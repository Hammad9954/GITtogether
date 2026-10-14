import { z } from 'zod';

export const createHackathonSchema = z.object({
  body: z.object({
    title: z.string().min(3).max(150),
    tagline: z.string().max(250).optional().default(''),
    description: z.string().min(10).max(6000),
    organizer: z.string().min(2),
    startDate: z.string(),
    endDate: z.string(),
    registrationDeadline: z.string().optional(),
    websiteUrl: z.string().optional().default(''),
    mode: z.enum(['Online', 'In-Person', 'Hybrid']).default('Online'),
    location: z.string().optional().default('Virtual'),
    themes: z.array(z.string()).default([]),
    prizes: z
      .array(
        z.object({
          place: z.string(),
          reward: z.string(),
          description: z.string().optional().default(''),
        })
      )
      .default([]),
  }),
});

export const createReviewSchema = z.object({
  body: z.object({
    revieweeId: z.string().min(1, 'Reviewee ID is required'),
    projectId: z.string().min(1, 'Project ID is required'),
    rating: z.number().min(1).max(5),
    collaborationSkillsRating: z.number().min(1).max(5).default(5),
    communicationRating: z.number().min(1).max(5).default(5),
    punctualityRating: z.number().min(1).max(5).default(5),
    comment: z.string().min(5, 'Review comment must be at least 5 characters').max(2000),
  }),
});

export const createReportSchema = z.object({
  body: z.object({
    targetType: z.enum(['user', 'project', 'message', 'other']),
    targetId: z.string().min(1, 'Target ID is required'),
    targetName: z.string().optional().default(''),
    reason: z.enum([
      'spam',
      'harassment',
      'inappropriate_content',
      'plagiarism',
      'fake_profile',
      'other',
    ]),
    description: z.string().min(5, 'Description must be at least 5 characters').max(3000),
  }),
});
