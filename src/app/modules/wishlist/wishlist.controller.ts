import { Request, Response } from 'express';
import { WishlistServices } from './wishlist.service';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';

// ------------ toggle wishlist controller ----------
const toggleWishlist = catchAsync(async (req: Request, res: Response) => {
  const result = await WishlistServices.toggleWishlist({ ...req.body, user: req.user.id });

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: result.message,
    data: result.data,
  });
});

// ------------ get wishlist by user id controller ----------
const getWishlistByUserId = catchAsync(async (req: Request, res: Response) => {
  const result = await WishlistServices.getWishlistByUserId(req.params.id as string);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Wishlist fetched successfully',
    data: result.data,
    pagination: result.pagination,
  });
});

// ------------ get my wishlist controller ----------
const getMyWishlist = catchAsync(async (req: Request, res: Response) => {
  const result = await WishlistServices.getWishlistByUserId(req.user.id as string);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Wishlist fetched successfully',
    data: result.data,
    pagination: result.pagination,
  });
});

export const WishlistController = {
  toggleWishlist,
  getWishlistByUserId,
  getMyWishlist,
};