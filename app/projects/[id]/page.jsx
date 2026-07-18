"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import {
  ArrowLeft,
  ArrowUpRight,
  Bookmark,
  Briefcase,
  Calendar,
  CheckCircle2,
  CircleDot,
  Clock,
  MapPin,
  MessageSquare,
  Settings,
  Target,
  Users,
} from "lucide-react"
import { apiFetch, getAccessToken, getStoredUser } from "@/lib/api"

function formatStage(stage) {
  return stage
    ? stage
        .split("-")
        .join(" ")
        .replace(/\b\w/g, (letter) => letter.toUpperCase())
    : "Idea"
}

function formatDate(value) {
  if (!value) return ""
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value))
}

export default function ProjectDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const currentUser = getStoredUser()

  const [applyingRole, setApplyingRole] = useState(null)
  const [applyMessage, setApplyMessage] = useState("")
  const [applyHours, setApplyHours] = useState("")
  const [applying, setApplying] = useState(false)
  const [applyError, setApplyError] = useState("")

  const loadProject = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const payload = await apiFetch(`/api/v1/projects/${id}`)
      setProject(payload.data.project)
    } catch (requestError) {
      setError(requestError.message)
      if (requestError.status === 404) setError("Project not found.")
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    loadProject()
  }, [loadProject])

  const toggleSave = async () => {
    if (!getAccessToken()) {
      setError("Sign in to save projects.")
      return
    }
    const wasSaved = project.isSaved
    setProject((prev) => ({ ...prev, isSaved: !wasSaved }))
    try {
      await apiFetch(`/api/v1/projects/${project.id}/save`, {
        method: wasSaved ? "DELETE" : "POST",
      })
    } catch {
      setProject((prev) => ({ ...prev, isSaved: wasSaved }))
    }
  }

  const openApply = (role) => {
    if (!getAccessToken()) {
      router.push("/account")
      return
    }
    setApplyingRole(role)
    setApplyMessage("")
    setApplyHours("")
    setApplyError("")
  }

  const handleApply = async (event) => {
    event.preventDefault()
    setApplying(true)
    setApplyError("")
    try {
      await apiFetch(`/api/v1/roles/${applyingRole.id}/applications`, {
        method: "POST",
        body: JSON.stringify({
          message: applyMessage,
          ...(applyHours ? { availabilityHoursPerWeek: Number(applyHours) } : {}),
        }),
      })
      setApplyingRole(null)
      await loadProject()
    } catch (requestError) {
      setApplyError(requestError.message)
    } finally {
      setApplying(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f7f3] text-[#171717]">
        <section className="px-6 py-20 sm:px-10 lg:px-20 xl:px-28">
          <p className="text-lg font-black">Loading project...</p>
        </section>
      </div>
    )
  }

  if (error && !project) {
    return (
      <div className="min-h-screen bg-[#f7f7f3] text-[#171717]">
        <section className="px-6 py-20 sm:px-10 lg:px-20 xl:px-28">
          <div className="max-w-xl">
            <Link href="/find-projects" className="mb-8 inline-flex items-center gap-2 text-sm font-black hover:underline">
              <ArrowLeft className="size-4" />
              Back to projects
            </Link>
            <p className="mt-8 text-xl font-black">{error}</p>
          </div>
        </section>
      </div>
    )
  }

  if (!project) return null

  const canApply = !project.isOwner && !project.isMember
  const openRoles = (project.roles || []).filter((role) => role.status === "open" && role.slotsOpen > 0)
  const filledRoles = (project.roles || []).filter((role) => role.status !== "open" || role.slotsOpen === 0)
  const totalSlots = project.roles.reduce((sum, r) => sum + r.slotsTotal, 0)
  const filledSlots = project.roles.reduce((sum, r) => sum + r.slotsFilled, 0)

  return (
    <div className="min-h-screen bg-[#f7f7f3] text-[#171717]">
      <section className="border-b border-[#d9d8d2] bg-[#fbfbfa] px-6 py-10 sm:px-10 lg:px-20 xl:px-28">
        <Link href="/find-projects" className="inline-flex items-center gap-2 text-sm font-black text-[#62615d] hover:text-[#171717]">
          <ArrowLeft className="size-4" />
          Back to projects
        </Link>

        <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_280px]">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-[#2f2f2d] px-2.5 py-1 text-xs font-black uppercase tracking-[0.12em] text-white">
                {project.category}
              </span>
              <span className="flex items-center gap-1.5 border border-[#d9d8d2] bg-white px-2.5 py-1 text-xs font-black text-[#55544f]">
                <CircleDot className="size-3" />
                {formatStage(project.stage)}
              </span>
              <span className="flex items-center gap-1.5 border border-[#d9d8d2] bg-white px-2.5 py-1 text-xs font-black text-[#55544f]">
                <Clock className="size-3" />
                {project.commitmentLabel || `${project.commitmentHoursPerWeek || 0} hrs/week`}
              </span>
              <span className={`px-2.5 py-1 text-xs font-black uppercase tracking-[0.12em] ${
                project.status === "recruiting"
                  ? "bg-[#171717] text-white"
                  : project.status === "active"
                  ? "bg-[#2f2f2d] text-white"
                  : "bg-[#efeee8] text-[#55544f]"
              }`}>
                {project.status}
              </span>
            </div>

            <h1 className="mt-6 max-w-3xl text-4xl font-black leading-[0.95] sm:text-5xl">
              {project.title}
            </h1>

            <p className="mt-5 max-w-3xl text-lg font-semibold leading-relaxed text-[#55544f]">
              {project.description}
            </p>
          </div>

          <div className="flex flex-col gap-3 lg:items-end">
            {project.isOwner ? (
              <Link
                href={`/projects/${id}/manage`}
                className="inline-flex h-11 items-center gap-2 border border-[#171717] bg-[#171717] px-5 text-sm font-black text-white transition hover:bg-transparent hover:text-[#171717]"
              >
                <Settings className="size-4" />
                Manage
              </Link>
            ) : project.isMember ? (
              <Link
                href={`/projects/${id}/member`}
                className="inline-flex h-11 items-center gap-2 border border-[#171717] bg-[#171717] px-5 text-sm font-black text-white transition hover:bg-transparent hover:text-[#171717]"
              >
                <ArrowUpRight className="size-4" />
                Team Dashboard
              </Link>
            ) : (
              <button
                onClick={toggleSave}
                className={`inline-flex h-11 items-center gap-2 border px-5 text-sm font-black transition ${
                  project.isSaved
                    ? "border-[#171717] bg-[#171717] text-white"
                    : "border-[#d9d8d2] bg-white text-[#171717] hover:border-[#171717]"
                }`}
              >
                <Bookmark className={`size-4 ${project.isSaved ? "fill-white" : ""}`} />
                {project.isSaved ? "Saved" : "Save"}
              </button>
            )}
          </div>
        </div>
      </section>

      <section className="px-6 py-8 sm:px-10 lg:px-20 xl:px-28">
        <div className="grid gap-10 lg:grid-cols-[1fr_320px]">
          <div className="space-y-10">
            {openRoles.length > 0 && (
              <div>
                <div className="mb-5 border-b border-[#d9d8d2] pb-4">
                  <h2 className="text-xl font-black">Open Roles ({openRoles.length})</h2>
                </div>
                <div className="grid gap-4">
                  {openRoles.map((role) => (
                    <div key={role.id} className="border border-[#d9d8d2] bg-[#fbfbfa] p-5">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex-1">
                          <h3 className="text-xl font-black">{role.title}</h3>
                          {role.description && (
                            <p className="mt-2 font-semibold text-[#55544f]">{role.description}</p>
                          )}
                          <div className="mt-4 flex flex-wrap gap-4 text-sm font-semibold text-[#55544f]">
                            <span className="flex items-center gap-1.5">
                              <Users className="size-4" />
                              {role.slotsOpen} of {role.slotsTotal} spots
                            </span>
                            {role.workloadHoursPerWeek > 0 && (
                              <span className="flex items-center gap-1.5">
                                <Clock className="size-4" />
                                {role.workloadHoursPerWeek} hrs/week
                              </span>
                            )}
                          </div>
                          {role.requiredSkills.length > 0 && (
                            <div className="mt-4">
                              <p className="mb-2 text-xs font-black uppercase tracking-[0.14em] text-[#77766f]">
                                Required skills
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {role.requiredSkills.map((skill) => (
                                  <span key={skill} className="border border-[#171717] bg-white px-3 py-1 text-sm font-black text-[#171717]">
                                    {skill}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          {role.preferredSkills.length > 0 && (
                            <div className="mt-3">
                              <p className="mb-2 text-xs font-black uppercase tracking-[0.14em] text-[#77766f]">
                                Preferred skills
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {role.preferredSkills.map((skill) => (
                                  <span key={skill} className="border border-[#d9d8d2] bg-white px-3 py-1 text-sm font-bold text-[#55544f]">
                                    {skill}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                        {canApply ? (
                          <button
                            onClick={() => openApply(role)}
                            className="inline-flex h-10 shrink-0 items-center gap-2 border border-[#171717] bg-[#171717] px-4 text-sm font-black text-white transition hover:bg-transparent hover:text-[#171717]"
                          >
                            Apply
                            <ArrowUpRight className="size-4" />
                          </button>
                        ) : project.isMember ? (
                          <span className="inline-flex h-10 shrink-0 items-center gap-2 border border-[#d9d8d2] bg-[#efeee8] px-4 text-sm font-bold text-[#55544f]">
                            <CheckCircle2 className="size-4" />
                            Joined
                          </span>
                        ) : (
                          <span className="inline-flex h-10 shrink-0 items-center gap-2 border border-[#d9d8d2] bg-[#efeee8] px-4 text-sm font-bold text-[#55544f]">
                            Your Project
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {filledRoles.length > 0 && (
              <div>
                <div className="mb-5 border-b border-[#d9d8d2] pb-4">
                  <h2 className="text-xl font-black text-[#77766f]">Filled Roles</h2>
                </div>
                <div className="grid gap-3">
                  {filledRoles.map((role) => (
                    <div key={role.id} className="border border-[#d9d8d2] bg-[#fbfbfa] p-4 opacity-60">
                      <div className="flex items-center justify-between">
                        <h3 className="font-black">{role.title}</h3>
                        <span className="flex items-center gap-1.5 text-sm font-semibold text-[#55544f]">
                          <CheckCircle2 className="size-4" />
                          {role.slotsFilled}/{role.slotsTotal} filled
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {project.roles.length === 0 && (
              <div className="border border-[#d9d8d2] bg-[#fbfbfa] p-6">
                <p className="text-lg font-black">No roles listed yet.</p>
                <p className="mt-2 font-semibold text-[#55544f]">Roles will appear here once the owner adds them.</p>
              </div>
            )}

            {project.skills && project.skills.length > 0 && (
              <div>
                <div className="mb-5 border-b border-[#d9d8d2] pb-4">
                  <h2 className="text-xl font-black">Skills &amp; Expertise</h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  {project.skills.map((skill) => (
                    <span key={skill} className="border border-[#171717] bg-white px-3 py-1.5 text-sm font-black text-[#171717]">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {project.tags && project.tags.length > 0 && (
              <div>
                <div className="mb-5 border-b border-[#d9d8d2] pb-4">
                  <h2 className="text-xl font-black">Tags</h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  {project.tags.map((tag) => (
                    <span key={tag} className="border border-[#d9d8d2] bg-white px-3 py-1.5 text-sm font-bold text-[#55544f]">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {project.progressPercent > 0 && (
              <div>
                <div className="mb-5 border-b border-[#d9d8d2] pb-4">
                  <h2 className="text-xl font-black">Progress</h2>
                </div>
                <div>
                  <div className="mb-2 flex justify-between text-xs font-black uppercase tracking-[0.12em] text-[#77766f]">
                    <span>Completed</span>
                    <span>{project.progressPercent}%</span>
                  </div>
                  <div className="h-3 bg-[#e5e3dc]">
                    <div className="h-full bg-[#171717]" style={{ width: `${project.progressPercent}%` }} />
                  </div>
                  {project.nextMilestone && (
                    <p className="mt-3 flex items-center gap-2 text-sm font-bold text-[#55544f]">
                      <Target className="size-4" />
                      Next: {project.nextMilestone}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
            <div className="border border-[#d9d8d2] bg-[#fbfbfa] p-5">
              <h3 className="mb-4 text-sm font-black uppercase tracking-[0.14em] text-[#77766f]">
                Details
              </h3>
              <div className="space-y-4 text-sm">
                <div className="flex items-center gap-3">
                  <MapPin className="size-4 shrink-0 text-[#62615d]" />
                  <div>
                    <p className="font-black">{project.location || "Remote"}</p>
                    <p className="text-xs font-semibold text-[#77766f] capitalize">{project.locationType}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="size-4 shrink-0 text-[#62615d]" />
                  <div>
                    <p className="font-black">{project.commitmentLabel || `${project.commitmentHoursPerWeek || 0} hrs/week`}</p>
                    <p className="text-xs font-semibold text-[#77766f]">Commitment</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Users className="size-4 shrink-0 text-[#62615d]" />
                  <div>
                    <p className="font-black">{filledSlots} of {totalSlots} filled</p>
                    <p className="text-xs font-semibold text-[#77766f]">Team spots</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="size-4 shrink-0 text-[#62615d]" />
                  <div>
                    <p className="font-black">{formatDate(project.createdAt)}</p>
                    <p className="text-xs font-semibold text-[#77766f]">Posted</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="border border-[#d9d8d2] bg-[#fbfbfa] p-5">
              <h3 className="mb-4 text-sm font-black uppercase tracking-[0.14em] text-[#77766f]">
                Owner
              </h3>
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-full bg-[#2f2f2d] text-sm font-black text-white">
                  {project.title.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-black">Project creator</p>
                  <p className="text-xs font-semibold text-[#77766f]">
                    {project.ownerId ? "GroupHub member" : "Unknown"}
                  </p>
                </div>
              </div>
            </div>

            {canApply && project.status === "recruiting" && openRoles.length > 0 && (
              <div className="border border-[#171717] bg-[#2f2f2d] p-5 text-white">
                <h3 className="text-sm font-black uppercase tracking-[0.14em] text-white/65">
                  Interested?
                </h3>
                <p className="mt-3 text-lg font-black">
                  {openRoles.length} open role{openRoles.length > 1 ? "s" : ""} available.
                </p>
                <p className="mt-2 text-sm font-semibold text-white/70">
                  Review the roles above and apply to the one that fits.
                </p>
              </div>
            )}
          </aside>
        </div>
      </section>

      {applyingRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#171717]/70 p-4">
          <div className="w-full max-w-lg border border-[#171717] bg-[#fbfbfa] p-6">
            <h2 className="text-2xl font-black">Apply to {applyingRole.title}</h2>
            <p className="mt-2 font-semibold text-[#55544f]">
              Tell the project owner why you are a good fit.
            </p>
            {applyError && (
              <p className="mt-4 border border-[#171717] bg-white p-3 text-sm font-bold">{applyError}</p>
            )}
            <form className="mt-6 space-y-4" onSubmit={handleApply}>
              <textarea
                className="min-h-32 w-full border border-[#d9d8d2] bg-white p-3 font-semibold outline-none focus:border-[#171717]"
                placeholder="What experience, skills, or interest makes you a good match for this role?"
                value={applyMessage}
                onChange={(e) => setApplyMessage(e.target.value)}
                required
              />
              <input
                type="number"
                min="0"
                max="80"
                className="h-11 w-full border border-[#d9d8d2] bg-white px-3 font-semibold outline-none focus:border-[#171717]"
                placeholder="Availability (hours per week)"
                value={applyHours}
                onChange={(e) => setApplyHours(e.target.value)}
              />
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  className="h-11 flex-1 border border-[#171717] font-black"
                  onClick={() => setApplyingRole(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-11 flex-1 bg-[#171717] font-black text-white disabled:opacity-60"
                  disabled={applying || !applyMessage.trim()}
                >
                  {applying ? "Submitting..." : "Submit Application"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
