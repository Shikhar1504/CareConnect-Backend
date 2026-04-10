import mongoose from 'mongoose';
import Patient from '../models/Patient.js';
import ClinicalNote from '../models/ClinicalNote.js';
import RiskAssessment from '../models/RiskAssessment.js';


// =======================
// Admit Patient
// =======================
const admitPatient = async (patientData, noteText, assignedDoctorId) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 1️⃣ Create Patient
    const patient = await Patient.create([{
      patientId: `PAT-${Date.now()}`,
      name: patientData.name,
      age: patientData.age,
      phone:patientData.phone,
      vitals: patientData.vitals,
      status: 'admitted',
      assignedDoctor: assignedDoctorId
    }], { session });

    const createdPatient = patient[0];

    // 2️⃣ Save admission note
    let savedNoteText = '';

    if (noteText) {
      await ClinicalNote.create([{
        patientId: createdPatient._id,
        text: noteText,
        type: 'admission',
        createdBy: assignedDoctorId
      }], { session });

      savedNoteText = noteText;
    }

    // 3️⃣ AI Risk Calculation
    try {
      const aiService = await import('./ai.service.js');
      await aiService.predictRisk(createdPatient, savedNoteText);
    } catch (err) {
      console.warn('AI service failed:', err.message);
    }

    await session.commitTransaction();
    session.endSession();

    return { patient: createdPatient };

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};


// =======================
// Get Patients List
// =======================
// const getPatientsList = async (doctorId, page = 1, limit = 10) => {
//   const skip = (page - 1) * limit;

//   const patients = await Patient.find({ assignedDoctor: doctorId })
//     .sort({ createdAt: -1 })
//     .skip(skip)
//     .limit(limit)
//     .select('name age status trajectory createdAt')
//     .populate('assignedDoctor', 'name role');

//   const total = await Patient.countDocuments({ assignedDoctor: doctorId });

//   return {
//     total,
//     page,
//     limit,
//     data: patients
//   };
// };

const getPatientsList = async (doctorId, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;

  const patients = await Patient.aggregate([
    // 1️⃣ Only logged-in doctor patients
    {
      $match: {
        assignedDoctor: new mongoose.Types.ObjectId(doctorId)
      }
    },

    // 2️⃣ Join risk assessments
    {
      $lookup: {
        from: 'riskassessments',
        localField: '_id',
        foreignField: 'patientId',
        as: 'riskData'
      }
    },

    // 3️⃣ Get latest risk (last element)
    {
      $addFields: {
        latestRisk: { $arrayElemAt: ['$riskData', -1] }
      }
    },

    // 4️⃣ Extract risk score safely
    {
      $addFields: {
        riskScore: {
          $ifNull: ['$latestRisk.baseScore', 0]
        }
      }
    },

    // 5️⃣ SORT by risk (dashboard requirement 🔥)
    {
      $sort: { riskScore: -1 }
    },

    // 6️⃣ Pagination
    { $skip: skip },
    { $limit: limit },

    // 7️⃣ Return only what frontend needs
    {
      $project: {
        name: 1,
        age: 1,
        vitals: 1,
        status: 1,
        trajectory: 1,
        riskScore: 1,
        hasActiveAlert: 1,
        notesCount: 1,
        assignedDoctor: 1,
        createdAt: 1
      }
    }
  ]);

  const total = await Patient.countDocuments({
    assignedDoctor: doctorId
  });

  return {
    total,
    page,
    limit,
    data: patients
  };
};


// =======================
// Get Patient Profile
// =======================
const getPatientProfile = async (patientId) => {
  const patient = await Patient.findById(patientId)
    .populate('assignedDoctor', 'name role');

  if (!patient) throw new Error('Patient not found');

  const notes = await ClinicalNote.find({ patientId })
    .sort({ createdAt: -1 })
    .limit(20);

  const riskAssessments = await RiskAssessment.find({ patientId })
    .sort({ createdAt: -1 })
    .limit(10);

  return {
    ...patient.toObject(),
    notes,
    riskAssessments,
  };
};


export {
  admitPatient,
  getPatientsList,
  getPatientProfile,
};