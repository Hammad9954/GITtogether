import { Report } from '../models/Report.js';
import { successResponse, errorResponse } from '../utils/response.js';

export const createReport = async (req, res, next) => {
  try {
    const { targetType, targetId, targetName, reason, description } = req.body;

    const report = await Report.create({
      reporter: req.user._id,
      targetType,
      targetId,
      targetName: targetName || '',
      reason,
      description,
      status: 'pending',
    });

    return successResponse(
      res,
      { report },
      'Report submitted to moderation team. Thank you for keeping Git Together safe.',
      201
    );
  } catch (err) {
    next(err);
  }
};

export const getMyReports = async (req, res, next) => {
  try {
    const reports = await Report.find({ reporter: req.user._id }).sort({ createdAt: -1 });
    return successResponse(res, { reports }, 'Your reports retrieved');
  } catch (err) {
    next(err);
  }
};
