const cookie = require("cookie")
const jwt = require("jsonwebtoken")
const { env } = require("../config/env")
const { chatService } = require("../services/chat.service")

function extractToken(socket) {
  const fromAuth = socket.handshake.auth?.token || socket.handshake.query?.token
  if (fromAuth) return fromAuth

  const cookies = cookie.parse(socket.handshake.headers.cookie || "")
  const signedCookie = cookies["accessToken"]
  if (!signedCookie) return null

  const unsigned = require("cookie-signature").unsign(
    signedCookie.slice(2),
    env.APP_SECRET
  )
  return unsigned || null
}

function setupSocket(io) {
  io.use((socket, next) => {
    const token = extractToken(socket)
    if (!token) return next(new Error("Authentication required"))
    try {
      const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET, { algorithms: ["HS256"] })
      socket.userId = decoded.sub
      next()
    } catch {
      next(new Error("Invalid token"))
    }
  })

  io.on("connection", (socket) => {
    socket.join(`user:${socket.userId}`)

    socket.on("join:conversation", (conversationId) => {
      socket.join(`conversation:${conversationId}`)
    })

    socket.on("leave:conversation", (conversationId) => {
      socket.leave(`conversation:${conversationId}`)
    })

    socket.on("message:send", async ({ conversationId, text }, ack) => {
      if (!conversationId || !text?.trim()) {
        return ack?.({ error: "Missing conversationId or text" })
      }
      try {
        const message = await chatService.sendMessage(conversationId, socket.userId, text.trim())
        io.to(`conversation:${conversationId}`).emit("message:new", message.toObject())
        ack?.({ success: true, message })
      } catch (err) {
        ack?.({ error: err.message })
      }
    })

    socket.on("message:markRead", async ({ conversationId }) => {
      if (!conversationId) return
      await chatService.markRead(conversationId, socket.userId)
      io.to(`user:${socket.userId}`).emit("conversation:read", { conversationId })
    })

    socket.on("disconnect", () => {})
  })
}

module.exports = { setupSocket }
