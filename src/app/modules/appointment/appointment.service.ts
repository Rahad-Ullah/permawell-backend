import ApiError from '../../../errors/ApiError';
import { Appointment } from './appointment.model';
import { IAppointment } from './appointment.interface';
import { StatusCodes } from 'http-status-codes';
import { User } from '../user/user.model';
import { UserRole, UserStatus } from '../user/user.constant';
import { AppointmentStatus } from './appointment.constants';
import { JwtPayload } from 'jsonwebtoken';
import QueryBuilder from '../../builder/QueryBuilder';
import { sendNotifications } from '../../../helpers/notificationHelper';
import { NotificationType } from '../notification/notification.constant';


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
  const populatedAppointment = await appointment.populate('careSeeker', 'name');
  const populatedCareSeeker = populatedAppointment.careSeeker as any;

  // send notification to provider
  sendNotifications({
    type: NotificationType.AppointmentCreated,
    receiver: careProviderUser._id,
    title: 'New Appointment',
    message: `You have a new appointment request from ${populatedCareSeeker.name}`,
    referenceId: appointment._id.toString(),
  }).catch(err => console.error(err));

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

  // send notification to provider
  sendNotifications({
    type: NotificationType.AppointmentUpdated,
    receiver: user.role === UserRole.CareSeeker ? result.careProvider : result.careSeeker,
    title: `Appointment ${payload.status}`,
    message: `Your appointment has been ${payload.status.toLowerCase()}`,
    referenceId: result._id.toString(),
  }).catch(err => console.error(err));

  return result;
};

// get single appointment
const getAppointmentById = async (id: string) => {
  const result = await Appointment.findById(id).populate('careSeeker careProvider');

  return result;
};

// get care seeker or care provider appointments
const getMyAppointments = async (userId: string, role: string, query: Record<string, unknown>) => {
  const filter = { isDeleted: false } as any;
  // role based filter
  if (role === UserRole.CareSeeker) {
    filter.careSeeker = userId
  }

  if (role === UserRole.CareProvider) {
    filter.careProvider = userId
  }

  const appointmentQuery = new QueryBuilder(Appointment.find(filter), query)
    .filter()
    .sort()
    .paginate()
    .fields()

  const [data, pagination] = await Promise.all([
    appointmentQuery.modelQuery.populate('careSeeker careProvider', 'name title email username image isOnline isDeleted'),
    appointmentQuery.getPaginationInfo()
  ])

  return { data, pagination }
};


export const AppointmentServices = {
  createAppointment,
  updateAppointment,
  getAppointmentById,
  getMyAppointments,
};