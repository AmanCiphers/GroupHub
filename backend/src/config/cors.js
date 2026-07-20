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

const rawOrigins = [
  ...env.CORS_ORIGIN.split(",").map((origin) => origin.trim()),
  env.CLIENT_URL,
  "http://localhost:3000",
  "https://grouphub.thecloverforge.com",
].filter(Boolean)

const allowedOrigins = []
const rootDomains = []

for (const origin of rawOrigins) {
  allowedOrigins.push(origin)
  const root = getRootDomain(origin)
  if (root && !rootDomains.includes(root)) {
    rootDomains.push(root)
  }
}

const hasExplicitOrigins = allowedOrigins.length > 0

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

    if (rootDomains.some((domain) => origin.endsWith(domain))) {
      callback(null, true)
      return
    }

    if (!hasExplicitOrigins) {
      callback(null, true)
      return
    }

    callback(new Error("Not allowed by CORS"))
  },
  credentials: true,
})

module.exports = { corsMiddleware }
