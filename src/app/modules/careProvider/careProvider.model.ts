import { Schema, model } from 'mongoose';
import { ICareProvider, CareProviderModel } from './careProvider.interface';
import { CareType, WorkPlaceType } from './careProvider.constants';

const WeeklyScheduleSchema = new Schema(
  {
    dayOfWeek: { type: String, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
  },
  { _id: false }
);

const AvailabilitySchema = new Schema(
  {
    workplaceType: {
      type: String,
      enum: Object.values(WorkPlaceType),
      required: true,
    },
    isAvailable: { type: Boolean, default: true },
    weeklySchedules: { type: [WeeklyScheduleSchema], default: [] },
  },
  { _id: false }
);

const ContactInfoSchema = new Schema(
  {
    phone: {
      countryCode: { type: String, default: '' },
      number: { type: String, default: '' },
    },
    landline: {
      countryCode: { type: String, default: '' },
      number: { type: String, default: '' },
    },
    website: { type: String, default: '' },
    facebook: { type: String, default: '' },
    twitter: { type: String, default: '' },
    instagram: { type: String, default: '' },
  },
  { _id: false }
);

const careProviderSchema = new Schema<ICareProvider, CareProviderModel>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    specialty: { type: String, default: '' },
    specialistTitle: { type: String, default: '' },
    careType: { type: String, enum: Object.values(CareType), default: null },
    serviceOverview: { type: String, default: '' },
    workplace: { type: String, default: '' },
    licenseNumber: { type: String, default: '' },
    isKycVerified: { type: Boolean, default: false },
    experienceYears: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
    timezone: { type: String, default: '' },
    availabilities: { type: [AvailabilitySchema], default: [] },
    contactInfo: { type: ContactInfoSchema },
    gallery: { type: [String], default: [] },
  },
  { timestamps: true }
);

export const CareProvider = model<ICareProvider, CareProviderModel>(
  'CareProvider',
  careProviderSchema
);