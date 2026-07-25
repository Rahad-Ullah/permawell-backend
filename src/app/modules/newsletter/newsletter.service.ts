import { Newsletter } from './newsletter.model';
import { INewsletter } from './newsletter.interface';
import QueryBuilder from '../../builder/QueryBuilder';
import { NewsletterStatus } from './newsletter.constants';
import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';

// ----------- subscribe newsletter -----------
const subscribeNewsletter = async (payload: INewsletter): Promise<INewsletter> => {
  // check if email already exists
  const existingEmail = await Newsletter.findOne({
    email: payload.email,
    status: NewsletterStatus.Subscribed,
  });
  if (existingEmail) {
    throw new ApiError(StatusCodes.CONFLICT, 'You are already subscribed');
  }

  const result = await Newsletter.findOneAndUpdate(
    { email: payload.email },
    {
      ...payload,
      subscribedAt: new Date(),
      status: NewsletterStatus.Subscribed,
    },
    { upsert: true, new: true },
  );
  return result;
};

// ----------- unsubscribe newsletter -----------
const unsubscribeNewsletter = async (email: string): Promise<INewsletter> => {
  const result = await Newsletter.findOneAndUpdate(
    { email },
    { status: NewsletterStatus.Unsubscribed, unsubscribedAt: new Date() },
    { new: true },
  );
  if (!result) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Newsletter subscription not found');
  }
  return result;
};

// ----------- get all newsletter subscriptions -----------
const getAllNewsletters = async (query: Record<string, unknown>) => {
  const newsLetterQuery = new QueryBuilder(Newsletter.find(), query)
    .search(['email'])
    .filter()
    .sort()
    .paginate()
    .fields();

  const [data, pagination] = await Promise.all([
    newsLetterQuery.modelQuery.lean(),
    newsLetterQuery.getPaginationInfo(),
  ]);

  return { data, pagination };
};

export const NewsletterServices = {
  subscribeNewsletter,
  unsubscribeNewsletter,
  getAllNewsletters,
};
