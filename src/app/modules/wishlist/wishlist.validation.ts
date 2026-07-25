import { z } from 'zod';
import { objectId } from '../../../shared/objectIdValidator';

// toggle wishlist validation
const toggleWishlistValidation = z.object({
  body: z.object({
    careProvider: objectId('CareProvider'),
  }),
});

// get wishlist by user id validation
const getWishlistByUserIdValidation = z.object({
  params: z.object({
    id: objectId('User'),
  }),
});

export const WishlistValidations = {
  toggleWishlistValidation,
  getWishlistByUserIdValidation,
};