import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import multer from "multer";

const backendRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

export const resumeDirectory = path.join(backendRoot, "uploads", "resumes");

fs.mkdirSync(resumeDirectory, { recursive: true });

const ALLOWED_EXTENSIONS = new Set([".pdf", ".doc", ".docx"]);
const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, resumeDirectory),
  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();
    const unique = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}`;
    cb(null, `${req.user.userId}-${unique}${extension}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();
    if (
      !ALLOWED_EXTENSIONS.has(extension) ||
      !ALLOWED_MIME_TYPES.has(file.mimetype)
    ) {
      return cb(new Error("Resume must be a PDF, DOC, or DOCX file."));
    }
    return cb(null, true);
  },
}).single("resume");

export const uploadResume = (req, res, next) => {
  upload(req, res, (error) => {
    if (!error) return next();

    if (error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        message: "Resume must be 5 MB or smaller.",
      });
    }

    return res.status(400).json({
      message: error.message || "Could not upload resume.",
    });
  });
};
