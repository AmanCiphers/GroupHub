const { z } = require("zod")
const { CATEGORY_VALUES, ROLES } = require("../config/metadata")

const ROLE_VALUES = ROLES.map((r) => r.toLowerCase())

const roleBodySchema = z.object({
  title: z
    .string()
    .trim()
    .refine((val) => ROLE_VALUES.includes(val.toLowerCase()), {
      message: `Role must be one of: ${ROLES.join(", ")}`,
    }),
  description: z.string().trim().max(1000).optional(),
  requiredSkills: z.array(z.string().trim().min(1).max(60)).max(30).optional(),
  preferredSkills: z.array(z.string().trim().min(1).max(60)).max(30).optional(),
  slotsTotal: z.number().int().min(1).max(50).optional(),
  workloadHoursPerWeek: z.number().min(0).max(80).optional(),
  status: z.enum(["open", "filled", "closed"]).optional(),
})

const projectBodySchema = z.object({
  title: z.string().trim().min(3).max(120),
  description: z.string().trim().min(20).max(2000),
  category: z
    .string()
    .trim()
    .refine((val) => CATEGORY_VALUES.includes(val), {
      message: `Category must be one of: ${CATEGORY_VALUES.join(", ")}`,
    }),
  stage: z.enum(["idea", "research", "prototype", "mvp", "active", "completed", "paused"]).default("idea"),
  commitmentHoursPerWeek: z.number().min(0).max(80).optional(),
  commitmentLabel: z.string().trim().max(80).optional(),
  locationType: z.enum(["remote", "hybrid", "onsite"]).optional(),
  location: z.string().trim().max(120).optional(),
  status: z.enum(["draft", "recruiting", "active", "completed", "archived"]).optional(),
  visibility: z.enum(["public", "private", "unlisted"]).optional(),
  skills: z.array(z.string().trim().min(1).max(60)).max(30).optional(),
  tags: z.array(z.string().trim().min(1).max(60)).max(30).optional(),
  teamSizeTarget: z.number().int().min(1).max(100).optional(),
  progressPercent: z.number().min(0).max(100).optional(),
  nextMilestone: z.string().trim().max(200).optional(),
})

const createProjectSchema = z.object({
  body: projectBodySchema.extend({
    roles: z.array(roleBodySchema).min(1).max(20),
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
})

const updateProjectSchema = z.object({
  body: projectBodySchema.partial().strict(),
  params: z.object({ id: z.string().min(1) }),
  query: z.object({}).optional(),
})

const listProjectsSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({}).optional(),
  query: z.object({
    q: z.string().trim().max(120).optional(),
    category: z.string().trim().max(80).optional(),
    skill: z.string().trim().max(60).optional(),
    stage: z.string().trim().max(40).optional(),
    status: z.string().trim().max(40).optional(),
    page: z.string().optional(),
    limit: z.string().optional(),
  }),
})

const projectIdParamSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({ id: z.string().min(1) }),
  query: z.object({}).optional(),
})

const createRoleSchema = z.object({
  body: roleBodySchema,
  params: z.object({ projectId: z.string().min(1) }),
  query: z.object({}).optional(),
})

const updateRoleSchema = z.object({
  body: roleBodySchema.partial().strict(),
  params: z.object({ roleId: z.string().min(1) }),
  query: z.object({}).optional(),
})

module.exports = {
  createProjectSchema,
  createRoleSchema,
  listProjectsSchema,
  projectIdParamSchema,
  updateProjectSchema,
  updateRoleSchema,
}
