import express from 'express';
import { getAnalytics } from '../controllers/analytics.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';
import authorizeRoles from '../middleware/role.middleware.js';

const router = express.Router();

// GET /api/analytics
router.get('/', verifyToken, authorizeRoles('admin'), getAnalytics);

export default router;
