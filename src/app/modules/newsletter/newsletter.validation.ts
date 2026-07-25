import { z } from 'zod';
import { NewsletterSource } from './newsletter.constants';

const subscribeSchema = z.object({
  body: z
    .object({
      email: z.string().email('Invalid email address'),
      source: z.nativeEnum(NewsletterSource),
    })
    .strict(),
});

const unsubscribeSchema = z.object({
  body: z
    .object({
      email: z.string().email('Invalid email address'),
    })
    .strict(),
});

export const NewsletterValidations = {
  subscribeSchema,
  unsubscribeSchema,
};
