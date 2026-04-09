import express from 'express';
const router = express.Router();

import { verifyToken } from '../middleware/auth.middleware.js';
import authorizeRoles from '../middleware/role.middleware.js';

import {
  predictRisks,
  simulateRisk,
  chat,
  dictation
} from '../controllers/ai.controller.js';

// 🔐 Auth first
router.use(verifyToken);

// 👨‍⚕️ Doctor + 👩‍⚕️ Nurse
router.post('/predict', authorizeRoles('doctor', 'nurse'), predictRisks);
router.post('/simulate', authorizeRoles('doctor', 'nurse'), simulateRisk);
router.post('/chat', authorizeRoles('doctor', 'nurse'), chat);
router.post('/dictation', authorizeRoles('doctor', 'nurse'), dictation);

export default router;