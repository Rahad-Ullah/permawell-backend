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

// update review
const updateReview = catchAsync(async (req: Request, res: Response) => {
  const result = await ReviewServices.updateReview(req.params.id, req.body);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Review updated successfully',
    data: result,
  });
});

// delete review
const deleteReview = catchAsync(async (req: Request, res: Response) => {
  const result = await ReviewServices.deleteReview(req.params.id);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Review deleted successfully',
    data: result,
  });
});

// get review by id
const getReviewByReviewerId = catchAsync(async (req: Request, res: Response) => {
  const result = await ReviewServices.getReviewByReviewerId(req.user.id, req.query);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Review fetched successfully',
    data: result.data,
    pagination: result.pagination
  });
});

// get review by care provider id
const getReviewsByCareProviderId = catchAsync(async (req: Request, res: Response) => {
  const result = await ReviewServices.getReviewsByCareProviderId(req.params.id, req.query);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Review fetched successfully',
    data: result.data,
    pagination: result.pagination
  });
});


export const ReviewController = {
  createReview,
  updateReview,
  deleteReview,
  getReviewByReviewerId,
  getReviewsByCareProviderId,
};