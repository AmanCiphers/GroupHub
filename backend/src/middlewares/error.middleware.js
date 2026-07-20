const { env } = require("../config/env")
const { logger } = require("../utils/logger")

function errorMiddleware(error, req, res, _next) {
  if (error.code === 11000) {
    const fields = Object.keys(error.keyPattern || {})
    error.statusCode = 409
    error.message = fields.length
      ? `${fields.join(", ")} already exists`
      : "Resource already exists"
  }

  const statusCode = error.statusCode || 500
  const isServerError = statusCode >= 500

  logger.error(
    {
      error,
      requestId: req.id,
      path: req.originalUrl,
      method: req.method,
    },
    error.message
  )

  res.status(statusCode).json({
    success: false,
    message: isServerError ? "Internal server error" : error.message,
    requestId: req.id,
    details: env.NODE_ENV === "production" ? undefined : error.details,
  })
}

module.exports = { errorMiddleware }
