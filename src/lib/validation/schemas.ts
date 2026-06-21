import { z } from "zod";

export const emailSchema = z.string().email().max(254);
export const passwordSchema = z
  .string()
  .min(10, "Use at least 10 characters")
  .max(128);

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});

export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  fullName: z.string().min(1, "Name is required").max(120),
});

export const resetRequestSchema = z.object({ email: emailSchema });
export const updatePasswordSchema = z.object({ password: passwordSchema });

export const profileUpdateSchema = z.object({
  fullName: z.string().min(1).max(120),
  avatarUrl: z.string().url().optional().or(z.literal("")),
});

export const tierEnum = z.enum(["free", "basic", "pro", "premium"]);
export const levelEnum = z.enum(["beginner", "intermediate", "advanced"]);

export const courseSchema = z.object({
  title: z.string().min(3).max(160),
  slug: z
    .string()
    .regex(/^[a-z0-9-]+$/, "Lowercase letters, numbers and dashes only")
    .min(3)
    .max(160),
  subtitle: z.string().max(200).optional(),
  description: z.string().max(8000).optional(),
  category: z.string().max(60).optional(),
  level: levelEnum.optional(),
  requiredTier: tierEnum.default("basic"),
});

export const moduleSchema = z.object({
  title: z.string().min(1).max(160),
  position: z.coerce.number().int().min(0).default(0),
});

export const lessonSchema = z.object({
  title: z.string().min(1).max(160),
  position: z.coerce.number().int().min(0).default(0),
  durationSeconds: z.coerce.number().int().min(0).default(0),
  isPreview: z.coerce.boolean().default(false),
  requiredTier: tierEnum.nullable().optional(),
  contentHtml: z.string().max(100_000).optional(),
  cfStreamUid: z.string().max(200).optional(),
});

export const progressSchema = z.object({
  lessonId: z.string().uuid(),
  courseId: z.string().uuid(),
  lastPositionSeconds: z.coerce.number().int().min(0).default(0),
  completed: z.boolean().optional(),
});

export const checkoutSchema = z.object({
  tier: z.enum(["basic", "pro", "premium"]),
  interval: z.enum(["month", "year"]).default("month"),
});

export type CourseInput = z.infer<typeof courseSchema>;
export type LessonInput = z.infer<typeof lessonSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
