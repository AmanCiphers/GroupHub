const express = require("express")
const {
  getCurrentUser,
  updateCurrentUser,
} = require("../controllers/user.controller")
const { authMiddleware } = require("../middlewares/auth.middleware")
const { validate } = require("../middlewares/validate.middleware")
const { updateCurrentUserSchema } = require("../validators/user.validator")

const userRoutes = express.Router()

userRoutes.use(authMiddleware)

userRoutes.get("/me", getCurrentUser)
userRoutes.patch("/me", validate(updateCurrentUserSchema), updateCurrentUser)

module.exports = { userRoutes }
