import Checkin from '../models/Checkin.js';

const getTodayDateString = () => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

export const getTodayCheckin = async (patientId) => {
  const date = getTodayDateString();

  let checkin = await Checkin.findOne({ patientId, date });

  if (!checkin) {
    checkin = await Checkin.create({
      patientId,
      date,
      tasks: [
        { title: 'Take medicines', completed: false },
        { title: 'Check vitals', completed: false },
        { title: 'Walk 15 minutes', completed: false }
      ]
    });
  }

  return checkin;
};

export const updateCheckin = async (patientId, tasks) => {
  const date = getTodayDateString();

  const checkin = await Checkin.findOneAndUpdate(
    { patientId, date },
    { tasks },
    { new: true }
  );

  if (!checkin) {
    throw new Error('Check-in record not found for today');
  }

  return checkin;
};
