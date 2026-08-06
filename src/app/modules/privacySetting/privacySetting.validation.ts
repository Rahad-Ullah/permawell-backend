import { z } from 'zod';
import { PrivacyAccessLevel } from './privacySetting.constants';

export const updatePrivacySettingValidation = z.object({
  body: z.object({
    emailAccess: z
      .nativeEnum(PrivacyAccessLevel)
      .optional(),
    mobileAccess: z
      .nativeEnum(PrivacyAccessLevel)
      .optional(),
    messagingAccess: z
      .nativeEnum(PrivacyAccessLevel)
      .optional(),
    fullAddressAccess: z
      .nativeEnum(PrivacyAccessLevel)
      .optional(),
  }).strict()
});

export const PrivacySettingValidations = {
  updatePrivacySettingValidation,
};