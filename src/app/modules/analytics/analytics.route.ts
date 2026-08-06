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

// get admin overview
router.get(
    '/overview/admin',
    auth(UserRole.Admin, UserRole.SuperAdmin),
    AnalyticsController.getAdminOverview
);

// get monthly user growth
router.get(
    '/monthly-users-growth',
    auth(UserRole.Admin, UserRole.SuperAdmin),
    AnalyticsController.getMonthlyUserGrowth
);

export const analyticsRoutes = router;