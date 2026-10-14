import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(100),
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    college: z.string().optional().default(''),
    course: z.string().optional().default(''),
    year: z.string().optional().default('1st Year'),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(1, 'Password is required'),
  }),
});

export const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(100).optional(),
    college: z.string().max(150).optional(),
    course: z.string().max(150).optional(),
    year: z.string().optional(),
    bio: z.string().max(1000).optional(),
    skills: z.array(z.string()).optional(),
    interests: z.array(z.string()).optional(),
    preferredRoles: z.array(z.string()).optional(),
    portfolioLinks: z
      .object({
        github: z.string().optional().default(''),
        linkedin: z.string().optional().default(''),
        website: z.string().optional().default(''),
      })
      .optional(),
    availability: z
      .object({
        hoursPerWeek: z.number().min(0).max(80).optional(),
        status: z.enum(['actively-looking', 'open-to-offers', 'busy', 'unavailable']).optional(),
      })
      .optional(),
    experience: z
      .array(
        z.object({
          title: z.string().min(1),
          organization: z.string().min(1),
          duration: z.string().optional(),
          description: z.string().optional(),
        })
      )
      .optional(),
  }),
});
