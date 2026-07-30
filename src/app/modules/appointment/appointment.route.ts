import express from 'express';
import { AppointmentController } from './appointment.controller';

const router = express.Router();

router.get('/', AppointmentController);

export const appointmentRoutes = router;