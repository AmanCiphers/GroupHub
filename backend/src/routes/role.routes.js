const express = require("express")
const { applyToRole } = require("../controllers/application.controller")
const { closeRole, updateRole } = require("../controllers/role.controller")
const { authMiddleware } = require("../middlewares/auth.middleware")
const { validate } = require("../middlewares/validate.middleware")
const { applyToRoleSchema } = require("../validators/application.validator")
const { updateRoleSchema } = require("../validators/project.validator")

const roleRoutes = express.Router()

roleRoutes.post("/:roleId/applications", authMiddleware, validate(applyToRoleSchema), applyToRole)
roleRoutes.patch("/:roleId", authMiddleware, validate(updateRoleSchema), updateRole)
roleRoutes.delete("/:roleId", authMiddleware, validate(updateRoleSchema), closeRole)

module.exports = { roleRoutes }
