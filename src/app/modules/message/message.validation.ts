import { z } from 'zod';
import { objectId } from '../../../shared/objectIdValidator';
import { MessageType } from './message.constant';

// Define the validation schema for Message
const createMessageSchema = z.object({
  body: z
    .object({
      chat: objectId('Invalid chat ID'),
      type: z.nativeEnum(MessageType),
      text: z.string().nonempty('Message content is required').optional(),
      image: z.any().optional(),
      media: z.any().optional(),
      doc: z.any().optional(),
    })
    .strict(),
});

export const MessageValidations = { createMessageSchema };
