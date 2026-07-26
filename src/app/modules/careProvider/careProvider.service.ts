import { ICareProvider } from './careProvider.interface';
import ApiError from '../../../errors/ApiError';
import { StatusCodes } from 'http-status-codes';
import { CareProvider } from './careProvider.model';
import deleteS3File from '../../../shared/deleteS3File';

// ----------------- update care provider -----------------
const updateCareProviderToDB = async (
  userId: string,
  payload: Partial<ICareProvider>,
): Promise<Partial<ICareProvider | null>> => {
  const careProvider = await CareProvider.findOne({ user: userId });
  if (!careProvider) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Care provider doesn't exist!");
  }

  const updatedCareProvider = await CareProvider.findByIdAndUpdate(
    careProvider._id,
    payload,
    { new: true },
  );

  if (!updatedCareProvider) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to update user");
  }

  return updatedCareProvider;
};

// ------------------ update gallery ------------------
const updateGalleryToDB = async (
  userId: string,
  payload: { newImages?: string[]; removeImages?: string[] }
): Promise<Partial<ICareProvider | null>> => {
  const careProvider = await CareProvider.findOne({ user: userId });
  if (!careProvider) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Care provider doesn't exist!");
  }

  const { newImages = [], removeImages = [] } = payload;

  // 1. Validate that all requested removal images actually exist in the current gallery
  if (removeImages.length > 0) {
    const existingGallery = new Set(careProvider.gallery || []);
    const hasInvalidImage = removeImages.some((img) => !existingGallery.has(img));

    if (hasInvalidImage) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "One or more images requested for removal were not found in the gallery!"
      );
    }
  }

  // Validate gallery max upload limit
  const totalImages = careProvider.gallery.length + newImages.length - removeImages.length;
  if (totalImages > 10) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Gallery can only contain 10 images!"
    );
  }

  // 2. Filter out removed images and append new ones safely in memory
  const removalSet = new Set(removeImages);
  const updatedGallery = careProvider.gallery.filter((img) => !removalSet.has(img));

  // Prevent duplicate additions if necessary
  updatedGallery.push(...newImages);

  // 3. Save updated care provider
  careProvider.gallery = updatedGallery;
  await careProvider.save();

  // 4. Cleanup S3 files asynchronously without failing the overall DB update
  if (removeImages.length > 0) {
    // Promise.allSettled prevents one S3 failure from breaking the whole response block
    Promise.allSettled(removeImages.map((image) => deleteS3File(image))).catch(
      (err) => console.error("Failed to cleanup S3 files:", err)
    );
  }

  return careProvider;
};

export const CareProviderServices = {
  updateCareProviderToDB,
  updateGalleryToDB
};