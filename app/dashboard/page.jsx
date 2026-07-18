"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowUpRight,
  Bell,
  CheckCircle2,
  MessageSquare,
  Plus,
  Settings,
  Users,
  X,
} from "lucide-react"
import { apiFetch, getAccessToken } from "@/lib/api"

const statusClass = {
  active: "bg-[#171717] text-white",
  recruiting: "bg-white text-[#171717] border border-[#171717]",
  pending: "bg-[#efeee8] text-[#55544f]",
  accepted: "bg-[#171717] text-white",
  rejected: "bg-white text-[#77766f] border border-[#d9d8d2]",
  withdrawn: "bg-white text-[#77766f] border border-[#d9d8d2]",
}

function titleCase(value) {
  return value
    ? value.replace(/\b\w/g, (letter) => letter.toUpperCase())
    : "Pending"
}

function formatDate(value) {
  if (!value) return "recently"
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
  }).format(new Date(value))
}

function PillInput({ values, onChange, placeholder, suggestions }) {
  const [input, setInput] = useState("")
  const [showSuggestions, setShowSuggestions] = useState(false)
  const inputRef = useRef(null)
  const wrapperRef = useRef(null)

  const filtered = suggestions
    ? suggestions.filter(
        (s) =>
          !values.some((v) => v.toLowerCase() === s.toLowerCase()) &&
          s.toLowerCase().includes(input.toLowerCase())
      )
    : []

  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  function addItems(raw) {
    const items = raw
      .split(/[,;]/)
      .map((s) => s.trim())
      .filter(Boolean)
    if (!items.length) return
    const existing = new Set(values.map((v) => v.toLowerCase()))
    const newItems = items.filter((item) => !existing.has(item.toLowerCase()))
    if (!newItems.length) return
    onChange([...values, ...newItems])
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault()
      if (input) addItems(input)
      setInput("")
      setShowSuggestions(false)
    }
    if (e.key === "Backspace" && !input && values.length) {
      onChange(values.slice(0, -1))
    }
  }

  function selectSuggestion(suggestion) {
    onChange([...values, suggestion])
    setInput("")
    setShowSuggestions(false)
    inputRef.current?.focus()
  }

  function remove(index) {
    onChange(values.filter((_, i) => i !== index))
  }

  return (
    <div ref={wrapperRef} className="relative">
      <div
        className="flex min-h-11 flex-wrap items-center gap-1.5 border border-[#d9d8d2] bg-white px-3 py-1.5 focus-within:border-[#171717] cursor-text"
        onClick={() => inputRef.current?.focus()}
      >
        {values.map((value, index) => (
          <span key={index} className="flex items-center gap-1 border border-[#171717] bg-white px-2 py-0.5 text-sm font-black">
            {value}
            <button type="button" onClick={() => remove(index)} className="hover:text-[#77766f]">
              <X className="size-3" />
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => {
            setInput(e.target.value)
            setShowSuggestions(true)
          }}
          onFocus={() => setShowSuggestions(true)}
          onKeyDown={handleKeyDown}
          onPaste={(e) => {
            e.preventDefault()
            const text = e.clipboardData.getData("text")
            addItems(text)
          }}
          className="min-w-[120px] flex-1 border-0 bg-transparent px-0 py-1 font-semibold outline-none text-sm"
          placeholder={values.length ? "" : placeholder}
        />
      </div>
      {showSuggestions && filtered.length > 0 && (
        <div className="absolute left-0 right-0 top-full z-10 mt-1 max-h-48 overflow-y-auto border border-[#d9d8d2] bg-white shadow-lg">
          {filtered.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => selectSuggestion(s)}
              className="w-full px-3 py-2 text-left text-sm font-semibold hover:bg-[#efeee8]"
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default function DashboardPage() {
  const [showNewProject, setShowNewProject] = useState(false)
  const [dashboard, setDashboard] = useState(null)
  const [applications, setApplications] = useState([])
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)

  const [rolePills, setRolePills] = useState([])
  const [skillPills, setSkillPills] = useState([])
  const [categories, setCategories] = useState([])
  const [availableRoles, setAvailableRoles] = useState([])

  const router = useRouter()

  async function loadMetadata() {
    try {
      const payload = await apiFetch("/api/v1/metadata")
      setCategories(payload.data.categories || [])
      setAvailableRoles(payload.data.roles || [])
    } catch {
      // fallback to defaults
    }
  }

  async function loadDashboard() {
    setLoading(true)
    setError("")

    try {
      const [dashboardPayload, applicationsPayload] = await Promise.all([
        apiFetch("/api/v1/dashboard"),
        apiFetch("/api/v1/applications/me"),
      ])

      setDashboard(dashboardPayload.data.dashboard)
      setApplications(applicationsPayload.data.applications || [])
    } catch (requestError) {
      setError(requestError.message)

      if (requestError.status === 401) {
        router.push("/account")
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!getAccessToken()) {
      router.push("/account")
      return
    }

    loadMetadata()
    loadDashboard()
  }, [])

  const handleCreateProject = async (event) => {
    event.preventDefault()
    setCreating(true)
    setError("")

    const formData = new FormData(event.currentTarget)
    const commitmentHoursPerWeek = Number(formData.get("commitmentHoursPerWeek") || 0)
    const nextMilestone = String(formData.get("nextMilestone") || "").trim()

    if (!rolePills.length) {
      setError("Add at least one open role.")
      setCreating(false)
      return
    }

    try {
      await apiFetch("/api/v1/projects", {
        method: "POST",
        body: JSON.stringify({
          title: String(formData.get("title") || "").trim(),
          description: String(formData.get("description") || "").trim(),
          category: String(formData.get("category") || "").trim(),
          stage: "idea",
          commitmentHoursPerWeek,
          commitmentLabel: `${commitmentHoursPerWeek} hrs/week`,
          skills: skillPills.length ? skillPills : rolePills,
          teamSizeTarget: rolePills.length + 1,
          ...(nextMilestone ? { nextMilestone } : {}),
          roles: rolePills.map((role) => ({
            title: role,
            requiredSkills: [role],
            slotsTotal: 1,
            workloadHoursPerWeek: commitmentHoursPerWeek,
          })),
        }),
      })

      setShowNewProject(false)
      setRolePills([])
      setSkillPills([])
      event.currentTarget.reset()
      await loadDashboard()
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setCreating(false)
    }
  }

  const handleReviewApplication = async (appId, status) => {
    setError("")
    try {
      await apiFetch(`/api/v1/applications/${appId}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      })
      await loadDashboard()
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  const stats = [
    { label: "Active projects", value: dashboard?.stats?.activeProjects || 0 },
    { label: "Open roles", value: dashboard?.stats?.openRoles || 0 },
    { label: "Incoming", value: dashboard?.stats?.incomingApplications || 0 },
    { label: "Memberships", value: dashboard?.stats?.memberships || 0 },
  ]

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
            {error && !showNewProject && (
              <p className="mt-5 border border-[#171717] bg-white p-3 text-sm font-bold">
                {error}
              </p>
            )}
          </div>
          <div className="flex flex-wrap gap-3">
            <button className="flex size-11 items-center justify-center border border-[#d9d8d2] bg-white">
              <Bell className="size-5" />
            </button>
            <button className="flex size-11 items-center justify-center border border-[#d9d8d2] bg-white">
              <Settings className="size-5" />
            </button>
            <button
              onClick={() => {
                setError("")
                setRolePills([])
                setSkillPills([])
                setShowNewProject(true)
              }}
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
              <p className="mt-3 text-4xl font-black">{loading ? "--" : stat.value}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="px-6 pb-20 sm:px-10 lg:px-20 xl:px-28">
        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
          <div className="space-y-8">
            <div>
              <div className="mb-4 flex items-center justify-between border-b border-[#d9d8d2] pb-4">
                <h2 className="text-xl font-black">My Projects</h2>
                <Link href="/find-projects" className="text-sm font-black underline underline-offset-4">
                  Browse roles
                </Link>
              </div>
              <div className="grid gap-4">
                {(dashboard?.ownedProjects || []).map((project) => (
                  <Link key={project.id} href={`/projects/${project.id}/manage`} className="block border border-[#d9d8d2] bg-[#fbfbfa] p-5 transition hover:border-[#171717]">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`px-2.5 py-1 text-xs font-black ${statusClass[project.status] || statusClass.recruiting}`}>
                          {titleCase(project.status)}
                        </span>
                      </div>
                      <h3 className="mt-3 text-2xl font-black">{project.title}</h3>
                      <p className="mt-2 text-sm font-semibold text-[#55544f]">
                        Next: {project.nextMilestone || "Define the next milestone"}
                      </p>
                    </div>
                    <div className="mt-5">
                      <div className="mb-2 flex justify-between text-xs font-black uppercase tracking-[0.12em] text-[#77766f]">
                        <span>Progress</span>
                        <span>{project.progressPercent}%</span>
                      </div>
                      <div className="h-2 bg-[#e5e3dc]">
                        <div className="h-full bg-[#171717]" style={{ width: `${project.progressPercent}%` }} />
                      </div>
                    </div>
                  </Link>
                ))}
                {!loading && (dashboard?.ownedProjects || []).length === 0 && (
                  <div className="border border-[#d9d8d2] bg-[#fbfbfa] p-5">
                    <h3 className="text-xl font-black">No projects yet.</h3>
                    <p className="mt-2 font-semibold text-[#55544f]">
                      Create your first project to start recruiting roles.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {(dashboard?.memberships || []).length > 0 && (
              <div>
                <div className="mb-4 border-b border-[#d9d8d2] pb-4">
                  <h2 className="text-xl font-black">Joined</h2>
                </div>
                <div className="grid gap-4">
                  {(dashboard?.memberships || []).map((membership) => (
                    <Link key={membership.id} href={`/projects/${membership.projectId}/member`} className="block border border-[#d9d8d2] bg-[#fbfbfa] p-5 transition hover:border-[#171717]">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={`px-2.5 py-1 text-xs font-black ${statusClass[membership.project?.status] || statusClass.recruiting}`}>
                              {titleCase(membership.project?.status || "active")}
                            </span>
                            <span className="border border-[#d9d8d2] bg-white px-2.5 py-1 text-xs font-black text-[#55544f]">
                              {membership.roleTitle}
                            </span>
                          </div>
                          <h3 className="mt-3 text-2xl font-black">{membership.project?.title}</h3>
                          {membership.project?.nextMilestone && (
                            <p className="mt-2 text-sm font-semibold text-[#55544f]">
                              Next: {membership.project.nextMilestone}
                            </p>
                          )}
                        </div>
                      </div>
                      {membership.project?.progressPercent > 0 && (
                        <div className="mt-5">
                          <div className="mb-2 flex justify-between text-xs font-black uppercase tracking-[0.12em] text-[#77766f]">
                            <span>Progress</span>
                            <span>{membership.project.progressPercent}%</span>
                          </div>
                          <div className="h-2 bg-[#e5e3dc]">
                            <div className="h-full bg-[#171717]" style={{ width: `${membership.project.progressPercent}%` }} />
                          </div>
                        </div>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {(dashboard?.incomingApplications || []).length > 0 && (
              <div>
                <div className="mb-4 flex items-center justify-between border-b border-[#d9d8d2] pb-4">
                  <h2 className="text-xl font-black">Incoming Applications</h2>
                  <span className="text-sm font-black uppercase tracking-[0.12em] text-[#77766f]">
                    {(dashboard?.incomingApplications || []).filter((a) => a.status === "pending").length} pending
                  </span>
                </div>
                <div className="grid gap-3">
                  {(dashboard?.incomingApplications || []).map((app) => (
                    <div key={app.id} className="border border-[#d9d8d2] bg-[#fbfbfa] p-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex items-start gap-3">
                          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#2f2f2d] text-sm font-black text-white">
                            {app.applicant?.fullName?.split(" ").map((n) => n[0]).join("").slice(0, 2) || "?"}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-black">{app.applicant?.fullName || "Unknown"}</h3>
                              <span className={`px-2 py-0.5 text-xs font-black ${statusClass[app.status] || statusClass.pending}`}>
                                {titleCase(app.status)}
                              </span>
                            </div>
                            <p className="text-sm font-semibold text-[#77766f]">
                              Applied to <span className="text-[#171717]">{app.role?.title}</span> on {app.project?.title}
                            </p>
                            <p className="mt-2 text-sm font-semibold">{app.message}</p>
                            {app.applicant?.skills?.length > 0 && (
                              <div className="mt-2 flex flex-wrap gap-1.5">
                                {app.applicant.skills.map((skill) => (
                                  <span key={skill} className="border border-[#d9d8d2] px-2 py-0.5 text-xs font-bold text-[#55544f]">{skill}</span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                        {app.status === "pending" && (
                          <div className="flex gap-2 sm:flex-col">
                            <button
                              onClick={() => handleReviewApplication(app.id, "accepted")}
                              className="h-9 px-4 bg-[#171717] text-white text-xs font-black hover:bg-[#2f2f2d]"
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => handleReviewApplication(app.id, "rejected")}
                              className="h-9 px-4 border border-[#171717] text-xs font-black hover:bg-[#efeee8]"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <div className="mb-4 border-b border-[#d9d8d2] pb-4">
                <h2 className="text-xl font-black">My Applications</h2>
              </div>
              <div className="grid gap-3">
                {applications.map((app) => (
                  <div key={app.id} className="flex flex-col gap-3 border border-[#d9d8d2] bg-[#fbfbfa] p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="font-black">{app.project?.title || "Project application"}</h3>
                      <p className="mt-1 text-sm font-semibold text-[#77766f]">
                        Applied {formatDate(app.createdAt)}
                      </p>
                    </div>
                    <span className={`w-fit px-2.5 py-1 text-xs font-black ${statusClass[app.status] || statusClass.pending}`}>
                      {titleCase(app.status)}
                    </span>
                  </div>
                ))}
                {!loading && applications.length === 0 && (
                  <div className="border border-[#d9d8d2] bg-[#fbfbfa] p-4">
                    <p className="font-semibold text-[#55544f]">No applications yet.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <aside className="space-y-6">
            <div className="border border-[#d9d8d2] bg-[#fbfbfa] p-5">
              <h2 className="text-xl font-black">Today&apos;s Activity</h2>
              <div className="mt-5 grid gap-4">
                {(dashboard?.activity || []).map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <div className="flex size-9 shrink-0 items-center justify-center bg-[#2f2f2d] text-white">
                      <MessageSquare className="size-4" />
                    </div>
                    <div>
                      <p className="text-sm font-bold leading-snug">{titleCase(item.type.replaceAll("_", " "))}</p>
                      <p className="mt-1 text-xs font-semibold text-[#77766f]">{formatDate(item.createdAt)}</p>
                    </div>
                  </div>
                ))}
                {!loading && (dashboard?.activity || []).length === 0 && (
                  <p className="text-sm font-semibold text-[#55544f]">
                    Project updates will appear here.
                  </p>
                )}
              </div>
            </div>

            <div className="border border-[#171717] bg-[#2f2f2d] p-5 text-white">
              <p className="text-sm font-black uppercase tracking-[0.14em] text-white/65">
                Recommended
              </p>
              <h2 className="mt-3 text-2xl font-black">AI project matching is ready for v2.</h2>
              <Link href="/find-projects" className="mt-6 inline-flex items-center gap-2 text-sm font-black underline underline-offset-4">
                Review projects
                <ArrowUpRight className="size-4" />
              </Link>
            </div>
          </aside>
        </div>
      </section>

      {showNewProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#171717]/70 p-4">
          <div className="w-full max-w-xl border border-[#171717] bg-[#fbfbfa] p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-black">Create New Project</h2>
            <p className="mt-2 font-semibold text-[#55544f]">
              Define the idea, missing roles, and the first milestone.
            </p>
            {error && (
              <p className="mt-4 border border-[#171717] bg-white p-3 text-sm font-bold">{error}</p>
            )}
            <form className="mt-6 space-y-4" onSubmit={handleCreateProject}>
              <div>
                <label className="text-sm font-black">Project title</label>
                <input name="title" className="mt-1 h-11 w-full border border-[#d9d8d2] bg-white px-3 font-semibold outline-none focus:border-[#171717]" placeholder="What is your project called?" required />
              </div>
              <div>
                <label className="text-sm font-black">Category</label>
                <select name="category" className="mt-1 h-11 w-full border border-[#d9d8d2] bg-white px-3 font-semibold outline-none focus:border-[#171717]" required>
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-black">Description</label>
                <textarea name="description" rows={3} className="mt-1 min-h-24 w-full border border-[#d9d8d2] bg-white p-3 font-semibold outline-none focus:border-[#171717]" placeholder="What are you building?" required />
              </div>
              <div>
                <label className="text-sm font-black">Technologies &amp; skills</label>
                <PillInput values={skillPills} onChange={setSkillPills} placeholder="Type a skill and press Enter" />
              </div>
              <div>
                <label className="text-sm font-black">Open roles</label>
                <PillInput values={rolePills} onChange={setRolePills} placeholder="Type to search roles..." suggestions={availableRoles} />
                <p className="mt-1 text-xs font-semibold text-[#77766f]">Each role gets 1 slot. Add multiple if needed.</p>
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="text-sm font-black">Hours / week</label>
                  <input name="commitmentHoursPerWeek" type="number" min="0" max="80" defaultValue={0} className="mt-1 h-11 w-full border border-[#d9d8d2] bg-white px-3 font-semibold outline-none focus:border-[#171717]" />
                </div>
                <div className="flex-1">
                  <label className="text-sm font-black">First milestone</label>
                  <input name="nextMilestone" className="mt-1 h-11 w-full border border-[#d9d8d2] bg-white px-3 font-semibold outline-none focus:border-[#171717]" placeholder="e.g. Design handoff" />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" className="h-11 flex-1 border border-[#171717] font-black" onClick={() => {
                  setShowNewProject(false)
                  setError("")
                }}>
                  Cancel
                </button>
                <button type="submit" className="h-11 flex-1 bg-[#171717] font-black text-white disabled:opacity-60" disabled={creating}>
                  {creating ? "Creating..." : "Create Project"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
