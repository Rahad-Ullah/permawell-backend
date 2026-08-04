import express from 'express';
import { FaqController } from './faq.controller';

const router = express.Router();

router.get('/', FaqController);

export const faqRoutes = router;