import express from 'express';
import { PrivacySettingController } from './privacySetting.controller';
import auth from '../../middlewares/auth';
import { UserRole } from '../user/user.constant';
import validateRequest from '../../middlewares/validateRequest';
import { PrivacySettingValidations } from './privacySetting.validation';

const router = express.Router();

// update my privacy setting
router.patch(
    '/',
    auth(UserRole.CareSeeker),
    validateRequest(PrivacySettingValidations.updatePrivacySettingValidation),
    PrivacySettingController.updatePrivacySetting,
);

// get my privacy setting
router.get(
    '/',
    auth(UserRole.CareSeeker),
    PrivacySettingController.getMyPrivacySetting,
);

export const privacySettingRoutes = router;