import { ICareProvider } from './careProvider.interface';
import ApiError from '../../../errors/ApiError';
import { StatusCodes } from 'http-status-codes';
import { CareProvider } from './careProvider.model';
import deleteS3File from '../../../shared/deleteS3File';
import { DateTime } from 'luxon';
import { Appointment } from '../appointment/appointment.model';
import { AppointmentStatus } from '../appointment/appointment.constants';

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
export const getAvailability = async (
  providerId: string,
  dateStr: string,
  workplaceType: string,
  userTimezone: string
) => {
  // 1. Fetch provider
  const careProvider = await CareProvider.findOne({ user: providerId });
  if (!careProvider) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Care provider doesn't exist!");
  }

  // 2. Locate workplace schedule config
  const scheduleConfig = careProvider.availabilities.find(
    (a) => a.workplaceType === workplaceType && a.isAvailable
  );

  if (!scheduleConfig?.weeklySchedules?.length) {
    return [];
  }

  // 3. Define user's local day boundaries (00:00:00 to 23:59:59)
  const userStartOfDay = DateTime.fromISO(dateStr, { zone: userTimezone }).startOf('day');
  const userEndOfDay = userStartOfDay.endOf('day');

  if (!userStartOfDay.isValid) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid date format or timezone!');
  }

  // 4. Generate 30-minute candidate slots
  const SLOT_DURATION_MINUTES = 30;

  const BOOKING_BUFFER_MINUTES = 15;
  const minAllowedStartMs = DateTime.now().plus({ minutes: BOOKING_BUFFER_MINUTES }).toMillis();

  const candidateSlots: { startTime: string; endTime: string }[] = [];
  let currentSlotStart = userStartOfDay;

  while (currentSlotStart < userEndOfDay) {
    const currentSlotEnd = currentSlotStart.plus({ minutes: SLOT_DURATION_MINUTES });
    if (currentSlotEnd > userEndOfDay) break;

    // A. Check what day/time this slot corresponds to in the provider's timezone
    const providerSlotStart = currentSlotStart.setZone(careProvider.timezone);
    const dayOfWeek = providerSlotStart.toFormat('EEEE');

    // B. Find provider schedule for this day
    const daySchedule = scheduleConfig.weeklySchedules.find(
      (s) => s.dayOfWeek.toLowerCase() === dayOfWeek.toLowerCase()
    );

    if (daySchedule) {
      // C. Build provider's working hours as DateTime objects on that specific date
      const providerDateStr = providerSlotStart.toISODate();

      const workStart = DateTime.fromISO(`${providerDateStr}T${daySchedule.startTime}`, {
        zone: careProvider.timezone,
      });

      let workEnd = DateTime.fromISO(`${providerDateStr}T${daySchedule.endTime}`, {
        zone: careProvider.timezone,
      });

      // Handle overnight shifts (e.g., 22:00 -> 02:00)
      if (workEnd <= workStart) {
        workEnd = workEnd.plus({ days: 1 });
      }

      // D. Verify slot fits within provider working hours
      const isWithinHours =
        currentSlotStart.toMillis() >= workStart.toMillis() &&
        currentSlotEnd.toMillis() <= workEnd.toMillis();

      // E. Check if slot starts after the buffer period
      const isFutureSlot = currentSlotStart.toMillis() >= minAllowedStartMs;

      if (isWithinHours && isFutureSlot) {
        candidateSlots.push({
          startTime: currentSlotStart.toUTC().toISO()!,
          endTime: currentSlotEnd.toUTC().toISO()!,
        });
      }
    }

    // Advance to next 30-min window
    currentSlotStart = currentSlotEnd;
  }

  if (candidateSlots.length === 0) {
    return [];
  }

  // 5. Fetch booked appointments overlapping user's local day range
  // An appointment overlaps if it starts before userEndOfDay AND ends after userStartOfDay
  const bookedAppointments = await Appointment.find({
    careProvider: providerId,
    startTime: { $lt: userEndOfDay.toJSDate() },
    endTime: { $gt: userStartOfDay.toJSDate() },
    status: { $in: [AppointmentStatus.Pending, AppointmentStatus.Confirmed] },
  }).lean();

  // 6. Filter out candidate slots that overlap with any existing appointment
  const availableSlots = candidateSlots
    .filter((slot) => {
      const isBooked = bookedAppointments.some((appt) => {
        const apptStartMs = new Date(appt.startTime).getTime();
        const apptEndMs = new Date(appt.endTime).getTime();
        const slotStartMs = new Date(slot.startTime).getTime();
        const slotEndMs = new Date(slot.endTime).getTime();

        // Two time ranges overlap if: SlotStart < ApptEnd AND SlotEnd > ApptStart
        return slotStartMs < apptEndMs && slotEndMs > apptStartMs;
      });

      return !isBooked;
    })

  return availableSlots;
};

export const CareProviderServices = {
  updateCareProviderToDB,
  updateGalleryToDB,
  getAvailability,
};