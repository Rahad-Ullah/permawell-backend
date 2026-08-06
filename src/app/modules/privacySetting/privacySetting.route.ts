import express from 'express';
import { PrivacySettingController } from './privacySetting.controller';

const router = express.Router();

router.get('/', PrivacySettingController);

export const privacySettingRoutes = router;