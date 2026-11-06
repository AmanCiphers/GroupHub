import Project from "../models/Project.model.js";
import Membership from "../models/Membership.model.js";
import ProjectRole from "../models/ProjectRole.model.js";
import Application from "../models/Application.model.js";
import User from "../models/User.model.js";
import {
  PROJECT_CATEGORIES,
  PROJECT_STAGES,
  PROJECT_STATUS,
  PROJECT_VISIBILITY,
  PROJECT_JOIN_POLICY,
  COMMITMENT,
  COMPENSATION,
  EXPERIENCE_LEVEL,
  ROLE_STATUS,
  MEMBER_ROLE,
  MEMBERSHIP_STATUS,
} from "../utils/enums.js";
import { copyProfileResumeToApplication, applicationResumeDirectory } from "../middleware/upload.middleware.js";
import fs from "node:fs/promises";
import path from "node:path";

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

const parseMulti = (value) => {
  const raw = Array.isArray(value) ? value : [value];
  const values = [];
  for (const entry of raw) {
    if (typeof entry !== "string") continue;
    for (const part of entry.split(",")) {
      const trimmed = part.trim();
      if (trimmed) values.push(trimmed);
    }
  }
  return [...new Set(values)].slice(0, 20);
};

const buildProjectFilter = (params, { exclude } = {}) => {
  const filter = {};
  if (!params.user) filter.visibility = "public";

  const searchTerm =
    typeof params.query === "string" ? params.query.trim().slice(0, 100) : "";
  if (searchTerm) {
    const regex = new RegExp(escapeRegex(searchTerm), "i");
    filter.$or = [{ title: regex }, { description: regex }];
  }

  if (exclude !== "category" && params.categories.length) {
    filter.category = { $in: params.categories };
  }
  if (exclude !== "skill" && params.skills.length) {
    filter.skills = { $in: params.skills };
  }
  if (exclude !== "tag" && params.tags.length) {
    filter.tags = { $in: params.tags };
  }
  if (exclude !== "stage" && params.stages.length) {
    filter.stage = { $in: params.stages };
  }
  if (exclude !== "commitment" && params.commitments.length) {
    filter.commitment = { $in: params.commitments };
  }
  if (exclude !== "status" && params.statuses.length) {
    filter.status = { $in: params.statuses };
  }

  return filter;
};

const toCountMap = (rows) =>
  Object.fromEntries(rows.map(({ _id, count }) => [_id, count]));

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
      roles,
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

    if (!Array.isArray(roles) || roles.length === 0) {
      return res.status(400).json({
        message: "At least one role is required.",
      });
    }

    for (const [idx, role] of roles.entries()) {
      if (!isString(role?.title) || role.title.trim() === "") {
        return res.status(400).json({
          message: `Role ${idx + 1}: title is required.`,
        });
      }
      if (role.description !== undefined && typeof role.description !== "string") {
        return res.status(400).json({
          message: `Role ${idx + 1}: description must be a string.`,
        });
      }
      if (role.slots !== undefined && (!isNumber(role.slots) || role.slots < 1)) {
        return res.status(400).json({
          message: `Role ${idx + 1}: slots must be a number >= 1.`,
        });
      }
      if (role.status !== undefined && !ROLE_STATUS.includes(role.status)) {
        return res.status(400).json({
          message: `Role ${idx + 1}: status must be one of: ${ROLE_STATUS.join(", ")}.`,
        });
      }
      if (role.skills !== undefined && !isStringArray(role.skills)) {
        return res.status(400).json({
          message: `Role ${idx + 1}: skills must be an array of strings.`,
        });
      }
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

    const createdRoles = await Promise.all(
      roles.map((role) =>
        ProjectRole.create({
          projectId: project._id,
          title: role.title.trim(),
          description: typeof role.description === "string" ? role.description.trim().slice(0, 1000) : "",
          skills: normalizeList(role.skills, { maxItems: 20, maxLen: 50 }),
          slots: isNumber(role.slots) ? role.slots : 1,
          status: ROLE_STATUS.includes(role.status) ? role.status : "Open",
        })
      )
    );

    await Membership.create({
      projectId: project._id,
      userId: req.user.userId,
      roleId: createdRoles[0]._id,
      memberRole: "Owner",
      status: "Active",
    });

    logProjectEvent(`Project created: ${project.title} by ${req.user.userId} with ${createdRoles.length} role(s)`);

    return res.status(201).json({ project, roles: createdRoles });
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

export const addProjectRole = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { title, description, skills, slots, status } = req.body || {};

    if (!isString(title) || title.trim() === "") {
      return res.status(400).json({ message: "Role title is required." });
    }
    if (description !== undefined && typeof description !== "string") {
      return res.status(400).json({ message: "description must be a string." });
    }
    if (slots !== undefined && (!isNumber(slots) || slots < 1)) {
      return res.status(400).json({ message: "slots must be a number >= 1." });
    }
    if (status !== undefined && !ROLE_STATUS.includes(status)) {
      return res.status(400).json({ message: `status must be one of: ${ROLE_STATUS.join(", ")}.` });
    }
    if (skills !== undefined && !isStringArray(skills)) {
      return res.status(400).json({ message: "skills must be an array of strings." });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found." });
    }

    if (project.ownerId.toString() !== req.user.userId) {
      return res.status(403).json({ message: "Only the project owner can add roles." });
    }

    const role = await ProjectRole.create({
      projectId: project._id,
      title: title.trim(),
      description: typeof description === "string" ? description.trim().slice(0, 1000) : "",
      skills: normalizeList(skills, { maxItems: 20, maxLen: 50 }),
      slots: isNumber(slots) ? slots : 1,
      status: ROLE_STATUS.includes(status) ? status : "Open",
    });

    logProjectEvent(`Role added to ${project.title}: ${role.title} by ${req.user.userId}`);

    return res.status(201).json({ role });
  } catch (error) {
    if (error?.name === "CastError") {
      return res.status(404).json({ message: "Project not found." });
    }
    logProjectEvent(`Add role error: ${error.message}`);
    return res.status(500).json({ message: "Internal server error." });
  }
};

