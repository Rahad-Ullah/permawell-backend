import ApiError from '../../../errors/ApiError';
import { Appointment } from './appointment.model';
import { IAppointment } from './appointment.interface';
import { StatusCodes } from 'http-status-codes';
import { User } from '../user/user.model';
import { UserRole, UserStatus } from '../user/user.constant';
import { AppointmentStatus } from './appointment.constants';
import { JwtPayload } from 'jsonwebtoken';


// ---------------- create appointment -----------------
const createAppointment = async (payload: IAppointment): Promise<IAppointment> => {
  // check if the care provider exist and is active
  const careProviderUser = await User.findById(payload.careProvider).populate('roleRef');
  if (!careProviderUser || careProviderUser.isDeleted || careProviderUser.status !== UserStatus.Active) {
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      'Care provider not found or not active'
    );
  }

  // check if the provider is available at the specified time
  const existingAppointments = await Appointment.countDocuments({
    careProvider: payload.careProvider,
    startTime: { $lt: payload.endTime },
    endTime: { $gt: payload.startTime },
    status: { $in: [AppointmentStatus.Pending, AppointmentStatus.Confirmed] }
  });
  if (existingAppointments > 0) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Provider is not available at the specified time'
    );
  }

  // attach provider timezone
  const careProvider = careProviderUser.roleRef as any;
  payload.careProviderTimezone = careProvider?.timezone || 'UTC';

  const appointment = await Appointment.create(payload);

  return appointment;
};

// update appointment
const updateAppointment = async (id: string, payload: IAppointment, user: JwtPayload) => {
  // check status and user role
  const careSeekerPermissions = [AppointmentStatus.Cancelled, AppointmentStatus.Completed];
  const careProviderPermissions = [AppointmentStatus.Declined, AppointmentStatus.Confirmed, AppointmentStatus.Cancelled];

  if (user.role === UserRole.CareSeeker && !careSeekerPermissions.includes(payload.status)) {
    throw new ApiError(StatusCodes.FORBIDDEN, 'You are not allowed to update this appointment');
  }

  if (user.role === UserRole.CareProvider && !careProviderPermissions.includes(payload.status)) {
    throw new ApiError(StatusCodes.FORBIDDEN, 'You are not allowed to update this appointment');
  }

  const result = await Appointment.findByIdAndUpdate(id, payload, { new: true });

  if (!result) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Appointment not found');
  }

  return result;
};


export const AppointmentServices = {
  createAppointment,
  updateAppointment,
};