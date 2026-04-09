import mongoose from 'mongoose';
import * as patientService from '../services/patient.service.js';


// =======================
// Admit Patient
// =======================
const admitPatient = async (req, res, next) => {
  try {
    if (req.user.role !== 'doctor') {
      return res.status(403).json({
        message: 'Only doctors can admit patients',
      });
    }

    const { patientData, noteText } = req.body;

    if (!patientData || !patientData.name || !patientData.age) {
      return res.status(400).json({
        message: 'Patient name and age are required.',
      });
    }

    const assignedDoctorId = req.user.id;

    const result = await patientService.admitPatient(
      patientData,
      noteText,
      assignedDoctorId
    );

    res.status(201).json({
      message: 'Patient admitted successfully',
      data: result,
    });

  } catch (error) {
    next(error);
  }
};


// =======================
// Get Patients List
// =======================
const getPatientsList = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const patients = await patientService.getPatientsList(
      req.user.id,
      page,
      limit
    );

    res.status(200).json(patients);

  } catch (error) {
    next(error);
  }
};


// =======================
// Get Patient Profile
// =======================
const getPatientProfile = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: 'Invalid patient ID',
      });
    }

    const profile = await patientService.getPatientProfile(id);

    res.status(200).json(profile);

  } catch (error) {
    if (error.message === 'Patient not found') {
      return res.status(404).json({ message: error.message });
    }
    next(error);
  }
};


export {
  admitPatient,
  getPatientsList,
  getPatientProfile,
};