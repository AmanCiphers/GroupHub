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
    const { title, skills, slots, status } = req.body || {};

    if (!isString(title) || title.trim() === "") {
      return res.status(400).json({ message: "Role title is required." });
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
            "name email headline bio location skills links",
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