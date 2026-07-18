const express = require("express")
const { getLeaderboard } = require("../controllers/leaderboard.controller")

const leaderboardRoutes = express.Router()

leaderboardRoutes.get("/", getLeaderboard)

module.exports = { leaderboardRoutes }
