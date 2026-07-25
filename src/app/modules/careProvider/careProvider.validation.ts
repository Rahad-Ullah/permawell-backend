import { z } from 'zod';
import { CareType, WorkPlaceType } from './careProvider.constants';

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
});

const updateCareProviderZodSchema = z.object({
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
  gallery: z.array(z.string()).optional(),
});

export const CareProviderValidations = {
  updateCareProviderZodSchema
};