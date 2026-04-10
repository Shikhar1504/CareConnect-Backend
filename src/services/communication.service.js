import ScheduledTask from '../models/ScheduledTask.js';
import Patient from '../models/Patient.js';
import Alert from '../models/Alert.js';


// =======================
// Confirm Discharge
// =======================
const confirmDischarge = async (patientId) => {
  if (!patientId) throw new Error('patientId required');

  const patient = await Patient.findByIdAndUpdate(
    patientId,
    {
      status: 'discharged',
      dischargedAt: new Date()
    },
    { new: true }
  );

  if (!patient) throw new Error('Patient not found');

  // Schedule follow-up after 24h
  const sendAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  const task = await ScheduledTask.create({
    type: 'discharge_followup',
    patientId: patient._id,
    sendAt,
    payload: {
      message:
        'Hi, this is CareConnect. Are you feeling okay today? Reply YES or NO.'
    },
    status: 'pending'
  });

  return { patient, scheduledTask: task };
};


// =======================
// Handle Twilio Reply
// =======================
const handleTwilioReply = async (from, body) => {
  const text = (body || '').trim().toUpperCase();

  const patients = await Patient.find().select('phone');

patients.forEach(p => {
  console.log(`"${p.phone}"`, p.phone.length);
});

  // 🔥 Normalize phone
  let normalizedPhone = from.trim();

  // Remove whatsapp: prefix if present
  if (normalizedPhone.startsWith('whatsapp:')) {
    normalizedPhone = normalizedPhone.replace('whatsapp:', '');
  }

  console.log('Normalized phone:', normalizedPhone);

  const patient = await Patient.findOne({
    phone: normalizedPhone
  });

  if (!patient) {
    console.warn('No patient found for phone:', normalizedPhone);
    return;
  }

  let alert;

  if (text.includes('no') || text.includes('not')) {
    const existingAlert = await Alert.findOne({
      patientId: patient._id,
      status: 'open',
    });

    const botMessage = 'I have notified your care team. Someone will call you shortly.';

    if (existingAlert) {
      existingAlert.chat.push({ sender: 'patient', message: body });
      existingAlert.chat.push({ sender: 'bot', message: botMessage });
      await existingAlert.save();
      alert = existingAlert;
    } else {
      alert = await Alert.create({
        patientId: patient._id,
        message: `Patient replied "${body}" to follow-up.`,
        severity: 'high',
        status: 'open',
        source: 'Twilio SMS',
        meta: {
          reply: body,
          phone: normalizedPhone,
        },
        chat: [
          { sender: 'patient', message: body },
          { sender: 'bot', message: botMessage }
        ]
      });

      await Patient.findByIdAndUpdate(patient._id, {
        hasActiveAlert: true,
      });

      console.log(`[WEBSOCKET EVENT] Alert created for Patient ${patient._id}`);
    }
  }
};


export {
  confirmDischarge,
  handleTwilioReply,
};