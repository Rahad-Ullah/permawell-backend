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

// get review by reviewer id
const getReviewByReviewerIdSchema = z.object({
  params: z.object({
    id: objectId('Reviewer ID'),
  }).strict(),
});

// get review by care provider id
const getReviewsByCareProviderIdSchema = z.object({
  params: z.object({
    id: objectId('Care Provider ID'),
  }).strict(),
});


export const ReviewValidations = {
  createReviewSchema,
  updateReviewSchema,
  deleteReviewSchema,
  getReviewByReviewerIdSchema,
  getReviewsByCareProviderIdSchema,
};