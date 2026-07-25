import { z } from 'zod';
import { UserRole, UserStatus, VerificationStatus } from './user.constant';
import { objectId } from '../../../shared/objectIdValidator';

const createUserZodSchema = z.object({
  body: z
    .object({
      firstName: z
        .string({ required_error: 'First name is required' })
        .nonempty('First name cannot be empty'),
      lastName: z
        .string({ required_error: 'Last name is required' })
        .nonempty('Last name cannot be empty'),
      role: z.enum([UserRole.Customer, UserRole.Driver, UserRole.Host], {
        required_error: 'Role is required',
      }),
      email: z
        .string({ required_error: 'Email is required' })
        .email('Invalid email address'),
      password: z
        .string({ required_error: 'Password is required' })
        .min(8, 'Password must be at least 8 characters long'),
      phone: z.coerce.string({ required_error: 'Phone is required' }).optional(),
      image: z.string().optional(),
    })
    .strict(),
});

const updateUserZodSchema = z.object({
  body: z
    .object({
      firstName: z.string().optional(),
      lastName: z.string().optional(),
      email: z.string().email('Invalid email address').optional(),
      phone: z.coerce.string().optional(),
      image: z.string().optional(),
      address: z
        .object({
          street: z.string().optional(),
          city: z.string().optional(),
          state: z.string().optional(),
          postalCode: z.string().optional(),
          country: z.string().optional(),
        })
        .optional(),
      location: z
        .object({
          type: z.string().optional(),
          coordinates: z.array(z.number()).optional(),
        })
        .optional(),
    })
    .strict(),
});

const updateStatusZodSchema = z
  .object({
    params: z.object({
      id: objectId('user id'),
    }).strict(),
    body: z.object({
      status: z.nativeEnum(UserStatus, {
        required_error: 'Status is required',
      }),
    }).strict(),
  })

// review kyc
const reviewKycZodSchema = z
  .object({
    params: z.object({
      id: objectId('user id'),
    }).strict(),
    body: z.object({
      status: z.enum([VerificationStatus.Verified, VerificationStatus.Rejected], {
        required_error: 'Status is required',
      }),
      reviewNotes: z.string().optional(),
    }).strict(),
  })

// delete user
const deleteUserZodSchema = z.object({
  params: z
    .object({
      id: objectId('user id'),
    })
    .strict(),
});

export const UserValidation = {
  createUserZodSchema,
  updateUserZodSchema,
  updateStatusZodSchema,
  reviewKycZodSchema,
  deleteUserZodSchema,
};
