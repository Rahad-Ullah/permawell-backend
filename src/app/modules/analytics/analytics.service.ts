import { AppointmentStatus } from "../appointment/appointment.constants";
import { Appointment } from "../appointment/appointment.model";
import { Review } from "../review/review.model";

// ----------------- get care provider overview -----------------
const getProviderOverview = async (userId: string) => {
  const [
    totalAppointments,
    pendingAppointments,
    confirmedAppointments,
    cancelledAppointments,
    declinedAppointments,
    totalReviews
  ] = await Promise.all([
    Appointment.countDocuments({ careProvider: userId }),
    Appointment.countDocuments({ careProvider: userId, status: AppointmentStatus.Pending }),
    Appointment.countDocuments({ careProvider: userId, status: AppointmentStatus.Confirmed }),
    Appointment.countDocuments({ careProvider: userId, status: AppointmentStatus.Cancelled }),
    Appointment.countDocuments({ careProvider: userId, status: AppointmentStatus.Declined }),
    Review.countDocuments({ careProvider: userId })
  ])

  return {
    totalAppointments,
    pendingAppointments,
    confirmedAppointments,
    cancelledAppointments,
    declinedAppointments,
    totalReviews
  }
}

export const AnalyticsServices = {
  getProviderOverview
};