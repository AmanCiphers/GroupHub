const express = require("express")
const { listSavedProjects } = require("../controllers/savedProject.controller")
const { authMiddleware } = require("../middlewares/auth.middleware")

const savedProjectRoutes = express.Router()

savedProjectRoutes.get("/", authMiddleware, listSavedProjects)

module.exports = { savedProjectRoutes }
