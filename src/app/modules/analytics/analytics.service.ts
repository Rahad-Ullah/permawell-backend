import { AppointmentStatus } from "../appointment/appointment.constants";
import { Appointment } from "../appointment/appointment.model";
import { CareProvider } from "../careProvider/careProvider.model";
import { Review } from "../review/review.model";
import { UserRole } from "../user/user.constant";
import { User } from "../user/user.model";

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

// ---------------- admin dashboard overview -----------------
const getAdminOverview = async () => {
  const [
    totalAppointments,
    totalCareSeekers,
    totalCareProviders,
    topProviders,
  ] = await Promise.all([
    Appointment.countDocuments({}),
    User.countDocuments({ role: UserRole.CareSeeker }),
    User.countDocuments({ role: UserRole.CareProvider }),
    CareProvider
      .find({})
      .sort({ averageRating: -1, totalReviews: -1 })
      .limit(5)
      .select('user specialty specialistTitle  averageRating totalReviews')
      .populate('user', 'name image')
  ])

  return {
    totalAppointments,
    totalCareSeekers,
    totalCareProviders,
    topProviders
  }
}

// ---------------- get monthly user growth ----------------
const getMonthlyUserGrowth = async (query: Record<string, unknown>) => {
  const year = (query?.year as string) || new Date().getFullYear().toString()

  const result = await User.aggregate([
    {
      $match: {
        createdAt: {
          $gte: new Date(`${year}-01-01`),
          $lt: new Date(`${parseInt(year as string) + 1}-01-01`)
        }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        },
        count: { $sum: 1 }
      }
    },
    {
      $sort: {
        '_id.year': 1,
        '_id.month': 1
      }
    }
  ])

  // format the result
  const formattedResult = result.map((item) => ({
    year: item._id.year,
    month: item._id.month,
    count: item.count
  }))

  return formattedResult
}

export const AnalyticsServices = {
  getProviderOverview,
  getAdminOverview,
  getMonthlyUserGrowth
};