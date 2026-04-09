import mongoose from 'mongoose';

const patientSchema = new mongoose.Schema({
  patientId: {
    type: String,
    unique: true,
  },

  name: {
    type: String,
    required: true,
  },

  age: {
    type: Number,
    required: true,
  },

  phone:{
    type:String,
    required:true
  },

  vitals: {
    heartRate: {
      type: Number,
      min: 30,
      max: 200,
    },
    bloodPressure: {
      systolic: Number,
      diastolic: Number,
    },
    temperature: {
      type: Number,
      min: 30,
      max: 45,
    },
    oxygenLevel: {
      type: Number,
      min: 0,
      max: 100,
    }
  },

  status: {
    type: String,
    enum: ['admitted', 'discharged', 'critical'],
    default: 'admitted',
  },

  trajectory: {
    type: String,
    enum: ['improving', 'stable', 'declining'],
    default: 'stable',
  },

  assignedDoctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },

  admittedAt: {
    type: Date,
    default: Date.now,
  },

  dischargedAt: Date,

  hasActiveAlert: {
    type: Boolean,
    default: false,
  },

  notesCount: {
    type: Number,
    default: 0,
  }

}, { timestamps: true });

// 🔥 Indexing
patientSchema.index({ assignedDoctor: 1, status: 1 });

export default mongoose.model('Patient', patientSchema);