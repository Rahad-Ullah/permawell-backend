import { z } from 'zod';
import { PrivacyAccessLevel } from './privacySetting.constants';

export const UpdatePrivacySettingValidation = z.object({
  body: z.object({
    emailAccess: z
      .nativeEnum(PrivacyAccessLevel, {
        message: 'Invalid email access level',
      })
      .optional(),
    mobileAccess: z
      .nativeEnum(PrivacyAccessLevel, {
        message: 'Invalid mobile access level',
      })
      .optional(),
    messagingAccess: z
      .nativeEnum(PrivacyAccessLevel, {
        message: 'Invalid messaging access level',
      })
      .optional(),
    fullAddressAccess: z
      .nativeEnum(PrivacyAccessLevel, {
        message: 'Invalid full address access level',
      })
      .optional(),
  }).strict()
});

export const PrivacySettingValidations = {
  UpdatePrivacySettingValidation,
};