"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useSelector } from "react-redux"
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  CalendarDays,
  CheckCircle2,
  CircleDot,
  Clock,
  ExternalLink,
  Github,
  Globe,
  Lightbulb,
  Linkedin,
  MapPin,
  RefreshCw,
  Send,
  Sparkles,
  Target,
  UserPlus,
  Users,
} from "lucide-react"

import { PageHeader } from "@/components/page-header"
import { api } from "@/lib/api"
import { getInitials } from "@/lib/utils"
import { ApplyWizard } from "@/components/apply-wizard"
import {
  CardSkeleton,
  TextSkeleton,
  RoleCardSkeleton,
  ProfilePreviewSkeleton,
  PageHeaderSkeleton,
} from "@/components/skeleton"

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

function formatDate(value) {
  if (!value) return "Not set"
  return new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

function StatusBadge({ status, application = false }) {
  const styles = application ? applicationStatusClass : projectStatusClass
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

function DetailRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="mt-0.5 size-4 shrink-0 text-quiet" />
      <div>
        <p className="text-xs font-black uppercase tracking-[0.12em] text-faint">
          {label}
        </p>
        <p className="mt-0.5 text-sm font-semibold text-ink">{value || "Not set"}</p>
      </div>
    </div>
  )
}

function ProjectLoading() {
  return (
    <div className="min-h-screen bg-canvas text-ink">
      <PageHeader
        eyebrow="Project"
        title="Loading project…"
        description="Pulling together the team, roles, and progress."
      >
        <PageHeaderSkeleton />
      </PageHeader>

      <section className="px-6 py-8 sm:px-10 lg:px-20 xl:px-28">
        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
          <div className="space-y-10">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <div>
              <div className="flex items-center justify-between border-b border-line pb-3 mb-5">
                <div>
                  <Skeleton className="h-6 w-32 mb-1" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-8 w-28" />
              </div>
              <ListSkeleton items={3} component={RoleCardSkeleton} />
            </div>
          </div>

          <aside className="space-y-6 self-start lg:sticky lg:top-24">
            <CardSkeleton />
            <ProfilePreviewSkeleton />
            <CardSkeleton />
          </aside>
        </div>
      </section>
    </div>
  )
}

