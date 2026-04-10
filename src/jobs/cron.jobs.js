import cron from 'node-cron';
import ScheduledTask from '../models/ScheduledTask.js';
import twilio from 'twilio';

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const startCronJobs = () => {
  cron.schedule('*/5 * * * *', async () => {
    console.log('[CRON] Running scheduled tasks check...');

    try {
      const now = new Date();

      const tasks = await ScheduledTask.find({
        status: 'pending',
        sendAt: { $lte: now }
      })
      .populate('patientId')
      .lean();

      for (let task of tasks) {
        try {
          // 🔥 Lock task
          await ScheduledTask.findByIdAndUpdate(task._id, {
            status: 'processing'
          });

          // 🔥 Retry protection
          if (task.retryCount >= 3) {
            await ScheduledTask.findByIdAndUpdate(task._id, {
              status: 'failed'
            });
            continue;
          }

          await client.messages.create({
            body: task.payload.message,
            from: process.env.TWILIO_WHATSAPP_NUMBER,
            to: `whatsapp:${task.patientId.phone}`
          });

          console.log(`[TWILIO] Message sent to ${task.patientId.phone}`);

          await ScheduledTask.findByIdAndUpdate(task._id, {
            status: 'sent',
            processedAt: new Date()
          });

        } catch (err) {
          console.error('[TWILIO ERROR]', err.message);

          await ScheduledTask.findByIdAndUpdate(task._id, {
            status: 'pending',
            $inc: { retryCount: 1 },
            error: err.message
          });
        }
      }

    } catch (error) {
      console.error('[CRON] Error executing tasks:', error);
    }
  });

  console.log('[CRON] Jobs initialized successfully.');
};

export default startCronJobs;