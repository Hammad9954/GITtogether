import { verifyToken } from '../utils/jwt.js';
import { User } from '../models/User.js';
import { errorResponse } from '../utils/response.js';

export const authenticate = async (req, res, next) => {
  try {
    let token = req.cookies?.token;

    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return errorResponse(res, 'Authentication required. Please log in.', 401);
    }

    const decoded = verifyToken(token);
    const user = await User.findById(decoded.id);

    if (!user) {
      return errorResponse(res, 'User account no longer exists.', 401);
    }

    if (user.isSuspended) {
      return errorResponse(
        res,
        `Your account has been suspended: ${user.suspensionReason || 'Violation of community guidelines'}. Contact support.`,
        403
      );
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return errorResponse(res, 'Session invalid or expired. Please log in again.', 401);
    }
    return errorResponse(res, 'Authentication failed.', 500);
  }
};

// Optional auth: populate req.user if token is present, but don't reject if not
export const optionalAuth = async (req, res, next) => {
  try {
    let token = req.cookies?.token;
    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      const decoded = verifyToken(token);
      const user = await User.findById(decoded.id);
      if (user && !user.isSuspended) {
        req.user = user;
      }
    }
    next();
  } catch {
    next();
  }
};
