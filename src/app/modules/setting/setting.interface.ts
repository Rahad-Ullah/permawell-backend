import { Model, ObjectId } from 'mongoose';

export interface ISetting {
  _id: ObjectId;
  platformFeePercentage: number;
  contactInfo: {
    email: string;
    phone: string;
    whatsApp: string;
    address: string;
    location: {
      type: string;
      coordinates: [number, number];
    };
  };
  socialLinks: {
    facebook: string;
    instagram: string;
    twitter: string;
    linkedin: string;
    youtube: string;
    tiktok: string;
    reddit: string;
    weChat: string;
    discord: string;
    telegram: string;
  };
}

export type SettingModel = Model<ISetting>;