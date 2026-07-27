const { CATEGORIES, ROLES } = require("../config/metadata")
const { Project } = require("../models/Project")
const { apiResponse } = require("../utils/ApiResponse")
const { asyncHandler } = require("../utils/asyncHandler")

const getMetadata = asyncHandler(async (req, res) => {
  const skills = await Project.distinct("skills", { status: { $ne: "archived" } })
  apiResponse(res, 200, { categories: CATEGORIES, roles: ROLES, skills })
})

module.exports = { getMetadata }
