const { CATEGORIES } = require("../config/metadata")
const { Project } = require("../models/Project")
const { tagRepository } = require("../repositories/tag.repository")
const { apiResponse } = require("../utils/ApiResponse")
const { asyncHandler } = require("../utils/asyncHandler")

const getMetadata = asyncHandler(async (req, res) => {
  const [skills, roleTags] = await Promise.all([
    Project.distinct("skills", { status: { $ne: "archived" } }),
    tagRepository.findByType("role"),
  ])
  const roles = roleTags.map((t) => t.name)
  apiResponse(res, 200, { categories: CATEGORIES, roles, skills })
})

module.exports = { getMetadata }
