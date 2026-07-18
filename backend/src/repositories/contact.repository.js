const { ContactSubmission } = require("../models/ContactSubmission")

async function create(data) {
  return ContactSubmission.create(data)
}

const contactRepository = { create }

module.exports = { contactRepository }
