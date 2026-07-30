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

// update appointment
const updateAppointment = catchAsync(async (req: Request, res: Response) => {
  const result = await AppointmentServices.updateAppointment(req.params.id, req.body, req.user);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Appointment updated successfully',
    data: result,
  });
});

// get single by id
const getAppointmentById = catchAsync(async (req: Request, res: Response) => {
  const result = await AppointmentServices.getAppointmentById(req.params.id);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Appointment fetched successfully',
    data: result,
  });
});

// get my appointments
const getMyAppointments = catchAsync(async (req: Request, res: Response) => {
  const result = await AppointmentServices.getMyAppointments(req.user.id, req.user.role, req.query);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Appointments fetched successfully',
    data: result.data,
    pagination: result.pagination
  });
});

export const AppointmentController = {
  createAppointment,
  updateAppointment,
  getAppointmentById,
  getMyAppointments,
};