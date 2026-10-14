import { Team } from '../models/Team.js';
import { Invitation } from '../models/Invitation.js';
import { Conversation } from '../models/Conversation.js';
import { User } from '../models/User.js';
import { createNotification } from '../services/notificationService.js';
import { successResponse, errorResponse } from '../utils/response.js';

export const getMyTeams = async (req, res, next) => {
  try {
    const teams = await Team.find({
      'members.user': req.user._id,
      status: { $ne: 'disbanded' },
    })
      .populate('leader', 'name avatar college')
      .populate('project', 'title category status bannerImage')
      .populate('hackathon', 'title organizer startDate endDate')
      .sort({ updatedAt: -1 });

    return successResponse(res, { teams }, 'My teams retrieved');
  } catch (err) {
    next(err);
  }
};

export const getTeamById = async (req, res, next) => {
  try {
    const team = await Team.findById(req.params.id)
      .populate('leader', 'name avatar email college course year')
      .populate('members.user', 'name avatar email college course year skills reputationScore portfolioLinks availability')
      .populate('project')
      .populate('hackathon');

    if (!team) {
      return errorResponse(res, 'Team not found', 404);
    }

    // Permission check: is user a member or admin or is team open?
    const isMember = team.members.some((m) => m.user._id.toString() === req.user._id.toString());
    const isLeader = team.leader._id.toString() === req.user._id.toString();

    return successResponse(
      res,
      {
        team,
        userRole: isLeader ? 'Leader' : isMember ? 'Member' : 'Guest',
        isMember,
        isLeader,
      },
      'Team retrieved'
    );
  } catch (err) {
    next(err);
  }
};

export const createTeam = async (req, res, next) => {
  try {
    const { name, description, projectId, hackathonId, maxMembers, role } = req.body;

    const conversation = await Conversation.create({
      type: 'team',
      participants: [req.user._id],
    });

    const team = await Team.create({
      name,
      description: description || '',
      leader: req.user._id,
      project: projectId || null,
      hackathon: hackathonId || null,
      maxMembers: maxMembers || 5,
      members: [
        {
          user: req.user._id,
          role: role || 'Team Leader',
          permissions: ['manage_members', 'edit_project', 'chat', 'invite'],
        },
      ],
      chatRoom: conversation._id,
    });

    conversation.team = team._id;
    await conversation.save();

    const populated = await Team.findById(team._id)
      .populate('leader', 'name avatar')
      .populate('members.user', 'name avatar');

    return successResponse(res, { team: populated }, 'Team created successfully!', 201);
  } catch (err) {
    next(err);
  }
};

export const inviteMember = async (req, res, next) => {
  try {
    const { teamId } = req.params;
    const { inviteeId, role, message } = req.body;

    const team = await Team.findById(teamId).populate('project', 'title');
    if (!team) {
      return errorResponse(res, 'Team not found', 404);
    }

    // Permission check
    const isLeader = team.leader.toString() === req.user._id.toString();
    const memberObj = team.members.find((m) => m.user.toString() === req.user._id.toString());
    const canInvite = isLeader || memberObj?.permissions?.includes('manage_members') || memberObj?.permissions?.includes('invite');

    if (!canInvite && req.user.role !== 'admin') {
      return errorResponse(res, 'You do not have permission to invite members to this team', 403);
    }

    if (team.members.length >= team.maxMembers) {
      return errorResponse(res, 'Team has already reached its maximum capacity', 400);
    }

    // Check if user is already a member
    const alreadyMember = team.members.some((m) => m.user.toString() === inviteeId);
    if (alreadyMember) {
      return errorResponse(res, 'This student is already a member of the team', 400);
    }

    const invitee = await User.findById(inviteeId);
    if (!invitee) {
      return errorResponse(res, 'Invitee user not found', 404);
    }

    const invitation = await Invitation.create({
      team: teamId,
      project: team.project?._id || null,
      inviter: req.user._id,
      invitee: inviteeId,
      role: role || 'Member',
      message: message || '',
      status: 'pending',
    });

    // Notify invitee
    await createNotification({
      recipient: inviteeId,
      sender: req.user._id,
      type: 'team_invitation',
      title: 'New Team Invitation 🚀',
      message: `${req.user.name} invited you to join team "${team.name}" as ${role || 'Member'}.`,
      link: '/teams',
      data: { teamId, invitationId: invitation._id },
    });

    return successResponse(res, { invitation }, 'Invitation sent successfully!', 201);
  } catch (err) {
    next(err);
  }
};

export const getMyInvitations = async (req, res, next) => {
  try {
    const invitations = await Invitation.find({
      invitee: req.user._id,
      status: 'pending',
    })
      .populate('inviter', 'name avatar college')
      .populate({
        path: 'team',
        select: 'name description leader members maxMembers',
        populate: { path: 'leader', select: 'name avatar' },
      })
      .populate('project', 'title category')
      .sort({ createdAt: -1 });

    return successResponse(res, { invitations }, 'Invitations retrieved');
  } catch (err) {
    next(err);
  }
};

