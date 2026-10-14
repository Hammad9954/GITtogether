import { Hackathon } from '../models/Hackathon.js';
import { Team } from '../models/Team.js';
import { successResponse, paginatedResponse, errorResponse } from '../utils/response.js';

export const getHackathons = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page || '1', 10);
    const limit = parseInt(req.query.limit || '9', 10);
    const skip = (page - 1) * limit;

    const { status, search, mode } = req.query;
    const query = {};

    if (status && status !== 'all') {
      query.status = status;
    }

    if (mode && mode !== 'All') {
      query.mode = mode;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { organizer: { $regex: search, $options: 'i' } },
        { themes: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    const [hackathons, total] = await Promise.all([
      Hackathon.find(query)
        .populate('creator', 'name avatar')
        .sort({ startDate: 1 })
        .skip(skip)
        .limit(limit),
      Hackathon.countDocuments(query),
    ]);

    return paginatedResponse(res, hackathons, {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    next(err);
  }
};

export const getHackathonById = async (req, res, next) => {
  try {
    const hackathon = await Hackathon.findById(req.params.id)
      .populate('creator', 'name avatar email college')
      .populate('participants', 'name avatar college skills role')
      .populate({
        path: 'teams',
        populate: {
          path: 'leader members.user',
          select: 'name avatar college skills',
        },
      });

    if (!hackathon) {
      return errorResponse(res, 'Hackathon not found', 404);
    }

    const isParticipating = req.user
      ? hackathon.participants.some((p) => p._id.toString() === req.user._id.toString())
      : false;

    return successResponse(
      res,
      { hackathon, isParticipating },
      'Hackathon details retrieved'
    );
  } catch (err) {
    next(err);
  }
};

export const createHackathon = async (req, res, next) => {
  try {
    const hackathonData = {
      ...req.body,
      creator: req.user._id,
    };

    const hackathon = await Hackathon.create(hackathonData);
    return successResponse(res, { hackathon }, 'Hackathon created successfully', 201);
  } catch (err) {
    next(err);
  }
};

export const joinHackathon = async (req, res, next) => {
  try {
    const hackathon = await Hackathon.findById(req.params.id);
    if (!hackathon) {
      return errorResponse(res, 'Hackathon not found', 404);
    }

    const alreadyJoined = hackathon.participants.includes(req.user._id);
    if (alreadyJoined) {
      // Toggle leave/join
      hackathon.participants = hackathon.participants.filter(
        (p) => p.toString() !== req.user._id.toString()
      );
      await hackathon.save();
      return successResponse(res, { isParticipating: false }, 'Withdrawn from hackathon');
    }

    hackathon.participants.push(req.user._id);
    await hackathon.save();

    return successResponse(res, { isParticipating: true }, 'Successfully registered for hackathon!');
  } catch (err) {
    next(err);
  }
};

export const registerTeamToHackathon = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { teamId } = req.body;

    const [hackathon, team] = await Promise.all([
      Hackathon.findById(id),
      Team.findById(teamId),
    ]);

    if (!hackathon || !team) {
      return errorResponse(res, 'Hackathon or Team not found', 404);
    }

    if (team.leader.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return errorResponse(res, 'Only the team leader can register the team for a hackathon', 403);
    }

    if (hackathon.teams.includes(team._id)) {
      return errorResponse(res, 'This team is already registered for this hackathon', 400);
    }

    hackathon.teams.push(team._id);
    await hackathon.save();

    team.hackathon = hackathon._id;
    await team.save();

    return successResponse(res, { hackathon, team }, 'Team registered for hackathon!');
  } catch (err) {
    next(err);
  }
};
