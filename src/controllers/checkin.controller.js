import * as checkinService from '../services/checkin.service.js';

export const getTodayCheckin = async (req, res, next) => {
  try {
    const patientId = req.user.id;

    const checkin = await checkinService.getTodayCheckin(patientId);

    res.status(200).json({
      success: true,
      data: checkin
    });

  } catch (error) {
    next(error);
  }
};


export const updateCheckin = async (req, res, next) => {
  try {
    const patientId = req.user.id;
    const { tasks } = req.body;

    if (
      !tasks ||
      !Array.isArray(tasks) ||
      tasks.some(t => typeof t.title !== 'string')
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid tasks format'
      });
    }

    const checkin = await checkinService.updateCheckin(patientId, tasks);

    console.log(`[CHECKIN] Updated for patient ${patientId}`);

    res.status(200).json({
      success: true,
      data: checkin
    });

  } catch (error) {
    next(error);
  }
};