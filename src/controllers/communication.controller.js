import * as communicationService from '../services/communication.service.js';


// =======================
// Discharge Patient
// =======================
const dischargeConfirm = async (req, res, next) => {
  try {
    if (req.user.role !== 'doctor') {
      return res.status(403).json({
        message: 'Only doctors can discharge patients'
      });
    }

    const { patientId } = req.body;

    if (!patientId) {
      return res.status(400).json({
        message: 'patientId is required'
      });
    }

    const result = await communicationService.confirmDischarge(patientId);

    res.status(200).json({
      message: 'Patient discharged and message scheduled',
      data: result
    });

  } catch (error) {
    next(error);
  }
};


// =======================
// Twilio Webhook
// =======================
const twilioWebhook = async (req, res) => {
  try {
    const { From, Body } = req.body;

    if (!From || !Body) {
      return res.status(400).send('Invalid webhook payload');
    }

    const normalizedBody = Body.trim().toLowerCase();

    console.log('Twilio reply received:', { From, Body });

    await communicationService.handleTwilioReply(From, normalizedBody);

    // Twilio requires valid XML response
    res.status(200).send('<Response></Response>');

  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).send('Error processing webhook');
  }
};


export {
  dischargeConfirm,
  twilioWebhook
};