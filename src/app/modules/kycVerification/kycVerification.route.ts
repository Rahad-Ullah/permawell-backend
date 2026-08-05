import express from 'express';
import { KycVerificationValidations } from './kycVerification.validation';
import { KycVerificationController } from './kycVerification.controller';
import auth from '../../middlewares/auth';
import { UserRole } from '../user/user.constant';
import validateRequest from '../../middlewares/validateRequest';
import fileUploadHandler from '../../middlewares/fileUploadHandler';

const router = express.Router();

// create kyc verification
router.post(
    '/create',
    auth(UserRole.CareProvider),
    fileUploadHandler(),
    validateRequest(KycVerificationValidations.createKycVerificationValidationSchema),
    KycVerificationController.createKycVerification
);

// update kyc verification status
router.patch(
    '/:id',
    auth(UserRole.Admin, UserRole.SuperAdmin),
    validateRequest(KycVerificationValidations.updateKycVerificationValidationSchema),
    KycVerificationController.updateKycVerificationStatus
);

// get my kyc verification
router.get(
    '/my-kyc',
    auth(UserRole.CareProvider),
    KycVerificationController.getMyKycVerification
);

// get all kyc verification
router.get(
    '/all',
    auth(UserRole.Admin, UserRole.SuperAdmin),
    KycVerificationController.getAllKycVerification
);

export const kycVerificationRoutes = router;