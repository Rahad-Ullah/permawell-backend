import { Model, Types } from 'mongoose';
import { CareType, WorkPlaceType } from './careProvider.constants';

export interface ICareProvider {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  specialty: string;
  specialistTitle: string;
  careType: CareType;
  serviceOverview: string;
  workplace: string;
  licenseNumber: string;
  isKycVerified: boolean;
  experienceYears: number;
  averageRating: number;
  totalReviews: number;
  timezone: string;
  availabilities: {
    workplaceType: WorkPlaceType;
    isAvailable: boolean;
    weeklySchedules: {
      dayOfWeek: string;
      startTime: string;
      endTime: string;
    }[];
  }[];
  contactInfo: {
    phone: {
      countryCode: string;
      number: string;
    };
    landline: {
      countryCode: string;
      number: string;
    };
    website: string;
    facebook: string;
    twitter: string;
    instagram: string;
  };
  gallery: string[];
  createdAt: Date;
  updatedAt: Date;
}


export type CareProviderModel = Model<ICareProvider>;