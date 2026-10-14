import { z } from 'zod';

export const applyProjectSchema = z.object({
  body: z.object({
    role: z.string().min(1, 'Role applied for is required'),
    pitch: z.string().min(10, 'Pitch must be at least 10 characters').max(2000),
    skills: z.array(z.string()).default([]),
  }),
});

export const reviewApplicationSchema = z.object({
  body: z.object({
    status: z.enum(['accepted', 'rejected']),
    feedback: z.string().max(1000).optional().default(''),
  }),
});
