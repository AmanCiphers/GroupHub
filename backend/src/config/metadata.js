const CATEGORIES = [
  { value: "Technology", label: "Technology" },
  { value: "Design", label: "Design" },
  { value: "Business", label: "Business" },
  { value: "Marketing", label: "Marketing" },
  { value: "Gaming", label: "Gaming" },
  { value: "Social Impact", label: "Social Impact" },
  { value: "Education", label: "Education" },
  { value: "Health & Wellness", label: "Health & Wellness" },
]

const CATEGORY_VALUES = CATEGORIES.map((c) => c.value)

const ROLES = [
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "Mobile Developer",
  "DevOps Engineer",
  "UI/UX Designer",
  "Product Designer",
  "Graphic Designer",
  "Product Manager",
  "Project Manager",
  "Data Scientist",
  "Data Analyst",
  "Machine Learning Engineer",
  "QA Engineer",
  "Technical Writer",
  "Content Writer",
  "Marketing Specialist",
  "Social Media Manager",
  "Community Manager",
  "Business Developer",
]

module.exports = { CATEGORIES, CATEGORY_VALUES, ROLES }
