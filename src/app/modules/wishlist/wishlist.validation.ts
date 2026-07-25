import { z } from 'zod';
import { objectId } from '../../../shared/objectIdValidator';

// toggle wishlist validation
const toggleWishlistValidation = z.object({
  body: z.object({
    property: objectId('property'),
  }),
});

// get wishlist by user id validation
const getWishlistByUserIdValidation = z.object({
  params: z.object({
    id: objectId('user'),
  }),
});

export const WishlistValidations = {
  toggleWishlistValidation,
  getWishlistByUserIdValidation,
};