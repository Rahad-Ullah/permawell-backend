import express from 'express';
import { AppointmentController } from './appointment.controller';
import validateRequest from '../../middlewares/validateRequest';
import { AppointmentValidations } from './appointment.validation';
import auth from '../../middlewares/auth';
import { UserRole } from '../user/user.constant';

const router = express.Router();

// create appointment
router.post(
    '/create',
    auth(UserRole.CareSeeker),
    validateRequest(AppointmentValidations.createAppointmentSchema),
    AppointmentController.createAppointment
);

// update appointment
router.patch(
    '/:id',
    auth(UserRole.CareSeeker, UserRole.CareProvider),
    validateRequest(AppointmentValidations.updateAppointmentSchema),
    AppointmentController.updateAppointment
);

export const appointmentRoutes = router;