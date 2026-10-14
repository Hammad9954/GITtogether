import { z } from 'zod';

export const createProjectSchema = z.object({
  body: z.object({
    title: z.string().min(3, 'Title must be at least 3 characters').max(140),
    description: z.string().min(10, 'Description must be at least 10 characters').max(5000),
    category: z.enum([
      'Web App',
      'Mobile App',
      'AI/ML',
      'Blockchain',
      'Cybersecurity',
      'IoT / Hardware',
      'Game Dev',
      'Open Source',
      'Research',
      'Other',
    ]),
    requiredSkills: z.array(z.string()).default([]),
    openPositions: z
      .array(
        z.object({
          role: z.string().min(1, 'Role title is required'),
          count: z.number().min(1).default(1),
          filled: z.number().min(0).default(0),
          description: z.string().optional().default(''),
          requiredSkills: z.array(z.string()).optional().default([]),
        })
      )
      .default([]),
    teamSize: z.number().min(1).max(20).default(4),
    deadline: z.string().optional(),
    tags: z.array(z.string()).default([]),
    githubUrl: z.string().url().or(z.literal('')).optional().default(''),
    liveUrl: z.string().url().or(z.literal('')).optional().default(''),
    status: z.enum(['draft', 'published', 'paused', 'completed', 'closed']).default('published'),
  }),
});

export const updateProjectSchema = z.object({
  body: z.object({
    title: z.string().min(3).max(140).optional(),
    description: z.string().min(10).max(5000).optional(),
    category: z
      .enum([
        'Web App',
        'Mobile App',
        'AI/ML',
        'Blockchain',
        'Cybersecurity',
        'IoT / Hardware',
        'Game Dev',
        'Open Source',
        'Research',
        'Other',
      ])
      .optional(),
    requiredSkills: z.array(z.string()).optional(),
    openPositions: z
      .array(
        z.object({
          _id: z.string().optional(),
          role: z.string().min(1),
          count: z.number().min(1).default(1),
          filled: z.number().min(0).default(0),
          description: z.string().optional().default(''),
          requiredSkills: z.array(z.string()).optional().default([]),
        })
      )
      .optional(),
    teamSize: z.number().min(1).max(20).optional(),
    deadline: z.string().nullable().optional(),
    tags: z.array(z.string()).optional(),
    githubUrl: z.string().optional(),
    liveUrl: z.string().optional(),
    status: z.enum(['draft', 'published', 'paused', 'completed', 'closed']).optional(),
  }),
});
