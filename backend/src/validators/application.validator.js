const { z } = require("zod")

const applyToRoleSchema = z.object({
  body: z.object({
    message: z.string().trim().min(10).max(2000),
    availabilityHoursPerWeek: z.number().min(0).max(80).optional(),
  }),
  params: z.object({ roleId: z.string().min(1) }),
  query: z.object({}).optional(),
})

const projectApplicationsSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({ projectId: z.string().min(1) }),
  query: z.object({}).optional(),
})

const updateApplicationSchema = z.object({
  body: z.object({
    status: z.enum(["accepted", "rejected", "withdrawn"]),
  }),
  params: z.object({ id: z.string().min(1) }),
  query: z.object({}).optional(),
})

module.exports = {
  applyToRoleSchema,
  projectApplicationsSchema,
  updateApplicationSchema,
}
