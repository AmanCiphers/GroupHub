const express = require("express")
const {
  getMe,
  login,
  logout,
  refresh,
  register,
  verifyEmail,
} = require("../controllers/auth.controller")
const { authMiddleware } = require("../middlewares/auth.middleware")
const { authRateLimiter, refreshRateLimiter } = require("../middlewares/rateLimit.middleware")
const { validate } = require("../middlewares/validate.middleware")
const {
  loginSchema,
  registerSchema,
} = require("../validators/auth.validator")

const authRoutes = express.Router()

authRoutes.post("/register", authRateLimiter, validate(registerSchema), register)
authRoutes.post("/login", authRateLimiter, validate(loginSchema), login)
authRoutes.post("/refresh", refreshRateLimiter, refresh)
authRoutes.post("/logout", refreshRateLimiter, logout)
authRoutes.get("/me", authMiddleware, getMe)
authRoutes.get("/verify-email", verifyEmail)

module.exports = { authRoutes }
