const { connectDatabase, disconnectDatabase } = require("../src/config/db")
const { User } = require("../src/models/User")
const { Project } = require("../src/models/Project")
const { ProjectRole } = require("../src/models/ProjectRole")
const { Application } = require("../src/models/Application")
const { ProjectMembership } = require("../src/models/ProjectMembership")
const { SavedProject } = require("../src/models/SavedProject")
const { ActivityEvent } = require("../src/models/ActivityEvent")
const { Notification } = require("../src/models/Notification")
const { ContactSubmission } = require("../src/models/ContactSubmission")
const { RefreshToken } = require("../src/models/RefreshToken")
const bcrypt = require("bcryptjs")

const FORCE = process.argv.includes("--force")

const categories = [
  "Technology", "Design", "Business", "Marketing",
  "Gaming", "Social Impact", "Education", "Health & Wellness",
]

const roleTitles = [
  "Frontend Developer", "Backend Developer", "Full Stack Developer",
  "Mobile Developer", "UI/UX Designer", "Product Designer",
  "Product Manager", "Data Scientist", "Machine Learning Engineer",
  "Marketing Specialist", "Content Writer", "QA Engineer",
]

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

function pickN(arr, n) {
  const shuffled = [...arr].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, n)
}

const users = [
  { fullName: "Alice Chen", email: "alice@example.com", password: "password123", bio: "Full-stack developer passionate about edtech.", skills: ["React", "Node.js", "TypeScript", "PostgreSQL"], interests: ["AI", "Open Source"], location: "San Francisco, CA", availabilityHoursPerWeek: 15, experienceLevel: "advanced" },
  { fullName: "Bob Martinez", email: "bob@example.com", password: "password123", bio: "Product designer focused on accessible interfaces.", skills: ["Figma", "UI/UX", "Prototyping", "Design Systems"], interests: ["Design", "Accessibility"], location: "New York, NY", availabilityHoursPerWeek: 10, experienceLevel: "intermediate" },
  { fullName: "Carol Singh", email: "carol@example.com", password: "password123", bio: "Data scientist and ML engineer.", skills: ["Python", "TensorFlow", "Data Analysis", "SQL"], interests: ["Machine Learning", "Climate"], location: "Austin, TX", availabilityHoursPerWeek: 20, experienceLevel: "expert" },
  { fullName: "David Kim", email: "david@example.com", password: "password123", bio: "Marketing professional with a technical edge.", skills: ["SEO", "Content Strategy", "Analytics", "Growth"], interests: ["Startups", "Marketing"], location: "Chicago, IL", availabilityHoursPerWeek: 8, experienceLevel: "intermediate" },
  { fullName: "Elena Garcia", email: "elena@example.com", password: "password123", bio: "Mobile developer building cross-platform apps.", skills: ["React Native", "Swift", "Flutter", "Firebase"], interests: ["Mobile", "Health Tech"], location: "Seattle, WA", availabilityHoursPerWeek: 12, experienceLevel: "advanced" },
  { fullName: "GroupHub Admin", email: "admin@grouphub.com", password: "admin123", bio: "Platform administrator.", skills: ["Management", "Community", "Strategy"], interests: ["Community Building"], location: "Remote", availabilityHoursPerWeek: 40, experienceLevel: "expert" },
]

