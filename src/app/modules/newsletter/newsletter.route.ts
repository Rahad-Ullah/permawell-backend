import express from 'express';
import { NewsletterController } from './newsletter.controller';
import { NewsletterValidations } from './newsletter.validation';
import validateRequest from '../../middlewares/validateRequest';
import auth from '../../middlewares/auth';
import { UserRole } from '../user/user.constant';

const router = express.Router();

// subscribe newsletter
router.post(
    '/subscribe',
    validateRequest(NewsletterValidations.subscribeSchema),
    NewsletterController.subscribeNewsletter,
);

// unsubscribe newsletter
router.patch(
    '/unsubscribe',
    validateRequest(NewsletterValidations.unsubscribeSchema),
    NewsletterController.unsubscribeNewsletter,
);

// get all newsletter subscriptions
router.get(
    '/',
    auth(UserRole.Admin, UserRole.SuperAdmin),
    NewsletterController.getAllNewsletters,
);

export const newsletterRoutes = router;
