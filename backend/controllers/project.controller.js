import Project from "../models/Project.model.js";
import Membership from "../models/Membership.model.js";
import {
  PROJECT_CATEGORIES,
  PROJECT_STAGES,
  PROJECT_STATUS,
  PROJECT_VISIBILITY,
  PROJECT_JOIN_POLICY,
  COMMITMENT,
  COMPENSATION,
  EXPERIENCE_LEVEL,
} from "../utils/enums.js";

const logProjectEvent = (message) => {
  console.log("========================================");
  console.log(` [Event] -> ${message}`);
  console.log("========================================");
};

const isString = (v) => typeof v === "string";
const isNumber = (v) => typeof v === "number" && Number.isFinite(v);
const isStringArray = (v) => Array.isArray(v) && v.every(isString);

const normalizeList = (values, { lowercase = false, maxItems = 30, maxLen = 50 } = {}) => {
  if (!Array.isArray(values)) return [];
  const seen = new Set();
  const out = [];
  for (const raw of values) {
    if (typeof raw !== "string") continue;
    let item = raw.trim();
    if (!item) continue;
    if (lowercase) item = item.toLowerCase();
    const key = item.toLowerCase();
    if (seen.has(key) || out.length >= maxItems) continue;
    if (item.length > maxLen) item = item.slice(0, maxLen);
    seen.add(key);
    out.push(item);
  }
  return out;
};

const isDuplicateKeyError = (error) =>
  error && error.code === 11000;

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const createProject = async (req, res) => {
  try {
    const {
      title,
      description,
      whyBuilding,
      targetAudience,
      compensation,
      experienceLevel,
      currentStatus,
      targetEndDate,
      contactInfo,
      category,
      tags,
      skills,
      stage,
      status,
      visibility,
      joinPolicy,
      commitment,
      location,
      startDate,
      milestones,
      maxTeamSize,
    } = req.body || {};

    if (
      !isString(title) ||
      !isString(description) ||
      !isString(category) ||
      !isString(targetAudience)
    ) {
      return res.status(400).json({
        message: "title, description, category, and targetAudience are required.",
      });
    }

    if (title.trim() === "" || description.trim() === "" || targetAudience.trim() === "") {
      return res.status(400).json({
        message: "title, description, and targetAudience cannot be empty.",
      });
    }

    if (compensation !== undefined && !COMPENSATION.includes(compensation)) {
      return res.status(400).json({ message: `compensation must be one of: ${COMPENSATION.join(", ")}.` });
    }

    if (experienceLevel !== undefined && !EXPERIENCE_LEVEL.includes(experienceLevel)) {
      return res.status(400).json({ message: `experienceLevel must be one of: ${EXPERIENCE_LEVEL.join(", ")}.` });
    }

    if (!PROJECT_CATEGORIES.includes(category)) {
      return res.status(400).json({
        message: `category must be one of: ${PROJECT_CATEGORIES.join(", ")}.`,
      });
    }

    if (tags !== undefined && !isStringArray(tags)) {
      return res.status(400).json({ message: "tags must be an array of strings." });
    }

    if (skills !== undefined && !isStringArray(skills)) {
      return res.status(400).json({ message: "skills must be an array of strings." });
    }

    const trimmedTitle = title.trim();
    const trimmedDescription = description.trim();
    const trimmedLocation = (location ?? "Remote").trim() || "Remote";

    if (trimmedTitle.length > 120) {
      return res.status(400).json({ message: "title cannot exceed 120 characters." });
    }

    if (trimmedDescription.length > 2000) {
      return res.status(400).json({ message: "description cannot exceed 2000 characters." });
    }

    const trimmedTargetAudience = targetAudience.trim();
    const trimmedWhyBuilding = (whyBuilding ?? "").trim();
    const trimmedCurrentStatus = (currentStatus ?? "").trim();
    const trimmedContactInfo = (contactInfo ?? "").trim();

    if (trimmedTargetAudience.length > 500) {
      return res.status(400).json({ message: "targetAudience cannot exceed 500 characters." });
    }

    if (trimmedWhyBuilding.length > 2000) {
      return res.status(400).json({ message: "whyBuilding cannot exceed 2000 characters." });
    }

    if (trimmedCurrentStatus.length > 1000) {
      return res.status(400).json({ message: "currentStatus cannot exceed 1000 characters." });
    }

    if (trimmedContactInfo.length > 500) {
      return res.status(400).json({ message: "contactInfo cannot exceed 500 characters." });
    }

    if (stage !== undefined && !PROJECT_STAGES.includes(stage)) {
      return res.status(400).json({ message: `stage must be one of: ${PROJECT_STAGES.join(", ")}.` });
    }

    if (status !== undefined && !PROJECT_STATUS.includes(status)) {
      return res.status(400).json({ message: `status must be one of: ${PROJECT_STATUS.join(", ")}.` });
    }

    if (visibility !== undefined && !PROJECT_VISIBILITY.includes(visibility)) {
      return res.status(400).json({ message: `visibility must be one of: ${PROJECT_VISIBILITY.join(", ")}.` });
    }

    if (joinPolicy !== undefined && !PROJECT_JOIN_POLICY.includes(joinPolicy)) {
      return res.status(400).json({ message: `joinPolicy must be one of: ${PROJECT_JOIN_POLICY.join(", ")}.` });
    }

    if (commitment !== undefined && !COMMITMENT.includes(commitment)) {
      return res.status(400).json({ message: `commitment must be one of: ${COMMITMENT.join(", ")}.` });
    }

    if (maxTeamSize !== undefined && (!isNumber(maxTeamSize) || maxTeamSize < 1)) {
      return res.status(400).json({ message: "maxTeamSize must be a number >= 1." });
    }

    if (milestones !== undefined && !Array.isArray(milestones)) {
      return res.status(400).json({ message: "milestones must be an array." });
    }

    if (startDate !== undefined && !(startDate instanceof Date) && isNaN(Date.parse(startDate))) {
      return res.status(400).json({ message: "startDate must be a valid date." });
    }

    if (targetEndDate !== undefined && !(targetEndDate instanceof Date) && isNaN(Date.parse(targetEndDate))) {
      return res.status(400).json({ message: "targetEndDate must be a valid date." });
    }

    const teamSize = 1;
    const size = Math.round(maxTeamSize ?? 5);
    const spotsOpen = Math.max(0, size - teamSize);

    const existing = await Project.findOne({
      ownerId: req.user.userId,
      title: new RegExp(`^${escapeRegex(trimmedTitle)}$`, "i"),
    });
    if (existing) {
      return res.status(409).json({
        message: "You already have a project with this title.",
      });
    }

    const project = await Project.create({
      ownerId: req.user.userId,
      title: trimmedTitle,
      description: trimmedDescription,
      whyBuilding: trimmedWhyBuilding,
      targetAudience: trimmedTargetAudience,
      compensation: compensation ?? "volunteer",
      experienceLevel: experienceLevel ?? "any",
      currentStatus: trimmedCurrentStatus,
      targetEndDate: targetEndDate ?? undefined,
      contactInfo: trimmedContactInfo,
      category,
      tags: normalizeList(tags, { lowercase: true }),
      skills: normalizeList(skills),
      stage: stage ?? "Idea",
      status: status ?? "Recruiting",
      visibility: visibility ?? "public",
      joinPolicy: joinPolicy ?? "approval",
      commitment: commitment ?? "3 hrs/week",
      location: trimmedLocation,
      startDate: startDate ?? undefined,
      milestones: milestones ?? [],
      maxTeamSize: size,
      spotsOpen,
      teamSize,
      memberCount: 1,
      applicantCount: 0,
    });

    await Membership.create({
      projectId: project._id,
      userId: req.user.userId,
      memberRole: "Owner",
      status: "Active",
    });

    logProjectEvent(`Project created: ${project.title} by ${req.user.userId}`);

    return res.status(201).json({ project });
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      logProjectEvent("Create project failed: duplicate title for owner.");
      return res.status(409).json({
        message: "You already have a project with this title.",
      });
    }
    logProjectEvent(`Create project error: ${error.message}`);
    return res.status(500).json({ message: "Internal server error." });
  }
};

