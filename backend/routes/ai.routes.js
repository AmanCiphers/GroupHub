import express from "express";
import { authenticateToken } from "../middleware/auth.middleware.js";
import { verifyCsrfToken } from "../middleware/csrf.middleware.js";
import { rateLimit } from "../middleware/rateLimit.middleware.js";
import {
  rewriteDescription,
  recommendSkills,
  AiNotConfiguredError,
} from "../services/ai.service.js";

const router = express.Router();

const LENGTH_LIMITS = {
  title: 120,
  description: 2000,
  whyBuilding: 2000,
  targetAudience: 500,
  currentStatus: 1000,
};

const validateInput = (body) => {
  if (!body || typeof body !== "object") {
    return "Request body is required.";
  }
  for (const [field, max] of Object.entries(LENGTH_LIMITS)) {
    const value = body[field];
    if (value === undefined || value === null) continue;
    if (typeof value !== "string") {
      return `${field} must be a string.`;
    }
    if (value.length > max) {
      return `${field} cannot exceed ${max} characters.`;
    }
  }
  return null;
};

const handleAi = (fn) => async (req, res) => {
  const error = validateInput(req.body);
  if (error) {
    return res.status(400).json({ message: error });
  }

  try {
    const result = await fn(req.body || {});
    return res.status(200).json(result);
  } catch (err) {
    if (err instanceof AiNotConfiguredError) {
      return res.status(503).json({ message: "AI not configured." });
    }
    const status = err.statusCode && err.statusCode >= 400 ? err.statusCode : 500;
    if (status === 429 || status === 503) {
      return res.status(status).json({ message: err.message });
    }
    return res.status(500).json({ message: "AI request failed." });
  }
};

router.post(
  "/rewrite-description",
  authenticateToken,
  verifyCsrfToken,
  rateLimit,
  handleAi(async (body) => {
    const description = await rewriteDescription({
      title: body.title,
      whyBuilding: body.whyBuilding,
      description: body.description,
      category: body.category,
      targetAudience: body.targetAudience,
      currentStatus: body.currentStatus,
    });
    return { description };
  }),
);

router.post(
  "/recommend-skills",
  authenticateToken,
  verifyCsrfToken,
  rateLimit,
  handleAi(async (body) => {
    const skills = await recommendSkills({
      title: body.title,
      whyBuilding: body.whyBuilding,
      description: body.description,
      category: body.category,
      targetAudience: body.targetAudience,
    });
    return { skills };
  }),
);

export default router;