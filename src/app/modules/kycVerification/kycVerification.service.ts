import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { IKycVerification } from './kycVerification.interface';
import { KycVerification } from './kycVerification.model';
import deleteS3File from '../../../shared/deleteS3File';
import QueryBuilder from '../../builder/QueryBuilder';

// --------------- create kyc verification service ----------------
const createKycVerification = async (payload: IKycVerification): Promise<IKycVerification> => {
  const existingKyc = await KycVerification.findOne({
    user: payload.user,
    type: payload.type
  });

  const result = await KycVerification.findOneAndUpdate(
    {
      user: payload.user,
      type: payload.type
    },
    {
      $set: payload
    },
    {
      upsert: true,
      new: true,
      runValidators: true,
    }
  )

  // delete old documents
  if (existingKyc && existingKyc?.documents.length > 0) {
    const oldDocuments = existingKyc.documents;
    const newDocuments = result.documents;
    const documentsToDelete = oldDocuments.filter((document) => !newDocuments.includes(document));
    for (const document of documentsToDelete) {
      await deleteS3File(document)
    }
  }

  return result;
};

// --------------- update kyc verification service ----------------
const updateKycVerificationStatus = async (
  id: string,
  payload: IKycVerification
): Promise<IKycVerification> => {
  const result = await KycVerification.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });

  if (!result) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Kyc verification not found');
  }
  return result;
};

// --------------- get kyc verification by user service ----------------
const getKycVerificationByUser = async (userId: string): Promise<IKycVerification[]> => {
  const result = await KycVerification.find({ user: userId });
  return result;
};

// --------------- get all kyc verification service ----------------
const getAllKycVerification = async (query: Record<string, unknown>) => {
  const kycQuery = new QueryBuilder(KycVerification.find(), query)
    .search([])
    .filter()
    .paginate()
    .sort()
    .fields()

  const [data, pagination] = await Promise.all([
    kycQuery.modelQuery.populate('user').lean(),
    kycQuery.getPaginationInfo(),
  ])

  return { data, pagination };
};

export const KycVerificationServices = {
  createKycVerification,
  getKycVerificationByUser,
  updateKycVerificationStatus,
  getAllKycVerification
};