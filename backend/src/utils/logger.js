const pino = require("pino")
const { randomUUID } = require("crypto")

const logger = pino({
  level: process.env.LOG_LEVEL || "info",
  transport:
    process.env.NODE_ENV === "development"
      ? {
          target: "pino-pretty",
          options: { colorize: true },
        }
      : undefined,
})

function createRequestId() {
  return randomUUID()
}

module.exports = { createRequestId, logger }
