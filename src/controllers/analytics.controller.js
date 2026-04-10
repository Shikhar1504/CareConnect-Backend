import { getAnalyticsData } from '../services/analytics.service.js';

export const getAnalytics = async (req, res, next) => {
  try {
    const data = await getAnalyticsData();
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};
