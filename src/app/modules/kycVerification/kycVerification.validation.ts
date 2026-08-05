import { z } from 'zod';
import { VerificationStatus, VerificationType } from './kycVerification.constants';

// create kyc verification
const createKycVerificationValidationSchema = z.object({
  body: z.object({
    type: z.nativeEnum(VerificationType),
    documents: z.array(z.string()).nonempty(),
  })
});

// update kyc verification
const updateKycVerificationValidationSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
  body: z.object({
    type: z.nativeEnum(VerificationType).optional(),
    documents: z.array(z.string()).optional(),
    status: z.nativeEnum(VerificationStatus).optional(),
    feedback: z.string().optional(),
  })
});

// get kyc verification
const getKycVerificationValidationSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
});

export const KycVerificationValidations = {
  createKycVerificationValidationSchema,
  updateKycVerificationValidationSchema,
  getKycVerificationValidationSchema,
};