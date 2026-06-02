export type UploadImageInput = {
  filePath: string;
  folder: string;
};

export type StoredImage = {
  imageUrl: string;
  publicId: string;
};

export interface StorageService {
  uploadImage(input: UploadImageInput): Promise<StoredImage>;
  deleteImage(publicId: string): Promise<void>;
}
