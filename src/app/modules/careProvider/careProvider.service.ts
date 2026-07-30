import { ICareProvider } from './careProvider.interface';
import ApiError from '../../../errors/ApiError';
import { StatusCodes } from 'http-status-codes';
import { CareProvider } from './careProvider.model';
import deleteS3File from '../../../shared/deleteS3File';
import { DateTime } from 'luxon';

// ----------------- update care provider -----------------
const updateCareProviderToDB = async (
  userId: string,
  payload: Partial<ICareProvider>,
): Promise<Partial<ICareProvider | null>> => {
  const careProvider = await CareProvider.findOne({ user: userId });
  if (!careProvider) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Care provider doesn't exist!");
  }

  const updatedCareProvider = await CareProvider.findByIdAndUpdate(
    careProvider._id,
    payload,
    { new: true },
  );

  if (!updatedCareProvider) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to update user");
  }

  return updatedCareProvider;
};

// ------------------ update gallery ------------------
const updateGalleryToDB = async (
  userId: string,
  payload: { newImages?: string[]; removeImages?: string[] }
): Promise<Partial<ICareProvider | null>> => {
  const careProvider = await CareProvider.findOne({ user: userId });
  if (!careProvider) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Care provider doesn't exist!");
  }

  const { newImages = [], removeImages = [] } = payload;

  // 1. Validate that all requested removal images actually exist in the current gallery
  if (removeImages.length > 0) {
    const existingGallery = new Set(careProvider.gallery || []);
    const hasInvalidImage = removeImages.some((img) => !existingGallery.has(img));

    if (hasInvalidImage) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "One or more images requested for removal were not found in the gallery!"
      );
    }
  }

  // Validate gallery max upload limit
  const totalImages = careProvider.gallery.length + newImages.length - removeImages.length;
  if (totalImages > 10) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Gallery can only contain 10 images!"
    );
  }

  // 2. Filter out removed images and append new ones safely in memory
  const removalSet = new Set(removeImages);
  const updatedGallery = careProvider.gallery.filter((img) => !removalSet.has(img));

  // Prevent duplicate additions if necessary
  updatedGallery.push(...newImages);

  // 3. Save updated care provider
  careProvider.gallery = updatedGallery;
  await careProvider.save();

  // 4. Cleanup S3 files asynchronously without failing the overall DB update
  if (removeImages.length > 0) {
    // Promise.allSettled prevents one S3 failure from breaking the whole response block
    Promise.allSettled(removeImages.map((image) => deleteS3File(image))).catch(
      (err) => console.error("Failed to cleanup S3 files:", err)
    );
  }

  return careProvider;
};

// ------------------ get care provider availability -------------------
// Utility helper to convert "HH:mm" string into total minutes from midnight
const timeToMinutes = (timeStr: string): number => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
};

export const getAvailability = async (
  providerId: string,
  dateStr: string,        // e.g., "2026-07-30"
  workplaceType: string,  // e.g., "ONLINE" or "CLINIC"
  userTimezone: string    // e.g., "Asia/Tokyo" or "America/New_York"
) => {
  // 1. Fetch Care Provider
  const careProvider = await CareProvider.findById(providerId);
  if (!careProvider) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Care provider doesn't exist!");
  }

  // 2. Locate requested workplace availability config
  const availabilityConfig = careProvider.availabilities.find(
    (a) => a.workplaceType === workplaceType && a.isAvailable
  );

  if (!availabilityConfig || !availabilityConfig.weeklySchedules.length) {
    return []; // No active schedules for this workplace type
  }

  // 3. Define User's local day range in UTC
  // Parse YYYY-MM-DD in the user's time zone
  const userStartOfDay = DateTime.fromISO(dateStr, { zone: userTimezone }).startOf('day');
  const userEndOfDay = userStartOfDay.endOf('day');

  if (!userStartOfDay.isValid) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid date format or timezone!");
  }

  // 4. Generate all 30-minute candidate slots across the user's day
  const SLOT_DURATION_MINUTES = 30;
  const availableSlots: { startTime: string; endTime: string }[] = [];

  let currentSlotStart = userStartOfDay;

  while (currentSlotStart < userEndOfDay) {
    const currentSlotEnd = currentSlotStart.plus({ minutes: SLOT_DURATION_MINUTES });

    // If the 30-min slot spills past the user's local day end, stop
    if (currentSlotEnd > userEndOfDay) break;

    // 5. Convert candidate slot into the Provider's local timezone
    const providerSlotStart = currentSlotStart.setZone(careProvider.timezone);
    const providerSlotEnd = currentSlotEnd.setZone(careProvider.timezone);

    // Get the provider's day of the week (e.g., "Monday", "Tuesday")
    const providerDayOfWeek = providerSlotStart.toFormat('EEEE');

    // Find provider availability rule for this specific weekday
    const daySchedule = availabilityConfig.weeklySchedules.find(
      (s) => s.dayOfWeek.toLowerCase() === providerDayOfWeek.toLowerCase()
    );

    if (daySchedule) {
      // Calculate minutes from midnight in provider's local time
      const slotStartMinutes = providerSlotStart.hour * 60 + providerSlotStart.minute;
      const slotEndMinutes = providerSlotEnd.hour * 60 + providerSlotEnd.minute;

      const scheduleStartMinutes = timeToMinutes(daySchedule.startTime);
      let scheduleEndMinutes = timeToMinutes(daySchedule.endTime);

      // Handle overnight shift edge-case (e.g., 22:00 to 02:00)
      if (scheduleEndMinutes <= scheduleStartMinutes) {
        scheduleEndMinutes += 24 * 60;
      }

      // 6. Check if slot falls completely within provider working hours
      const isWithinWorkingHours =
        slotStartMinutes >= scheduleStartMinutes &&
        slotEndMinutes <= scheduleEndMinutes;

      if (isWithinWorkingHours) {
        availableSlots.push({
          startTime: currentSlotStart.toUTC().toISO(), // ISO format with UTC timezone
          endTime: currentSlotEnd.toUTC().toISO(),
        });
      }
    }

    // Move to next 30-minute increment
    currentSlotStart = currentSlotEnd;
  }

  // TODO: Filter out already booked slots from the Appointment database collection here

  return availableSlots;
};

export const CareProviderServices = {
  updateCareProviderToDB,
  updateGalleryToDB,
  getAvailability,
};