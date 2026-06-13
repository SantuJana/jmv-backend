import { createHash, createHmac, randomUUID } from "crypto";
import path from "path";
import sharp from "sharp";

import { env } from "@/config/env";
import { AppError } from "@/utils/app-error";
import { buildImageVariantKey, buildProxyImageUrl } from "@/utils/object-storage-image";

import type { DeleteImageInput, UploadImageInput } from "./uploads.validation";

type MinioConfig = {
  endpoint: URL;
  region: string;
  bucket: string;
  accessKey: string;
  secretKey: string;
};

const toStorageError = (error: unknown, fallbackMessage: string) => {
  if (error instanceof AppError) {
    return error;
  }

  if (error instanceof Error) {
    return new AppError(error.message || fallbackMessage, 502);
  }

  return new AppError(fallbackMessage, 502);
};

const assertMinioConfigured = (): MinioConfig => {
  const bucket = env.MINIO_BUCKET?.trim();
  const accessKey = env.MINIO_ACCESS_KEY?.trim();
  const secretKey = env.MINIO_SECRET_KEY?.trim();

  if (!env.MINIO_ENDPOINT || !bucket || !accessKey || !secretKey) {
    throw new AppError("MinIO object storage is not configured", 503);
  }

  return {
    endpoint: new URL(env.MINIO_ENDPOINT),
    region: env.MINIO_REGION,
    bucket,
    accessKey,
    secretKey
  };
};

const hash = (value: string | Buffer) => createHash("sha256").update(value).digest("hex");

const hmac = (key: string | Buffer, value: string) => createHmac("sha256", key).update(value).digest();

const hmacHex = (key: string | Buffer, value: string) => createHmac("sha256", key).update(value).digest("hex");

const toAmzDate = (date: Date) => date.toISOString().replace(/[:-]|\.\d{3}/g, "");

