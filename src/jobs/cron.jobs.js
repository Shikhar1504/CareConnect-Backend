import cron from 'node-cron';
import ScheduledTask from '../models/ScheduledTask.js';

// Job that runs every 5 minutes to trigger overdue Twilio messages
const startCronJobs = () => {
  cron.schedule('*/5 * * * *', async () => {
    console.log('[CRON] Running scheduled tasks check...');
    try {
      const now = new Date();
      const tasks = await ScheduledTask.find({
        status: 'pending',
        sendAt: { $lte: now }
      }).populate('patientId');

      for (let task of tasks) {
        // Here we would make the actual API call to Twilio:
        /*
        const client = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
        await client.messages.create({ 
          body: task.payload.message, 
          from: process.env.TWILIO_WHATSAPP_NUMBER, 
          to: task.patientId.phoneNumber // Assuming patient schema had phoneNumber
        });
        */

        console.log(`[TWILIO MOCK] WhatsApp message sent to patient ${task.patientId._id}: ${task.payload.message}`);
        
        task.status = 'sent';
        await task.save();
      }
    } catch (error) {
      console.error('[CRON] Error executing tasks:', error);
    }
  });
  console.log('[CRON] Jobs initialized successfully.');
};

export default startCronJobs;

// Below is to replace above mock 
// do npm i twilio

// import cron from 'node-cron';
// import ScheduledTask from '../models/ScheduledTask.js';
// import twilio from 'twilio';

// const client = twilio(
//   process.env.TWILIO_ACCOUNT_SID,
//   process.env.TWILIO_AUTH_TOKEN
// );

// const startCronJobs = () => {
//   cron.schedule('*/5 * * * *', async () => {
//     console.log('[CRON] Running scheduled tasks check...');

//     try {
//       const now = new Date();

//       const tasks = await ScheduledTask.find({
//         status: 'pending',
//         sendAt: { $lte: now }
//       }).populate('patientId');

//       for (let task of tasks) {
//         try {
//           // ✅ REAL TWILIO CALL
//           await client.messages.create({
//             body: task.payload.message,
//             from: process.env.TWILIO_WHATSAPP_NUMBER,
//             to: `whatsapp:${task.patientId.phone}` // IMPORTANT
//           });

//           console.log(`[TWILIO] Message sent to ${task.patientId.phone}`);

//           task.status = 'sent';
//           task.processedAt = new Date();
//           await task.save();

//         } catch (err) {
//           console.error('[TWILIO ERROR]', err.message);

//           task.status = 'failed';
//           task.error = err.message;
//           await task.save();
//         }
//       }

//     } catch (error) {
//       console.error('[CRON] Error executing tasks:', error);
//     }
//   });

//   console.log('[CRON] Jobs initialized successfully.');
// };

// export default startCronJobs;