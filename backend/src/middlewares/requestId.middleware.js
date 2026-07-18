const { createRequestId } = require("../utils/logger")

function requestIdMiddleware(req, res, next) {
  req.id = req.headers["x-request-id"] || createRequestId()
  res.setHeader("x-request-id", req.id)
  next()
}

module.exports = { requestIdMiddleware }
