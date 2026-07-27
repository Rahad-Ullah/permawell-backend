import { z } from 'zod';

// create chat validation
export const createChatValidation = z.object({
  body: z
    .object({
      participants: z
        .array(
          z
            .string({ required_error: 'Participant id are required' })
            .length(24, 'Invalid participant id')
            .nonempty('Participant id cannot be empty')
        )
        .min(1, 'Minimum 1 participants are required'),
    })
    .strict(),
});

export const ChatValidations = { createChatValidation };