const projects = [
  { title: "AI Study Companion", description: "An AI-powered study tool that creates personalized quizzes, summarizes lecture notes, and helps students prepare for exams more effectively.", category: "Technology", stage: "prototype", status: "recruiting", skills: ["React", "Python", "Machine Learning", "NLP"], tags: ["AI", "Education", "Open Source"], teamSizeTarget: 5, progressPercent: 25, nextMilestone: "MVP quiz engine", commitmentHoursPerWeek: 10, locationType: "remote", location: "Remote", roles: [
    { title: "Frontend Developer", requiredSkills: ["React", "TypeScript"], slotsTotal: 2 },
    { title: "Machine Learning Engineer", requiredSkills: ["Python", "NLP", "TensorFlow"], slotsTotal: 1 },
    { title: "Product Manager", requiredSkills: ["Product Strategy", "Agile"], slotsTotal: 1 },
  ]},
  { title: "Campus Event Map", description: "Interactive map showing all campus events, club meetings, and study groups in real time. Helps students discover what is happening around them.", category: "Technology", stage: "idea", status: "recruiting", skills: ["React Native", "Node.js", "Maps API", "UI/UX"], tags: ["Campus", "Social", "Mobile"], teamSizeTarget: 4, progressPercent: 5, nextMilestone: "User research and wireframes", commitmentHoursPerWeek: 8, locationType: "hybrid", location: "Boston, MA", roles: [
    { title: "Mobile Developer", requiredSkills: ["React Native", "Maps API"], slotsTotal: 1 },
    { title: "UI/UX Designer", requiredSkills: ["Figma", "User Research"], slotsTotal: 1 },
    { title: "Backend Developer", requiredSkills: ["Node.js", "PostgreSQL"], slotsTotal: 1 },
  ]},
  { title: "GreenTrack App", description: "A mobile app that helps users track their carbon footprint through daily activities and provides personalized suggestions to reduce environmental impact.", category: "Health & Wellness", stage: "mvp", status: "recruiting", skills: ["React Native", "Python", "Data Analysis", "UI/UX"], tags: ["Climate", "Health", "Mobile"], teamSizeTarget: 4, progressPercent: 40, nextMilestone: "Beta launch", commitmentHoursPerWeek: 12, locationType: "remote", location: "Remote", roles: [
    { title: "Mobile Developer", requiredSkills: ["React Native", "Firebase"], slotsTotal: 1 },
    { title: "Data Scientist", requiredSkills: ["Python", "Data Analysis"], slotsTotal: 1 },
    { title: "Marketing Specialist", requiredSkills: ["Growth Marketing", "ASO"], slotsTotal: 1 },
  ]},
  { title: "Portfolio Builder", description: "A platform that helps students and freelancers build professional portfolios by connecting their projects, skills, and contributions into a beautiful showcase.", category: "Technology", stage: "prototype", status: "recruiting", skills: ["React", "Node.js", "Design", "TypeScript"], tags: ["Portfolio", "Career", "Open Source"], teamSizeTarget: 3, progressPercent: 30, nextMilestone: "Template system", commitmentHoursPerWeek: 10, locationType: "remote", location: "Remote", roles: [
    { title: "Frontend Developer", requiredSkills: ["React", "TypeScript", "CSS"], slotsTotal: 1 },
    { title: "Product Designer", requiredSkills: ["Figma", "Design Systems"], slotsTotal: 1 },
  ]},
  { title: "Community Health Hub", description: "A health resource platform connecting underserved communities with local clinics, mental health resources, and wellness programs.", category: "Social Impact", stage: "idea", status: "recruiting", skills: ["React", "Node.js", "Content", "Community"], tags: ["Health", "Social Impact", "Nonprofit"], teamSizeTarget: 5, progressPercent: 10, nextMilestone: "Community partnership outreach", commitmentHoursPerWeek: 6, locationType: "hybrid", location: "Atlanta, GA", roles: [
    { title: "Backend Developer", requiredSkills: ["Node.js", "PostgreSQL"], slotsTotal: 1 },
    { title: "Content Writer", requiredSkills: ["Writing", "Health Communication"], slotsTotal: 1 },
    { title: "UI/UX Designer", requiredSkills: ["Figma", "Accessibility"], slotsTotal: 1 },
  ]},
  { title: "EduConnect Platform", description: "Open-source learning platform connecting students with tutors globally. Features live sessions, resource sharing, and progress tracking.", category: "Education", stage: "active", status: "recruiting", skills: ["React", "WebRTC", "Node.js", "Python"], tags: ["Education", "Open Source", "Real-time"], teamSizeTarget: 6, progressPercent: 55, nextMilestone: "Real-time collaboration features", commitmentHoursPerWeek: 15, locationType: "remote", location: "Remote", roles: [
    { title: "Frontend Developer", requiredSkills: ["React", "WebRTC"], slotsTotal: 1 },
    { title: "Backend Developer", requiredSkills: ["Node.js", "WebSockets"], slotsTotal: 1 },
    { title: "QA Engineer", requiredSkills: ["Testing", "Automation"], slotsTotal: 1 },
  ]},
  { title: "Design System Library", description: "A comprehensive, open-source design system with reusable components, icons, and guidelines for student projects.", category: "Design", stage: "prototype", status: "recruiting", skills: ["Figma", "React", "Storybook", "CSS"], tags: ["Design", "Open Source", "Components"], teamSizeTarget: 3, progressPercent: 35, nextMilestone: "Component documentation", commitmentHoursPerWeek: 8, locationType: "remote", location: "Remote", roles: [
    { title: "Product Designer", requiredSkills: ["Figma", "Design Systems"], slotsTotal: 1 },
    { title: "Frontend Developer", requiredSkills: ["React", "Storybook"], slotsTotal: 1 },
  ]},
  { title: "Game Night Matcher", description: "A social gaming platform that matches players for board games, video games, and tabletop RPGs based on preferences and availability.", category: "Gaming", stage: "idea", status: "recruiting", skills: ["React", "Node.js", "MongoDB", "UI/UX"], tags: ["Gaming", "Social", "Matchmaking"], teamSizeTarget: 4, progressPercent: 5, nextMilestone: "Concept validation", commitmentHoursPerWeek: 10, locationType: "remote", location: "Remote", roles: [
    { title: "Full Stack Developer", requiredSkills: ["React", "Node.js", "MongoDB"], slotsTotal: 2 },
    { title: "Product Manager", requiredSkills: ["Product Strategy", "User Research"], slotsTotal: 1 },
  ]},
]

