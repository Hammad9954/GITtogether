import { SkillSession } from '../models/SkillSession.js';
import { User } from '../models/User.js';
import { createNotification } from '../services/notificationService.js';
import { successResponse, errorResponse } from '../utils/response.js';

export const getSkillSessions = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const [providedSessions, requestedSessions] = await Promise.all([
      SkillSession.find({ provider: userId })
        .populate('requester', 'name avatar college course')
        .sort({ createdAt: -1 }),
      SkillSession.find({ requester: userId })
        .populate('provider', 'name avatar college course')
        .sort({ createdAt: -1 }),
    ]);

    return successResponse(
      res,
      { providedSessions, requestedSessions },
      'Skill sharing sessions retrieved'
    );
  } catch (err) {
    next(err);
  }
};

export const getAvailableSkillMentors = async (req, res, next) => {
  try {
    const { skill } = req.query;
    const query = {
      isSuspended: false,
      'skills.0': { $exists: true },
    };

    if (req.user) {
      query._id = { $ne: req.user._id };
    }

    if (skill) {
      query.skills = { $in: [new RegExp(skill, 'i')] };
    }

    const mentors = await User.find(query)
      .select('name avatar college course year bio skills reputationScore availability')
      .limit(20);

    return successResponse(res, { mentors }, 'Available peer skill mentors');
  } catch (err) {
    next(err);
  }
};

export const requestSession = async (req, res, next) => {
  try {
    const { providerId, skill, topic, description, proposedDurationMinutes, preferredTime } = req.body;
    const requesterId = req.user._id;

    if (providerId === requesterId.toString()) {
      return errorResponse(res, 'Cannot request a skill session from yourself', 400);
    }

    const provider = await User.findById(providerId);
    if (!provider) {
      return errorResponse(res, 'Skill mentor not found', 404);
    }

    const session = await SkillSession.create({
      provider: providerId,
      requester: requesterId,
      skill,
      topic,
      description: description || '',
      proposedDurationMinutes: proposedDurationMinutes || 45,
      preferredTime: preferredTime || 'Flexible',
      status: 'requested',
    });

    await createNotification({
      recipient: providerId,
      sender: requesterId,
      type: 'skill_session',
      title: 'Peer Learning Request 💡',
      message: `${req.user.name} requested a 1-on-1 session to learn "${skill}" on topic "${topic}".`,
      link: '/skill-sharing',
      data: { sessionId: session._id },
    });

    return successResponse(res, { session }, 'Skill session request sent!', 201);
  } catch (err) {
    next(err);
  }
};

export const respondToSession = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { response, meetingLink, notes } = req.body; // 'accepted' | 'rejected'

    const session = await SkillSession.findById(id);
    if (!session) {
      return errorResponse(res, 'Session not found', 404);
    }

    if (session.provider.toString() !== req.user._id.toString()) {
      return errorResponse(res, 'Only the mentor can respond to this request', 403);
    }

    session.status = response;
    if (meetingLink) session.meetingLink = meetingLink;
    if (notes) session.notes = notes;
    await session.save();

    await createNotification({
      recipient: session.requester,
      sender: req.user._id,
      type: 'skill_session',
      title: `Skill Session ${response === 'accepted' ? 'Accepted! 🎓' : 'Declined'}`,
      message:
        response === 'accepted'
          ? `${req.user.name} accepted your request to learn "${session.skill}". Check your session details for meeting link.`
          : `${req.user.name} was unable to accept your learning request for "${session.skill}".`,
      link: '/skill-sharing',
      data: { sessionId: session._id, status: response },
    });

    return successResponse(res, { session }, `Session request ${response}`);
  } catch (err) {
    next(err);
  }
};

export const completeSession = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    const session = await SkillSession.findById(id);
    if (!session) {
      return errorResponse(res, 'Session not found', 404);
    }

    const isAuthorized =
      session.provider.toString() === req.user._id.toString() ||
      session.requester.toString() === req.user._id.toString();

    if (!isAuthorized) {
      return errorResponse(res, 'Unauthorized to complete this session', 403);
    }

    session.status = 'completed';
    if (notes) session.notes = notes;
    await session.save();

    // Reward both provider and requester with reputation boost
    await User.findByIdAndUpdate(session.provider, { $inc: { reputationScore: 5 } });
    await User.findByIdAndUpdate(session.requester, { $inc: { reputationScore: 2 } });

    return successResponse(res, { session }, 'Session completed! Reputation rewards applied.');
  } catch (err) {
    next(err);
  }
};
