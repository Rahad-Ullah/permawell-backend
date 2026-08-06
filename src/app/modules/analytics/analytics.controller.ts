import { Request, Response } from 'express';
import { AnalyticsServices } from './analytics.service';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';

// get care provider overview
const getProviderOverview = catchAsync(async (req: Request, res: Response) => {
  const result = await AnalyticsServices.getProviderOverview(req.user.id as string);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    data: result,
    message: 'Care provider overview fetched successfully'
  });
});

export const AnalyticsController = {
  getProviderOverview
};