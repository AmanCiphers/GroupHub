import express from "express";
import {
  createProject,
  listProjects,
  getProjectById,
  applyToRole,
} from "../controllers/project.controller.js";
import {
  authenticateToken,
  optionalAuth,
} from "../middleware/auth.middleware.js";
import { verifyCsrfToken } from "../middleware/csrf.middleware.js";

const router = express.Router();

router.get("/", listProjects);
router.get("/:projectId", optionalAuth, getProjectById);
router.post("/", authenticateToken, verifyCsrfToken, createProject);
router.post(
  "/:projectId/roles/:roleId/applications",
  authenticateToken,
  verifyCsrfToken,
  applyToRole,
);

export default router;