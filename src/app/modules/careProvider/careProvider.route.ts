import express from 'express';
import { UserRole } from '../user/user.constant';
import validateRequest from '../../middlewares/validateRequest';
import { CareProviderValidations } from './careProvider.validation';
import { CareProviderController } from './careProvider.controller';
import auth from '../../middlewares/auth';

const router = express.Router();

// update care provider
router.patch(
    "/profile",
    auth(UserRole.CareProvider),
    validateRequest(CareProviderValidations.updateCareProviderZodSchema),
    CareProviderController.updateCareProvider
)

export const careProviderRoutes = router;