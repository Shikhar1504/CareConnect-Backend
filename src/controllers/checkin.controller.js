import * as checkinService from '../services/checkin.service.js';

export const getTodayCheckin = async (req, res, next) => {
  try {
    // Assuming the authenticated patient's ID is in req.user.id
    const patientId = req.user.id;
    const checkin = await checkinService.getTodayCheckin(patientId);
    
    res.status(200).json({ success: true, checkin });
  } catch (error) {
    next(error);
  }
};

export const updateCheckin = async (req, res, next) => {
  try {
    const patientId = req.user.id;
    const { tasks } = req.body;
    
    if (!tasks || !Array.isArray(tasks)) {
      return res.status(400).json({ success: false, message: 'Tasks array is required' });
    }

    const checkin = await checkinService.updateCheckin(patientId, tasks);
    
    res.status(200).json({ success: true, checkin });
  } catch (error) {
    next(error);
  }
};
