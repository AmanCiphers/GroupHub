const cors = require("cors")
const { env } = require("./env")

function getRootDomain(url) {
  try {
    const hostname = new URL(url).hostname
    const parts = hostname.split(".")
    if (parts.length >= 3) {
      return parts.slice(-2).join(".")
    }
    if (parts.length === 2) {
      return hostname
    }
    return null
  } catch {
    return null
  }
}

const allowedOrigins = [
  ...env.CORS_ORIGIN.split(",").map((origin) => origin.trim()),
  env.CLIENT_URL,
].filter(Boolean)

const clientRootDomain = getRootDomain(env.CLIENT_URL)

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

    if (/^https:\/\/.*\.vercel\.app$/.test(origin)) {
      callback(null, true)
      return
    }

    if (clientRootDomain && origin.endsWith(clientRootDomain)) {
      callback(null, true)
      return
    }

    callback(new Error("Not allowed by CORS"))
  },
  credentials: true,
})

module.exports = { corsMiddleware }
