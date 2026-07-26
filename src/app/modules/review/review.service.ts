import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { User } from '../user/user.model';
import { IReview } from './review.interface';
import { Review } from './review.model';
import { UserRole } from '../user/user.constant';
import QueryBuilder from '../../builder/QueryBuilder';
import mongoose, { Types } from 'mongoose';
import { CareProvider } from '../careProvider/careProvider.model';

// --------------- create review ----------------
const createReview = async (payload: IReview) => {
  // Start MongoDB Session
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 1. Validate care provider within transaction session
    const careProviderUser = await User.findOne({
      _id: payload.careProvider,
      role: UserRole.CareProvider,
      isDeleted: false,
    }).session(session);

    if (!careProviderUser) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Care provider not found');
    }

    // 2. Create the new review
    const [newReview] = await Review.create([payload], { session });

    // 3. Recalculate rating & total reviews using Aggregation within the transaction
    const stats = await Review.aggregate([
      {
        $match: {
          careProvider: new mongoose.Types.ObjectId(payload.careProvider),
          isDeleted: false,
        },
      },
      {
        $group: {
          _id: '$careProvider',
          totalReviews: { $sum: 1 },
          averageRating: { $avg: '$rating' },
        },
      },
    ]).session(session);

    const totalReviews = stats[0]?.totalReviews || 0;
    const averageRating = stats[0]?.averageRating
      ? Number(stats[0].averageRating.toFixed(1))
      : 0;

    // 4. Update the Care Provider document
    await CareProvider.updateOne(
      { user: careProviderUser._id },
      {
        totalReviews,
        averageRating,
      },
      { session }
    );

    // Commit transaction
    await session.commitTransaction();
    session.endSession();

    return newReview;
  } catch (error) {
    // Rollback any changes on error
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

// --------------- update review ----------------
const updateReview = async (id: string, payload: Partial<IReview>) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 1. Find the existing review
    const existingReview = await Review.findById(id).session(session);
    if (!existingReview || existingReview.isDeleted) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Review not found');
    }

    // 2. Update the review document
    const updatedReview = await Review.findByIdAndUpdate(id, payload, {
      new: true,
      runValidators: true,
      session,
    });

    if (!updatedReview) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Failed to update review');
    }

    // 3. Recalculate Care Provider ratings ONLY if the rating was modified
    if (payload.rating !== undefined && payload.rating !== existingReview.rating) {
      const stats = await Review.aggregate([
        {
          $match: {
            careProvider: existingReview.careProvider,
            isDeleted: false,
          },
        },
        {
          $group: {
            _id: '$careProvider',
            totalReviews: { $sum: 1 },
            averageRating: { $avg: '$rating' },
          },
        },
      ]).session(session);

      const totalReviews = stats[0]?.totalReviews || 0;
      const averageRating = stats[0]?.averageRating
        ? Number(stats[0].averageRating.toFixed(1))
        : 0;

      await CareProvider.updateOne(
        {
          user: existingReview.careProvider
        },
        {
          totalReviews,
          averageRating,
        },
        { session }
      );
    }

    await session.commitTransaction();
    session.endSession();

    return updatedReview;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

// --------------- delete review ----------------
const deleteReview = async (id: string) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 1. Find the review and check if it exists or is already deleted
    const review = await Review.findById(id).session(session);
    if (!review || review.isDeleted) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Review not found');
    }

    // 2. Perform soft delete
    review.isDeleted = true;
    await review.save({ session });

    // 3. Recalculate stats for the care provider without the deleted review
    const stats = await Review.aggregate([
      {
        $match: {
          careProvider: review.careProvider,
          isDeleted: false, // Excludes the newly soft-deleted review
        },
      },
      {
        $group: {
          _id: '$careProvider',
          totalReviews: { $sum: 1 },
          averageRating: { $avg: '$rating' },
        },
      },
    ]).session(session);

    const totalReviews = stats[0]?.totalReviews || 0;
    const averageRating = stats[0]?.averageRating
      ? Number(stats[0].averageRating.toFixed(1))
      : 0;

    // 4. Update the Care Provider document
    await CareProvider.updateOne(
      {
        user: review.careProvider
      },
      {
        totalReviews,
        averageRating,
      },
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    return review;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

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