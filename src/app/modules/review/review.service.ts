import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { User } from '../user/user.model';
import { IReview } from './review.interface';
import { Review } from './review.model';
import { UserRole } from '../user/user.constant';
import QueryBuilder from '../../builder/QueryBuilder';
import { Types } from 'mongoose';

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
    reviewQuery.modelQuery.populate('careProvider', 'name email image'),
    reviewQuery.getPaginationInfo()
  ])

  return { data, pagination }
}

// --------------- get review by care provider id ----------------
const getReviewsByCareProviderId = async (
  careProviderId: string,
  query: Record<string, unknown>
) => {
  // 1. Paginated list query using QueryBuilder
  const reviewQuery = new QueryBuilder(
    Review.find({ careProvider: careProviderId, isDeleted: false }),
    query
  )
    .filter()
    .paginate()
    .sort()
    .fields();

  // 2. Aggregation pipeline to calculate stats
  const statsQuery = Review.aggregate([
    {
      $match: {
        careProvider: new Types.ObjectId(careProviderId),
        isDeleted: false,
      },
    },
    {
      $group: {
        _id: null,
        totalReviews: { $sum: 1 },
        averageRating: { $avg: '$rating' },
        star1: { $sum: { $cond: [{ $eq: ['$rating', 1] }, 1, 0] } },
        star2: { $sum: { $cond: [{ $eq: ['$rating', 2] }, 1, 0] } },
        star3: { $sum: { $cond: [{ $eq: ['$rating', 3] }, 1, 0] } },
        star4: { $sum: { $cond: [{ $eq: ['$rating', 4] }, 1, 0] } },
        star5: { $sum: { $cond: [{ $eq: ['$rating', 5] }, 1, 0] } },
      },
    },
  ]);

  // Execute queries in parallel for better performance
  const [reviews, pagination, statsResult] = await Promise.all([
    reviewQuery.modelQuery.populate('reviewer', 'name email image').lean(),
    reviewQuery.getPaginationInfo(),
    statsQuery,
  ]);

  // Format stats result (fallback to default zeroes if no reviews exist)
  const rawStats = statsResult[0] || {};
  const stats = {
    averageRating: rawStats.averageRating ? Number(rawStats.averageRating.toFixed(1)) : 0,
    totalReviews: rawStats.totalReviews || 0,
    ratingDistribution: {
      star1: rawStats.star1 || 0,
      star2: rawStats.star2 || 0,
      star3: rawStats.star3 || 0,
      star4: rawStats.star4 || 0,
      star5: rawStats.star5 || 0,
    },
  };

  return {
    pagination,
    data: { reviews, stats }
  };
};

export const ReviewServices = {
  createReview,
  updateReview,
  deleteReview,
  getReviewsByCareProviderId,
  getReviewByReviewerId,
};