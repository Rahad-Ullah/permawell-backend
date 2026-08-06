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

// get admin overview
const getAdminOverview = catchAsync(async (req: Request, res: Response) => {
  const result = await AnalyticsServices.getAdminOverview();

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    data: result,
    message: 'Admin overview fetched successfully'
  });
});

// get monthly user growth
const getMonthlyUserGrowth = catchAsync(async (req: Request, res: Response) => {
  const result = await AnalyticsServices.getMonthlyUserGrowth(req.query);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    data: result,
    message: 'Monthly user growth fetched successfully'
  });
});

export const AnalyticsController = {
  getProviderOverview,
  getAdminOverview,
  getMonthlyUserGrowth
};