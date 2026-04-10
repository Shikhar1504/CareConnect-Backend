import mongoose from 'mongoose';

const checkinSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  date: {
    type: String,
    required: true
  },
  tasks: [
    {
      title: String,
      completed: { type: Boolean, default: false }
    }
  ]
}, { timestamps: true });

export default mongoose.model('Checkin', checkinSchema);
