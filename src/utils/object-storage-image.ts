import { env } from "@/config/env";

const CLOUDINARY_UPLOAD_PATH = "/image/upload/";

const trimSlashes = (value: string) => value.replace(/^\/+|\/+$/g, "");

const encodePathSegment = (segment: string) =>
  encodeURIComponent(segment).replace(/[!'()*]/g, (char) => `%${char.charCodeAt(0).toString(16).toUpperCase()}`);

export const buildProxyImageUrl = (objectKey: string) => {
  const apiBaseUrl = env.API_BASE_URL.replace(/\/+$/g, "");
  const apiPrefix = env.API_PREFIX.replace(/^\/?/, "/").replace(/\/+$/g, "");
  const encodedObjectKey = trimSlashes(objectKey).split("/").filter(Boolean).map(encodePathSegment).join("/");

  return `${apiBaseUrl}${apiPrefix}/uploads/image/${encodedObjectKey}`;
};

export const buildImageVariantKey = (
  objectKey: string,
  variant: "card" | "detail" | "thumbnail"
) => {
  const extensionIndex = objectKey.lastIndexOf(".");

  if (extensionIndex <= 0) {
    return `${objectKey}-${variant}.webp`;
  }

  return `${objectKey.slice(0, extensionIndex)}-${variant}.webp`;
};

const getLegacyImageExtension = (imageUrl: string | null) => {
  if (!imageUrl) {
    return "";
  }

  try {
    const pathname = new URL(imageUrl).pathname;
    const extension = pathname.match(/\.[a-zA-Z0-9]+$/)?.[0];

    return extension?.toLowerCase() ?? "";
  } catch {
    return "";
  }
};

export const buildObjectStorageImageUrl = (imageUrl: string | null, imagePublicId?: string | null) => {
  if (imagePublicId) {
    const normalizedPublicId = imagePublicId.includes(".")
      ? imagePublicId
      : `${imagePublicId}${getLegacyImageExtension(imageUrl)}`;

    return buildProxyImageUrl(normalizedPublicId);
  }

  if (!imageUrl?.includes(CLOUDINARY_UPLOAD_PATH)) {
    return imageUrl;
  }

  return imageUrl;
};

export const buildImageUrls = (imageUrl: string | null, imagePublicId?: string | null) => {
  const publicImageUrl = buildObjectStorageImageUrl(imageUrl, imagePublicId);
  const hasOptimizedVariants = Boolean(imagePublicId?.includes("."));

  return {
    original: publicImageUrl,
    thumbnail: hasOptimizedVariants && imagePublicId
      ? buildProxyImageUrl(buildImageVariantKey(imagePublicId, "thumbnail"))
      : publicImageUrl,
    card: hasOptimizedVariants && imagePublicId
      ? buildProxyImageUrl(buildImageVariantKey(imagePublicId, "card"))
      : publicImageUrl,
    detail: hasOptimizedVariants && imagePublicId
      ? buildProxyImageUrl(buildImageVariantKey(imagePublicId, "detail"))
      : publicImageUrl
  };
};
