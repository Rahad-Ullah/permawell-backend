import { Request, Response } from 'express';
import { AppointmentServices } from './appointment.service';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';

// create appointment
const createAppointment = catchAsync(async (req: Request, res: Response) => {
  const result = await AppointmentServices.createAppointment({ careSeeker: req.user.id, ...req.body });

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Appointment created successfully',
    data: result,
  });
});

export const AppointmentController = {
  createAppointment,
};