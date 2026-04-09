import mongoose from 'mongoose';

const clinicalNoteSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true,
  },

  text: {
    type: String,
    required: true,
    maxlength: 5000,
  },

  type: {
    type: String,
    enum: ['admission', 'dictation', 'discharge'],
    required: true,
  },

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },

  // 🔥 AI output
  aiAnalysis: {
    trajectory: {
      type: String,
      enum: ['improving', 'stable', 'declining'],
    },
    summary: String,
  },

  // 🔥 RAG + filtering
  tags: [String],

  isDeleted: {
    type: Boolean,
    default: false,
  }

}, { timestamps: true });

// 🔥 Index for fast retrieval
clinicalNoteSchema.index({ patientId: 1, createdAt: -1 });

export default mongoose.model('ClinicalNote', clinicalNoteSchema);