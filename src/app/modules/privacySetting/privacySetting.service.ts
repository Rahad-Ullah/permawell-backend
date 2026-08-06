import { IPrivacySetting } from './privacySetting.interface';
import ApiError from '../../../errors/ApiError';
import { PrivacySetting } from './privacySetting.model';
import { StatusCodes } from 'http-status-codes';

// ---------------- update privacy setting -----------------
const updatePrivacySetting = async (
  userId: string,
  payload: Partial<IPrivacySetting>,
) => {
  const result = await PrivacySetting.findOneAndUpdate(
    { user: userId },
    payload,
    { new: true, upsert: true },
  );

  if (!result) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Privacy setting not found');
  }

  return result;
};

// ----------------- get privacy setting by user ------------------
const getPrivacySettingByUser = async (userId: string) => {
  const result = await PrivacySetting.findOne({ user: userId });

  if (!result) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Privacy setting not found');
  }

  return result;
};

export const PrivacySettingServices = {
  updatePrivacySetting,
  getPrivacySettingByUser,
};