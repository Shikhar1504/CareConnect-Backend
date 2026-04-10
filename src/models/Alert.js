import mongoose from 'mongoose';

const alertSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true,
  },

  message: {
    type: String,
    required: true,
  },

  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium',
  },

  status: {
    type: String,
    enum: ['open', 'resolved'],
    default: 'open',
  },

  source: {
    type: String,
    default: 'Twilio SMS',
  },

  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },

  taskId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ScheduledTask',
  },

  isAcknowledged: {
    type: Boolean,
    default: false,
  },

  resolvedAt: Date,
  resolutionNote: String,

  meta: mongoose.Schema.Types.Mixed,

  chat: [
    {
      sender: { type: String, enum: ['bot', 'patient'] },
      message: String,
      createdAt: { type: Date, default: Date.now }
    }
  ]

}, { timestamps: true });

// 🔥 Index for fast dashboard queries
alertSchema.index({ patientId: 1, status: 1, createdAt: -1 });

export default mongoose.model('Alert', alertSchema);