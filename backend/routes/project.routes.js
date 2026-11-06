import express from "express";
import {
  createProject,
  listProjects,
  getProjectById,
  applyToRole,
  downloadApplicationResume,
  addProjectRole,
  updateProject,
  updateProjectRole,
  deleteProjectRole,
  addProjectMember,
  updateProjectMember,
  removeProjectMember,
  getLandingProjects,
  getContributeData,
} from "../controllers/project.controller.js";
import {
  authenticateToken,
  optionalAuth,
} from "../middleware/auth.middleware.js";
import { verifyCsrfToken } from "../middleware/csrf.middleware.js";
import { uploadApplicationResume } from "../middleware/upload.middleware.js";

const router = express.Router();

router.get("/landing", getLandingProjects);
router.get("/contribute", getContributeData);
router.get("/", listProjects);
router.get("/:projectId", optionalAuth, getProjectById);
router.post("/", authenticateToken, verifyCsrfToken, createProject);
router.patch("/:projectId", authenticateToken, verifyCsrfToken, updateProject);
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
router.patch(
  "/:projectId/roles/:roleId",
  authenticateToken,
  verifyCsrfToken,
  updateProjectRole,
);
router.delete(
  "/:projectId/roles/:roleId",
  authenticateToken,
  verifyCsrfToken,
  deleteProjectRole,
);
router.post(
  "/:projectId/members",
  authenticateToken,
  verifyCsrfToken,
  addProjectMember,
);
router.patch(
  "/:projectId/members/:membershipId",
  authenticateToken,
  verifyCsrfToken,
  updateProjectMember,
);
router.delete(
  "/:projectId/members/:membershipId",
  authenticateToken,
  verifyCsrfToken,
  removeProjectMember,
);
router.get(
  "/:projectId/applications/:applicationId/resume",
  authenticateToken,
  downloadApplicationResume,
);

export default router;