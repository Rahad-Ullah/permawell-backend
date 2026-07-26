import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { User } from '../user/user.model';
import { IReview } from './review.interface';
import { Review } from './review.model';
import { UserRole } from '../user/user.constant';

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

export const ReviewServices = {
  createReview,
};