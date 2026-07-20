const path = require("path")
const dotenv = require("dotenv")
const { z } = require("zod")

dotenv.config({ path: path.resolve(__dirname, "../../../.env") })
dotenv.config({ path: path.resolve(__dirname, "../../.env"), override: true })

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(5000),
  API_BASE_URL: z.string().url().default("http://localhost:5000"),
  CLIENT_URL: z.string().default(""),
  CORS_ORIGIN: z.string().default(""),
  APP_SECRET: z.string().min(16),
  MONGODB_URI: z.string().min(1),
  MONGODB_DB_NAME: z.string().min(1).default("grouphub"),
  JWT_ACCESS_SECRET: z.string().min(16),
  JWT_REFRESH_SECRET: z.string().min(16),
  JWT_ACCESS_EXPIRES_IN: z.string().default("15m"),
  JWT_REFRESH_EXPIRES_IN: z.string().default("7d"),
  BCRYPT_SALT_ROUNDS: z.coerce.number().int().min(10).max(15).default(12),
  EMAIL_FROM: z.string().optional().default(""),
  RESEND_API_SECRET: z.string().optional().default(""),
  AI_PROVIDER: z.string().optional().default("groq"),
  GROQ_API_KEY: z.string().optional().default(""),
  GROQ_MODEL: z.string().optional().default("llama-3.3-70b-versatile"),
  REDIS_URL: z.string().optional().default(""),
  REDIS_TOKEN: z.string().optional().default(""),
  SENTRY_DSN: z.string().optional().default(""),
})

const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
  const details = parsed.error.issues
    .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
    .join("; ")
  throw new Error(`Invalid environment configuration: ${details}`)
}

const env = parsed.data

module.exports = { env }