const syncProjectTeamCounts = async (projectId) => {
  const [memberCount, project] = await Promise.all([
    Membership.countDocuments({ projectId, status: "Active" }),
    Project.findById(projectId).select("maxTeamSize"),
  ]);

  if (!project) return;

  const spotsOpen = Math.max(0, (project.maxTeamSize ?? 1) - memberCount);
  await Project.updateOne({ _id: projectId }, { memberCount, spotsOpen });
};

const parseOptionalDate = (value) => {
  if (value === null || value === "") return null;
  const parsed = value instanceof Date ? value : new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
};

export const updateProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);

    if (!project) {
      return res.status(404).json({ message: "Project not found." });
    }

    if (project.ownerId.toString() !== req.user.userId) {
      return res.status(403).json({ message: "Only the project owner can edit this project." });
    }

    const body = req.body || {};
    const next = {};

    const stringFields = {
      title: 120,
      description: 2000,
      whyBuilding: 2000,
      targetAudience: 500,
      currentStatus: 1000,
      contactInfo: 500,
      location: 80,
    };

    for (const [field, maxLength] of Object.entries(stringFields)) {
      if (body[field] === undefined) continue;
      if (typeof body[field] !== "string") {
        return res.status(400).json({ message: `${field} must be a string.` });
      }
      const value = body[field].trim();
      if (["title", "description", "targetAudience"].includes(field) && !value) {
        return res.status(400).json({ message: `${field} cannot be empty.` });
      }
      if (value.length > maxLength) {
        return res.status(400).json({ message: `${field} cannot exceed ${maxLength} characters.` });
      }
      next[field] = value;
    }

    const enumFields = {
      category: PROJECT_CATEGORIES,
      stage: PROJECT_STAGES,
      status: PROJECT_STATUS,
      visibility: PROJECT_VISIBILITY,
      joinPolicy: PROJECT_JOIN_POLICY,
      commitment: COMMITMENT,
      compensation: COMPENSATION,
      experienceLevel: EXPERIENCE_LEVEL,
    };

    for (const [field, allowed] of Object.entries(enumFields)) {
      if (body[field] === undefined) continue;
      if (!allowed.includes(body[field])) {
        return res.status(400).json({
          message: `${field} must be one of: ${allowed.join(", ")}.`,
        });
      }
      next[field] = body[field];
    }

    if (body.skills !== undefined) {
      if (!isStringArray(body.skills)) {
        return res.status(400).json({ message: "skills must be an array of strings." });
      }
      next.skills = normalizeList(body.skills);
    }

    if (body.tags !== undefined) {
      if (!isStringArray(body.tags)) {
        return res.status(400).json({ message: "tags must be an array of strings." });
      }
      next.tags = normalizeList(body.tags, { lowercase: true });
    }

    if (body.maxTeamSize !== undefined) {
      if (!isNumber(body.maxTeamSize) || body.maxTeamSize < 1) {
        return res.status(400).json({ message: "maxTeamSize must be a number >= 1." });
      }
      next.maxTeamSize = Math.round(body.maxTeamSize);
    }

    for (const field of ["startDate", "targetEndDate"]) {
      if (body[field] === undefined) continue;
      const parsed = parseOptionalDate(body[field]);
      if (parsed === undefined) {
        return res.status(400).json({ message: `${field} must be a valid date.` });
      }
      next[field] = parsed;
    }

    if (next.title) {
      const existing = await Project.findOne({
        ownerId: req.user.userId,
        title: new RegExp(`^${escapeRegex(next.title)}$`, "i"),
        _id: { $ne: project._id },
      });
      if (existing) {
        return res.status(409).json({
          message: "You already have a project with this title.",
        });
      }
    }

    Object.assign(project, next);

    const memberCount = await Membership.countDocuments({
      projectId: project._id,
      status: "Active",
    });
    project.memberCount = memberCount;
    project.spotsOpen = Math.max(0, (project.maxTeamSize ?? 1) - memberCount);

    await project.save();

    logProjectEvent(`Project updated: ${project.title} by ${req.user.userId}`);

    return res.status(200).json({ message: "Project updated.", project });
  } catch (error) {
    if (error?.name === "CastError") {
      return res.status(404).json({ message: "Project not found." });
    }
    if (isDuplicateKeyError(error)) {
      return res.status(409).json({
        message: "You already have a project with this title.",
      });
    }
    logProjectEvent(`Update project error: ${error.message}`);
    return res.status(500).json({ message: "Internal server error." });
  }
};

