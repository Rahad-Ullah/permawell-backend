import { Request, Response } from 'express';
import { CareProviderServices } from './careProvider.service';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';
import { getMultipleFilesPath } from '../../../shared/getFilePath';

// update care provider
const updateCareProvider = catchAsync(async (req: Request, res: Response) => {
  const result = await CareProviderServices.updateCareProviderToDB(req.user.id, req.body);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Care provider updated successfully',
    data: result,
  });
});

// update gallery
const updateGallery = catchAsync(async (req: Request, res: Response) => {
  const uploadedImages = getMultipleFilesPath(req.files, 'image');
  const removeImages = req.body.removeImages as string[];
  const result = await CareProviderServices.updateGalleryToDB(req.user.id, { removeImages, newImages: uploadedImages });

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Gallery updated successfully',
    data: result,
  });
});

// get provider availability
const getAvailability = catchAsync(async (req: Request, res: Response) => {
  const { provider, date, workplaceType, timezone } = req.query;
  const result = await CareProviderServices.getAvailability(
    provider as string,
    date as string,
    workplaceType as string,
    timezone as string
  );
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Availability fetched successfully',
    data: result,
  });
});

export const CareProviderController = {
  updateCareProvider,
  updateGallery,
  getAvailability,
};