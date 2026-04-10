import * as alertService from '../services/alert.service.js';

export const getAlerts = async (req, res, next) => {
  try {
    const data = await alertService.getAlerts();
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

export const resolveAlert = async (req, res, next) => {
  try {
    const { id } = req.params;
    const alert = await alertService.resolveAlert(id);
    res.status(200).json({ success: true, alert });
  } catch (error) {
    next(error);
  }
};
