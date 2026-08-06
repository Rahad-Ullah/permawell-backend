import express from 'express';
import { AnalyticsController } from './analytics.controller';
import auth from '../../middlewares/auth';
import { UserRole } from '../user/user.constant';

const router = express.Router();

// get care provider overview
router.get(
    '/overview/me',
    auth(UserRole.CareProvider),
    AnalyticsController.getProviderOverview
);

export const analyticsRoutes = router;