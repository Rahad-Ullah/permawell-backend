import { Model, Types } from 'mongoose';
import { VerificationStatus, VerificationType } from './kycVerification.constants';

export interface IKycVerification {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  type: VerificationType;
  documents: string[];
  status: VerificationStatus;
  feedback: string;
  reviewedBy: Types.ObjectId;
  reviewedAt: Date;
  createdAt: Date;
  updatedAt: Date;
};

export type KycVerificationModel = Model<IKycVerification>;