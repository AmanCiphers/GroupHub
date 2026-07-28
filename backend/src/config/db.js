const mongoose = require("mongoose")
const { env } = require("./env")
const { logger } = require("../utils/logger")
require("../models/Tag")

const SEED_TAGS = [
  // ── Technology ──────────────────────────────────────────
  { name: "React", type: "skill", category: "Technology", subCategory: "Frontend" },
  { name: "Vue.js", type: "skill", category: "Technology", subCategory: "Frontend" },
  { name: "Angular", type: "skill", category: "Technology", subCategory: "Frontend" },
  { name: "Svelte", type: "skill", category: "Technology", subCategory: "Frontend" },
  { name: "Solid.js", type: "skill", category: "Technology", subCategory: "Frontend" },
  { name: "Next.js", type: "skill", category: "Technology", subCategory: "Frontend" },
  { name: "TypeScript", type: "skill", category: "Technology", subCategory: "Frontend" },
  { name: "JavaScript", type: "skill", category: "Technology", subCategory: "Frontend" },
  { name: "HTML", type: "skill", category: "Technology", subCategory: "Frontend" },
  { name: "CSS", type: "skill", category: "Technology", subCategory: "Frontend" },
  { name: "Tailwind CSS", type: "skill", category: "Technology", subCategory: "Frontend" },
  { name: "Sass", type: "skill", category: "Technology", subCategory: "Frontend" },
  { name: "GraphQL", type: "skill", category: "Technology", subCategory: "Frontend" },
  { name: "Node.js", type: "skill", category: "Technology", subCategory: "Backend" },
  { name: "Python", type: "skill", category: "Technology", subCategory: "Backend" },
  { name: "Django", type: "skill", category: "Technology", subCategory: "Backend" },
  { name: "Flask", type: "skill", category: "Technology", subCategory: "Backend" },
  { name: "FastAPI", type: "skill", category: "Technology", subCategory: "Backend" },
  { name: "Go", type: "skill", category: "Technology", subCategory: "Backend" },
  { name: "Rust", type: "skill", category: "Technology", subCategory: "Backend" },
  { name: "Java", type: "skill", category: "Technology", subCategory: "Backend" },
  { name: "Spring Boot", type: "skill", category: "Technology", subCategory: "Backend" },
  { name: "PHP", type: "skill", category: "Technology", subCategory: "Backend" },
  { name: "Laravel", type: "skill", category: "Technology", subCategory: "Backend" },
  { name: "Ruby", type: "skill", category: "Technology", subCategory: "Backend" },
  { name: "Rails", type: "skill", category: "Technology", subCategory: "Backend" },
  { name: "C#", type: "skill", category: "Technology", subCategory: "Backend" },
  { name: ".NET", type: "skill", category: "Technology", subCategory: "Backend" },
  { name: "Kotlin", type: "skill", category: "Technology", subCategory: "Backend" },
  { name: "Swift", type: "skill", category: "Technology", subCategory: "Mobile" },
  { name: "SwiftUI", type: "skill", category: "Technology", subCategory: "Mobile" },
  { name: "Flutter", type: "skill", category: "Technology", subCategory: "Mobile" },
  { name: "Dart", type: "skill", category: "Technology", subCategory: "Mobile" },
  { name: "React Native", type: "skill", category: "Technology", subCategory: "Mobile" },
  { name: "PostgreSQL", type: "skill", category: "Technology", subCategory: "Database" },
  { name: "MySQL", type: "skill", category: "Technology", subCategory: "Database" },
  { name: "MongoDB", type: "skill", category: "Technology", subCategory: "Database" },
  { name: "Redis", type: "skill", category: "Technology", subCategory: "Database" },
  { name: "SQLite", type: "skill", category: "Technology", subCategory: "Database" },
  { name: "Docker", type: "skill", category: "Technology", subCategory: "DevOps" },
  { name: "Kubernetes", type: "skill", category: "Technology", subCategory: "DevOps" },
  { name: "Terraform", type: "skill", category: "Technology", subCategory: "DevOps" },
  { name: "AWS", type: "skill", category: "Technology", subCategory: "DevOps" },
  { name: "GCP", type: "skill", category: "Technology", subCategory: "DevOps" },
  { name: "Azure", type: "skill", category: "Technology", subCategory: "DevOps" },
  { name: "CI/CD", type: "skill", category: "Technology", subCategory: "DevOps" },
  { name: "GitHub Actions", type: "skill", category: "Technology", subCategory: "DevOps" },
  { name: "Git", type: "skill", category: "Technology", subCategory: "DevOps" },
  { name: "OpenAI", type: "skill", category: "Technology", subCategory: "AI/ML" },
  { name: "TensorFlow", type: "skill", category: "Technology", subCategory: "AI/ML" },
  { name: "PyTorch", type: "skill", category: "Technology", subCategory: "AI/ML" },
  { name: "LangChain", type: "skill", category: "Technology", subCategory: "AI/ML" },
  { name: "WebSockets", type: "skill", category: "Technology", subCategory: "Realtime" },
  { name: "Socket.IO", type: "skill", category: "Technology", subCategory: "Realtime" },
  { name: "Firebase", type: "skill", category: "Technology", subCategory: "Backend-as-a-Service" },
  { name: "Supabase", type: "skill", category: "Technology", subCategory: "Backend-as-a-Service" },
  { name: "Stripe", type: "skill", category: "Technology", subCategory: "Payments" },
  { name: "Figma", type: "skill", category: "Design", subCategory: "UI/UX" },
  { name: "Sketch", type: "skill", category: "Design", subCategory: "UI/UX" },
  { name: "Adobe XD", type: "skill", category: "Design", subCategory: "UI/UX" },
  { name: "Photoshop", type: "skill", category: "Design", subCategory: "Visual" },
  { name: "Illustrator", type: "skill", category: "Design", subCategory: "Visual" },

  // ── Roles ──────────────────────────────────────────────
  { name: "Frontend Developer", type: "role", category: "Engineering", subCategory: "Frontend" },
  { name: "Backend Developer", type: "role", category: "Engineering", subCategory: "Backend" },
  { name: "Full Stack Developer", type: "role", category: "Engineering", subCategory: "Full Stack" },
  { name: "Mobile Developer", type: "role", category: "Engineering", subCategory: "Mobile" },
  { name: "DevOps Engineer", type: "role", category: "Engineering", subCategory: "DevOps" },
  { name: "Site Reliability Engineer", type: "role", category: "Engineering", subCategory: "DevOps" },
  { name: "Security Engineer", type: "role", category: "Engineering", subCategory: "Security" },
  { name: "QA Engineer", type: "role", category: "Engineering", subCategory: "Quality" },
  { name: "AI/ML Engineer", type: "role", category: "Engineering", subCategory: "AI/ML" },
  { name: "Machine Learning Engineer", type: "role", category: "Engineering", subCategory: "AI/ML" },
  { name: "Data Scientist", type: "role", category: "Engineering", subCategory: "Data" },
  { name: "Data Analyst", type: "role", category: "Engineering", subCategory: "Data" },
  { name: "Game Developer", type: "role", category: "Engineering", subCategory: "Gaming" },
  { name: "Engineering Manager", type: "role", category: "Engineering", subCategory: "Management" },
  { name: "Solutions Architect", type: "role", category: "Engineering", subCategory: "Architecture" },
  { name: "UI/UX Designer", type: "role", category: "Design", subCategory: "UI/UX" },
  { name: "Product Designer", type: "role", category: "Design", subCategory: "Product" },
  { name: "Graphic Designer", type: "role", category: "Design", subCategory: "Visual" },
  { name: "Product Manager", type: "role", category: "Management", subCategory: "Product" },
  { name: "Project Manager", type: "role", category: "Management", subCategory: "Project" },
  { name: "Scrum Master", type: "role", category: "Management", subCategory: "Project" },
  { name: "Technical Writer", type: "role", category: "Content", subCategory: "Technical" },
  { name: "Content Writer", type: "role", category: "Content", subCategory: "General" },
  { name: "Copywriter", type: "role", category: "Content", subCategory: "General" },
  { name: "Marketing Specialist", type: "role", category: "Marketing", subCategory: "General" },
  { name: "SEO Specialist", type: "role", category: "Marketing", subCategory: "Growth" },
  { name: "Growth Hacker", type: "role", category: "Marketing", subCategory: "Growth" },
  { name: "Social Media Manager", type: "role", category: "Marketing", subCategory: "Social" },
  { name: "Community Manager", type: "role", category: "Marketing", subCategory: "Community" },
  { name: "Business Developer", type: "role", category: "Business", subCategory: "Development" },
  { name: "Customer Success Manager", type: "role", category: "Business", subCategory: "Success" },
  { name: "Video Editor", type: "role", category: "Creative", subCategory: "Media" },
]

async function seedTags() {
  const Tag = mongoose.model("Tag")
  const existing = await Tag.countDocuments()
  if (existing > 0) {
    await Tag.deleteMany({ category: { $exists: false } })
    return
  }

  const docs = SEED_TAGS.map((t) => ({
    name: t.name.toLowerCase(),
    displayName: t.name,
    type: t.type,
    category: t.category.toLowerCase(),
    subCategory: t.subCategory.toLowerCase(),
    count: 1,
  }))
  await Tag.insertMany(docs, { ordered: false }).catch(() => {})
  logger.info(`Seeded ${docs.length} hierarchical tags`)
}

async function connectDatabase() {
  mongoose.set("strictQuery", true)

  await mongoose.connect(env.MONGODB_URI, {
    dbName: env.MONGODB_DB_NAME,
  })

  logger.info(`Connected to MongoDB database "${env.MONGODB_DB_NAME}"`)

  await seedTags()
}

async function disconnectDatabase() {
  await mongoose.disconnect()
  logger.info("Disconnected from MongoDB")
}

module.exports = { connectDatabase, disconnectDatabase }
