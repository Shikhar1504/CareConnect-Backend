import express from 'express';
const router = express.Router();

import { verifyToken } from '../middleware/auth.middleware.js';
import authorizeRoles from '../middleware/role.middleware.js';

import {
  admitPatient,
  getPatientsList,
  getPatientProfile
} from '../controllers/patient.controller.js';

// 🔐 Apply auth globally
router.use(verifyToken);

// 👨‍⚕️ Doctor only
router.post('/admit', authorizeRoles('doctor'), admitPatient);

// 👨‍⚕️ Doctor + 👩‍⚕️ Nurse + 🛠️ Admin
router.get('/', authorizeRoles('doctor', 'nurse', 'admin'), getPatientsList);

router.get('/:id', authorizeRoles('doctor', 'nurse', 'admin'), getPatientProfile);

export default router;