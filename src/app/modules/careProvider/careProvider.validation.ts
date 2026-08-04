import { z } from 'zod';
import { CareType, WorkPlaceType } from './careProvider.constants';
import { objectId } from '../../../shared/objectIdValidator';

// update care provider validation
const WeeklyScheduleSchema = z.object({
  dayOfWeek: z.string(),
  startTime: z.string(),
  endTime: z.string(),
});

const AvailabilitySchema = z.object({
  workplaceType: z.nativeEnum(WorkPlaceType),
  isAvailable: z.boolean(),
  weeklySchedules: z.array(WeeklyScheduleSchema),
});

const ContactInfoSchema = z.object({
  phone: z.object({
    countryCode: z.string().optional(),
    number: z.string().optional(),
  }).optional(),
  landline: z.object({
    countryCode: z.string().optional(),
    number: z.string().optional(),
  }).optional(),
  website: z.string().optional(),
  facebook: z.string().optional(),
  twitter: z.string().optional(),
  instagram: z.string().optional(),
}).strict();

// update care provider validation schema
const updateCareProviderZodSchema = z.object({
  body: z.object({
    specialty: z.string().optional(),
    specialistTitle: z.string().optional(),
    careType: z.nativeEnum(CareType).optional(),
    serviceOverview: z.string().optional(),
    workplace: z.string().optional(),
    licenseNumber: z.string().optional(),
    experienceYears: z.number().optional(),
    timezone: z.string().optional(),
    availabilities: z.array(AvailabilitySchema).optional(),
    contactInfo: ContactInfoSchema.optional(),
  }).strict()
});

// update gallery validation schema
const updateGalleryZodSchema = z.object({
  body: z.object({
    removeImages: z.array(z.string().url()).optional(),
    image: z.any().optional(),
  }).strict()
});

// get availability
const getAvailabilityZodSchema = z.object({
  query: z.object({
    provider: objectId('Care Provider ID'),
    date: z.string().date().refine((date) => {
      const today = new Date().toISOString().split("T")[0];
      return date >= today;
    }, {
      message: "Please provide today's date or a future date",
    }),
    workplaceType: z.nativeEnum(WorkPlaceType),
    timezone: z.string().nonempty(),
  })
});

export const CareProviderValidations = {
  updateCareProviderZodSchema,
  updateGalleryZodSchema,
  getAvailabilityZodSchema
};