export const listProjects = async (req, res) => {
  try {
    const {
      query,
      category,
      skill,
      tag,
      stage,
      status,
      page = 1,
      limit = 12,
    } = req.query;

    const filter = {};

    if (!req.user) {
      filter.visibility = "public";
    }

    if (query) {
      const regex = new RegExp(query, "i");
      filter.$or = [{ title: regex }, { description: regex }];
    }

    if (category) filter.category = category;
    if (skill) filter.skills = { $in: [skill] };
    if (tag) filter.tags = { $in: [tag] };
    if (stage) filter.stage = stage;
    if (status) filter.status = status;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 12));

    const [projects, total] = await Promise.all([
      Project.find(filter)
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .populate("ownerId", "name email"),
      Project.countDocuments(filter),
    ]);

    return res.status(200).json({
      projects,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
    });
  } catch (error) {
    logProjectEvent(`List projects error: ${error.message}`);
    return res.status(500).json({ message: "Internal server error." });
  }
};

export const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId).populate(
      "ownerId",
      "name email",
    );

    if (!project) {
      return res.status(404).json({ message: "Project not found." });
    }

    if (
      project.visibility !== "public" &&
      (!req.user || req.user.userId !== project.ownerId._id.toString())
    ) {
      return res.status(404).json({ message: "Project not found." });
    }

    return res.status(200).json({ project });
  } catch (error) {
    logProjectEvent(`Get project error: ${error.message}`);
    return res.status(500).json({ message: "Internal server error." });
  }
};