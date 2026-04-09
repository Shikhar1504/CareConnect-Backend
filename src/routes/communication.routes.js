import express from 'express';
const router = express.Router();

import { verifyToken } from '../middleware/auth.middleware.js';
import authorizeRoles from '../middleware/role.middleware.js';

import {
  dischargeConfirm,
  twilioWebhook
} from '../controllers/communication.controller.js';

// 👨‍⚕️ Doctor only
router.post(
  '/discharge/confirm',
  verifyToken,
  authorizeRoles('doctor'),
  dischargeConfirm
);

// 🌐 Public webhook
router.post('/webhook/twilio/reply', twilioWebhook);

export default router;