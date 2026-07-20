const compression = require("compression")
const cookieParser = require("cookie-parser")
const express = require("express")
const helmet = require("helmet")
const mongoSanitize = require("express-mongo-sanitize")
const morgan = require("morgan")

const { corsMiddleware } = require("./config/cors")
const { env } = require("./config/env")
const { apiRoutes } = require("./routes")
const { errorMiddleware } = require("./middlewares/error.middleware")
const { requestIdMiddleware } = require("./middlewares/requestId.middleware")
const { apiRateLimiter } = require("./middlewares/rateLimit.middleware")
const { ApiError } = require("./utils/ApiError")
const { logger } = require("./utils/logger")

const app = express()

app.disable("x-powered-by")
app.use(requestIdMiddleware)
app.use(helmet())
app.use(corsMiddleware)
app.use(compression())
app.use(express.json({ limit: "1mb" }))
app.use(express.urlencoded({ extended: true, limit: "1mb" }))
app.use(cookieParser(env.APP_SECRET))
app.use(mongoSanitize())

app.use((req, res, next) => {
  if (env.CLIENT_URL && ["POST", "PUT", "PATCH", "DELETE"].includes(req.method)) {
    const origin = req.headers.origin
    const referer = req.headers.referer

    if (origin || referer) {
      const isAllowed = (origin || referer).startsWith(env.CLIENT_URL)
      if (!isAllowed) {
        res.status(403).json({ success: false, message: "CSRF validation failed" })
        return
      }
    }
  }
  next()
})

if (env.NODE_ENV !== "test") {
  app.use(
    morgan("combined", {
      stream: {
        write: (message) => logger.info(message.trim()),
      },
    })
  )
}

app.get("/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    service: "grouphub-api",
    environment: env.NODE_ENV,
  })
})

app.get("/", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "GroupHub API is running",
    data: {
      health: "/health",
      api: "/api/v1",
    },
  })
})

app.use("/api/v1", apiRateLimiter, apiRoutes)

app.use((_req, _res, next) => {
  next(new ApiError(404, "Route not found"))
})

app.use(errorMiddleware)

module.exports = { app }
