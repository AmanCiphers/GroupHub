import Project from "../models/Project.model.js";
import Membership from "../models/Membership.model.js";
import Application from "../models/Application.model.js";
import "../models/ProjectRole.model.js";

const logDashboardEvent = (message) => {
  console.log("========================================");
  console.log(` [Dashboard] -> ${message}`);
  console.log("========================================");
};

const calculateProgress = (milestones = []) => {
  if (!milestones.length) return 0;
  const done = milestones.filter((milestone) => milestone.status === "Done").length;
  return Math.round((done / milestones.length) * 100);
};

const findNextMilestone = (milestones = []) => {
  const next = milestones.find((milestone) => milestone.status !== "Done");
  return next ? next.title : "All milestones complete";
};

const PROJECT_FIELDS =
  "title description category stage status skills tags memberCount spotsOpen updatedAt";

export const getDashboard = async (req, res) => {
  try {
    const userId = req.user.userId;

    const ownedProjects = await Project.find({ ownerId: userId }).sort({
      updatedAt: -1,
    });
    const ownedProjectIds = ownedProjects.map((project) => project._id);

    const memberships = await Membership.find({
      userId,
      status: "Active",
      projectId: { $nin: ownedProjectIds },
    })
      .populate({ path: "projectId", select: PROJECT_FIELDS })
      .sort({ updatedAt: -1 });

    const joinedProjectIds = memberships
      .map((membership) => membership.projectId?._id)
      .filter(Boolean);

    const [sentApplications, receivedApplications, stats] = await Promise.all([
      Application.find({ applicantId: userId })
        .populate({ path: "projectId", select: "title" })
        .populate({ path: "projectRoleId", select: "title" })
        .sort({ createdAt: -1 })
        .limit(10),
      ownedProjectIds.length
        ? Application.find({ projectId: { $in: ownedProjectIds } })
            .populate({ path: "projectId", select: "title" })
            .populate({ path: "projectRoleId", select: "title" })
            .populate({ path: "applicantId", select: "name email" })
            .sort({ createdAt: -1 })
            .limit(10)
        : Promise.resolve([]),
      Promise.all([
        Project.countDocuments({ ownerId: userId }),
        Membership.countDocuments({
          userId,
          status: "Active",
          projectId: { $nin: ownedProjectIds },
        }),
        Application.countDocuments({ applicantId: userId }),
        ownedProjectIds.length
          ? Application.countDocuments({ projectId: { $in: ownedProjectIds } })
          : 0,
        ownedProjectIds.length
          ? Application.countDocuments({
              projectId: { $in: ownedProjectIds },
              status: "Pending",
            })
          : 0,
      ]).then(
        ([myProjects, joinedProjects, applicationsSent, applicationsReceived, pendingReview]) => ({
          myProjects,
          joinedProjects,
          applicationsSent,
          applicationsReceived,
          pendingReview,
        }),
      ),
    ]);

    const skills = [...new Set(ownedProjects.flatMap((project) => project.skills || []))].slice(
      0,
      10,
    );
    const excludedIds = [...ownedProjectIds, ...joinedProjectIds];
    const recommendedFilter = {
      visibility: "public",
      status: "Recruiting",
      ownerId: { $ne: userId },
      _id: { $nin: excludedIds },
    };
    if (skills.length) recommendedFilter.skills = { $in: skills };

    let recommended = await Project.find(recommendedFilter)
      .sort({ createdAt: -1 })
      .limit(3)
      .select(PROJECT_FIELDS);

    if (recommended.length === 0) {
      recommended = await Project.find({
        visibility: "public",
        status: "Recruiting",
        ownerId: { $ne: userId },
        _id: { $nin: excludedIds },
      })
        .sort({ createdAt: -1 })
        .limit(3)
        .select(PROJECT_FIELDS);
    }

    const activity = [
      ...ownedProjects.slice(0, 3).map((project) => ({
        type: "project",
        text: `Posted ${project.title}`,
        timestamp: project.updatedAt,
      })),
      ...sentApplications.slice(0, 3).map((application) => ({
        type: "application",
        text: `You applied to ${application.projectId?.title || "a project"}`,
        timestamp: application.createdAt,
      })),
      ...receivedApplications.slice(0, 3).map((application) => ({
        type: "received",
        text: `${application.applicantId?.name || "Someone"} applied to ${
          application.projectId?.title || "your project"
        }`,
        timestamp: application.createdAt,
      })),
      ...memberships.slice(0, 2).map((membership) => ({
        type: "joined",
        text: `You joined ${membership.projectId?.title || "a project"}`,
        timestamp: membership.updatedAt,
      })),
    ]
      .filter((item) => item.timestamp)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 6);

    return res.status(200).json({
      stats,
      ownedProjects: ownedProjects.slice(0, 10).map((project) => ({
        id: project._id,
        title: project.title,
        category: project.category,
        stage: project.stage,
        status: project.status,
        memberCount: project.memberCount,
        spotsOpen: project.spotsOpen,
        updatedAt: project.updatedAt,
        progress: calculateProgress(project.milestones),
        nextMilestone: findNextMilestone(project.milestones),
      })),
      joinedProjects: memberships
        .filter((membership) => membership.projectId)
        .map((membership) => ({
          id: membership.projectId._id,
          title: membership.projectId.title,
          category: membership.projectId.category,
          stage: membership.projectId.stage,
          status: membership.projectId.status,
          memberCount: membership.projectId.memberCount,
          memberRole: membership.memberRole,
          joinedAt: membership.createdAt,
        })),
      applications: sentApplications
        .filter((application) => application.projectId)
        .map((application) => ({
          id: application._id,
          projectTitle: application.projectId.title,
          roleTitle: application.projectRoleId?.title || "Contributor",
          status: application.status,
          appliedAt: application.createdAt,
        })),
      receivedApplications: receivedApplications
        .filter((application) => application.projectId)
        .map((application) => ({
          id: application._id,
          projectTitle: application.projectId.title,
          roleTitle: application.projectRoleId?.title || "Contributor",
          applicantName: application.applicantId?.name || "Unknown applicant",
          applicantEmail: application.applicantId?.email || "",
          status: application.status,
          appliedAt: application.createdAt,
        })),
      recommended: recommended.map((project) => ({
        id: project._id,
        title: project.title,
        category: project.category,
        stage: project.stage,
        skills: project.skills,
        memberCount: project.memberCount,
        spotsOpen: project.spotsOpen,
      })),
      activity,
    });
  } catch (error) {
    logDashboardEvent(`Get dashboard error: ${error.message}`);
    return res.status(500).json({ message: "Internal server error." });
  }
};
