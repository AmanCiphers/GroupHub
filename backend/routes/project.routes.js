import express from "express";
import {
  createProject,
  listProjects,
  getProjectById,
} from "../controllers/project.controller.js";
import { authenticateToken } from "../middleware/auth.middleware.js";
import { verifyCsrfToken } from "../middleware/csrf.middleware.js";

const router = express.Router();

router.get("/", listProjects);
router.get("/:projectId", getProjectById);
router.post("/", authenticateToken, verifyCsrfToken, createProject);

export default router;