export const updateProjectRole = async (req, res) => {
  try {
    const { projectId, roleId } = req.params;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found." });
    }

    if (project.ownerId.toString() !== req.user.userId) {
      return res.status(403).json({ message: "Only the project owner can edit roles." });
    }

    const role = await ProjectRole.findOne({ _id: roleId, projectId });
    if (!role) {
      return res.status(404).json({ message: "Role not found." });
    }

    const body = req.body || {};

    if (body.title !== undefined) {
      if (!isString(body.title) || !body.title.trim()) {
        return res.status(400).json({ message: "Role title is required." });
      }
      if (body.title.trim().length > 80) {
        return res.status(400).json({ message: "Role title cannot exceed 80 characters." });
      }
      role.title = body.title.trim();
    }

    if (body.description !== undefined) {
      if (typeof body.description !== "string") {
        return res.status(400).json({ message: "description must be a string." });
      }
      role.description = body.description.trim().slice(0, 1000);
    }

    if (body.skills !== undefined) {
      if (!isStringArray(body.skills)) {
        return res.status(400).json({ message: "skills must be an array of strings." });
      }
      role.skills = normalizeList(body.skills, { maxItems: 20, maxLen: 50 });
    }

    if (body.slots !== undefined) {
      if (!isNumber(body.slots) || body.slots < 1) {
        return res.status(400).json({ message: "slots must be a number >= 1." });
      }
      const accepted = await Application.countDocuments({
        projectRoleId: role._id,
        status: "Accepted",
      });
      if (body.slots < accepted) {
        return res.status(400).json({
          message: `slots cannot be less than the ${accepted} accepted contributor(s).`,
        });
      }
      role.slots = Math.round(body.slots);
    }

    if (body.status !== undefined) {
      if (!ROLE_STATUS.includes(body.status)) {
        return res.status(400).json({
          message: `status must be one of: ${ROLE_STATUS.join(", ")}.`,
        });
      }
      role.status = body.status;
    }

    await role.save();

    logProjectEvent(`Role updated: ${role.title} on ${project.title}`);

    return res.status(200).json({ message: "Role updated.", role });
  } catch (error) {
    if (error?.name === "CastError") {
      return res.status(404).json({ message: "Project or role not found." });
    }
    logProjectEvent(`Update role error: ${error.message}`);
    return res.status(500).json({ message: "Internal server error." });
  }
};

export const deleteProjectRole = async (req, res) => {
  try {
    const { projectId, roleId } = req.params;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found." });
    }

    if (project.ownerId.toString() !== req.user.userId) {
      return res.status(403).json({ message: "Only the project owner can remove roles." });
    }

    const role = await ProjectRole.findOne({ _id: roleId, projectId });
    if (!role) {
      return res.status(404).json({ message: "Role not found." });
    }

    const [accepted, assignedMembers] = await Promise.all([
      Application.countDocuments({ projectRoleId: role._id, status: "Accepted" }),
      Membership.countDocuments({
        projectId: project._id,
        roleId: role._id,
        status: "Active",
      }),
    ]);

    if (accepted > 0 || assignedMembers > 0) {
      return res.status(409).json({
        message:
          "This role has accepted contributors. Reassign or remove them before deleting the role.",
      });
    }

    await Promise.all([
      Application.deleteMany({ projectRoleId: role._id }),
      role.deleteOne(),
    ]);

    logProjectEvent(`Role removed: ${role.title} from ${project.title}`);

    return res.status(200).json({ message: "Role removed." });
  } catch (error) {
    if (error?.name === "CastError") {
      return res.status(404).json({ message: "Project or role not found." });
    }
    logProjectEvent(`Delete role error: ${error.message}`);
    return res.status(500).json({ message: "Internal server error." });
  }
};

