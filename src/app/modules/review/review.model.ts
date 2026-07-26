import { Schema, model } from 'mongoose';
import { IReview, ReviewModel } from './review.interface';

const reviewSchema = new Schema<IReview, ReviewModel>({
  careProvider: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  reviewer: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  comment: {
    type: String,
    required: true,
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

export const Review = model<IReview, ReviewModel>(
  'Review',
  reviewSchema
);