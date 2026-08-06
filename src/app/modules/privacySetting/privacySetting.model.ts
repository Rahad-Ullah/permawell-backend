import { Schema, model } from 'mongoose';
import { IPrivacySetting, PrivacySettingModel } from './privacySetting.interface';
import { PrivacyAccessLevel } from './privacySetting.constants';

const privacySettingSchema = new Schema<IPrivacySetting, PrivacySettingModel>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    emailAccess: {
      type: String,
      enum: PrivacyAccessLevel,
      default: PrivacyAccessLevel.AllProviders,
    },
    mobileAccess: {
      type: String,
      enum: PrivacyAccessLevel,
      default: PrivacyAccessLevel.AllProviders,
    },
    messagingAccess: {
      type: String,
      enum: PrivacyAccessLevel,
      default: PrivacyAccessLevel.AllProviders,
    },
    fullAddressAccess: {
      type: String,
      enum: PrivacyAccessLevel,
      default: PrivacyAccessLevel.AllProviders,
    },
  },
  { timestamps: true }
);

export const PrivacySetting = model<IPrivacySetting, PrivacySettingModel>(
  'PrivacySetting',
  privacySettingSchema
);