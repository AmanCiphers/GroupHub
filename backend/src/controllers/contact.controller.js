const { contactService } = require("../services/contact.service")
const { apiResponse } = require("../utils/ApiResponse")
const { asyncHandler } = require("../utils/asyncHandler")

const createContactSubmission = asyncHandler(async (req, res) => {
  const submission = await contactService.createSubmission(req.validated.body, req)
  apiResponse(res, 201, { submission }, "Message received")
})

module.exports = { createContactSubmission }
