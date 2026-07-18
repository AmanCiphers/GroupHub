const { membershipService } = require("../services/membership.service")
const { projectService } = require("../services/project.service")
const { savedProjectService } = require("../services/savedProject.service")
const { apiResponse } = require("../utils/ApiResponse")
const { asyncHandler } = require("../utils/asyncHandler")

const createProject = asyncHandler(async (req, res) => {
  const project = await projectService.createProject(req.user.id, req.validated.body)
  apiResponse(res, 201, { project }, "Project created")
})

const listProjects = asyncHandler(async (req, res) => {
  const data = await projectService.listProjects(req.validated.query, req.user?.id)
  apiResponse(res, 200, data)
})

const getProject = asyncHandler(async (req, res) => {
  const project = await projectService.getProject(req.params.id, req.user?.id)
  apiResponse(res, 200, { project })
})

const updateProject = asyncHandler(async (req, res) => {
  const project = await projectService.updateProject(req.params.id, req.user.id, req.validated.body)
  apiResponse(res, 200, { project }, "Project updated")
})

const archiveProject = asyncHandler(async (req, res) => {
  const project = await projectService.archiveProject(req.params.id, req.user.id)
  apiResponse(res, 200, { project }, "Project archived")
})

const saveProject = asyncHandler(async (req, res) => {
  const result = await savedProjectService.saveProject(req.user.id, req.params.id)
  apiResponse(res, 200, result, "Project saved")
})

const unsaveProject = asyncHandler(async (req, res) => {
  const result = await savedProjectService.unsaveProject(req.user.id, req.params.id)
  apiResponse(res, 200, result, "Project unsaved")
})

const listProjectMembers = asyncHandler(async (req, res) => {
  const members = await membershipService.listProjectMembers(req.params.id, req.user.id)
  apiResponse(res, 200, { members })
})

module.exports = {
  archiveProject,
  createProject,
  getProject,
  listProjects,
  listProjectMembers,
  saveProject,
  unsaveProject,
  updateProject,
}
