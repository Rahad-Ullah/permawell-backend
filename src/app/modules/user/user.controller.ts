import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import {
  getMultipleFilesPath,
  getSingleFilePath,
} from '../../../shared/getFilePath';
import sendResponse from '../../../shared/sendResponse';
import { UserService } from './user.service';
import ApiError from '../../../errors/ApiError';

const createUser = catchAsync(async (req: Request, res: Response) => {
  const { ...userData } = req.body;
  const result = await UserService.createUserToDB(userData);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: result.message,
  });
});

const getUserProfile = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.getProfileFromDB(req.user.id);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Profile data retrieved successfully',
    data: result,
  });
});

// get single user by id
const getSingleUser = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.getSingleUserFromDB(req.params.id);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'User data retrieved successfully',
    data: result,
  });
});

//update profile
const updateProfile = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  let image = getSingleFilePath(req.files, 'image');

  const data = {
    image,
    ...req.body,
  };
  const result = await UserService.updateProfileToDB(user, data);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Profile updated successfully',
    data: result,
  });
});

// update kyc
const updateKyc = catchAsync(async (req: Request, res: Response) => {
  const docs = getMultipleFilesPath(req.files, 'doc') || [];
  const images = getMultipleFilesPath(req.files, 'image') || [];
  const documents = [...docs, ...images];
  if (!documents || documents?.length === 0) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Please upload documents');
  }

  const result = await UserService.updateKycToDB(req.user.id, { documents });

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'KYC updated successfully',
    data: result,
  });
});

// review kyc
const reviewKyc = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.reviewKycToDB(req.params.id, {
    ...req.body,
    reviewedBy: req.user.id,
  });

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'KYC reviewed successfully',
    data: result,
  });
});

// update user status
const updateStatus = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.updateStatusToDB(req.params.id, req.body);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'User status updated successfully',
    data: result,
  });
});

// delete user
const deleteSingleUser = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.deleteSingleUserFromDB(req.params.id);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'User deleted successfully',
    data: result,
  });
});

// get my kyc
const getMyKyc = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.getKycByUserIdFromDB(req.user.id);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'KYC data retrieved successfully',
    data: result,
  });
});

// get all users
const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.getAllUsersFromDB(req.query);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Users data retrieved successfully',
    data: result.users,
    pagination: result.pagination,
  });
});

export const UserController = {
  createUser,
  getUserProfile,
  getSingleUser,
  getMyKyc,
  updateProfile,
  updateKyc,
  reviewKyc,
  updateStatus,
  deleteSingleUser,
  getAllUsers,
};
