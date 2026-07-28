const { Router } = require("express")
const { authMiddleware } = require("../middlewares/auth.middleware")
const { aiService } = require("../services/ai.service")
const { asyncHandler } = require("../utils/asyncHandler")

const aiRoutes = Router()

aiRoutes.use(authMiddleware)

aiRoutes.post(
  "/rewrite",
  asyncHandler(async (req, res) => {
    const { text } = req.body
    if (!text?.trim()) {
      return res.status(400).json({ message: "Text is required" })
    }
    const result = await aiService.aiRewrite(text.trim())
    res.json({ data: result })
  })
)

module.exports = { aiRoutes }
