import Checkin from '../models/Checkin.js';

const getTodayDateString = () => {
  return new Date().toISOString().split('T')[0];
};


// =======================
// Get Today Checkin
// =======================
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


// =======================
// Update Checkin
// =======================
export const updateCheckin = async (patientId, tasks) => {
  const date = getTodayDateString();

  const checkin = await Checkin.findOneAndUpdate(
    { patientId, date },
    { $set: { tasks } },
    {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true
    }
  );

  return checkin;
};