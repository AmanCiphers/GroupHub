const { Router } = require("express")
const path = require("path")
const fs = require("fs")
const { authMiddleware } = require("../middlewares/auth.middleware")
const { upload, MAX_SIZE } = require("../config/upload")
const { fileRepository } = require("../repositories/file.repository")
const { asyncHandler } = require("../utils/asyncHandler")
const { membershipRepository } = require("../repositories/membership.repository")

const UPLOAD_DIR = path.resolve(__dirname, "../../uploads")

const fileRoutes = Router()

fileRoutes.use(authMiddleware)

async function ensureMember(req, projectId) {
  const membership = await membershipRepository.findActive(projectId, req.user.id)
  if (!membership) throw Object.assign(new Error("Not a project member"), { status: 403 })
}

fileRoutes.get(
  "/:projectId",
  asyncHandler(async (req, res) => {
    await ensureMember(req, req.params.projectId)
    const files = await fileRepository.findByProject(req.params.projectId)
    res.json({ data: { files } })
  })
)

fileRoutes.post(
  "/:projectId/upload",
  upload.single("file"),
  asyncHandler(async (req, res) => {
    await ensureMember(req, req.params.projectId)
    if (!req.file) return res.status(400).json({ message: "No file provided" })
    const file = await fileRepository.create({
      projectId: req.params.projectId,
      uploadedBy: req.user.id,
      originalName: req.file.originalname,
      storedName: req.file.filename,
      mimeType: req.file.mimetype,
      size: req.file.size,
    })
    res.json({ data: { file } })
  })
)

fileRoutes.get(
  "/:projectId/download/:fileId",
  asyncHandler(async (req, res) => {
    await ensureMember(req, req.params.projectId)
    const file = await fileRepository.findById(req.params.fileId)
    if (!file || String(file.projectId) !== req.params.projectId) {
      return res.status(404).json({ message: "File not found" })
    }
    const filePath = path.join(UPLOAD_DIR, file.storedName)
    if (!fs.existsSync(filePath)) return res.status(404).json({ message: "File not found on disk" })
    res.download(filePath, file.originalName)
  })
)

fileRoutes.delete(
  "/:projectId/:fileId",
  asyncHandler(async (req, res) => {
    await ensureMember(req, req.params.projectId)
    const file = await fileRepository.findById(req.params.fileId)
    if (!file || String(file.projectId) !== req.params.projectId) {
      return res.status(404).json({ message: "File not found" })
    }
    const filePath = path.join(UPLOAD_DIR, file.storedName)
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath)
    await fileRepository.remove(req.params.fileId)
    res.json({ data: { success: true } })
  })
)

module.exports = { fileRoutes }
