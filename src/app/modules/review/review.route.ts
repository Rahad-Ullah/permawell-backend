import express from 'express';
import { ReviewController } from './review.controller';
import auth from '../../middlewares/auth';
import { UserRole } from '../user/user.constant';
import validateRequest from '../../middlewares/validateRequest';
import { ReviewValidations } from './review.validation';

const router = express.Router();

// create review
router.post(
    '/create',
    auth(UserRole.CareSeeker),
    validateRequest(ReviewValidations.createReviewSchema),
    ReviewController.createReview
);

// update review
router.patch(
    '/:id',
    auth(UserRole.CareSeeker),
    validateRequest(ReviewValidations.updateReviewSchema),
    ReviewController.updateReview
);

// delete review
router.delete(
    '/:id',
    auth(UserRole.CareSeeker),
    validateRequest(ReviewValidations.deleteReviewSchema),
    ReviewController.deleteReview
);

// get review by id
router.get(
    '/reviewer/me',
    auth(UserRole.CareSeeker),
    ReviewController.getReviewByReviewerId
);

// get review by care provider id
router.get(
    '/care-provider/:id',
    auth(UserRole.CareSeeker, UserRole.CareProvider),
    validateRequest(ReviewValidations.getReviewsByCareProviderIdSchema),
    ReviewController.getReviewsByCareProviderId
);

export const reviewRoutes = router;