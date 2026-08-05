import { z } from 'zod';
import { KycStatus, KycType } from './kycVerification.constants';

// create kyc verification
const createKycVerificationValidationSchema = z.object({
  body: z.object({
    type: z.nativeEnum(KycType),
    documents: z.any().optional(),
  }).strict()
});

// update kyc verification
const updateKycVerificationValidationSchema = z.object({
  params: z.object({
    id: z.string(),
  }).strict(),
  body: z.object({
    status: z.nativeEnum(KycStatus).optional(),
    feedback: z.string().optional(),
  }).strict()
});

// get kyc verification
const getKycVerificationValidationSchema = z.object({
  params: z.object({
    id: z.string(),
  }).strict(),
});

export const KycVerificationValidations = {
  createKycVerificationValidationSchema,
  updateKycVerificationValidationSchema,
  getKycVerificationValidationSchema,
};