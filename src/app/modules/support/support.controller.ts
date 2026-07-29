import { Request, Response, NextFunction } from 'express';
import { SupportServices } from './support.service';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';

// create support ticket
const createSupport = catchAsync(async (req: Request, res: Response) => {
  const result = await SupportServices.createSupport({ user: req.user.id, ...req.body });

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Support ticket created successfully",
    data: result,
  });
})

export const SupportController = {
  createSupport,
};