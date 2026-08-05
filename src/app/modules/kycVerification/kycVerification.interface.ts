import { Model, Types } from 'mongoose';
import { KycStatus, KycType } from './kycVerification.constants';

export interface IKycVerification {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  type: KycType;
  documents: string[];
  status: KycStatus;
  feedback: string;
  reviewedBy: Types.ObjectId;
  reviewedAt: Date;
  createdAt: Date;
  updatedAt: Date;
};

export type KycVerificationModel = Model<IKycVerification>;