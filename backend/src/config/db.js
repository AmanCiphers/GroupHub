const mongoose = require("mongoose")
const { env } = require("./env")
const { logger } = require("../utils/logger")

async function connectDatabase() {
  mongoose.set("strictQuery", true)

  await mongoose.connect(env.MONGODB_URI, {
    dbName: env.MONGODB_DB_NAME,
  })

  logger.info(`Connected to MongoDB database "${env.MONGODB_DB_NAME}"`)
}

async function disconnectDatabase() {
  await mongoose.disconnect()
  logger.info("Disconnected from MongoDB")
}

module.exports = { connectDatabase, disconnectDatabase }
