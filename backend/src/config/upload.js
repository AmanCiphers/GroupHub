const multer = require("multer")
const path = require("path")

const MAX_SIZE = 20 * 1024 * 1024

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_SIZE },
  fileFilter: (_req, file, cb) => {
    const allowed = /\.(pdf|doc|docx|xls|xlsx|ppt|pptx|txt|csv|png|jpg|jpeg|gif|svg|zip|rar|7z|mp4|mov|avi|mkv|mp3|wav|flac|json|xml|yaml|yml|md|js|jsx|ts|tsx|css|scss|html|sh)$/i
    if (allowed.test(path.extname(file.originalname))) {
      cb(null, true)
    } else {
      cb(new Error("File type not allowed"))
    }
  },
})

module.exports = { upload, MAX_SIZE }