export const addProjectMember = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { email, memberRole = "Member", roleId } = req.body || {};

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found." });
    }

    if (project.ownerId.toString() !== req.user.userId) {
      return res.status(403).json({ message: "Only the project owner can add members." });
    }

    if (typeof email !== "string" || !email.trim()) {
      return res.status(400).json({ message: "Member email is required." });
    }

    if (!["Admin", "Mentor", "Member"].includes(memberRole)) {
      return res.status(400).json({
        message: "memberRole must be one of: Admin, Mentor, Member.",
      });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) {
      return res.status(404).json({ message: "No registered user found with that email." });
    }

    if (user._id.toString() === project.ownerId.toString()) {
      return res.status(400).json({ message: "The project owner is already on the team." });
    }

    let role;
    if (roleId) {
      role = await ProjectRole.findOne({ _id: roleId, projectId: project._id });
      if (!role) {
        return res.status(404).json({ message: "Role not found on this project." });
      }
    }

    const existing = await Membership.findOne({
      projectId: project._id,
      userId: user._id,
    });

    if (existing?.status === "Active") {
      return res.status(409).json({ message: "This user is already a team member." });
    }

    const activeCount = await Membership.countDocuments({
      projectId: project._id,
      status: "Active",
    });

    if (activeCount >= project.maxTeamSize) {
      return res.status(400).json({ message: "The team is already at its maximum size." });
    }

    let membership;
    if (existing) {
      existing.memberRole = memberRole;
      existing.roleId = role?._id;
      existing.status = "Active";
      membership = await existing.save();
    } else {
      membership = await Membership.create({
        projectId: project._id,
        userId: user._id,
        roleId: role?._id,
        memberRole,
        status: "Active",
      });
    }

    await syncProjectTeamCounts(project._id);

    logProjectEvent(`${user.email} added to ${project.title} as ${memberRole}`);

    return res.status(201).json({
      message: "Member added.",
      member: {
        id: membership._id,
        memberRole: membership.memberRole,
        roleTitle: role?.title || null,
        joinedAt: membership.createdAt,
        user: {
          id: user._id,
          name: user.name,
          headline: user.headline || "",
          email: user.email,
        },
      },
    });
  } catch (error) {
    if (error?.name === "CastError") {
      return res.status(404).json({ message: "Project or role not found." });
    }
    if (isDuplicateKeyError(error)) {
      return res.status(409).json({ message: "This user is already a team member." });
    }
    logProjectEvent(`Add member error: ${error.message}`);
    return res.status(500).json({ message: "Internal server error." });
  }
};

export const updateProjectMember = async (req, res) => {
  try {
    const { projectId, membershipId } = req.params;
    const { memberRole, status } = req.body || {};

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found." });
    }

    if (project.ownerId.toString() !== req.user.userId) {
      return res.status(403).json({ message: "Only the project owner can manage members." });
    }

    const membership = await Membership.findOne({
      _id: membershipId,
      projectId: project._id,
    });
    if (!membership) {
      return res.status(404).json({ message: "Team member not found." });
    }

    if (membership.userId.toString() === project.ownerId.toString()) {
      return res.status(400).json({ message: "The project owner's membership cannot be changed." });
    }

    if (memberRole !== undefined) {
      if (!["Admin", "Mentor", "Member"].includes(memberRole)) {
        return res.status(400).json({
          message: "memberRole must be one of: Admin, Mentor, Member.",
        });
      }
      membership.memberRole = memberRole;
    }

    if (status !== undefined) {
      if (!MEMBERSHIP_STATUS.includes(status)) {
        return res.status(400).json({
          message: `status must be one of: ${MEMBERSHIP_STATUS.join(", ")}.`,
        });
      }
      membership.status = status;
    }

    if (memberRole === undefined && status === undefined) {
      return res.status(400).json({ message: "Nothing to update." });
    }

    await membership.save();
    await syncProjectTeamCounts(project._id);

    return res.status(200).json({ message: "Member updated.", membership });
  } catch (error) {
    if (error?.name === "CastError") {
      return res.status(404).json({ message: "Project or member not found." });
    }
    logProjectEvent(`Update member error: ${error.message}`);
    return res.status(500).json({ message: "Internal server error." });
  }
};

