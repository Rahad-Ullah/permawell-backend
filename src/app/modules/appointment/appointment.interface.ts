import { Model, Types } from 'mongoose';
import { WorkPlaceType } from '../careProvider/careProvider.constants';
import { AppointmentStatus, PaymentMethod } from './appointment.constants';

export interface IAppointment {
  _id: Types.ObjectId;
  careSeeker: Types.ObjectId;
  careProvider: Types.ObjectId;
  startTime: Date;
  endTime: Date;
  careSeekerTimezone: string;
  careProviderTimezone: string;
  workplaceType: WorkPlaceType;
  paymentMethod: PaymentMethod;
  status: AppointmentStatus;
  notes?: string;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type AppointmentModel = Model<IAppointment>;