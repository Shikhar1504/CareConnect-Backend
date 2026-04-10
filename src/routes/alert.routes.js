import express from 'express';
import * as alertController from '../controllers/alert.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';
import authorizeRoles from '../middleware/role.middleware.js';

const router = express.Router();

router.get(
  '/',
  verifyToken,
  authorizeRoles('doctor', 'nurse', 'admin'),
  alertController.getAlerts
);

router.patch(
  '/:id/resolve',
  verifyToken,
  authorizeRoles('doctor', 'nurse'),
  alertController.resolveAlert
);

export default router;
