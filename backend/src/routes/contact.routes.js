const express = require("express")
const { createContactSubmission } = require("../controllers/contact.controller")
const { validate } = require("../middlewares/validate.middleware")
const { createContactSubmissionSchema } = require("../validators/contact.validator")

const contactRoutes = express.Router()

contactRoutes.post("/", validate(createContactSubmissionSchema), createContactSubmission)

module.exports = { contactRoutes }
