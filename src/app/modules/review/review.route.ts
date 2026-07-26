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

export const reviewRoutes = router;