const { projectRepository } = require("../repositories/project.repository")
const { savedProjectRepository } = require("../repositories/savedProject.repository")
const { projectService } = require("./project.service")
const { ApiError } = require("../utils/ApiError")

async function saveProject(userId, projectId) {
  const project = await projectRepository.findById(projectId)
  if (!project || project.status === "archived") throw new ApiError(404, "Project not found")

  await savedProjectRepository.create({ userId, projectId })
  return { projectId: String(projectId), saved: true }
}

async function unsaveProject(userId, projectId) {
  await savedProjectRepository.remove(userId, projectId)
  return { projectId: String(projectId), saved: false }
}

async function listSavedProjects(userId) {
  const saved = await savedProjectRepository.findByUser(userId)
  return saved
    .filter((item) => item.projectId)
    .map((item) => projectService.serializeProject(item.projectId, [], [String(item.projectId._id)]))
}

const savedProjectService = {
  listSavedProjects,
  saveProject,
  unsaveProject,
}

module.exports = { savedProjectService }
