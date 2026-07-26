import { Request, Response } from 'express';
import { CareProviderServices } from './careProvider.service';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';

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

export const CareProviderController = {
  updateCareProvider
};