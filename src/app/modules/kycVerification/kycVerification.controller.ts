import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';
import { KycVerificationServices } from './kycVerification.service';
import { KycStatus } from './kycVerification.constants';
import { getMultipleFilesPath } from '../../../shared/getFilePath';
import ApiError from '../../../errors/ApiError';

// --------------- create kyc verification controller ----------------
const createKycVerification = catchAsync(
  async (req: Request, res: Response) => {
    const pdfs = getMultipleFilesPath(req.files, 'doc') || [];
    const images = getMultipleFilesPath(req.files, 'image') || [];
    const documents = [...pdfs, ...images];

    if (documents.length < 1) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Documents are required');
    }

    const result = await KycVerificationServices.createKycVerification({
      ...req.body,
      user: req.user?.id,
      documents,
      status: KycStatus.Pending,
    });

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Kyc verification created successfully',
      data: result,
    });
  }
);

// --------------- update kyc verification status controller ----------------
const updateKycVerificationStatus = catchAsync(
  async (req: Request, res: Response) => {
    const result = await KycVerificationServices.updateKycVerificationStatus(
      req.params.id,
      {
        ...req.body,
        reviewedBy: req.user?.id,
        reviewedAt: new Date(),
      }
    );

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Kyc verification updated successfully',
      data: result,
    });
  }
);

// --------------- get my kyc verification controller ----------------
const getMyKycVerification = catchAsync(
  async (req: Request, res: Response) => {
    const result = await KycVerificationServices.getKycVerificationByUser(req.user?.id);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Kyc verification fetched successfully',
      data: result,
    });
  }
);

// --------------- get all kyc verification controller ----------------
const getAllKycVerification = catchAsync(
  async (req: Request, res: Response) => {
    const result = await KycVerificationServices.getAllKycVerification(req.query);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Kyc verification fetched successfully',
      data: result.data,
      pagination: result.pagination,
    });
  }
);

export const KycVerificationController = {
  createKycVerification,
  getMyKycVerification,
  getAllKycVerification,
  updateKycVerificationStatus,
};