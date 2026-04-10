import Alert from '../models/Alert.js';
import Patient from '../models/Patient.js';

export const getAlerts = async () => {
  const alerts = await Alert.find()
    .sort({ createdAt: -1 })
    .populate('patientId', 'name phone');

  const activeCount = await Alert.countDocuments({ status: 'open' });
  const resolvedCount = await Alert.countDocuments({ status: 'resolved' });

  return {
    activeCount,
    resolvedCount,
    alerts
  };
};

export const resolveAlert = async (alertId) => {
  const alert = await Alert.findByIdAndUpdate(
    alertId,
    { status: 'resolved', resolvedAt: new Date() },
    { new: true }
  );

  if (!alert) {
    throw new Error('Alert not found');
  }

  await Patient.findByIdAndUpdate(
    alert.patientId,
    { hasActiveAlert: false }
  );

  return alert;
};
