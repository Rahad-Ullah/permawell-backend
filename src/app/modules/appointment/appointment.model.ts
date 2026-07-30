import { Schema, model } from 'mongoose';
import { IAppointment, AppointmentModel } from './appointment.interface';
import { WorkPlaceType } from '../careProvider/careProvider.constants';
import { AppointmentStatus, PaymentMethod } from './appointment.constants';

const appointmentSchema = new Schema<IAppointment, AppointmentModel>({
  careSeeker: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  careProvider: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  startTime: {
    type: Date,
    required: true,
  },
  endTime: {
    type: Date,
    required: true,
  },
  careSeekerTimezone: {
    type: String,
    required: true,
  },
  careProviderTimezone: {
    type: String,
    required: true,
  },
  workplaceType: {
    type: String,
    enum: Object.values(WorkPlaceType),
    required: true,
  },
  paymentMethod: {
    type: String,
    enum: Object.values(PaymentMethod),
    required: true,
  },
  status: {
    type: String,
    enum: Object.values(AppointmentStatus),
    default: AppointmentStatus.Pending,
  },
  notes: {
    type: String,
    default: '',
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

export const Appointment = model<IAppointment, AppointmentModel>(
  'Appointment',
  appointmentSchema
);