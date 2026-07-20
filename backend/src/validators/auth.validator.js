const { z } = require("zod")

const passwordSchema = z
  .string()
  .min(10, "Password must be at least 10 characters")
  .max(128, "Password must be 128 characters or fewer")
  .regex(/[A-Z]/, "Password must contain an uppercase letter")
  .regex(/[a-z]/, "Password must contain a lowercase letter")
  .regex(/[0-9]/, "Password must contain a digit")
  .regex(/[^A-Za-z0-9]/, "Password must contain a special character")

const registerSchema = z
  .object({
    body: z
      .object({
        fullName: z.string().trim().min(2).max(80),
        email: z.string().trim().email().max(254),
        password: passwordSchema,
        confirmPassword: passwordSchema,
      })
      .refine((data) => data.password === data.confirmPassword, {
        path: ["confirmPassword"],
        message: "Passwords do not match",
      }),
    params: z.object({}).optional(),
    query: z.object({}).optional(),
  })
  .strict()

const loginSchema = z
  .object({
    body: z.object({
      email: z.string().trim().email().max(254),
      password: z.string().min(1).max(128),
    }),
    params: z.object({}).optional(),
    query: z.object({}).optional(),
  })
  .strict()

module.exports = { loginSchema, registerSchema }
