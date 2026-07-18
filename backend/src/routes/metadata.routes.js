const express = require("express")
const { getMetadata } = require("../controllers/metadata.controller")

const metadataRoutes = express.Router()

metadataRoutes.get("/", getMetadata)

module.exports = { metadataRoutes }
