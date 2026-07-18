const express = require("express")
const {
  listMyApplications,
  updateApplication,
} = require("../controllers/application.controller")
const { authMiddleware } = require("../middlewares/auth.middleware")
const { validate } = require("../middlewares/validate.middleware")
const { updateApplicationSchema } = require("../validators/application.validator")

const applicationRoutes = express.Router()

applicationRoutes.use(authMiddleware)

applicationRoutes.get("/me", listMyApplications)
applicationRoutes.patch("/:id", validate(updateApplicationSchema), updateApplication)

module.exports = { applicationRoutes }
