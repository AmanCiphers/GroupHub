"use client"

import { useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useDispatch, useSelector } from "react-redux"
import {
  ArrowUpRight,
  Bell,
  FolderKanban,
  Inbox,
  Plus,
  RefreshCw,
  Send,
  Settings,
  Sparkles,
  UserPlus,
  Users,
} from "lucide-react"

import { PageHeader } from "@/components/page-header"
import { fetchDashboard } from "@/lib/features/dashboard/dashboardSlice"

const projectStatusClass = {
  Recruiting: "border border-ink bg-white text-ink",
  Active: "bg-ink text-white",
  Completed: "bg-wash text-subtle",
  Archived: "border border-line bg-white text-faint",
}

const applicationStatusClass = {
  Pending: "border border-ink bg-white text-ink",
  Accepted: "bg-ink text-white",
  Rejected: "border border-line bg-white text-faint",
  Withdrawn: "bg-wash text-subtle",
}

const activityIcons = {
  project: FolderKanban,
  application: Send,
  received: Inbox,
  joined: UserPlus,
}

function timeAgo(date) {
  if (!date) return "recently"
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (seconds < 60) return "just now"
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes} min ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days} day${days === 1 ? "" : "s"} ago`
  return new Date(date).toLocaleDateString()
}

function initials(name) {
  if (!name) return "?"
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

function StatusBadge({ status, kind = "project" }) {
  const styles =
    kind === "application" ? applicationStatusClass : projectStatusClass
  return (
    <span
      className={`inline-flex w-fit px-2.5 py-1 text-xs font-black ${
        styles[status] || "border border-line bg-white text-subtle"
      }`}
    >
      {status}
    </span>
  )
}

function SectionHeader({ icon: Icon, title, count, action }) {
  return (
    <div className="mb-4 flex items-center justify-between border-b border-line pb-4">
      <h2 className="flex items-center gap-2 text-xl font-black">
        <Icon className="size-5" />
        {title}
        {typeof count === "number" && count > 0 && (
          <span className="border border-line bg-white px-2 py-0.5 text-xs font-black text-subtle">
            {count}
          </span>
        )}
      </h2>
      {action}
    </div>
  )
}

function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="border border-line bg-surface p-8 text-center">
      <div className="mx-auto flex size-11 items-center justify-center border border-line bg-white">
        <Icon className="size-5 text-quiet" />
      </div>
      <p className="mt-4 text-lg font-black text-ink">{title}</p>
      <p className="mt-1 text-sm font-semibold text-subtle">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

function DashboardLoading() {
  return (
    <div className="min-h-screen bg-canvas text-ink">
      <PageHeader
        eyebrow="Workspace"
        title="Keep every team moving."
        description="Track your projects, the teams you have joined, and the applications that need attention."
      />
      <section className="px-6 py-8 sm:px-10 lg:px-20 xl:px-28">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-28 animate-pulse border border-line bg-surface"
            />
          ))}
        </div>
        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
          <div className="h-72 animate-pulse border border-line bg-surface" />
          <div className="h-72 animate-pulse border border-line bg-surface" />
        </div>
      </section>
    </div>
  )
}

/** Authenticated workspace built from live project, membership, and application data. */
export default function DashboardPage() {
  const dispatch = useDispatch()
  const router = useRouter()
  const { user, initialized } = useSelector((state) => state.auth)
  const { data, status, error } = useSelector((state) => state.dashboard)

  useEffect(() => {
    if (initialized && !user) router.replace("/account")
  }, [initialized, user, router])

  useEffect(() => {
    if (initialized && user) dispatch(fetchDashboard())
  }, [dispatch, initialized, user])

  if (!initialized) return <DashboardLoading />

  if (!user) return null

  if (status === "error" && !data) {
    return (
      <div className="min-h-screen bg-canvas text-ink">
        <PageHeader
          eyebrow="Workspace"
          title="We couldn't load your workspace."
          description="The dashboard could not reach the API. Try again in a moment."
        />
        <section className="px-6 pb-20 sm:px-10 lg:px-20 xl:px-28">
          <button
            onClick={() => dispatch(fetchDashboard())}
            className="inline-flex h-11 items-center gap-2 border border-ink bg-ink px-5 text-sm font-black text-white transition hover:bg-transparent hover:text-ink"
          >
            <RefreshCw className="size-4" />
            Retry
          </button>
          {error && <p className="mt-3 text-sm font-semibold text-subtle">{error}</p>}
        </section>
      </div>
    )
  }

  if (!data) return <DashboardLoading />

  const { stats, ownedProjects, joinedProjects, applications, receivedApplications, recommended, activity } =
    data

  return (
    <div className="min-h-screen bg-canvas text-ink">
      <PageHeader
        eyebrow="Workspace"
        title={`Welcome back, ${user.name?.split(" ")[0] || "builder"}.`}
        description="Track your projects, the teams you have joined, and the applications that need attention."
        actions={
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              aria-label="Notifications"
              className="flex size-11 items-center justify-center border border-line bg-white"
            >
              <Bell className="size-5" />
            </button>
            <button
              type="button"
              aria-label="Workspace settings"
              className="flex size-11 items-center justify-center border border-line bg-white"
            >
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
          {[
            {
              label: "My projects",
              value: stats.myProjects,
              icon: FolderKanban,
              hint: "Projects you own",
            },
            {
              label: "Joined projects",
              value: stats.joinedProjects,
              icon: Users,
              hint: "Teams you are part of",
            },
            {
              label: "Applications sent",
              value: stats.applicationsSent,
              icon: Send,
              hint: "Outgoing applications",
            },
            {
              label: "Applications received",
              value: stats.applicationsReceived,
              icon: Inbox,
              hint:
                stats.pendingReview > 0
                  ? `${stats.pendingReview} pending review`
                  : "Incoming applications",
            },
          ].map((stat) => (
            <div key={stat.label} className="border border-line bg-surface p-5">
              <div className="flex items-start justify-between">
                <p className="text-sm font-black uppercase tracking-[0.14em] text-faint">
                  {stat.label}
                </p>
                <stat.icon className="size-4 text-quiet" />
              </div>
              <p className="mt-3 text-4xl font-black">{stat.value}</p>
              <p className="mt-1 text-xs font-semibold text-subtle">{stat.hint}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="px-6 pb-20 sm:px-10 lg:px-20 xl:px-28">
        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
          <div className="space-y-10">
            <div>
              <SectionHeader
                icon={FolderKanban}
                title="My projects"
                count={ownedProjects.length}
                action={
                  <Link
                    href="/find-projects"
                    className="text-sm font-black underline underline-offset-4"
                  >
                    Browse roles
                  </Link>
                }
              />

              {ownedProjects.length === 0 ? (
                <EmptyState
                  icon={FolderKanban}
                  title="No projects yet"
                  description="Post a project with the roles you need and start assembling your team."
                  action={
                    <Link
                      href="/projects/new"
                      className="inline-flex h-10 items-center gap-2 border border-ink bg-ink px-4 text-sm font-black text-white transition hover:bg-transparent hover:text-ink"
                    >
                      <Plus className="size-4" />
                      Create a project
                    </Link>
                  }
                />
              ) : (
                <div className="grid gap-4">
                  {ownedProjects.map((project) => (
                    <article
                      key={project.id}
                      className="border border-line bg-surface p-5 transition hover:border-ink"
                    >
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <StatusBadge status={project.status} />
                            <span className="border border-line bg-white px-2.5 py-1 text-xs font-black text-subtle">
                              {project.category}
                            </span>
                            <span className="border border-line bg-white px-2.5 py-1 text-xs font-black text-subtle">
                              {project.stage}
                            </span>
                          </div>
                          <h3 className="mt-3 text-2xl font-black">{project.title}</h3>
                          <p className="mt-2 text-sm font-semibold text-subtle">
                            Next: {project.nextMilestone}
                          </p>
                        </div>
                        <div className="flex shrink-0 flex-wrap items-center gap-4 text-sm font-semibold text-subtle">
                          <span className="flex items-center gap-1.5">
                            <Users className="size-4" />
                            {project.memberCount} members
                          </span>
                          <span className="flex items-center gap-1.5">
                            <UserPlus className="size-4" />
                            {project.spotsOpen} spots open
                          </span>
                        </div>
                      </div>

                      <div className="mt-5">
                        <div className="mb-2 flex justify-between text-xs font-black uppercase tracking-[0.12em] text-faint">
                          <span>Progress</span>
                          <span>{project.progress}%</span>
                        </div>
                        <div className="h-2 bg-track">
                          <div
                            className="h-full bg-ink"
                            style={{ width: `${project.progress}%` }}
                          />
                        </div>
                      </div>

                      <p className="mt-4 border-t border-line pt-3 text-xs font-semibold text-faint">
                        Updated {timeAgo(project.updatedAt)}
                      </p>
                    </article>
                  ))}
                </div>
              )}
            </div>

            <div>
              <SectionHeader
                icon={Users}
                title="Joined projects"
                count={joinedProjects.length}
              />

              {joinedProjects.length === 0 ? (
                <EmptyState
                  icon={Users}
                  title="You have not joined a team yet"
                  description="Browse open projects and apply to a role that matches your skills."
                  action={
                    <Link
                      href="/find-projects"
                      className="inline-flex h-10 items-center gap-2 border border-ink bg-ink px-4 text-sm font-black text-white transition hover:bg-transparent hover:text-ink"
                    >
                      Find projects
                      <ArrowUpRight className="size-4" />
                    </Link>
                  }
                />
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {joinedProjects.map((project) => (
                    <article
                      key={`${project.id}-${project.memberRole}`}
                      className="border border-line bg-surface p-5 transition hover:border-ink"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <StatusBadge status={project.status} />
                        <span className="border border-ink bg-white px-2.5 py-1 text-xs font-black text-ink">
                          {project.memberRole}
                        </span>
                      </div>
                      <h3 className="mt-3 text-xl font-black">{project.title}</h3>
                      <p className="mt-2 text-sm font-semibold text-subtle">
                        {project.category} · {project.stage}
                      </p>
                      <div className="mt-4 flex items-center justify-between border-t border-line pt-3 text-xs font-semibold text-faint">
                        <span className="flex items-center gap-1.5">
                          <Users className="size-3.5" />
                          {project.memberCount} members
                        </span>
                        <span>Joined {timeAgo(project.joinedAt)}</span>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>

            <div>
              <SectionHeader
                icon={Send}
                title="My applications"
                count={applications.length}
              />

              {applications.length === 0 ? (
                <EmptyState
                  icon={Send}
                  title="No applications yet"
                  description="When you apply to a role, you can track its status here."
                />
              ) : (
                <div className="grid gap-3">
                  {applications.map((application) => (
                    <div
                      key={application.id}
                      className="flex flex-col gap-3 border border-line bg-surface p-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div>
                        <h3 className="font-black">{application.projectTitle}</h3>
                        <p className="mt-1 text-sm font-semibold text-faint">
                          {application.roleTitle} · Applied{" "}
                          {timeAgo(application.appliedAt)}
                        </p>
                      </div>
                      <StatusBadge status={application.status} kind="application" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <SectionHeader
                icon={Inbox}
                title="Applications received"
                count={receivedApplications.length}
              />

              {receivedApplications.length === 0 ? (
                <EmptyState
                  icon={Inbox}
                  title="No applications received"
                  description="Applications to your projects will appear here for review."
                />
              ) : (
                <div className="grid gap-3">
                  {receivedApplications.map((application) => (
                    <div
                      key={application.id}
                      className="flex flex-col gap-3 border border-line bg-surface p-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-charcoal text-sm font-black text-white">
                          {initials(application.applicantName)}
                        </div>
                        <div>
                          <h3 className="font-black">{application.applicantName}</h3>
                          <p className="mt-1 text-sm font-semibold text-faint">
                            {application.applicantEmail || "Applicant"}{" "}
                            · {application.roleTitle} on {application.projectTitle}
                          </p>
                          <p className="mt-1 text-xs font-semibold text-faint">
                            Applied {timeAgo(application.appliedAt)}
                          </p>
                        </div>
                      </div>
                      <StatusBadge status={application.status} kind="application" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <aside className="space-y-6">
            <div className="border border-line bg-surface p-5">
              <h2 className="flex items-center gap-2 text-xl font-black">
                <Sparkles className="size-5" />
                Recommended
              </h2>
              <p className="mt-1 text-sm font-semibold text-subtle">
                Open projects matched to the skills in your projects.
              </p>

              <div className="mt-5 grid gap-3">
                {recommended.length === 0 ? (
                  <p className="text-sm font-semibold text-faint">
                    No recommendations yet. Create or join a project to get matched.
                  </p>
                ) : (
                  recommended.map((project) => (
                    <article
                      key={project.id}
                      className="border border-line bg-white p-4"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="bg-charcoal px-2 py-0.5 text-xs font-black uppercase tracking-[0.12em] text-white">
                          {project.category}
                        </span>
                        <span className="text-xs font-black text-faint">
                          {project.spotsOpen} spots open
                        </span>
                      </div>
                      <h3 className="mt-2 text-lg font-black leading-tight">
                        {project.title}
                      </h3>
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {(project.skills || []).slice(0, 3).map((skill) => (
                          <span
                            key={skill}
                            className="border border-line px-2 py-0.5 text-xs font-bold text-subtle"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </article>
                  ))
                )}
              </div>

              <Link
                href="/find-projects"
                className="mt-5 inline-flex items-center gap-2 text-sm font-black underline underline-offset-4"
              >
                Review all projects
                <ArrowUpRight className="size-4" />
              </Link>
            </div>

            <div className="border border-line bg-surface p-5">
              <h2 className="text-xl font-black">Recent activity</h2>
              <div className="mt-5 grid gap-4">
                {activity.length === 0 ? (
                  <p className="text-sm font-semibold text-faint">
                    No activity yet.
                  </p>
                ) : (
                  activity.map((item, index) => {
                    const Icon = activityIcons[item.type] || FolderKanban
                    return (
                      <div key={`${item.type}-${index}`} className="flex gap-3">
                        <div className="flex size-9 shrink-0 items-center justify-center bg-charcoal text-white">
                          <Icon className="size-4" />
                        </div>
                        <div>
                          <p className="text-sm font-bold leading-snug">{item.text}</p>
                          <p className="mt-1 text-xs font-semibold text-faint">
                            {timeAgo(item.timestamp)}
                          </p>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          </aside>
        </div>
      </section>
    </div>
  )
}
