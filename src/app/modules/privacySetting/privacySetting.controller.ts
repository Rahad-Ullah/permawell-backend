import { Request, Response } from 'express';
import { PrivacySettingServices } from './privacySetting.service';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';

// ---------------- update privacy setting -----------------
const updatePrivacySetting = catchAsync(async (req: Request, res: Response) => {
  const result = await PrivacySettingServices.updatePrivacySetting(req.user.id, req.body);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Privacy setting updated successfully',
    data: result,
  });
});

// ----------------- get my privacy setting ------------------
const getMyPrivacySetting = catchAsync(async (req: Request, res: Response) => {
  const result = await PrivacySettingServices.getPrivacySettingByUser(req.user.id);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Privacy setting fetched successfully',
    data: result,
  });
});

export const PrivacySettingController = {
  updatePrivacySetting,
  getMyPrivacySetting,
};