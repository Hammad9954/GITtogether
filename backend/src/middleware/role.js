import { errorResponse } from '../utils/response.js';

export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(res, 'Authentication required', 401);
    }
    if (!roles.includes(req.user.role)) {
      return errorResponse(
        res,
        `Access denied. Requires one of roles: [${roles.join(', ')}]`,
        403
      );
    }
    next();
  };
};

export const requireVerified = (req, res, next) => {
  if (!req.user) {
    return errorResponse(res, 'Authentication required', 401);
  }
  if (!req.user.isVerified) {
    return errorResponse(
      res,
      'Email verification required. Please verify your college email address to proceed.',
      403
    );
  }
  next();
};
