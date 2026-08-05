import express from 'express';
import { KycVerificationController } from './kycVerification.controller';

const router = express.Router();

router.get('/', KycVerificationController);

export const kycVerificationRoutes = router;