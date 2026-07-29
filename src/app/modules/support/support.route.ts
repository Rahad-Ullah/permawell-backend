import express from 'express';
import { SupportController } from './support.controller';

const router = express.Router();

router.get('/', SupportController);

export const supportRoutes = router;