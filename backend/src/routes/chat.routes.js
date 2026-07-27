const { Router } = require("express")
const { authMiddleware } = require("../middlewares/auth.middleware")
const { chatService } = require("../services/chat.service")
const { asyncHandler } = require("../utils/asyncHandler")

const chatRoutes = Router()

chatRoutes.use(authMiddleware)

chatRoutes.get(
  "/conversations",
  asyncHandler(async (req, res) => {
    const conversations = await chatService.getConversations(req.user.id)
    const withUnread = await Promise.all(
      conversations.map(async (c) => ({
        ...c,
        unreadCount: await chatService.getUnreadCount(c._id, req.user.id),
      }))
    )
    res.json({ data: { conversations: withUnread } })
  })
)

chatRoutes.get(
  "/conversations/:id/messages",
  asyncHandler(async (req, res) => {
    const limit = Math.min(parseInt(req.query.limit) || 50, 100)
    const before = req.query.before || null
    const messages = await chatService.getMessages(req.params.id, limit, before)
    res.json({ data: { messages } })
  })
)

chatRoutes.post(
  "/conversations/project/:projectId",
  asyncHandler(async (req, res) => {
    const conversation = await chatService.getOrCreateProjectConversation(req.params.projectId)
    res.json({ data: { conversation } })
  })
)

chatRoutes.post(
  "/conversations/dm/:userId",
  asyncHandler(async (req, res) => {
    const conversation = await chatService.getOrCreateDM(req.user.id, req.params.userId)
    res.json({ data: { conversation } })
  })
)

chatRoutes.post(
  "/conversations/:id/read",
  asyncHandler(async (req, res) => {
    await chatService.markRead(req.params.id, req.user.id)
    res.json({ data: { success: true } })
  })
)

chatRoutes.post(
  "/conversations/:id/messages",
  asyncHandler(async (req, res) => {
    const { text } = req.body
    if (!text?.trim()) return res.status(400).json({ message: "Text is required" })
    const message = await chatService.sendMessage(req.params.id, req.user.id, text.trim())
    res.json({ data: { message } })
  })
)

module.exports = { chatRoutes }
