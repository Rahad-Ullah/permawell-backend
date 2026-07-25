import { Schema, model } from 'mongoose';
import { INewsletter, NewsletterModel } from './newsletter.interface';
import { NewsletterSource, NewsletterStatus } from './newsletter.constants';

const newsletterSchema = new Schema<INewsletter, NewsletterModel>({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  source: {
    type: String,
    enum: Object.values(NewsletterSource),
    required: true,
  },
  status: {
    type: String,
    enum: Object.values(NewsletterStatus),
    default: NewsletterStatus.Subscribed,
  },
  subscribedAt: {
    type: Date,
    default: Date.now,
  },
  unsubscribedAt: {
    type: Date,
    default: null,
  },
});

export const Newsletter = model<INewsletter, NewsletterModel>(
  'Newsletter',
  newsletterSchema
);