export const respondToInvitation = async (req, res, next) => {
  try {
    const { invitationId } = req.params;
    const { response } = req.body; // 'accepted' | 'declined'

    const invitation = await Invitation.findById(invitationId).populate('team');
    if (!invitation) {
      return errorResponse(res, 'Invitation not found', 404);
    }

    if (invitation.invitee.toString() !== req.user._id.toString()) {
      return errorResponse(res, 'Unauthorized to respond to this invitation', 403);
    }

    if (invitation.status !== 'pending') {
      return errorResponse(res, `Invitation has already been ${invitation.status}`, 400);
    }

    invitation.status = response;
    await invitation.save();

    if (response === 'accepted') {
      const team = await Team.findById(invitation.team._id);
      if (!team) {
        return errorResponse(res, 'Team no longer exists', 404);
      }

      if (team.members.length >= team.maxMembers) {
        return errorResponse(res, 'Team is already full', 400);
      }

      const isMember = team.members.some((m) => m.user.toString() === req.user._id.toString());
      if (!isMember) {
        team.members.push({
          user: req.user._id,
          role: invitation.role || 'Member',
          joinedAt: new Date(),
          permissions: ['chat', 'view_workspace'],
        });

        if (team.members.length >= team.maxMembers) {
          team.status = 'full';
        }
        await team.save();

        if (team.chatRoom) {
          await Conversation.findByIdAndUpdate(team.chatRoom, {
            $addToSet: { participants: req.user._id },
          });
        }
      }

      // Notify inviter
      await createNotification({
        recipient: invitation.inviter,
        sender: req.user._id,
        type: 'team_update',
        title: 'Invitation Accepted 🎉',
        message: `${req.user.name} accepted your invitation to join "${team.name}"!`,
        link: `/teams/${team._id}`,
        data: { teamId: team._id },
      });
    }

    return successResponse(res, { invitation }, `Invitation ${response} successfully`);
  } catch (err) {
    next(err);
  }
};

export const updateMemberRole = async (req, res, next) => {
  try {
    const { teamId, memberUserId } = req.params;
    const { role, permissions } = req.body;

    const team = await Team.findById(teamId);
    if (!team) {
      return errorResponse(res, 'Team not found', 404);
    }

    if (team.leader.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return errorResponse(res, 'Only the team leader can update member roles', 403);
    }

    const member = team.members.find((m) => m.user.toString() === memberUserId);
    if (!member) {
      return errorResponse(res, 'Member not found in team', 404);
    }

    if (role) member.role = role;
    if (permissions) member.permissions = permissions;

    await team.save();
    return successResponse(res, { team }, 'Member role updated');
  } catch (err) {
    next(err);
  }
};

export const removeMember = async (req, res, next) => {
  try {
    const { teamId, memberUserId } = req.params;

    const team = await Team.findById(teamId);
    if (!team) {
      return errorResponse(res, 'Team not found', 404);
    }

    if (team.leader.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return errorResponse(res, 'Only team leader can remove members', 403);
    }

    if (team.leader.toString() === memberUserId) {
      return errorResponse(res, 'Cannot remove the team leader. Transfer leadership first.', 400);
    }

    team.members = team.members.filter((m) => m.user.toString() !== memberUserId);
    if (team.members.length < team.maxMembers && team.status === 'full') {
      team.status = 'active';
    }
    await team.save();

    // Remove from chat room
    if (team.chatRoom) {
      await Conversation.findByIdAndUpdate(team.chatRoom, {
        $pull: { participants: memberUserId },
      });
    }

    // Notify removed member
    await createNotification({
      recipient: memberUserId,
      sender: req.user._id,
      type: 'team_update',
      title: 'Removed from Team',
      message: `You have been removed from team "${team.name}".`,
      link: '/teams',
      data: { teamId },
    });

    return successResponse(res, { team }, 'Member removed from team');
  } catch (err) {
    next(err);
  }
};

export const leaveTeam = async (req, res, next) => {
  try {
    const { teamId } = req.params;

    const team = await Team.findById(teamId);
    if (!team) {
      return errorResponse(res, 'Team not found', 404);
    }

    if (team.leader.toString() === req.user._id.toString()) {
      return errorResponse(
        res,
        'Team leaders cannot leave without transferring leadership or disbanding the team',
        400
      );
    }

    team.members = team.members.filter((m) => m.user.toString() !== req.user._id.toString());
    if (team.status === 'full') {
      team.status = 'active';
    }
    await team.save();

    if (team.chatRoom) {
      await Conversation.findByIdAndUpdate(team.chatRoom, {
        $pull: { participants: req.user._id },
      });
    }

    return successResponse(res, {}, 'You have left the team');
  } catch (err) {
    next(err);
  }
};

export const updateTeamLinks = async (req, res, next) => {
  try {
    const { teamId } = req.params;
    const { links } = req.body;

    const team = await Team.findById(teamId);
    if (!team) {
      return errorResponse(res, 'Team not found', 404);
    }

    const isMember = team.members.some((m) => m.user.toString() === req.user._id.toString());
    if (!isMember && req.user.role !== 'admin') {
      return errorResponse(res, 'Only team members can update workspace links', 403);
    }

    team.links = { ...team.links, ...links };
    await team.save();

    return successResponse(res, { links: team.links }, 'Team workspace links updated');
  } catch (err) {
    next(err);
  }
};
