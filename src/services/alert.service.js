import Alert from '../models/Alert.js';
import Patient from '../models/Patient.js';


// =======================
// Get Alerts (Dashboard)
// =======================
export const getAlerts = async () => {
  const [alerts, activeCount, resolvedCount] = await Promise.all([
    Alert.find()
      .sort({ status: 1, createdAt: -1 }) // 🔥 active first
      .populate('patientId', 'name phone')
      .populate('assignedTo', 'name role'),

    Alert.countDocuments({ status: 'open' }),
    Alert.countDocuments({ status: 'resolved' })
  ]);

  return {
    activeCount,
    resolvedCount,
    alerts
  };
};


// =======================
// Resolve Alert
// =======================
export const resolveAlert = async (alertId) => {
  const alert = await Alert.findByIdAndUpdate(
    alertId,
    {
      status: 'resolved',
      resolvedAt: new Date(),
      isAcknowledged: true
    },
    { new: true }
  )
    .populate('patientId', 'name phone')
    .populate('assignedTo', 'name role');

  if (!alert) {
    throw new Error('Alert not found');
  }

  // 🔥 Check if any active alerts remain
  const remainingAlerts = await Alert.countDocuments({
    patientId: alert.patientId._id,
    status: 'open'
  });

  await Patient.findByIdAndUpdate(alert.patientId._id, {
    hasActiveAlert: remainingAlerts > 0
  });

  return alert;
};


// =======================
// Add Chat Message (Twilio)
// =======================
export const addChatMessage = async (alertId, sender, message) => {
  const alert = await Alert.findById(alertId);

  if (!alert) {
    throw new Error('Alert not found');
  }

  alert.chat.push({
    sender,
    message
  });

  await alert.save();

  return alert;
};


// =======================
// Create Alert (Webhook)
// =======================
export const createAlert = async ({
  patientId,
  message,
  severity = 'high',
  source = 'Twilio SMS',
  meta = {}
}) => {
  const alert = await Alert.create({
    patientId,
    message,
    severity,
    source,
    meta,
    status: 'open'
  });

  // 🔥 mark patient
  await Patient.findByIdAndUpdate(patientId, {
    hasActiveAlert: true
  });

  return alert;
};