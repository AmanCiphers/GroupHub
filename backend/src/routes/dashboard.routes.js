const express = require("express")
const { getDashboard } = require("../controllers/dashboard.controller")
const { authMiddleware } = require("../middlewares/auth.middleware")

const dashboardRoutes = express.Router()

dashboardRoutes.get("/", authMiddleware, getDashboard)

module.exports = { dashboardRoutes }
