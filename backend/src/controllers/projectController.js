import { Project } from '../models/Project.js';
import { Team } from '../models/Team.js';
import { Conversation } from '../models/Conversation.js';
import { Application } from '../models/Application.js';
import { successResponse, paginatedResponse, errorResponse } from '../utils/response.js';

export const getProjects = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page || '1', 10);
    const limit = parseInt(req.query.limit || '9', 10);
    const skip = (page - 1) * limit;

    const { category, skill, status, search, owner } = req.query;
    const query = { isModerated: false };

    if (status) {
      query.status = status;
    } else {
      // Default to showing published projects
      query.status = { $in: ['published', 'paused'] };
    }

    if (category && category !== 'All') {
      query.category = category;
    }

    if (owner) {
      query.owner = owner;
      // If fetching own projects, can view drafts as well
      delete query.status;
    }

    if (skill) {
      const skillsArray = skill.split(',').map((s) => s.trim().toLowerCase());
      query.requiredSkills = { $in: skillsArray };
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    const [projects, total] = await Promise.all([
      Project.find(query)
        .populate('owner', 'name avatar college reputationScore')
        .populate('team', 'name members')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Project.countDocuments(query),
    ]);

    return paginatedResponse(res, projects, {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    next(err);
  }
};

export const getProjectById = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner', 'name avatar email college course year bio skills reputationScore')
      .populate({
        path: 'team',
        populate: {
          path: 'members.user',
          select: 'name avatar college skills role',
        },
      });

    if (!project) {
      return errorResponse(res, 'Project not found', 404);
    }

    // Increment views
    project.viewsCount = (project.viewsCount || 0) + 1;
    await project.save({ validateBeforeSave: false });

    // Check user's application status if logged in
    let userApplication = null;
    if (req.user) {
      userApplication = await Application.findOne({
        project: project._id,
        applicant: req.user._id,
      });
    }

    return successResponse(
      res,
      { project, userApplication },
      'Project details retrieved'
    );
  } catch (err) {
    next(err);
  }
};

export const createProject = async (req, res, next) => {
  try {
    const {
      title,
      description,
      category,
      requiredSkills,
      openPositions,
      teamSize,
      deadline,
      tags,
      githubUrl,
      liveUrl,
      status,
    } = req.body;

    // 1. Create the project
    const project = await Project.create({
      title,
      description,
      category,
      owner: req.user._id,
      requiredSkills: requiredSkills || [],
      openPositions: openPositions || [],
      teamSize: teamSize || 4,
      deadline: deadline ? new Date(deadline) : null,
      tags: tags || [],
      githubUrl: githubUrl || '',
      liveUrl: liveUrl || '',
      status: status || 'published',
    });

    // 2. Create the Team Workspace and Team Chat
    const conversation = await Conversation.create({
      type: 'team',
      participants: [req.user._id],
    });

    const team = await Team.create({
      name: `${title} Team`,
      description: `Official workspace team for "${title}"`,
      leader: req.user._id,
      project: project._id,
      maxMembers: teamSize || 4,
      members: [
        {
          user: req.user._id,
          role: 'Team Lead / Project Owner',
          permissions: ['manage_members', 'edit_project', 'chat', 'review_applications'],
        },
      ],
      chatRoom: conversation._id,
    });

    conversation.team = team._id;
    await conversation.save();

    project.team = team._id;
    await project.save();

    const populatedProject = await Project.findById(project._id)
      .populate('owner', 'name avatar college')
      .populate('team');

    return successResponse(res, { project: populatedProject }, 'Project created successfully!', 201);
  } catch (err) {
    next(err);
  }
};

export const updateProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return errorResponse(res, 'Project not found', 404);
    }

    // Permission check: only owner or admin
    if (project.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return errorResponse(res, 'Unauthorized to edit this project', 403);
    }

    const updatableFields = [
      'title',
      'description',
      'category',
      'requiredSkills',
      'openPositions',
      'teamSize',
      'deadline',
      'tags',
      'githubUrl',
      'liveUrl',
      'status',
    ];

    for (const field of updatableFields) {
      if (req.body[field] !== undefined) {
        project[field] = req.body[field];
      }
    }

    await project.save();
    const updated = await Project.findById(project._id).populate('owner', 'name avatar').populate('team');

    return successResponse(res, { project: updated }, 'Project updated successfully');
  } catch (err) {
    next(err);
  }
};

export const updateProjectStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const project = await Project.findById(req.params.id);

    if (!project) {
      return errorResponse(res, 'Project not found', 404);
    }

    if (project.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return errorResponse(res, 'Unauthorized to modify this project status', 403);
    }

    project.status = status;
    await project.save();

    return successResponse(res, { project }, `Project status changed to ${status}`);
  } catch (err) {
    next(err);
  }
};

export const deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return errorResponse(res, 'Project not found', 404);
    }

    if (project.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return errorResponse(res, 'Unauthorized to delete this project', 403);
    }

    // Clean up applications
    await Application.deleteMany({ project: project._id });
    if (project.team) {
      await Team.findByIdAndUpdate(project.team, { status: 'disbanded' });
    }

    await Project.findByIdAndDelete(project._id);

    return successResponse(res, {}, 'Project deleted successfully');
  } catch (err) {
    next(err);
  }
};

export const uploadProjectBanner = async (req, res, next) => {
  try {
    if (!req.file) {
      return errorResponse(res, 'No banner image uploaded', 400);
    }

    const project = await Project.findById(req.params.id);
    if (!project) {
      return errorResponse(res, 'Project not found', 404);
    }

    if (project.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return errorResponse(res, 'Unauthorized to update this project banner', 403);
    }

    project.bannerImage = `/uploads/${req.file.filename}`;
    await project.save();

    return successResponse(res, { bannerImage: project.bannerImage }, 'Project banner updated');
  } catch (err) {
    next(err);
  }
};
