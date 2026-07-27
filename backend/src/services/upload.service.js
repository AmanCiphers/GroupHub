const streamifier = require("streamifier")
const { cloudinary } = require("../config/cloudinary")

const UPLOAD_FOLDER = "grouphub"

async function uploadBuffer(buffer, originalName) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: UPLOAD_FOLDER,
        public_id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        resource_type: "auto",
      },
      (error, result) => {
        if (error) reject(error)
        else resolve(result)
      }
    )
    streamifier.createReadStream(buffer).pipe(stream)
  })
}

async function removeFile(publicId) {
  return cloudinary.uploader.destroy(publicId)
}

const uploadService = { uploadBuffer, removeFile }

module.exports = { uploadService }
