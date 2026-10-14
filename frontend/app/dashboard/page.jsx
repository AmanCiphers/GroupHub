"use client"

import { useState } from "react"
import Link from "next/link"
import {
  ArrowUpRight,
  Bell,
  CheckCircle2,
  Clock,
  MessageSquare,
  Plus,
  Settings,
  Users,
} from "lucide-react"

const stats = [
  { label: "Active projects", value: "3" },
  { label: "Open roles", value: "6" },
  { label: "Applications", value: "5" },
  { label: "Reputation", value: "1,250" },
]

const projects = [
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

const applications = [
  { title: "Sustainable Fashion Marketplace", status: "Pending", date: "2 days ago" },
  { title: "Mental Health Check-in App", status: "Accepted", date: "1 week ago" },
  { title: "Indie Game Studio", status: "Rejected", date: "2 weeks ago" },
]

const activity = [
  { icon: MessageSquare, text: "Sarah commented on AI Study Companion", time: "5 min ago" },
  { icon: Users, text: "New application for Portfolio Builder", time: "1 hour ago" },
  { icon: CheckCircle2, text: "AI Study Companion crossed 50% progress", time: "3 hours ago" },
]

const statusClass = {
  Active: "bg-[#171717] text-white",
  Recruiting: "bg-white text-[#171717] border border-[#171717]",
  Pending: "bg-[#efeee8] text-[#55544f]",
  Accepted: "bg-[#171717] text-white",
  Rejected: "bg-white text-[#77766f] border border-[#d9d8d2]",
}

export default function DashboardPage() {
  const [showNewProject, setShowNewProject] = useState(false)

  return (
    <div className="min-h-screen bg-[#f7f7f3] text-[#171717]">
      <section className="border-b border-[#d9d8d2] bg-[#fbfbfa] px-6 py-10 sm:px-10 lg:px-20 xl:px-28">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-[#62615d]">
              Workspace
            </p>
            <h1 className="mt-4 max-w-3xl text-4xl font-black leading-[0.95] sm:text-6xl">
              Keep every team moving.
            </h1>
            <p className="mt-5 max-w-2xl text-lg font-semibold leading-snug text-[#55544f]">
              Track active projects, applications, team updates, and the next
              decisions that unblock progress.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button className="flex size-11 items-center justify-center border border-[#d9d8d2] bg-white">
              <Bell className="size-5" />
            </button>
            <button className="flex size-11 items-center justify-center border border-[#d9d8d2] bg-white">
              <Settings className="size-5" />
            </button>
            <button
              onClick={() => setShowNewProject(true)}
              className="inline-flex h-11 items-center gap-2 border border-[#171717] bg-[#171717] px-5 text-sm font-black text-white transition hover:bg-transparent hover:text-[#171717]"
            >
              <Plus className="size-4" />
              New project
            </button>
          </div>
        </div>
      </section>

      <section className="px-6 py-8 sm:px-10 lg:px-20 xl:px-28">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="border border-[#d9d8d2] bg-[#fbfbfa] p-5">
              <p className="text-sm font-black uppercase tracking-[0.14em] text-[#77766f]">
                {stat.label}
              </p>
              <p className="mt-3 text-4xl font-black">{stat.value}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="px-6 pb-20 sm:px-10 lg:px-20 xl:px-28">
        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
          <div className="space-y-8">
            <div>
              <div className="mb-4 flex items-center justify-between border-b border-[#d9d8d2] pb-4">
                <h2 className="text-xl font-black">Project Command</h2>
                <Link href="/find-projects" className="text-sm font-black underline underline-offset-4">
                  Browse roles
                </Link>
              </div>
              <div className="grid gap-4">
                {projects.map((project) => (
                  <article key={project.title} className="border border-[#d9d8d2] bg-[#fbfbfa] p-5">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`px-2.5 py-1 text-xs font-black ${statusClass[project.status]}`}>
                            {project.status}
                          </span>
                          {project.unread > 0 && (
                            <span className="border border-[#171717] bg-white px-2.5 py-1 text-xs font-black">
                              {project.unread} new
                            </span>
                          )}
                        </div>
                        <h3 className="mt-3 text-2xl font-black">{project.title}</h3>
                        <p className="mt-2 text-sm font-semibold text-[#55544f]">
                          Next: {project.next}
                        </p>
                      </div>
                      <div className="text-sm font-semibold text-[#55544f]">
                        <Users className="mr-1 inline size-4" />
                        {project.team} members
                      </div>
                    </div>
                    <div className="mt-5">
                      <div className="mb-2 flex justify-between text-xs font-black uppercase tracking-[0.12em] text-[#77766f]">
                        <span>Progress</span>
                        <span>{project.progress}%</span>
                      </div>
                      <div className="h-2 bg-[#e5e3dc]">
                        <div className="h-full bg-[#171717]" style={{ width: `${project.progress}%` }} />
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            <div>
              <div className="mb-4 border-b border-[#d9d8d2] pb-4">
                <h2 className="text-xl font-black">Applications</h2>
              </div>
              <div className="grid gap-3">
                {applications.map((app) => (
                  <div key={app.title} className="flex flex-col gap-3 border border-[#d9d8d2] bg-[#fbfbfa] p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="font-black">{app.title}</h3>
                      <p className="mt-1 text-sm font-semibold text-[#77766f]">
                        Applied {app.date}
                      </p>
                    </div>
                    <span className={`w-fit px-2.5 py-1 text-xs font-black ${statusClass[app.status]}`}>
                      {app.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <aside className="space-y-6">
            <div className="border border-[#d9d8d2] bg-[#fbfbfa] p-5">
              <h2 className="text-xl font-black">Today&apos;s Activity</h2>
              <div className="mt-5 grid gap-4">
                {activity.map((item) => (
                  <div key={item.text} className="flex gap-3">
                    <div className="flex size-9 shrink-0 items-center justify-center bg-[#2f2f2d] text-white">
                      <item.icon className="size-4" />
                    </div>
                    <div>
                      <p className="text-sm font-bold leading-snug">{item.text}</p>
                      <p className="mt-1 text-xs font-semibold text-[#77766f]">{item.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="border border-[#171717] bg-[#2f2f2d] p-5 text-white">
              <p className="text-sm font-black uppercase tracking-[0.14em] text-white/65">
                Recommended
              </p>
              <h2 className="mt-3 text-2xl font-black">3 projects match your React + product skills.</h2>
              <Link href="/find-projects" className="mt-6 inline-flex items-center gap-2 text-sm font-black underline underline-offset-4">
                Review matches
                <ArrowUpRight className="size-4" />
              </Link>
            </div>
          </aside>
        </div>
      </section>

      {showNewProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#171717]/70 p-4">
          <div className="w-full max-w-xl border border-[#171717] bg-[#fbfbfa] p-6">
            <h2 className="text-2xl font-black">Create New Project</h2>
            <p className="mt-2 font-semibold text-[#55544f]">
              Define the idea, missing roles, and the first milestone.
            </p>
            <form className="mt-6 space-y-4">
              <input className="h-11 w-full border border-[#d9d8d2] bg-white px-3 font-semibold outline-none focus:border-[#171717]" placeholder="Project title" />
              <textarea className="min-h-28 w-full border border-[#d9d8d2] bg-white p-3 font-semibold outline-none focus:border-[#171717]" placeholder="What are you building?" />
              <input className="h-11 w-full border border-[#d9d8d2] bg-white px-3 font-semibold outline-none focus:border-[#171717]" placeholder="Open roles, e.g. React, Designer" />
              <div className="flex gap-3 pt-2">
                <button type="button" className="h-11 flex-1 border border-[#171717] font-black" onClick={() => setShowNewProject(false)}>
                  Cancel
                </button>
                <button type="submit" className="h-11 flex-1 bg-[#171717] font-black text-white">
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
