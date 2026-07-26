import { z } from 'zod';
import { objectId } from '../../../shared/objectIdValidator';

// create review
const createReviewSchema = z.object({
  body: z.object({
    careProvider: objectId('Care Provider ID'),
    rating: z.number().min(1, 'Rating is required').max(5, 'Rating must be at most 5'),
    comment: z.string().min(1, 'Comment is required'),
  }).strict(),
});

// update review
const updateReviewSchema = z.object({
  params: z.object({
    id: objectId('Review ID'),
  }).strict(),
  body: z.object({
    rating: z.number().min(1, 'Rating is required').max(5, 'Rating must be at most 5'),
    comment: z.string().min(1, 'Comment is required'),
  }).strict(),
});

// delete review
const deleteReviewSchema = z.object({
  params: z.object({
    id: objectId('Review ID'),
  }).strict(),
});

// get review by user id
const getReviewByUserIdSchema = z.object({
  params: z.object({
    id: objectId('User ID'),
  }).strict(),
});


export const ReviewValidations = {
  createReviewSchema,
  updateReviewSchema,
  deleteReviewSchema,
  getReviewByUserIdSchema,
};