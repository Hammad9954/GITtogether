import { User } from '../models/User.js';
import { generateToken, setAuthCookie, clearAuthCookie } from '../utils/jwt.js';
import { successResponse, errorResponse } from '../utils/response.js';
import { generateVerificationToken, sendVerificationEmail } from '../services/emailService.js';

export const register = async (req, res, next) => {
  try {
    const { name, email, password, college, course, year } = req.body;

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return errorResponse(res, 'An account with this email already exists', 409);
    }

    const { code, token } = generateVerificationToken();
    const tokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      college: college || '',
      course: course || '',
      year: year || '1st Year',
      verificationToken: token,
      verificationTokenExpires: tokenExpires,
      isVerified: false,
    });

    await sendVerificationEmail({ to: user.email, name: user.name, code, token });

    const jwtToken = generateToken(user._id, user.role);
    setAuthCookie(res, jwtToken);

    const userObj = user.toObject();
    delete userObj.password;
    delete userObj.verificationToken;
    delete userObj.verificationTokenExpires;

    return successResponse(
      res,
      { user: userObj, token: jwtToken, verificationCode: code },
      'Registration successful! Please verify your college email.',
      201
    );
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() }).select(
      '+password +verificationToken'
    );

    if (!user) {
      return errorResponse(res, 'Invalid email or password credentials', 401);
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return errorResponse(res, 'Invalid email or password credentials', 401);
    }

    if (user.isSuspended) {
      return errorResponse(
        res,
        `Account suspended: ${user.suspensionReason || 'Violation of terms'}. Please contact administrator.`,
        403
      );
    }

    const jwtToken = generateToken(user._id, user.role);
    setAuthCookie(res, jwtToken);

    const userObj = user.toObject();
    delete userObj.password;
    delete userObj.verificationToken;

    return successResponse(
      res,
      { user: userObj, token: jwtToken },
      'Login successful! Welcome back.'
    );
  } catch (err) {
    next(err);
  }
};

export const logout = async (req, res) => {
  clearAuthCookie(res);
  return successResponse(res, {}, 'Logged out successfully');
};

export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }
    return successResponse(res, { user }, 'Profile retrieved');
  } catch (err) {
    next(err);
  }
};

export const verifyEmail = async (req, res, next) => {
  try {
    const { token, code } = req.body;
    let user = null;

    if (token) {
      user = await User.findOne({
        verificationToken: token,
        verificationTokenExpires: { $gt: Date.now() },
      }).select('+verificationToken +verificationTokenExpires');
    } else if (req.user) {
      user = await User.findById(req.user._id).select('+verificationToken +verificationTokenExpires');
    }

    if (!user) {
      return errorResponse(res, 'Invalid or expired verification token/code', 400);
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();

    return successResponse(res, { user }, 'College email verified successfully!');
  } catch (err) {
    next(err);
  }
};

export const resendVerification = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('+verificationToken');
    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    if (user.isVerified) {
      return errorResponse(res, 'Account email is already verified', 400);
    }

    const { code, token } = generateVerificationToken();
    user.verificationToken = token;
    user.verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await user.save();

    await sendVerificationEmail({ to: user.email, name: user.name, code, token });

    return successResponse(
      res,
      { verificationCode: code },
      'Verification email sent. Check your inbox.'
    );
  } catch (err) {
    next(err);
  }
};