/** Public project detail with open roles and application flow. */
export default function ProjectPage() {
  const { projectId } = useParams()
  const router = useRouter()
  const { user, csrfToken } = useSelector((state) => state.auth)

  const [data, setData] = useState(null)
  const [status, setStatus] = useState("loading")
  const [error, setError] = useState(null)
  const [reloadKey, setReloadKey] = useState(0)

  const [activeRole, setActiveRole] = useState(null)
  const [applySuccess, setApplySuccess] = useState(null)

  useEffect(() => {
    if (!projectId) return
    const controller = new AbortController()

    const load = async () => {
      setStatus("loading")
      setError(null)
      try {
        const response = await api.getProject(projectId, controller.signal)
        setData(response)
        setStatus("ready")
      } catch (loadError) {
        if (loadError.name === "AbortError") return
        setError(loadError.message || "Could not load this project.")
        setStatus(
          (loadError.message || "").toLowerCase().includes("not found")
            ? "notfound"
            : "error"
        )
      }
    }

    load()
    return () => controller.abort()
  }, [projectId, reloadKey])

  const startApply = (role) => {
    if (!user) {
      router.push(
        `/account?next=${encodeURIComponent(`/projects/${projectId}`)}`
      )
      return
    }
    setApplySuccess(null)
    setActiveRole(role)
  }

  const onApplyClose = () => {
    setActiveRole(null)
  }

  const onApplySuccess = (message) => {
    setApplySuccess(message)
    setActiveRole(null)
    setReloadKey((key) => key + 1)
  }

  const renderApplyButton = (role) => {
    const applied = role.viewerApplicationStatus

    if (!user) {
      return (
        <button
          type="button"
          onClick={() => startApply(role)}
          className="inline-flex h-10 items-center gap-2 bg-ink px-4 text-sm font-black text-white transition hover:bg-transparent hover:text-ink"
        >
          Sign in to apply
          <ArrowRight className="size-4" />
        </button>
      )
    }

    if (viewer.isOwner) {
      return (
        <span className="inline-flex h-10 items-center border border-line bg-wash px-4 text-sm font-black text-faint">
          Your project
        </span>
      )
    }

    if (viewer.isMember) {
      return (
        <span className="inline-flex h-10 items-center border border-line bg-wash px-4 text-sm font-black text-faint">
          You are on the team
        </span>
      )
    }

    if (applied) {
      return (
        <div className="flex items-center gap-2">
          <StatusBadge status={applied} application />
          <span className="text-xs font-semibold text-faint">Applied</span>
        </div>
      )
    }

    if (!acceptsApplications || role.status !== "Open") {
      return (
        <span className="inline-flex h-10 items-center border border-line bg-wash px-4 text-sm font-black text-faint">
          Applications closed
        </span>
      )
    }

    if (role.spotsRemaining === 0) {
      return (
        <span className="inline-flex h-10 items-center border border-line bg-wash px-4 text-sm font-black text-faint">
          Role filled
        </span>
      )
    }

    return (
      <button
        type="button"
        onClick={() => startApply(role)}
        className="inline-flex h-10 items-center gap-2 bg-ink px-4 text-sm font-black text-white transition hover:bg-transparent hover:text-ink"
      >
        <Send className="size-4" />
        Apply now
      </button>
    )
  }

  if (status === "loading" && !data) return <ProjectLoading />

  if (status === "notfound" || status === "error") {
    return (
      <div className="min-h-screen bg-canvas text-ink">
        <PageHeader
          eyebrow="Project"
          title={status === "notfound" ? "Project not found." : "Could not load this project."}
          description={
            status === "notfound"
              ? "This project may have been removed or is not public."
              : "The project could not reach the API. Try again in a moment."
          }
          actions={
            <Link
              href="/find-projects"
              className="inline-flex h-11 items-center gap-2 border border-ink bg-ink px-5 text-sm font-black text-white transition hover:bg-transparent hover:text-ink"
            >
              <ArrowLeft className="size-4" />
              Back to projects
            </Link>
          }
        />
        {status === "error" && (
          <section className="px-6 py-8 sm:px-10 lg:px-20 xl:px-28">
            <button
              onClick={() => setReloadKey((key) => key + 1)}
              className="inline-flex h-11 items-center gap-2 border border-ink px-5 text-sm font-black transition hover:bg-ink hover:text-white"
            >
              <RefreshCw className="size-4" />
              Retry
            </button>
            {error && <p className="mt-3 text-sm font-semibold text-subtle">{error}</p>}
          </section>
        )}
      </div>
    )
  }

  if (!data) return <ProjectLoading />

  const { project, roles = [], members = [], viewer = {} } = data
  const owner = project.ownerId || {}
  const acceptsApplications = ["Recruiting", "Active"].includes(project.status)

  const milestones = project.milestones || []
  const doneMilestones = milestones.filter(
    (milestone) => milestone.status === "Done"
  ).length
  const progress =
    milestones.length > 0
      ? Math.round((doneMilestones / milestones.length) * 100)
      : 0

  const openRoles = roles.filter((role) => role.status === "Open")

  const ownerLinks = [
    { key: "github", label: "GitHub", icon: Github, href: owner.links?.github },
    { key: "website", label: "Website", icon: Globe, href: owner.links?.website },
    {
      key: "linkedin",
      label: "LinkedIn",
      icon: Linkedin,
      href: owner.links?.linkedin,
    },
  ].filter((link) => link.href)

  return (
    <div className="min-h-screen bg-canvas text-ink">
      <PageHeader
        eyebrow={`${project.category} · ${project.stage}`}
        title={project.title}
        description={project.description}
        actions={
          <div className="mt-6 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={project.status} />
              <span className="flex items-center gap-1.5 border border-line bg-white px-2.5 py-1 text-xs font-black text-subtle">
                <Clock className="size-3" />
                {project.commitment}
              </span>
              <span className="flex items-center gap-1.5 border border-line bg-white px-2.5 py-1 text-xs font-black text-subtle">
                <Users className="size-3" />
                {project.memberCount || members.length} members
              </span>
            </div>
            <div className="flex flex-wrap gap-3">
              <a
                href="#open-roles"
                className="inline-flex h-11 items-center gap-2 bg-ink px-5 text-sm font-black text-white transition hover:bg-transparent hover:text-ink"
              >
                Apply to a role
                <ArrowRight className="size-4" />
              </a>
              <Link
                href="/find-projects"
                className="inline-flex h-11 items-center gap-2 border border-ink px-5 text-sm font-black transition hover:bg-ink hover:text-white"
              >
                <ArrowLeft className="size-4" />
                All projects
              </Link>
            </div>
          </div>
        }
      />

      <section className="px-6 py-8 sm:px-10 lg:px-20 xl:px-28">
        {applySuccess && (
          <div className="mb-6 border border-ink bg-white px-4 py-3 text-sm font-bold">
            {applySuccess}
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-10">
            <section>
              <h2 className="border-b border-line pb-3 text-xl font-black">
                About the project
              </h2>
              <div className="mt-5 grid gap-6">
                {project.whyBuilding && (
                  <div className="border border-line bg-surface p-5">
                    <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-quiet">
                      <Lightbulb className="size-4" />
                      Why we are building it
                    </p>
                    <p className="mt-3 font-semibold leading-relaxed text-subtle">
                      {project.whyBuilding}
                    </p>
                  </div>
                )}

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="border border-line bg-surface p-5">
                    <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-quiet">
                      <Target className="size-4" />
                      Who it is for
                    </p>
                    <p className="mt-3 text-sm font-semibold leading-relaxed text-subtle">
                      {project.targetAudience}
                    </p>
                  </div>
                  <div className="border border-line bg-surface p-5">
                    <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-quiet">
                      <CheckCircle2 className="size-4" />
                      Current status
                    </p>
                    <p className="mt-3 text-sm font-semibold leading-relaxed text-subtle">
                      {project.currentStatus || "The team is still shaping the plan."}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <div className="flex items-center justify-between border-b border-line pb-3">
                <h2 className="text-xl font-black">Milestones</h2>
                <span className="text-sm font-black text-quiet">
                  {doneMilestones}/{milestones.length} done
                </span>
              </div>

              <div className="mt-4">
                <div className="mb-2 flex justify-between text-xs font-black uppercase tracking-[0.12em] text-faint">
                  <span>Progress</span>
                  <span>{progress}%</span>
                </div>
                <div className="h-2 bg-track">
                  <div
                    className="h-full bg-ink"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              <div className="mt-5 grid gap-2">
                {milestones.length === 0 ? (
                  <p className="border border-line bg-surface p-4 text-sm font-semibold text-faint">
                    No milestones have been added yet.
                  </p>
                ) : (
                  milestones.map((milestone, index) => (
                    <div
                      key={`${milestone.title}-${index}`}
                      className="flex items-center justify-between gap-4 border border-line bg-surface px-4 py-3"
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex size-7 items-center justify-center bg-charcoal text-xs font-black text-white">
                          {index + 1}
                        </span>
                        <p className="text-sm font-bold">{milestone.title}</p>
                      </div>
                      <span className="shrink-0 border border-line bg-white px-2 py-0.5 text-xs font-black text-subtle">
                        {milestone.status}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </section>

            <section>
              <h2 className="border-b border-line pb-3 text-xl font-black">
                Skills & tags
              </h2>
              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <div>
                  <p className="mb-2 text-xs font-black uppercase tracking-[0.14em] text-faint">
                    Skills
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {(project.skills || []).length > 0 ? (
                      project.skills.map((skill) => (
                        <span
                          key={skill}
                          className="border border-ink bg-white px-3 py-1 text-sm font-black"
                        >
                          {skill}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm font-semibold text-faint">
                        No skills listed.
                      </span>
                    )}
                  </div>
                </div>
                <div>
                  <p className="mb-2 text-xs font-black uppercase tracking-[0.14em] text-faint">
                    Tags
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {(project.tags || []).length > 0 ? (
                      project.tags.map((tag) => (
                        <span
                          key={tag}
                          className="border border-line bg-white px-3 py-1 text-sm font-bold text-subtle"
                        >
                          {tag}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm font-semibold text-faint">
                        No tags.
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="border-b border-line pb-3 text-xl font-black">
                Team
              </h2>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {members.length === 0 ? (
                  <p className="border border-line bg-surface p-4 text-sm font-semibold text-faint">
                    No team members yet.
                  </p>
                ) : (
                  members.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-start gap-3 border border-line bg-surface p-4"
                    >
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-charcoal text-sm font-black text-white">
                        {getInitials(member.user.name)}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-black">{member.user.name}</p>
                        <p className="mt-0.5 truncate text-xs font-semibold text-subtle">
                          {member.user.headline || member.roleTitle || "Team member"}
                        </p>
                        <span className="mt-2 inline-flex border border-line bg-white px-2 py-0.5 text-xs font-black text-faint">
                          {member.memberRole}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>

            <section id="open-roles">
              <div className="flex items-center justify-between border-b border-line pb-3">
                <h2 className="text-xl font-black">Open roles</h2>
                <span className="text-sm font-black text-quiet">
                  {openRoles.length} open
                </span>
              </div>

              <div className="mt-5 grid gap-4">
                {roles.length === 0 ? (
                  <div className="border border-line bg-surface p-6 text-center">
                    <p className="text-lg font-black">No roles posted yet</p>
                    <p className="mt-1 text-sm font-semibold text-subtle">
                      Check back later or browse other projects.
                    </p>
                  </div>
                ) : (
                  roles.map((role) => (
                    <article
                      key={role.id}
                      className="border border-line bg-surface p-5"
                    >
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="bg-charcoal px-2.5 py-1 text-xs font-black uppercase tracking-[0.12em] text-white">
                              {role.title}
                            </span>
                            {role.status !== "Open" && (
                              <span className="border border-line bg-white px-2.5 py-1 text-xs font-black text-faint">
                                {role.status}
                              </span>
                            )}
                          </div>
                          <div className="mt-3 flex flex-wrap gap-1.5">
                            {(role.skills || []).map((skill) => (
                              <span
                                key={skill}
                                className="border border-line bg-white px-2 py-0.5 text-xs font-bold text-subtle"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="shrink-0">{renderApplyButton(role)}</div>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 border-t border-line pt-3 text-xs font-semibold text-faint">
                        <span className="flex items-center gap-1.5">
                          <Users className="size-3.5" />
                          {role.spotsRemaining} of {role.slots} spots open
                        </span>
                        <span className="flex items-center gap-1.5">
                          <UserPlus className="size-3.5" />
                          {role.applicants} applicant
                          {role.applicants === 1 ? "" : "s"}
                        </span>
                        {role.pending > 0 && (
                          <span className="flex items-center gap-1.5">
                            <Clock className="size-3.5" />
                            {role.pending} pending
                          </span>
                        )}
                      </div>
                    </article>
                  ))
                )}
              </div>
            </section>
          </div>

          <aside className="space-y-6 self-start lg:sticky lg:top-24">
            <div className="border border-line bg-surface p-5">
              <h2 className="flex items-center gap-2 text-lg font-black">
                <Sparkles className="size-5" />
                At a glance
              </h2>
              <div className="mt-4 grid gap-4">
                <DetailRow icon={CircleDot} label="Stage" value={project.stage} />
                <DetailRow icon={Briefcase} label="Compensation" value={project.compensation} />
                <DetailRow
                  icon={Clock}
                  label="Commitment"
                  value={project.commitment}
                />
                <DetailRow
                  icon={Users}
                  label="Team size"
                  value={`${project.memberCount || members.length} of ${project.maxTeamSize}`}
                />
                <DetailRow
                  icon={UserPlus}
                  label="Applicants"
                  value={`${project.applicantCount || 0} total`}
                />
                <DetailRow
                  icon={MapPin}
                  label="Location"
                  value={project.location}
                />
                <DetailRow
                  icon={CircleDot}
                  label="Experience"
                  value={project.experienceLevel}
                />
                <DetailRow
                  icon={CalendarDays}
                  label="Started"
                  value={formatDate(project.startDate)}
                />
                <DetailRow
                  icon={CalendarDays}
                  label="Target end"
                  value={formatDate(project.targetEndDate)}
                />
              </div>
            </div>

            <div className="border border-ink bg-surface p-5">
              <p className="text-xs font-black uppercase tracking-[0.14em] text-faint">
                Project owner
              </p>
              <div className="mt-4 flex items-center gap-3">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-charcoal text-base font-black text-white">
                  {getInitials(owner.name || "Unknown owner")}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-lg font-black">{owner.name || "Unknown owner"}</p>
                    {owner.username && (
                      <span className="text-sm font-semibold text-faint">@{owner.username}</span>
                    )}
                  </div>
                  <p className="mt-0.5 line-clamp-2 text-sm font-semibold text-subtle">
                    {owner.headline || "Project owner"}
                  </p>
                </div>
              </div>

              {owner.bio && (
                <p className="mt-4 text-sm font-semibold leading-relaxed text-subtle">
                  {owner.bio}
                </p>
              )}

              {owner.location && (
                <p className="mt-3 flex items-center gap-1.5 text-sm font-semibold text-subtle">
                  <MapPin className="size-4" />
                  {owner.location}
                </p>
              )}

              {(owner.skills || []).length > 0 && (
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {owner.skills.slice(0, 5).map((skill) => (
                    <span
                      key={skill}
                      className="border border-line bg-white px-2 py-0.5 text-xs font-bold text-subtle"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              )}

              {ownerLinks.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-3 border-t border-line pt-4">
                  {ownerLinks.map((link) => (
                    <a
                      key={link.key}
                      href={link.href}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1.5 text-sm font-bold text-subtle hover:text-ink"
                    >
                      <link.icon className="size-4" />
                      {link.label}
                    </a>
                  ))}
                </div>
              )}

              {project.contactInfo && (
                <div className="mt-4 border-t border-line pt-4">
                  <p className="text-xs font-black uppercase tracking-[0.12em] text-faint">
                    Contact
                  </p>
                  <p className="mt-1 text-sm font-semibold text-subtle">
                    {project.contactInfo}
                  </p>
                </div>
              )}

              <p className="mt-4 text-xs font-semibold text-faint">
                Posted {timeAgo(project.createdAt)}
              </p>
            </div>

            <div className="border border-line bg-surface p-5">
              <p className="flex items-center gap-2 text-sm font-black">
                <ExternalLink className="size-4" />
                Share this project
              </p>
              <p className="mt-2 text-xs font-semibold text-faint">
                Know someone who would be a great fit? Send them the project
                link.
              </p>
            </div>
          </aside>
        </div>
      </section>

      {activeRole && (
        <ApplyWizard
          project={project}
          role={activeRole}
          user={user}
          csrfToken={csrfToken}
          onClose={onApplyClose}
          onSuccess={onApplySuccess}
        />
      )}
    </div>
  )
}
