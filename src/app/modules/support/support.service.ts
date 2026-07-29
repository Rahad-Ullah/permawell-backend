
import { Support } from './support.model';
import { ISupport } from './support.interface';
import ApiError from '../../../errors/ApiError';
import { StatusCodes } from 'http-status-codes';
import { SupportStatus } from './support.constants';


// ----------------- create support -----------------
const createSupport = async (payload: Partial<ISupport>) => {
  const MAX_TICKETS_24H = 3;

  // 1. Calculate time threshold (24 hours ago from right now)
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  // 2. Count tickets created in the last 24 hours for this user
  const ticketCount = await Support.countDocuments({
    user: payload.user,
    type: payload.type,
    status: SupportStatus.Open,
    createdAt: { $gte: twentyFourHoursAgo },
  });

  // 3. Enforce the rate limit
  if (ticketCount >= MAX_TICKETS_24H) {
    throw new ApiError(
      StatusCodes.TOO_MANY_REQUESTS,
      `We are currently looking into your other queries. Please wait a while and try again.`
    );
  }

  // 4. Create the ticket
  const result = await Support.create(payload);
  if (!result) {
    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      "Failed to create support ticket. Please try again later."
    );
  }

  return result;
};

export const SupportServices = {
  createSupport
};