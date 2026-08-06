import { Model, Types } from 'mongoose';
import { PrivacyAccessLevel } from './privacySetting.constants';

export interface IPrivacySetting {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  emailAccess: PrivacyAccessLevel;
  mobileAccess: PrivacyAccessLevel;
  messagingAccess: PrivacyAccessLevel;
  fullAddressAccess: PrivacyAccessLevel;
  createdAt: Date;
  updatedAt: Date;
}

export type PrivacySettingModel = Model<IPrivacySetting>;