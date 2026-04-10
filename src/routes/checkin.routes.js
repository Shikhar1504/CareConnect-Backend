import express from 'express';
import * as checkinController from '../controllers/checkin.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';
import authorizeRoles from '../middleware/role.middleware.js';

const router = express.Router();

router.get(
  '/checkin',
  verifyToken,
  authorizeRoles('patient'),
  checkinController.getTodayCheckin
);

router.post(
  '/checkin',
  verifyToken,
  authorizeRoles('patient'),
  checkinController.updateCheckin
);

export default router;