export const removeProjectMember = async (req, res) => {
  try {
    const { projectId, membershipId } = req.params;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found." });
    }

    if (project.ownerId.toString() !== req.user.userId) {
      return res.status(403).json({ message: "Only the project owner can remove members." });
    }

    const membership = await Membership.findOne({
      _id: membershipId,
      projectId: project._id,
    });
    if (!membership) {
      return res.status(404).json({ message: "Team member not found." });
    }

    if (membership.userId.toString() === project.ownerId.toString()) {
      return res.status(400).json({ message: "The project owner cannot be removed." });
    }

    membership.status = "Left";
    await membership.save();
    await syncProjectTeamCounts(project._id);

    logProjectEvent(`Member removed from ${project.title}: ${membership.userId}`);

    return res.status(200).json({ message: "Member removed." });
  } catch (error) {
    if (error?.name === "CastError") {
      return res.status(404).json({ message: "Project or member not found." });
    }
    logProjectEvent(`Remove member error: ${error.message}`);
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
      commitment,
      status,
      page = 1,
      limit = 12,
      facets,
    } = req.query;

    const params = {
      user: req.user,
      query,
      categories: parseMulti(category),
      skills: parseMulti(skill),
      tags: parseMulti(tag),
      stages: parseMulti(stage),
      commitments: parseMulti(commitment),
      statuses: parseMulti(status),
    };

    const filter = buildProjectFilter(params);

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 12));
    const wantsFacets = facets === "1" || facets === "true";

    const facetQuery = wantsFacets
      ? Project.aggregate([
          {
            $facet: {
              categories: [
                { $match: buildProjectFilter(params, { exclude: "category" }) },
                { $group: { _id: "$category", count: { $sum: 1 } } },
              ],
              skills: [
                { $match: buildProjectFilter(params, { exclude: "skill" }) },
                { $unwind: "$skills" },
                { $group: { _id: "$skills", count: { $sum: 1 } } },
              ],
              stages: [
                { $match: buildProjectFilter(params, { exclude: "stage" }) },
                { $group: { _id: "$stage", count: { $sum: 1 } } },
              ],
              commitments: [
                {
                  $match: buildProjectFilter(params, {
                    exclude: "commitment",
                  }),
                },
                { $group: { _id: "$commitment", count: { $sum: 1 } } },
              ],
            },
          },
        ])
      : Promise.resolve([]);

    const [projects, total, facetRows] = await Promise.all([
      Project.find(filter)
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .populate("ownerId", "name email"),
      Project.countDocuments(filter),
      facetQuery,
    ]);

    const body = {
      projects,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
    };

    if (wantsFacets) {
      const row = facetRows[0] || {};
      body.facets = {
        categories: toCountMap(row.categories || []),
        skills: toCountMap(row.skills || []),
        stages: toCountMap(row.stages || []),
        commitments: toCountMap(row.commitments || []),
      };
    }

    return res.status(200).json(body);
  } catch (error) {
    logProjectEvent(`List projects error: ${error.message}`);
    return res.status(500).json({ message: "Internal server error." });
  }
};

export const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId).populate(
      "ownerId",
      "name email headline bio location skills links createdAt",
    );

    if (!project) {
      return res.status(404).json({ message: "Project not found." });
    }

    const ownerUserId =
      project.ownerId?._id?.toString() || project.ownerId?.toString();
    const viewerId = req.user?.userId;

    if (
      project.visibility !== "public" &&
      (!viewerId || viewerId !== ownerUserId)
    ) {
      return res.status(404).json({ message: "Project not found." });
    }

    const [roles, members, applicationCounts, viewerMembership, viewerApplicationRows] =
      await Promise.all([
        ProjectRole.find({ projectId: project._id }).sort({ createdAt: 1 }),
        Membership.find({ projectId: project._id, status: "Active" })
          .populate(
            "userId",
            "name email username headline bio location skills links",
          )
          .populate("roleId", "title")
          .sort({ createdAt: 1 }),
        Application.aggregate([
          { $match: { projectId: project._id } },
          {
            $group: {
              _id: { roleId: "$projectRoleId", status: "$status" },
              count: { $sum: 1 },
            },
          },
        ]),
        viewerId
          ? Membership.exists({
              projectId: project._id,
              userId: viewerId,
              status: "Active",
            })
          : false,
        viewerId
          ? Application.find({
              projectId: project._id,
              applicantId: viewerId,
            }).select("projectRoleId status")
          : [],
      ]);

    const countsByRole = new Map();
    for (const row of applicationCounts) {
      const roleId = row._id.roleId.toString();
      const counts = countsByRole.get(roleId) || {
        applicants: 0,
        accepted: 0,
        pending: 0,
      };
      counts.applicants += row.count;
      if (row._id.status === "Accepted") counts.accepted += row.count;
      if (row._id.status === "Pending") counts.pending += row.count;
      countsByRole.set(roleId, counts);
    }

    const viewerApplications = Object.fromEntries(
      viewerApplicationRows.map((application) => [
        application.projectRoleId.toString(),
        application.status,
      ]),
    );

    const roleData = roles.map((role) => {
      const counts = countsByRole.get(role._id.toString()) || {
        applicants: 0,
        accepted: 0,
        pending: 0,
      };
      return {
        id: role._id,
        title: role.title,
        skills: role.skills || [],
        slots: role.slots,
        status: role.status,
        applicants: counts.applicants,
        accepted: counts.accepted,
        pending: counts.pending,
        spotsRemaining: Math.max(0, role.slots - counts.accepted),
        viewerApplicationStatus:
          viewerApplications[role._id.toString()] || null,
      };
    });

    const memberData = members
      .filter((member) => member.userId)
      .map((member) => ({
        id: member._id,
        memberRole: member.memberRole,
        roleTitle: member.roleId?.title || null,
        joinedAt: member.createdAt,
        user: {
          id: member.userId._id,
          name: member.userId.name,
          email: member.userId.email || "",
          username: member.userId.username || null,
          headline: member.userId.headline || "",
          bio: member.userId.bio || "",
          location: member.userId.location || "",
          skills: member.userId.skills || [],
          links: member.userId.links || {},
        },
      }));

    return res.status(200).json({
      project,
      roles: roleData,
      members: memberData,
      viewer: {
        isOwner: Boolean(viewerId && viewerId === ownerUserId),
        isMember: Boolean(viewerMembership) || Boolean(viewerId && viewerId === ownerUserId),
        applications: viewerApplications,
      },
    });
  } catch (error) {
    if (error?.name === "CastError") {
      return res.status(404).json({ message: "Project not found." });
    }
    logProjectEvent(`Get project error: ${error.message}`);
    return res.status(500).json({ message: "Internal server error." });
  }
};

