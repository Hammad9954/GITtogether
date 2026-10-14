import { z } from 'zod';

export const createTeamSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Team name must be at least 2 characters').max(100),
    description: z.string().max(2000).optional().default(''),
    projectId: z.string().optional(),
    hackathonId: z.string().optional(),
    maxMembers: z.number().min(2).max(20).default(5),
    role: z.string().optional().default('Leader'),
  }),
});

export const inviteMemberSchema = z.object({
  body: z.object({
    inviteeId: z.string().min(1, 'Invitee user ID is required'),
    role: z.string().default('Member'),
    message: z.string().max(1000).optional().default(''),
  }),
});

export const updateMemberRoleSchema = z.object({
  body: z.object({
    role: z.string().min(1, 'Role is required'),
    permissions: z.array(z.string()).optional(),
  }),
});
