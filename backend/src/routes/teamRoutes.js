import express from 'express';
import {
  getMyTeams,
  getTeamById,
  createTeam,
  inviteMember,
  getMyInvitations,
  respondToInvitation,
  updateMemberRole,
  removeMember,
  leaveTeam,
  updateTeamLinks,
} from '../controllers/teamController.js';
import { authenticate } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validation.js';
import {
  createTeamSchema,
  inviteMemberSchema,
  updateMemberRoleSchema,
} from '../validators/teamValidator.js';

const router = express.Router();

router.get('/my', authenticate, getMyTeams);
router.get('/invitations', authenticate, getMyInvitations);
router.get('/:id', authenticate, getTeamById);
router.post('/', authenticate, validateRequest(createTeamSchema), createTeam);
router.post('/:teamId/invite', authenticate, validateRequest(inviteMemberSchema), inviteMember);
router.post('/invitations/:invitationId/respond', authenticate, respondToInvitation);
router.patch('/:teamId/members/:memberUserId/role', authenticate, validateRequest(updateMemberRoleSchema), updateMemberRole);
router.delete('/:teamId/members/:memberUserId', authenticate, removeMember);
router.post('/:teamId/leave', authenticate, leaveTeam);
router.patch('/:teamId/links', authenticate, updateTeamLinks);

export default router;
