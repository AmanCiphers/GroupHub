const { contactRepository } = require("../repositories/contact.repository")
const { normalizeEmail } = require("../utils/normalize")

async function createSubmission(payload, req) {
  const submission = await contactRepository.create({
    userId: req.user?.id,
    firstName: payload.firstName.trim(),
    lastName: payload.lastName.trim(),
    email: normalizeEmail(payload.email),
    subject: payload.subject.trim(),
    message: payload.message.trim(),
    ipAddress: req.ip || "",
    userAgent: req.get("user-agent") || "",
  })

  return {
    id: String(submission._id),
    status: submission.status,
    createdAt: submission.createdAt,
  }
}

const contactService = { createSubmission }

module.exports = { contactService }
