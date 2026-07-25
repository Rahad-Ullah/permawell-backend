import { Model, ObjectId } from 'mongoose';
import { NewsletterSource, NewsletterStatus } from './newsletter.constants';

export interface INewsletter {
  _id: ObjectId;
  email: string;
  source: NewsletterSource;
  status: NewsletterStatus;
  subscribedAt: Date;
  unsubscribedAt: Date;
}

export type NewsletterModel = Model<INewsletter>;