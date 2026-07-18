const { z } = require("zod")

const createContactSubmissionSchema = z.object({
  body: z.object({
    firstName: z.string().trim().min(1).max(80),
    lastName: z.string().trim().min(1).max(80),
    email: z.string().trim().email().max(254),
    subject: z.string().trim().min(2).max(150),
    message: z.string().trim().min(10).max(5000),
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
})

module.exports = { createContactSubmissionSchema }
