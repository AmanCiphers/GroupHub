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
export const applicationResumeDirectory = path.join(
  backendRoot,
  "uploads",
  "application-resumes",
);

fs.mkdirSync(resumeDirectory, { recursive: true });
fs.mkdirSync(applicationResumeDirectory, { recursive: true });

const ALLOWED_EXTENSIONS = new Set([".pdf", ".doc", ".docx"]);
const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

const createStorage = (directory) =>
  multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, directory),
    filename: (req, file, cb) => {
      const extension = path.extname(file.originalname).toLowerCase();
      const unique = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}`;
      cb(null, `${req.user.userId}-${unique}${extension}`);
    },
  });

const createUpload = (directory) =>
  multer({
    storage: createStorage(directory),
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

const profileUpload = createUpload(resumeDirectory);
const applicationUpload = createUpload(applicationResumeDirectory);

export const uploadResume = (req, res, next) => {
  profileUpload(req, res, (error) => {
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

export const uploadApplicationResume = (req, res, next) => {
  applicationUpload(req, res, (error) => {
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

export async function copyProfileResumeToApplication(userId, profileResumeFilename) {
  const source = path.join(resumeDirectory, profileResumeFilename);
  await fs.promises.access(source);
  const extension = path.extname(profileResumeFilename);
  const unique = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}`;
  const filename = `${userId}-${unique}${extension}`;
  const dest = path.join(applicationResumeDirectory, filename);
  await fs.promises.copyFile(source, dest);
  return filename;
}
