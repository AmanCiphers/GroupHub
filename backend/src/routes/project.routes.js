const express = require("express")
const {
  archiveProject,
  createProject,
  getProject,
  listProjects,
  listProjectMembers,
  saveProject,
  unsaveProject,
  updateProject,
} = require("../controllers/project.controller")
const { listProjectApplications } = require("../controllers/application.controller")
const { createRole } = require("../controllers/role.controller")
const { authMiddleware, optionalAuthMiddleware } = require("../middlewares/auth.middleware")
const { validate } = require("../middlewares/validate.middleware")
const { projectApplicationsSchema } = require("../validators/application.validator")
const {
  createProjectSchema,
  createRoleSchema,
  listProjectsSchema,
  projectIdParamSchema,
  updateProjectSchema,
} = require("../validators/project.validator")

const projectRoutes = express.Router()

projectRoutes.get("/", optionalAuthMiddleware, validate(listProjectsSchema), listProjects)
projectRoutes.post("/", authMiddleware, validate(createProjectSchema), createProject)
projectRoutes.get("/:id", optionalAuthMiddleware, getProject)
projectRoutes.patch("/:id", authMiddleware, validate(updateProjectSchema), updateProject)
projectRoutes.delete("/:id", authMiddleware, validate(projectIdParamSchema), archiveProject)
projectRoutes.post("/:id/save", authMiddleware, validate(projectIdParamSchema), saveProject)
projectRoutes.delete("/:id/save", authMiddleware, validate(projectIdParamSchema), unsaveProject)
projectRoutes.post("/:projectId/roles", authMiddleware, validate(createRoleSchema), createRole)
projectRoutes.get(
  "/:projectId/applications",
  authMiddleware,
  validate(projectApplicationsSchema),
  listProjectApplications
)
projectRoutes.get(
  "/:id/members",
  authMiddleware,
  validate(projectIdParamSchema),
  listProjectMembers
)

module.exports = { projectRoutes }
