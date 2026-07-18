const { z } = require("zod")

const stringListSchema = z
  .array(z.string().trim().min(1).max(60))
  .max(30)
  .optional()

const socialLinksSchema = z
  .object({
    github: z.string().trim().max(200).optional(),
    twitter: z.string().trim().max(200).optional(),
    linkedin: z.string().trim().max(200).optional(),
    website: z.string().trim().max(200).optional(),
  })
  .optional()

const updateCurrentUserSchema = z
  .object({
    body: z
      .object({
        fullName: z.string().trim().min(2).max(80).optional(),
        username: z
          .string()
          .trim()
          .min(3)
          .max(30)
          .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores")
          .optional(),
        bio: z.string().trim().max(500).optional(),
        skills: stringListSchema,
        interests: stringListSchema,
        location: z.string().trim().max(120).optional(),
        availabilityHoursPerWeek: z.number().min(0).max(80).optional(),
        experienceLevel: z
          .enum(["beginner", "intermediate", "advanced", "expert"])
          .optional(),
        socialLinks: socialLinksSchema,
      })
      .strict(),
    params: z.object({}).optional(),
    query: z.object({}).optional(),
  })
  .strict()

module.exports = { updateCurrentUserSchema }