const encodePathSegment = (segment: string) => encodeURIComponent(segment).replace(/[!'()*]/g, (char) => `%${char.charCodeAt(0).toString(16).toUpperCase()}`);

const toObjectPath = (bucket: string, objectKey: string) =>
  `/${[bucket, ...objectKey.split("/")].map(encodePathSegment).join("/")}`;

const trimSlashes = (value: string) => value.replace(/^\/+|\/+$/g, "");

const normalizeFolder = (folder: string) =>
  trimSlashes(folder)
    .split("/")
    .map((segment) => segment.replace(/[^a-zA-Z0-9_-]/g, "-"))
    .filter(Boolean)
    .join("/");

const getFileExtension = (file: Express.Multer.File) => {
  const originalExtension = path.extname(file.originalname).toLowerCase().replace(/[^.a-z0-9]/g, "");

  if (originalExtension) {
    return originalExtension;
  }

  const mimeExtensions: Record<string, string> = {
    "image/gif": ".gif",
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp"
  };

  return mimeExtensions[file.mimetype] ?? "";
};

const getUploadContentType = (file: Express.Multer.File) => file.mimetype || "application/octet-stream";

const buildObjectKey = (folder: string, file: Express.Multer.File) => {
  const safeFolder = normalizeFolder(folder);
  const baseName = path
    .basename(file.originalname, path.extname(file.originalname))
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  const fileName = `${Date.now()}-${randomUUID()}${baseName ? `-${baseName}` : ""}${getFileExtension(file)}`;

  return safeFolder ? `${safeFolder}/${fileName}` : fileName;
};

const getSigningKey = (secretKey: string, dateStamp: string, region: string) => {
  const dateKey = hmac(`AWS4${secretKey}`, dateStamp);
  const regionKey = hmac(dateKey, region);
  const serviceKey = hmac(regionKey, "s3");

  return hmac(serviceKey, "aws4_request");
};

const signS3Request = ({
  config,
  method,
  objectKey,
  contentType,
  payloadHash
}: {
  config: MinioConfig;
  method: "DELETE" | "GET" | "PUT";
  objectKey: string;
  contentType?: string;
  payloadHash: string;
}) => {
  const now = new Date();
  const amzDate = toAmzDate(now);
  const dateStamp = amzDate.slice(0, 8);
  const credentialScope = `${dateStamp}/${config.region}/s3/aws4_request`;
  const url = new URL(config.endpoint.toString());

  url.pathname = toObjectPath(config.bucket, objectKey);
  url.search = "";

  const headers: Record<string, string> = {
    host: url.host,
    "x-amz-content-sha256": payloadHash,
    "x-amz-date": amzDate
  };

  if (contentType) {
    headers["content-type"] = contentType;
  }

  const signedHeaderNames = Object.keys(headers).sort();
  const canonicalHeaders = signedHeaderNames.map((headerName) => `${headerName}:${headers[headerName] ?? ""}\n`).join("");
  const signedHeaders = signedHeaderNames.join(";");
  const canonicalRequest = [method, url.pathname, "", canonicalHeaders, signedHeaders, payloadHash].join("\n");
  const stringToSign = ["AWS4-HMAC-SHA256", amzDate, credentialScope, hash(canonicalRequest)].join("\n");
  const signature = hmacHex(getSigningKey(config.secretKey, dateStamp, config.region), stringToSign);

  return {
    url,
    headers: {
      ...Object.fromEntries(Object.entries(headers).filter(([headerName]) => headerName !== "host")),
      authorization: `AWS4-HMAC-SHA256 Credential=${config.accessKey}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`
    }
  };
};

const readStorageError = async (response: Response, fallbackMessage: string) => {
  const detail = await response.text().catch(() => "");
  const errorCode = detail.match(/<Code>([^<]+)<\/Code>/)?.[1];
  const errorMessage = detail.match(/<Message>([^<]+)<\/Message>/)?.[1];

  if (errorCode === "NoSuchBucket") {
    return new AppError(`MinIO bucket not found: ${assertMinioConfigured().bucket}`, 503, detail || undefined);
  }

  return new AppError(errorMessage ?? fallbackMessage, response.status >= 500 ? response.status : 502, detail || undefined);
};

const uploadBuffer = async (config: MinioConfig, objectKey: string, buffer: Buffer, contentType: string) => {
  const signedRequest = signS3Request({
    config,
    method: "PUT",
    objectKey,
    contentType,
    payloadHash: hash(buffer)
  });

  const response = await fetch(signedRequest.url, {
    method: "PUT",
    headers: signedRequest.headers,
    body: buffer
  });

  if (!response.ok) {
    throw await readStorageError(response, "Image upload failed");
  }
};

const buildOptimizedVariants = async (buffer: Buffer) => ({
  thumbnail: await sharp(buffer)
    .rotate()
    .resize({
      width: 320,
      height: 320,
      fit: "inside",
      withoutEnlargement: true
    })
    .webp({ quality: 72 })
    .toBuffer(),
  card: await sharp(buffer)
    .rotate()
    .resize({
      width: 800,
      height: 800,
      fit: "inside",
      withoutEnlargement: true
    })
    .webp({ quality: 78 })
    .toBuffer(),
  detail: await sharp(buffer)
    .rotate()
    .resize({
      width: 1200,
      height: 1200,
      fit: "inside",
      withoutEnlargement: true
    })
    .webp({ quality: 82 })
    .toBuffer()
});

const uploadImageSet = async (config: MinioConfig, objectKey: string, file: Express.Multer.File) => {
  const variants = await buildOptimizedVariants(file.buffer);

  await Promise.all([
    uploadBuffer(config, objectKey, file.buffer, getUploadContentType(file)),
    uploadBuffer(config, buildImageVariantKey(objectKey, "thumbnail"), variants.thumbnail, "image/webp"),
    uploadBuffer(config, buildImageVariantKey(objectKey, "card"), variants.card, "image/webp"),
    uploadBuffer(config, buildImageVariantKey(objectKey, "detail"), variants.detail, "image/webp")
  ]);
};

const fetchObject = async (config: MinioConfig, objectKey: string) => {
  const signedRequest = signS3Request({
    config,
    method: "GET",
    objectKey,
    payloadHash: hash("")
  });

  const response = await fetch(signedRequest.url, {
    method: "GET",
    headers: signedRequest.headers
  });

  if (!response.ok) {
    throw await readStorageError(response, "Image could not be loaded");
  }

  return {
    body: Buffer.from(await response.arrayBuffer()),
    contentType: response.headers.get("content-type") ?? "application/octet-stream",
    contentLength: response.headers.get("content-length"),
    etag: response.headers.get("etag"),
    lastModified: response.headers.get("last-modified")
  };
};

const deleteImageSet = async (config: MinioConfig, publicId: string) => {
  await Promise.all([
    publicId,
    buildImageVariantKey(publicId, "thumbnail"),
    buildImageVariantKey(publicId, "card"),
    buildImageVariantKey(publicId, "detail")
  ].map(async (objectKey) => {
    const signedRequest = signS3Request({
      config,
      method: "DELETE",
      objectKey,
      payloadHash: hash("")
    });

    const response = await fetch(signedRequest.url, {
      method: "DELETE",
      headers: signedRequest.headers
    });

    if (!response.ok && response.status !== 404) {
      throw await readStorageError(response, "Image deletion failed");
    }
  }));
};

export const uploadsService = {
  async uploadImage(input: UploadImageInput, file?: Express.Multer.File) {
    if (!file) {
      throw new AppError("Image file is required", 422);
    }

    const config = assertMinioConfigured();
    const objectKey = buildObjectKey(input.folder, file);

    try {
      await uploadImageSet(config, objectKey, file);
    } catch (error) {
      throw toStorageError(error, "Image upload failed");
    }

    return {
      imageUrl: buildProxyImageUrl(objectKey),
      imagePublicId: objectKey
    };
  },

  async getImage(objectKey: string) {
    if (!objectKey.trim()) {
      throw new AppError("Image key is required", 422);
    }

    const config = assertMinioConfigured();

    try {
      return await fetchObject(config, objectKey);
    } catch (error) {
      throw toStorageError(error, "Image could not be loaded");
    }
  },

  async deleteImageByPublicId(publicId: string) {
    const config = assertMinioConfigured();

    try {
      await deleteImageSet(config, publicId);
    } catch (error) {
      throw toStorageError(error, "Image deletion failed");
    }

    return {
      deleted: true
    };
  },

  async deleteImage(input: DeleteImageInput) {
    return this.deleteImageByPublicId(input.publicId);
  }
};