export const applyToRole = async (req, res) => {
  const uploadedFilePath = req.file
    ? path.join(applicationResumeDirectory, req.file.filename)
    : null;
  let copiedFilePath = null;

  const cleanup = async () => {
    if (uploadedFilePath) {
      await fs.unlink(uploadedFilePath).catch(() => {});
    }
    if (copiedFilePath) {
      await fs.unlink(copiedFilePath).catch(() => {});
    }
  };

  try {
    const { projectId, roleId } = req.params;

    const rawMessage = req.body?.message;
    const message = typeof rawMessage === "string" ? rawMessage.trim() : "";

    if (!message) {
      await cleanup();
      return res.status(400).json({
        message: "Please tell the owner why you are interested.",
      });
    }
    if (message.length > 1000) {
      await cleanup();
      return res.status(400).json({
        message: "Application message cannot exceed 1000 characters.",
      });
    }

    const experience = typeof req.body?.experience === "string"
      ? req.body.experience.trim().slice(0, 1000)
      : "";
    let portfolioUrl = typeof req.body?.portfolioUrl === "string"
      ? req.body.portfolioUrl.trim()
      : "";
    if (portfolioUrl) {
      try {
        const u = portfolioUrl.startsWith("http")
          ? new URL(portfolioUrl)
          : new URL(`https://${portfolioUrl}`);
        if (!["http:", "https:"].includes(u.protocol)) throw new Error();
        portfolioUrl = u.toString();
      } catch {
        await cleanup();
        return res.status(400).json({
          message: "Portfolio URL must be a valid http(s) address.",
        });
      }
    }

    const availability = typeof req.body?.availability === "string"
      ? req.body.availability
      : undefined;
    if (availability && !COMMITMENT.includes(availability)) {
      await cleanup();
      return res.status(400).json({
        message: "Select a valid availability option.",
      });
    }

    const timezone = typeof req.body?.timezone === "string"
      ? req.body.timezone.trim().slice(0, 80)
      : "";

    let startDate = undefined;
    if (req.body?.startDate) {
      const parsed = new Date(req.body.startDate);
      if (isNaN(parsed.getTime())) {
        await cleanup();
        return res.status(400).json({
          message: "Earliest start date is invalid.",
        });
      }
      startDate = parsed;
    }

    const useProfileResume = req.body?.useProfileResume === "true";

    const [project, role] = await Promise.all([
      Project.findById(projectId),
      ProjectRole.findOne({ _id: roleId, projectId }),
    ]);

    if (!project || !role) {
      await cleanup();
      return res.status(404).json({ message: "Project or role not found." });
    }

    if (!["Recruiting", "Active"].includes(project.status)) {
      await cleanup();
      return res.status(400).json({
        message: "This project is not accepting applications.",
      });
    }

    if (role.status !== "Open") {
      await cleanup();
      return res.status(400).json({
        message: "This role is not open for applications.",
      });
    }

    if (project.ownerId.toString() === req.user.userId) {
      await cleanup();
      return res.status(400).json({
        message: "You cannot apply to your own project.",
      });
    }

    const membership = await Membership.exists({
      projectId: project._id,
      userId: req.user.userId,
      status: "Active",
    });

    if (membership) {
      await cleanup();
      return res.status(400).json({
        message: "You are already a member of this project.",
      });
    }

    const accepted = await Application.countDocuments({
      projectRoleId: role._id,
      status: "Accepted",
    });

    if (accepted >= role.slots) {
      await cleanup();
      return res.status(400).json({
        message: "This role is already filled.",
      });
    }

    const existing = await Application.findOne({
      projectRoleId: role._id,
      applicantId: req.user.userId,
    });

    if (existing) {
      await cleanup();
      return res.status(409).json({
        message: "You have already applied to this role.",
      });
    }

    let resumeMeta = undefined;

    if (req.file) {
      resumeMeta = {
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        source: "upload",
        uploadedAt: new Date(),
      };
    } else if (useProfileResume) {
      const applicant = await User.findById(req.user.userId).select("resume");
      if (!applicant?.resume?.filename) {
        await cleanup();
        return res.status(400).json({
          message: "Your profile does not have a resume to use.",
        });
      }
      const copiedFilename = await copyProfileResumeToApplication(
        req.user.userId,
        applicant.resume.filename,
      );
      copiedFilePath = path.join(applicationResumeDirectory, copiedFilename);
      resumeMeta = {
        filename: copiedFilename,
        originalName: applicant.resume.originalName,
        mimeType: applicant.resume.mimeType,
        size: applicant.resume.size,
        source: "profile",
        uploadedAt: new Date(),
      };
    }

    const application = await Application.create({
      projectId: project._id,
      projectRoleId: role._id,
      applicantId: req.user.userId,
      message,
      experience,
      portfolioUrl,
      availability,
      timezone,
      startDate,
      resume: resumeMeta,
      status: "Pending",
    });

    await Project.updateOne(
      { _id: project._id },
      { $inc: { applicantCount: 1 } },
    );

    logProjectEvent(
      `Application ${application._id} sent to ${role.title} on ${project.title}`,
    );

    const responseResume = resumeMeta
      ? {
          originalName: resumeMeta.originalName,
          size: resumeMeta.size,
          source: resumeMeta.source,
          uploadedAt: resumeMeta.uploadedAt,
        }
      : null;

    return res.status(201).json({
      message: "Application sent.",
      application: {
        ...application.toObject(),
        resume: responseResume,
      },
    });
  } catch (error) {
    await cleanup();
    if (isDuplicateKeyError(error)) {
      return res.status(409).json({
        message: "You have already applied to this role.",
      });
    }
    if (error?.name === "CastError") {
      return res.status(404).json({ message: "Project or role not found." });
    }
    logProjectEvent(`Apply to role error: ${error.message}`);
    return res.status(500).json({ message: "Internal server error." });
  }
};

