const cors = require("cors")
const { env } = require("./env")

const allowedOrigins = env.CORS_ORIGIN.split(",").map((origin) => origin.trim())

const corsMiddleware = cors({
  origin(origin, callback) {
    if (!origin) {
      callback(null, true)
      return
    }

    if (origin === "null") {
      callback(new Error("Null origin not allowed"))
      return
    }

    if (allowedOrigins.includes(origin)) {
      callback(null, true)
      return
    }

    callback(new Error("Not allowed by CORS"))
  },
  credentials: true,
})

module.exports = { corsMiddleware }
