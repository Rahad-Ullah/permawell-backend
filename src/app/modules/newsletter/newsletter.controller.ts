import { Request, Response, NextFunction } from 'express';
import { NewsletterServices } from './newsletter.service';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';

// subscribe newsletter
const subscribeNewsletter = catchAsync(async (req: Request, res: Response) => {
  const result = await NewsletterServices.subscribeNewsletter(req.body);

  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: 'Newsletter subscribed successfully',
    data: result,
  });
});

// unsubscribe newsletter
const unsubscribeNewsletter = catchAsync(async (req: Request, res: Response) => {
  const result = await NewsletterServices.unsubscribeNewsletter(req.body.email);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Newsletter unsubscribed successfully',
    data: result,
  });
});

// get all newsletter subscriptions
const getAllNewsletters = catchAsync(async (req: Request, res: Response) => {
  const result = await NewsletterServices.getAllNewsletters(req.query);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Newsletter subscriptions fetched successfully',
    data: result.data,
    pagination: result.pagination,
  });
});

export const NewsletterController = {
  subscribeNewsletter,
  unsubscribeNewsletter,
  getAllNewsletters,
};