export const downloadApplicationResume = async (req, res) => {
  try {
    const { projectId, applicationId } = req.params;

    const application = await Application.findById(applicationId);
    if (!application || application.projectId.toString() !== projectId) {
      return res.status(404).json({ message: "Application not found." });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found." });
    }

    if (project.ownerId.toString() !== req.user.userId) {
      return res.status(403).json({ message: "Only the project owner can download resumes." });
    }

    if (!application.resume?.filename) {
      return res.status(404).json({ message: "No resume attached to this application." });
    }

    const filePath = path.join(applicationResumeDirectory, application.resume.filename);
    await fs.access(filePath);

    res.download(filePath, application.resume.originalName, (err) => {
      if (err) {
        logProjectEvent(`Resume download error: ${err.message}`);
      }
    });
  } catch (error) {
    logProjectEvent(`Download application resume error: ${error.message}`);
    return res.status(500).json({ message: "Internal server error." });
  }
};

export const getLandingProjects = async (req, res) => {
  try {
    const limit = Math.min(5, Math.max(1, parseInt(req.query.limit, 10) || 3));

    const projects = await Project.find({
      visibility: "public",
      status: { $in: ["Recruiting", "Active"] },
    })
      .sort({ createdAt: -1 })
      .limit(limit * 2) // fetch extra to filter for open roles
      .populate("ownerId", "name")
      .lean();

    const projectIds = projects.map((p) => p._id);

    const roles = await ProjectRole.find({
      projectId: { $in: projectIds },
      status: "Open",
    })
      .select("projectId title skills slots status")
      .lean();

    const rolesByProject = roles.reduce((acc, role) => {
      if (!acc[role.projectId]) acc[role.projectId] = [];
      acc[role.projectId].push(role);
      return acc;
    }, {});

    const enrichedProjects = projects
      .map((project) => ({
        ...project,
        roles: rolesByProject[project._id] || [],
      }))
      .filter((project) => project.roles.length > 0) // only projects with open roles
      .slice(0, limit); // max 3

    return res.status(200).json({ projects: enrichedProjects });
  } catch (error) {
    logProjectEvent(`Landing projects error: ${error.message}`);
    return res.status(500).json({ message: "Internal server error." });
  }
};