async function seed() {
  console.log("Connecting to database...")
  await connectDatabase()

  if (FORCE) {
    console.log("Clearing existing data...")
    await Promise.all([
      User.deleteMany({}),
      Project.deleteMany({}),
      ProjectRole.deleteMany({}),
      Application.deleteMany({}),
      ProjectMembership.deleteMany({}),
      SavedProject.deleteMany({}),
      ActivityEvent.deleteMany({}),
      Notification.deleteMany({}),
      ContactSubmission.deleteMany({}),
      RefreshToken.deleteMany({}),
    ])
  }

  console.log("Creating users...")
  const passwordHash = await bcrypt.hash("password123", 10)
  const adminHash = await bcrypt.hash("admin123", 10)

  const createdUsers = []
  for (const u of users) {
    const user = await User.create({
      ...u,
      passwordHash: u.email === "admin@grouphub.com" ? adminHash : passwordHash,
      role: u.email === "admin@grouphub.com" ? "admin" : "user",
      emailVerified: true,
      status: "active",
      username: u.fullName.toLowerCase().replace(/\s+/g, "_"),
      lastLoginAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
    })
    createdUsers.push(user)
    console.log(`  ✓ ${user.fullName} (${user.email})`)
  }

  console.log("Creating projects and roles...")
  for (let pi = 0; pi < projects.length; pi++) {
    const p = projects[pi]
    const owner = createdUsers[pi % (createdUsers.length - 1)]

    const project = await Project.create({
      ownerId: owner._id,
      title: p.title,
      slug: p.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
      description: p.description,
      category: p.category,
      stage: p.stage,
      status: p.status,
      skills: p.skills,
      tags: p.tags,
      teamSizeTarget: p.teamSizeTarget,
      progressPercent: p.progressPercent,
      nextMilestone: p.nextMilestone,
      commitmentHoursPerWeek: p.commitmentHoursPerWeek,
      commitmentLabel: `${p.commitmentHoursPerWeek} hrs/week`,
      locationType: p.locationType,
      location: p.location,
      publishedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
    })

    const roles = []
    for (const r of p.roles) {
      const role = await ProjectRole.create({
        projectId: project._id,
        title: r.title,
        description: `Looking for a ${r.title.toLowerCase()} to join the team.`,
        requiredSkills: r.requiredSkills,
        slotsTotal: r.slotsTotal,
        slotsFilled: r.slotsTotal > 1 ? Math.floor(Math.random() * r.slotsTotal) : 0,
        status: "open",
        workloadHoursPerWeek: project.commitmentHoursPerWeek * (1 - Math.random() * 0.4),
      })
      roles.push(role)
    }

    await ProjectMembership.create({
      projectId: project._id,
      userId: owner._id,
      roleTitle: "Owner",
      permissions: ["view", "comment", "manage_roles", "manage_applications", "manage_project"],
      joinedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
    })

    await ActivityEvent.create({
      actorId: owner._id,
      projectId: project._id,
      type: "project_created",
      metadata: { title: project.title },
      createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
    })

    console.log(`  ✓ ${project.title} (owner: ${owner.fullName}, ${roles.length} roles)`)
  }

  console.log("Creating sample applications...")
  const allProjects = await Project.find({})
  const allRoles = await ProjectRole.find({ status: "open" })

  for (let i = 0; i < Math.min(10, allRoles.length); i++) {
    const applicant = createdUsers[(i + 2) % createdUsers.length]
    const role = allRoles[i]
    const project = allProjects.find((p) => String(p._id) === String(role.projectId))

    if (!project || String(project.ownerId) === String(applicant._id)) continue

    const statuses = ["pending", "pending", "pending", "accepted", "rejected"]
    const status = statuses[i % statuses.length]

    const application = await Application.create({
      projectId: role.projectId,
      roleId: role._id,
      applicantId: applicant._id,
      message: `I am excited about this role! I have experience in ${(role.requiredSkills || []).join(", ")} and would love to contribute to ${project.title}.`,
      availabilityHoursPerWeek: 10 + Math.floor(Math.random() * 15),
      status,
    })

    if (status === "accepted") {
      await ProjectRole.findByIdAndUpdate(role._id, { $inc: { slotsFilled: 1 } })
      const allFilled = await ProjectRole.findById(role._id)
      if (allFilled.slotsFilled >= allFilled.slotsTotal) {
        await ProjectRole.findByIdAndUpdate(role._id, { status: "filled" })
      }

      await ProjectMembership.create({
        projectId: role.projectId,
        userId: applicant._id,
        roleId: role._id,
        roleTitle: role.title,
        permissions: ["view", "comment"],
        joinedAt: new Date(),
      })
    }

    await ActivityEvent.create({
      actorId: applicant._id,
      projectId: role.projectId,
      type: "application_submitted",
      metadata: { roleTitle: role.title },
    })
  }
  console.log("  ✓ Applications and memberships created")

  console.log("Creating saved projects...")
  for (let i = 0; i < 6; i++) {
    const user = createdUsers[i % createdUsers.length]
    const project = allProjects[(i + 2) % allProjects.length]
    if (String(project.ownerId) !== String(user._id)) {
      await SavedProject.create({ userId: user._id, projectId: project._id }).catch(() => {})
    }
  }
  console.log("  ✓ Saved projects created")

  console.log("Creating sample notifications...")
  for (let i = 0; i < createdUsers.length; i++) {
    const user = createdUsers[i]
    await Notification.create({
      userId: user._id,
      type: "welcome",
      title: "Welcome to GroupHub!",
      body: "Start by exploring projects or creating your own.",
    })
  }
  console.log("  ✓ Notifications created")

  console.log("Creating sample contact submissions...")
  await ContactSubmission.create({
    firstName: "Jane",
    lastName: "Doe",
    email: "jane@example.com",
    subject: "Partnership inquiry",
    message: "I would love to partner with GroupHub for our university hackathon.",
    status: "new",
    ipAddress: "192.168.1.1",
  })
  await ContactSubmission.create({
    firstName: "Sam",
    lastName: "Wilson",
    email: "sam@example.com",
    subject: "Feature suggestion",
    message: "It would be great to have a dark mode option for the platform.",
    status: "new",
    ipAddress: "192.168.1.2",
  })
  console.log("  ✓ Contact submissions created")

  console.log("\nSeed complete!")
  console.log("Users (password123):")
  users.forEach((u) => console.log(`  ${u.email}`))
  console.log("Admin (admin123): admin@grouphub.com")

  await disconnectDatabase()
  process.exit(0)
}

seed().catch((err) => {
  console.error("Seed failed:", err)
  process.exit(1)
})
