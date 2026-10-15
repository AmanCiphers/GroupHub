import { CheckCircle2, MessageSquare, Users } from "lucide-react"

export const stats = [
  { label: "Active projects", value: "3" },
  { label: "Open roles", value: "6" },
  { label: "Applications", value: "5" },
  { label: "Reputation", value: "1,250" },
]

export const projects = [
  {
    title: "AI Study Companion",
    status: "Active",
    team: 4,
    progress: 65,
    next: "Review flashcard flow",
    unread: 3,
  },
  {
    title: "Portfolio Builder",
    status: "Active",
    team: 3,
    progress: 40,
    next: "Ship editor prototype",
    unread: 0,
  },
  {
    title: "Community Event App",
    status: "Recruiting",
    team: 2,
    progress: 15,
    next: "Interview backend applicants",
    unread: 5,
  },
]

export const applications = [
  { title: "Sustainable Fashion Marketplace", status: "Pending", date: "2 days ago" },
  { title: "Mental Health Check-in App", status: "Accepted", date: "1 week ago" },
  { title: "Indie Game Studio", status: "Rejected", date: "2 weeks ago" },
]

export const activity = [
  { icon: MessageSquare, text: "Sarah commented on AI Study Companion", time: "5 min ago" },
  { icon: Users, text: "New application for Portfolio Builder", time: "1 hour ago" },
  { icon: CheckCircle2, text: "AI Study Companion crossed 50% progress", time: "3 hours ago" },
]

export const statusClass = {
  Active: "bg-ink text-white",
  Recruiting: "bg-white text-ink border border-ink",
  Pending: "bg-wash text-subtle",
  Accepted: "bg-ink text-white",
  Rejected: "bg-white text-faint border border-line",
}
