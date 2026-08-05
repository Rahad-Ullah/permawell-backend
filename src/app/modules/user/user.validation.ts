import { z } from 'zod';
import { UserGender, UserRole, UserStatus } from './user.constant';
import { objectId } from '../../../shared/objectIdValidator';

const createUserZodSchema = z.object({
  body: z
    .object({
      name: z.string({ required_error: 'Name is required' }),
      role: z.enum([UserRole.CareSeeker, UserRole.CareProvider], {
        required_error: 'Role is required',
      }),
      email: z
        .string({ required_error: 'Email is required' })
        .email('Invalid email address'),
      password: z
        .string({ required_error: 'Password is required' })
        .min(8, 'Password must be at least 8 characters long'),
    })
    .strict(),
});

const updateUserZodSchema = z.object({
  body: z
    .object({
      name: z.string().optional(),
      title: z.string().optional(),
      username: z
        .string()
        .trim()
        .min(3, "Username must be at least 3 characters long")
        .max(30, "Username cannot exceed 30 characters")
        .regex(
          /^[a-zA-Z]/,
          "Username must start with a letter"
        )
        .regex(
          /^[a-zA-Z0-9]+(-[a-zA-Z0-9]+)*$/,
          "Username can only contain letters, numbers, and single hyphens, and cannot end with a hyphen"
        )
        .transform((val) => val.toLowerCase())
        .optional(),
      gender: z.enum([UserGender.Male, UserGender.Female, UserGender.Other]).optional(),
      dob: z.coerce.date().optional(),
      nationality: z.string().optional(),
      language: z.string().optional(),
      bio: z.string().optional(),
      phone: z.object({
        countryCode: z.string().optional(),
        number: z.string().optional(),
      }).optional(),
      address: z.string().optional(),
      location: z
        .object({
          type: z.string().optional(),
          coordinates: z.array(z.number()).optional(),
        })
        .optional(),
      insurance: z.string().optional(),
      image: z.string().optional(),
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

// delete user
const deleteUserZodSchema = z.object({
  params: z
    .object({
      id: objectId('user id'),
    })
    .strict(),
});

// get single user
const getSingleUserZodSchema = z.object({
  params: z.object({
    id: objectId('user id'),
  }).strict(),
});

// get all care providers
const getAllCareProvidersZodSchema = z.object({
  query: z
    .object({
      searchTerm: z.string().optional(),
      page: z.string().optional(),
      limit: z.string().optional(),
    })
    .strict(),
});

export const UserValidation = {
  createUserZodSchema,
  updateUserZodSchema,
  updateStatusZodSchema,
  deleteUserZodSchema,
  getSingleUserZodSchema,
};
