const { roleService } = require("../services/role.service")
const { apiResponse } = require("../utils/ApiResponse")
const { asyncHandler } = require("../utils/asyncHandler")

const createRole = asyncHandler(async (req, res) => {
  const role = await roleService.createRole(req.params.projectId, req.user.id, req.validated.body)
  apiResponse(res, 201, { role }, "Role created")
})

const updateRole = asyncHandler(async (req, res) => {
  const role = await roleService.updateRole(req.params.roleId, req.user.id, req.validated.body)
  apiResponse(res, 200, { role }, "Role updated")
})

const closeRole = asyncHandler(async (req, res) => {
  const role = await roleService.closeRole(req.params.roleId, req.user.id)
  apiResponse(res, 200, { role }, "Role closed")
})

module.exports = { closeRole, createRole, updateRole }
