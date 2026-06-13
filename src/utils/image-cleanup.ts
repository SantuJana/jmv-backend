import { uploadsService } from "@/modules/uploads/uploads.service";

export const deleteReplacedImage = async ({
  previousPublicId,
  nextPublicId
}: {
  previousPublicId?: string | null;
  nextPublicId?: string | null;
}) => {
  if (!previousPublicId || previousPublicId === nextPublicId) {
    return;
  }

  try {
    await uploadsService.deleteImageByPublicId(previousPublicId);
  } catch (error) {
    console.warn("Previous image could not be deleted", error);
  }
};
