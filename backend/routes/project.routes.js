import express from "express";
import {
  createProject,
  listProjects,
  getProjectById,
  applyToRole,
  downloadApplicationResume,
  addProjectRole,
  getLandingProjects,
} from "../controllers/project.controller.js";
import {
  authenticateToken,
  optionalAuth,
} from "../middleware/auth.middleware.js";
import { verifyCsrfToken } from "../middleware/csrf.middleware.js";
import { uploadApplicationResume } from "../middleware/upload.middleware.js";

const router = express.Router();

router.get("/landing", getLandingProjects);
router.get("/", listProjects);
router.get("/:projectId", optionalAuth, getProjectById);
router.post("/", authenticateToken, verifyCsrfToken, createProject);
router.post(
  "/:projectId/roles/:roleId/applications",
  authenticateToken,
  verifyCsrfToken,
  uploadApplicationResume,
  applyToRole,
);
router.post(
  "/:projectId/roles",
  authenticateToken,
  verifyCsrfToken,
  addProjectRole,
);
router.get(
  "/:projectId/applications/:applicationId/resume",
  authenticateToken,
  downloadApplicationResume,
);

export default router;