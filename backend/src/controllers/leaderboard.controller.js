const { User } = require("../models/User")
const { Project } = require("../models/Project")
const { ProjectMembership } = require("../models/ProjectMembership")
const { ActivityEvent } = require("../models/ActivityEvent")
const { apiResponse } = require("../utils/ApiResponse")
const { asyncHandler } = require("../utils/asyncHandler")

async function getLeaderboardData(period) {
  let dateFilter = {}
  if (period === "month") {
    const start = new Date()
    start.setDate(1)
    start.setHours(0, 0, 0, 0)
    dateFilter = { createdAt: { $gte: start } }
  } else if (period === "week") {
    const start = new Date()
    start.setDate(start.getDate() - start.getDay())
    start.setHours(0, 0, 0, 0)
    dateFilter = { createdAt: { $gte: start } }
  }

  const [users, ownedProjectCounts, membershipCounts, recentActivityUsers] = await Promise.all([
    User.find({ status: "active" })
      .select("fullName username reputationPoints skills avatarUrl")
      .sort({ reputationPoints: -1 })
      .limit(50)
      .lean(),

    Project.aggregate([
      { $group: { _id: "$ownerId", count: { $sum: 1 } } },
    ]),

    ProjectMembership.aggregate([
      { $group: { _id: "$userId", count: { $sum: 1 } } },
    ]),

    ActivityEvent.aggregate([
      { $match: dateFilter },
      { $group: { _id: "$actorId" } },
    ]),
  ])

  const ownerMap = {}
  ownedProjectCounts.forEach((item) => {
    ownerMap[String(item._id)] = item.count
  })

  const membershipMap = {}
  membershipCounts.forEach((item) => {
    membershipMap[String(item._id)] = item.count
  })

  const activeUserIds = new Set(recentActivityUsers.map((u) => String(u._id)))

  const ranked = users.map((user) => ({
    id: user._id,
    fullName: user.fullName,
    username: user.username || `@${user.fullName.toLowerCase().replace(/\s+/g, "_")}`,
    points: user.reputationPoints || 0,
    projects: ownerMap[String(user._id)] || 0,
    contributions: membershipMap[String(user._id)] || 0,
    skills: user.skills || [],
    active: activeUserIds.has(String(user._id)),
  }))

  return ranked
}

function pickBadge(index, user) {
  const badges = ["Elite Contributor", "Top Mentor", "Project Leader", "Rising Star"]
  return index < badges.length ? badges[index] : "Community Builder"
}

const getLeaderboard = asyncHandler(async (req, res) => {
  const period = req.query.period || "all"

  const ranked = await getLeaderboardData(period)

  const topThree = ranked.slice(0, 3).map((u, i) => ({
    ...u,
    badge: pickBadge(i, u),
  }))

  const rest = ranked.slice(3, 10).map((u, i) => ({
    ...u,
    rank: i + 4,
  }))

  const totalActive = ranked.length
  const totalCompleted = await Project.countDocuments({ status: "completed" })
  const totalMemberships = await ProjectMembership.countDocuments({ status: "active" })

  const stats = [
    { label: "Active contributors", value: totalActive.toLocaleString() },
    { label: "Projects completed", value: totalCompleted.toLocaleString() },
    { label: "Team memberships", value: totalMemberships.toLocaleString() },
    { label: "Streak leaders", value: Math.min(ranked.filter((u) => u.active).length, 156).toLocaleString() },
  ]

  apiResponse(res, 200, {
    topThree,
    leaderboard: rest,
    stats,
  })
})

module.exports = { getLeaderboard }
