const fs = require("fs")
const multer = require("multer")
const path = require("path")
const crypto = require("crypto")

const UPLOAD_DIR = path.resolve(__dirname, "../../uploads")
const MAX_SIZE = 20 * 1024 * 1024

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true })
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOAD_DIR)
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname)
    cb(null, `${crypto.randomBytes(16).toString("hex")}${ext}`)
  },
})

const upload = multer({
  storage,
  limits: { fileSize: MAX_SIZE },
  fileFilter: (_req, file, cb) => {
    const allowed = /\.(pdf|doc|docx|xls|xlsx|ppt|pptx|txt|csv|png|jpg|jpeg|gif|svg|zip|rar|7z|mp4|mov|avi|mkv|mp3|wav|flac|json|xml|yaml|yml|md)$/i
    if (allowed.test(path.extname(file.originalname))) {
      cb(null, true)
    } else {
      cb(new Error("File type not allowed"))
    }
  },
})

module.exports = { upload, MAX_SIZE }
