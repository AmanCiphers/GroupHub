import { BookOpen, MessageSquare, Rocket, Settings, Users } from "lucide-react"

export const categories = ["All", "Getting Started", "Projects", "Collaboration", "Advanced"]

export const tutorials = [
  ["Creating Your First Profile", "Showcase skills, availability, and what you want to learn.", "Getting Started", "5 min", "Beginner", Users],
  ["Launching a New Project", "Write a listing with clear roles and a useful first milestone.", "Projects", "8 min", "Beginner", Rocket],
  ["Finding the Right Team Members", "Use role and skill filters to find complementary contributors.", "Getting Started", "6 min", "Beginner", Users],
  ["Applying to Projects", "Explain fit, availability, and what you can ship first.", "Projects", "7 min", "Beginner", BookOpen],
  ["Effective Team Communication", "Keep async teams aligned without adding process drag.", "Collaboration", "10 min", "Intermediate", MessageSquare],
  ["Managing Project Milestones", "Break ideas into small proofs and visible progress.", "Projects", "12 min", "Intermediate", Settings],
  ["Building Your Reputation", "Turn reliable contributions into profile trust.", "Collaboration", "8 min", "Intermediate", Users],
  ["Advanced Search Techniques", "Find narrow roles, early projects, and high-fit teams faster.", "Advanced", "6 min", "Advanced", Settings],
]
