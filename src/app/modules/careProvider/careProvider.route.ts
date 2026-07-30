import express from 'express';
import { UserRole } from '../user/user.constant';
import validateRequest from '../../middlewares/validateRequest';
import { CareProviderValidations } from './careProvider.validation';
import { CareProviderController } from './careProvider.controller';
import auth from '../../middlewares/auth';
import fileUploadHandler from '../../middlewares/fileUploadHandler';

const router = express.Router();

// update care provider
router.patch(
    "/profile",
    auth(UserRole.CareProvider),
    validateRequest(CareProviderValidations.updateCareProviderZodSchema),
    CareProviderController.updateCareProvider
)

// update gallery
router.patch(
    "/gallery",
    auth(UserRole.CareProvider),
    fileUploadHandler(),
    validateRequest(CareProviderValidations.updateGalleryZodSchema),
    CareProviderController.updateGallery
)

// get availability
router.get(
    '/availability',
    auth(UserRole.CareSeeker),
    validateRequest(CareProviderValidations.getAvailabilityZodSchema),
    CareProviderController.getAvailability
)

export const careProviderRoutes = router;