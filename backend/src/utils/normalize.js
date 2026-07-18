function normalizeEmail(email) {
  return email.trim().toLowerCase()
}

function normalizeStringList(values = []) {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))]
}

module.exports = { normalizeEmail, normalizeStringList }
