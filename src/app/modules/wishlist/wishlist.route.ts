import express from 'express';
import { WishlistController } from './wishlist.controller';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { WishlistValidations } from './wishlist.validation';

const router = express.Router();

// toggle wishlist
router.post(
    '/toggle',
    auth(),
    validateRequest(WishlistValidations.toggleWishlistValidation),
    WishlistController.toggleWishlist,
);

// get wishlist by user id
router.get(
    '/user/:id',
    auth(),
    validateRequest(WishlistValidations.getWishlistByUserIdValidation),
    WishlistController.getWishlistByUserId,
);

// get my wishlist
router.get('/my-wishlist', auth(), WishlistController.getMyWishlist);

export const wishlistRoutes = router;
