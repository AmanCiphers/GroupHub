import { BookOpen, Bug, Code, FileText, Globe, HeartHandshake, Megaphone, Palette, Sparkles } from "lucide-react"

export const heroPoints = [
  [Sparkles, "Build proof", "Real project work that shows what you can do."],
  [Globe, "Meet builders", "Collaborate beyond your immediate network."],
  [FileText, "Earn history", "Keep visible contributions attached to your profile."],
]

export const contributionTypes = [
  [Code, "Development", "Build features, fix bugs, and connect project architecture.", ["Frontend", "Backend", "Mobile", "DevOps"], 156],
  [Palette, "Design", "Clarify flows, prototype screens, and shape product identity.", ["UI Design", "UX Research", "Branding"], 89],
  [Megaphone, "Marketing", "Help projects find users through content and launch strategy.", ["Content", "Social", "SEO"], 67],
  [BookOpen, "Documentation", "Turn rough projects into readable guides and onboarding.", ["Writing", "Tutorials", "API Docs"], 45],
  [HeartHandshake, "Mentorship", "Review work, coach new builders, and raise team quality.", ["Code Review", "Career Advice", "Pairing"], 34],
  [Bug, "Testing & QA", "Find issues, test flows, and make releases more reliable.", ["Manual QA", "Automation", "Bug Reports"], 52],
]

export const featuredProjects = [
  ["EduConnect Platform", "Open-source learning platform connecting students with tutors globally.", ["React Developer", "UX Designer"], "High"],
  ["GreenTrack App", "Mobile app helping users track and reduce their carbon footprint.", ["iOS Developer", "Data Analyst"], "Medium"],
  ["Community Health Hub", "Health resource platform for underserved communities.", ["Backend Developer", "Content Writer"], "High"],
]
