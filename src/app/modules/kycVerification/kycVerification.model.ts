import { Schema, model } from 'mongoose';
import { KycStatus, KycType } from './kycVerification.constants';
import { IKycVerification, KycVerificationModel } from './kycVerification.interface';

const kycVerificationSchema = new Schema<IKycVerification, KycVerificationModel>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    enum: KycType,
    required: true,
  },
  documents: {
    type: [String],
    required: true,
    default: [],
  },
  status: {
    type: String,
    enum: KycStatus,
    required: true,
    default: KycStatus.Pending,
  },
  feedback: {
    type: String,
    default: '',
  },
  reviewedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  reviewedAt: {
    type: Date,
    default: null,
  },
}, {
  timestamps: true,
});

export const KycVerification = model<IKycVerification, KycVerificationModel>(
  'KycVerification',
  kycVerificationSchema
);