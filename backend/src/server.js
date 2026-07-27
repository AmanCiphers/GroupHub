const http = require("http")
const { Server } = require("socket.io")
const { app } = require("./app")
const { connectDatabase, disconnectDatabase } = require("./config/db")
const { env } = require("./config/env")
const { logger } = require("./utils/logger")
const { setupSocket } = require("./socket/handler")

let server
let io

async function bootstrap() {
  await connectDatabase()

  server = http.createServer(app)
  io = new Server(server, {
    cors: {
      origin: [env.CLIENT_URL, env.CORS_ORIGIN].filter(Boolean),
      credentials: true,
    },
  })
  setupSocket(io)

  server.listen(env.PORT, () => {
    logger.info(`GroupHub API listening on port ${env.PORT}`)
  })

  server.on("error", (error) => {
    logger.error(error, `API server failed to listen on port ${env.PORT}`)
    process.exit(1)
  })
}

async function shutdown(signal) {
  logger.info(`${signal} received, shutting down`)

  if (io) io.close()
  if (server) {
    server.close(async () => {
      await disconnectDatabase()
      process.exit(0)
    })
    return
  }

  await disconnectDatabase()
  process.exit(0)
}

process.on("SIGTERM", () => shutdown("SIGTERM"))
process.on("SIGINT", () => shutdown("SIGINT"))

bootstrap().catch((error) => {
  logger.error(error, "Failed to start API")
  process.exit(1)
})
