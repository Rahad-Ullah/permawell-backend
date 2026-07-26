import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { User } from '../user/user.model';
import { IReview } from './review.interface';
import { Review } from './review.model';
import { UserRole } from '../user/user.constant';
import QueryBuilder from '../../builder/QueryBuilder';

// --------------- create review ----------------
const createReview = async (payload: IReview) => {
  // validate care provider
  const careProvider = await User.findOne({
    _id: payload.careProvider,
    role: UserRole.CareProvider,
    isDeleted: false,
  });
  if (!careProvider) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Care provider not found');
  }

  const result = await Review.create(payload);
  return result;
}

// --------------- update review ----------------
const updateReview = async (id: string, payload: Partial<IReview>) => {
  const result = await Review.findByIdAndUpdate(id, payload, { new: true });
  if (!result) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Review not found');
  }
  return result;
}

// --------------- delete review ----------------
const deleteReview = async (id: string) => {
  const result = await Review.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
  if (!result) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Review not found');
  }
  return result;
}

// --------------- get review by reviewer id ----------------
const getReviewByReviewerId = async (reviewerId: string, query: Record<string, unknown>) => {
  const reviewQuery = new QueryBuilder(Review.find({ reviewer: reviewerId, isDeleted: false }), query)
    .filter()
    .paginate()
    .sort()
    .fields()

  const [data, pagination] = await Promise.all([
    reviewQuery.modelQuery.lean(),
    reviewQuery.getPaginationInfo()
  ])

  return { data, pagination }
}

// --------------- get review by care provider id ----------------
const getReviewsByCareProviderId = async (careProviderId: string, query: Record<string, unknown>) => {
  const reviewQuery = new QueryBuilder(Review.find({ careProvider: careProviderId, isDeleted: false }), query)
    .filter()
    .paginate()
    .sort()
    .fields()

  const [data, pagination] = await Promise.all([
    reviewQuery.modelQuery.lean(),
    reviewQuery.getPaginationInfo()
  ])

  return { data, pagination }
}

export const ReviewServices = {
  createReview,
  updateReview,
  deleteReview,
  getReviewsByCareProviderId,
  getReviewByReviewerId,
};