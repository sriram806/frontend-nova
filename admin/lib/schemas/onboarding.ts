import { z } from 'zod';

const bulletPoint = z
  .string()
  .min(3, 'Enter at least one bullet point.')
  .regex(/^[\-•].+/, 'Bullet points must start with "-" or "•".');

export const targetRoleSchema = z.object({
  title: z.string().min(2, 'Select a target role.'),
  level: z.enum(['intern', 'junior', 'mid', 'senior', 'lead', 'principal']).default('junior'),
  industry: z.string().optional(),
  locationPreference: z.string().optional(),
  keywords: z.array(z.string()).min(1, 'Select at least one focus area.'),
});

export const resumeSchema = z.object({
  profile: z.object({
    name: z.string().min(2, 'Name is required.'),
    email: z.string().email('Enter a valid email.'),
    phone: z.string().min(10, 'Enter a valid phone number.'),
    address: z.string().min(5, 'Address is required.'),
  }),
  links: z.object({
    linkedUrl: z.string().url('Enter a valid LinkedIn URL.'),
    githubUrl: z.string().url('Enter a valid GitHub URL.'),
    portfolioUrl: z.string().url('Enter a valid Portfolio URL.').optional().or(z.literal('')),
    resumePdfUrl: z.string().url('Resume PDF is required.').optional().or(z.literal('')),
  }),
  summary: z.string().min(30, 'Summary should be at least 30 characters.').max(1000, 'Summary must be at most 1000 characters.'),
  skills: z.array(z.string().min(2, 'Enter a valid skill.')).min(1, 'Add at least one skill.'),
  experience: z.array(z.object({
    company: z.string().min(2, 'Company is required.'),
    role: z.string().min(2, 'Role is required.'),
    duration: z.string().min(2, 'Duration is required.'),
    techStack: z.array(z.string()).min(1, 'Add tech stack used.'),
    bullets: z.array(z.string().min(10, 'Points must be at least 10 characters.')).length(3, 'Provide exactly 3 bullet points.'),
  })).optional().default([]),
  projects: z.array(z.object({
    name: z.string().min(2, 'Project name is required.'),
    techStack: z.array(z.string()).min(1, 'Add tech stack.'),
    link: z.string().url('Enter a valid project link.'),
    bullets: z.array(z.string().min(10, 'Points must be at least 10 characters.')).length(3, 'Provide exactly 3 bullet points.'),
  })).min(1, 'Add at least one project.'),
  achievements: z.array(z.object({
    title: z.string().min(2, 'Title is required.'),
    description: z.string().optional(),
    link: z.string().url('Enter a valid link.').optional().or(z.literal('')),
  })).optional().default([]),
  education: z.array(z.object({
    degree: z.string().min(2, 'Degree is required.'),
    college: z.string().min(2, 'College is required.'),
    cgpa: z.string().min(1, 'CGPA is required.'),
    year: z.string().min(4, 'Year of passing is required.'),
  })).min(1, 'Add at least one education entry.'),
});

export type TargetRoleInput = z.infer<typeof targetRoleSchema>;
export type ResumeInput = z.infer<typeof resumeSchema>;
