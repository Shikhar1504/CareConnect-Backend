import mongoose from 'mongoose';

const riskAssessmentSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true,
  },

  baseScore: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
  },

  simulatedScore: {
    type: Number,
    min: 0,
    max: 100,
  },

  shapFactors: [{
    feature: {
      type: String,
      required: true,
    },
    impact: {
      type: Number,
      required: true,
    }
  }],

  // 🔥 ML metadata
  modelVersion: {
    type: String,
    default: 'v1',
  },

  // 🔥 Input snapshot (optional but powerful)
  inputFeatures: {
    type: mongoose.Schema.Types.Mixed,
  },

  // 🔥 Human-readable explanation
  summary: {
    type: String,
  },

  // 🔥 Active version tracking
  isActive: {
    type: Boolean,
    default: true,
  }

}, { timestamps: true });

// 🔥 Index for fast queries
riskAssessmentSchema.index({ patientId: 1, createdAt: -1 });

export default mongoose.model('RiskAssessment', riskAssessmentSchema);