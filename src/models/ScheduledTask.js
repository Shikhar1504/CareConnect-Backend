import mongoose from 'mongoose';

const scheduledTaskSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['discharge_followup', 'medication_reminder'],
    default: 'discharge_followup',
  },
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true,
  },
  payload: {
    type: mongoose.Schema.Types.Mixed,
  },
  sendAt: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'sent', 'failed'],
    default: 'pending',
  },
  retryCount: {
    type: Number,
    default: 0,
  },
  maxRetries: {
    type: Number,
    default: 3,
  },
  error: {
    type: String,
  },
  processedAt: {
    type: Date,
  }
}, { timestamps: true });

// 🔥 Index for cron performance
scheduledTaskSchema.index({ sendAt: 1, status: 1 });

export default mongoose.model('ScheduledTask', scheduledTaskSchema);