// Contribution type mapping based on skills
const CONTRIBUTION_TYPE_KEYWORDS = {
  Development: [
    "React", "React Native", "Vue", "Angular", "Svelte", "Next.js",
    "Node.js", "Express", "Python", "Django", "Flask", "Ruby on Rails",
    "PHP", "Laravel", "Java", "Spring", "Go", "Rust", "C#", "C++",
    "GraphQL", "REST API", "PostgreSQL", "MongoDB", "MySQL", "SQL",
    "Redis", "Docker", "Kubernetes", "AWS", "GCP", "Azure", "DevOps",
    "CI/CD", "Firebase", "Supabase", "Prisma", "Mongoose",
    "Swift", "Kotlin", "Mobile", "iOS", "Android", "Flutter",
  ],
  Design: [
    "UI/UX", "UX Research", "Product Design", "Figma", "Sketch", "Adobe XD",
    "Graphic Design", "Motion Design", "Branding", "Illustration",
    "Prototyping", "Design Systems", "Accessibility", "Interaction Design",
  ],
  Marketing: [
    "Marketing", "SEO", "SEM", "Content Marketing", "Social Media",
    "Copywriting", "Growth", "Analytics", "Email Marketing", "Brand Strategy",
    "PR", "Influencer Marketing",
  ],
  Documentation: [
    "Technical Writing", "Translation",
  ],
  Mentorship: [
    "Mentoring", "Code Review",
  ],
  "Testing & QA": [
    "QA Testing", "Automation", "Bug Reports",
  ],
};

const getContributionType = (skills) => {
  const skillSet = new Set(skills.map((s) => s.toLowerCase()));
  for (const [type, keywords] of Object.entries(CONTRIBUTION_TYPE_KEYWORDS)) {
    if (keywords.some((k) => skillSet.has(k.toLowerCase()))) {
      return type;
    }
  }
  return "Development"; // default
};

export const getContributeData = async (req, res) => {
  try {
    // Fetch public projects with open roles
    const projects = await Project.find({
      visibility: "public",
      status: { $in: ["Recruiting", "Active"] },
    })
      .sort({ createdAt: -1 })
      .limit(50)
      .populate("ownerId", "name")
      .lean();

    const projectIds = projects.map((p) => p._id);

    const roles = await ProjectRole.find({
      projectId: { $in: projectIds },
      status: "Open",
    })
      .select("projectId title skills slots status")
      .lean();

    const rolesByProject = roles.reduce((acc, role) => {
      if (!acc[role.projectId]) acc[role.projectId] = [];
      acc[role.projectId].push(role);
      return acc;
    }, {});

    // Build contribution type counts
    const contributionCounts = {
      Development: 0,
      Design: 0,
      Marketing: 0,
      Documentation: 0,
      Mentorship: 0,
      "Testing & QA": 0,
    };

    // Enrich projects with roles and compute contribution counts
    const enrichedProjects = projects
      .map((project) => {
        const projectRoles = rolesByProject[project._id] || [];
        return {
          ...project,
          roles: projectRoles,
        };
      })
      .filter((project) => project.roles.length > 0);

    // Count open roles per contribution type
    enrichedProjects.forEach((project) => {
      project.roles.forEach((role) => {
        const type = getContributionType(role.skills || []);
        contributionCounts[type] = (contributionCounts[type] || 0) + (role.slots || 1);
      });
    });

    // Featured projects: sort by status (Recruiting first), then by recency, limit 6
    const featuredProjects = enrichedProjects
      .sort((a, b) => {
        if (a.status === "Recruiting" && b.status !== "Recruiting") return -1;
        if (b.status === "Recruiting" && a.status !== "Recruiting") return 1;
        return new Date(b.createdAt) - new Date(a.createdAt);
      })
      .slice(0, 6)
      .map((project) => ({
        _id: project._id,
        title: project.title,
        description: project.description,
        category: project.category,
        stage: project.stage,
        status: project.status,
        commitment: project.commitment,
        experienceLevel: project.experienceLevel,
        location: project.location,
        needs: project.roles.map((r) => r.title),
        urgency: project.status === "Recruiting" ? "High" : "Medium",
      }));

    // Contribution types with real counts
    const contributionTypes = [
      ["Development", contributionCounts.Development || 0],
      ["Design", contributionCounts.Design || 0],
      ["Marketing", contributionCounts.Marketing || 0],
      ["Documentation", contributionCounts.Documentation || 0],
      ["Mentorship", contributionCounts.Mentorship || 0],
      ["Testing & QA", contributionCounts["Testing & QA"] || 0],
    ];

    return res.status(200).json({
      contributionTypes,
      featuredProjects,
      heroPoints: [
        ["Build proof", "Real project work that shows what you can do."],
        ["Meet builders", "Collaborate beyond your immediate network."],
        ["Earn history", "Keep visible contributions attached to your profile."],
      ],
    });
  } catch (error) {
    logProjectEvent(`Contribute data error: ${error.message}`);
    return res.status(500).json({ message: "Internal server error." });
  }
};