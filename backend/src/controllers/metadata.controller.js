const { CATEGORIES, ROLES } = require("../config/metadata")
const { apiResponse } = require("../utils/ApiResponse")
const { asyncHandler } = require("../utils/asyncHandler")

const getMetadata = asyncHandler(async (req, res) => {
  apiResponse(res, 200, { categories: CATEGORIES, roles: ROLES })
})

module.exports = { getMetadata }
