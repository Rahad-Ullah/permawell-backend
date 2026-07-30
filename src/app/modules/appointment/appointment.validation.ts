import { z } from 'zod';
import { WorkPlaceType } from '../careProvider/careProvider.constants';
import { AppointmentStatus, PaymentMethod } from './appointment.constants';
import { objectId } from '../../../shared/objectIdValidator';

// create appointment validation schema
const createAppointmentSchema = z.object({
  body: z.object({
    careProvider: objectId('careProvider'),
    startTime: z.string().datetime(),
    endTime: z.string().datetime(),
    careSeekerTimezone: z.string().nonempty(),
    workplaceType: z.nativeEnum(WorkPlaceType),
    paymentMethod: z.nativeEnum(PaymentMethod),
    notes: z.string(),
  }).strict(),
});

// update appointment validation schema
const updateAppointmentSchema = z.object({
  params: z.object({
    id: objectId('id')
  }).strict(),
  body: z.object({
    status: z.enum([
      AppointmentStatus.Confirmed,
      AppointmentStatus.Declined,
      AppointmentStatus.Cancelled,
      AppointmentStatus.Completed
    ]).optional(),
  }).strict(),
});

// get single appointment validation schema
const getSingleAppointmentSchema = z.object({
  params: z.object({
    id: objectId('id')
  }).strict()
});

// get appointments by user validation schema
const getAppointmentsByUserSchema = z.object({
  params: z.object({
    id: objectId('id')
  }).strict()
});

export const AppointmentValidations = {
  createAppointmentSchema,
  updateAppointmentSchema,
  getSingleAppointmentSchema,
  getAppointmentsByUserSchema
};