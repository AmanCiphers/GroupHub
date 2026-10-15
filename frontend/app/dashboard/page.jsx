"use client"

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

import { PageHeader } from "@/components/page-header"
import { activity, applications, projects, stats, statusClass } from "@/lib/data/dashboard.data"

/** Authenticated workspace: stats, projects, applications, activity. */
export default function DashboardPage() {

  return (
    <div className="min-h-screen bg-canvas text-ink">
      <PageHeader
        eyebrow="Workspace"
        title="Keep every team moving."
        description="Track active projects, applications, team updates, and the next decisions that unblock progress."
        actions={
          <div className="flex flex-wrap gap-3">
            <button className="flex size-11 items-center justify-center border border-line bg-white">
              <Bell className="size-5" />
            </button>
            <button className="flex size-11 items-center justify-center border border-line bg-white">
              <Settings className="size-5" />
            </button>
            <Link
              href="/projects/new"
              className="inline-flex h-11 items-center gap-2 border border-ink bg-ink px-5 text-sm font-black text-white transition hover:bg-transparent hover:text-ink"
            >
              <Plus className="size-4" />
              New project
            </Link>
          </div>
        }
      />

      <section className="px-6 py-8 sm:px-10 lg:px-20 xl:px-28">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="border border-line bg-surface p-5">
              <p className="text-sm font-black uppercase tracking-[0.14em] text-faint">
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
              <div className="mb-4 flex items-center justify-between border-b border-line pb-4">
                <h2 className="text-xl font-black">Project Command</h2>
                <Link href="/find-projects" className="text-sm font-black underline underline-offset-4">
                  Browse roles
                </Link>
              </div>
              <div className="grid gap-4">
                {projects.map((project) => (
                  <article key={project.title} className="border border-line bg-surface p-5">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`px-2.5 py-1 text-xs font-black ${statusClass[project.status]}`}>
                            {project.status}
                          </span>
                          {project.unread > 0 && (
                            <span className="border border-ink bg-white px-2.5 py-1 text-xs font-black">
                              {project.unread} new
                            </span>
                          )}
                        </div>
                        <h3 className="mt-3 text-2xl font-black">{project.title}</h3>
                        <p className="mt-2 text-sm font-semibold text-subtle">
                          Next: {project.next}
                        </p>
                      </div>
                      <div className="text-sm font-semibold text-subtle">
                        <Users className="mr-1 inline size-4" />
                        {project.team} members
                      </div>
                    </div>
                    <div className="mt-5">
                      <div className="mb-2 flex justify-between text-xs font-black uppercase tracking-[0.12em] text-faint">
                        <span>Progress</span>
                        <span>{project.progress}%</span>
                      </div>
                      <div className="h-2 bg-track">
                        <div className="h-full bg-ink" style={{ width: `${project.progress}%` }} />
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            <div>
              <div className="mb-4 border-b border-line pb-4">
                <h2 className="text-xl font-black">Applications</h2>
              </div>
              <div className="grid gap-3">
                {applications.map((app) => (
                  <div key={app.title} className="flex flex-col gap-3 border border-line bg-surface p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="font-black">{app.title}</h3>
                      <p className="mt-1 text-sm font-semibold text-faint">
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
            <div className="border border-line bg-surface p-5">
              <h2 className="text-xl font-black">Today&apos;s Activity</h2>
              <div className="mt-5 grid gap-4">
                {activity.map((item) => (
                  <div key={item.text} className="flex gap-3">
                    <div className="flex size-9 shrink-0 items-center justify-center bg-charcoal text-white">
                      <item.icon className="size-4" />
                    </div>
                    <div>
                      <p className="text-sm font-bold leading-snug">{item.text}</p>
                      <p className="mt-1 text-xs font-semibold text-faint">{item.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="border border-ink bg-charcoal p-5 text-white">
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

      </div>
    )
  }
