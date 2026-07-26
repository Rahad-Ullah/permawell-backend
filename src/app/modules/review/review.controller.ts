import { Request, Response } from 'express';
import { ReviewServices } from './review.service';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';

// create review
const createReview = catchAsync(async (req: Request, res: Response) => {
  const result = await ReviewServices.createReview({
    ...req.body,
    reviewer: req.user?.id,
  });

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Review created successfully',
    data: result,
  });
});


export const ReviewController = {
  createReview,
};