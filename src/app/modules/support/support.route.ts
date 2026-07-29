import express from 'express';
import { SupportController } from './support.controller';
import auth from '../../middlewares/auth';
import { UserRole } from '../user/user.constant';
import validateRequest from '../../middlewares/validateRequest';
import { SupportValidations } from './support.validation';

const router = express.Router();

// create support ticket
router.post(
    '/create',
    auth(UserRole.CareProvider, UserRole.CareSeeker),
    validateRequest(SupportValidations.createSupportSchema),
    SupportController.createSupport
);

export const supportRoutes = router;