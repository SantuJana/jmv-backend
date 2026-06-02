import { v2 as cloudinary } from "cloudinary";

import { env } from "@/config/env";
import { AppError } from "@/utils/app-error";

import type { DeleteImageInput, UploadImageInput } from "./uploads.validation";

let isCloudinaryConfigured = false;

const toCloudinaryError = (error: unknown, fallbackMessage: string) => {
  if (error instanceof AppError) {
    return error;
  }

  if (typeof error === "object" && error && "http_code" in error) {
    const cloudinaryError = error as { http_code?: number; message?: string };
    const statusCode = cloudinaryError.http_code && cloudinaryError.http_code >= 400 ? cloudinaryError.http_code : 502;

    return new AppError(cloudinaryError.message ?? fallbackMessage, statusCode);
  }

  return new AppError(fallbackMessage, 502);
};

const configureCloudinary = () => {
  if (isCloudinaryConfigured) {
    return;
  }

  if (!env.CLOUDINARY_CLOUD_NAME || !env.CLOUDINARY_API_KEY || !env.CLOUDINARY_API_SECRET) {
    throw new AppError("Cloudinary is not configured", 503);
  }

  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME.trim(),
    api_key: env.CLOUDINARY_API_KEY.trim(),
    api_secret: env.CLOUDINARY_API_SECRET.trim()
  });

  isCloudinaryConfigured = true;
};

const uploadBuffer = (buffer: Buffer, folder: string) =>
  new Promise<{ secure_url: string; public_id: string }>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image"
      },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }

        if (!result) {
          reject(new AppError("Image upload failed", 502));
          return;
        }

        resolve({
          secure_url: result.secure_url,
          public_id: result.public_id
        });
      }
    );

    stream.end(buffer);
  });

export const uploadsService = {
  async uploadImage(input: UploadImageInput, file?: Express.Multer.File) {
    if (!file) {
      throw new AppError("Image file is required", 422);
    }

    configureCloudinary();

    let uploadedImage: Awaited<ReturnType<typeof uploadBuffer>>;

    try {
      uploadedImage = await uploadBuffer(file.buffer, input.folder);
    } catch (error) {
      throw toCloudinaryError(error, "Image upload failed");
    }

    return {
      imageUrl: uploadedImage.secure_url,
      imagePublicId: uploadedImage.public_id
    };
  },

  async deleteImage(input: DeleteImageInput) {
    configureCloudinary();

    let result: Awaited<ReturnType<typeof cloudinary.uploader.destroy>>;

    try {
      result = await cloudinary.uploader.destroy(input.publicId, {
        resource_type: "image"
      });
    } catch (error) {
      throw toCloudinaryError(error, "Image deletion failed");
    }

    if (result.result !== "ok" && result.result !== "not found") {
      throw new AppError("Image deletion failed", 502, result);
    }

    return {
      deleted: true
    };
  }
};
