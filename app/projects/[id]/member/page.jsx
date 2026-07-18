"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import {
  Activity,
  ArrowLeft,
  BarChart3,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  List,
  MapPin,
  MessageSquare,
  Rocket,
  Target,
  Users,
  X,
} from "lucide-react"
import { apiFetch, getStoredUser } from "@/lib/api"

function formatStage(stage) {
  return stage
    ? stage.split("-").join(" ").replace(/\b\w/g, (l) => l.toUpperCase())
    : "Idea"
}

function titleCase(value) {
  return value ? String(value).replace(/\b\w/g, (l) => l.toUpperCase()) : ""
}

function formatDate(value) {
  if (!value) return ""
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value))
}

function formatDateRel(value) {
  if (!value) return ""
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(new Date(value))
}

const statusClass = {
  todo: "bg-[#efeee8] text-[#55544f]",
  in_progress: "bg-[#2f2f2d] text-white",
  needs_review: "bg-[#cc8833] text-white",
  done: "bg-[#171717] text-white",
  cancelled: "bg-white text-[#77766f] border border-[#d9d8d2]",
}

const priorityColors = {
  low: "bg-[#e5e3dc] text-[#55544f]",
  medium: "bg-[#2f2f2d] text-white",
  high: "bg-[#171717] text-white",
  urgent: "bg-[#cc3333] text-white",
}

const TABS = [
  { id: "overview", label: "Overview", icon: BarChart3 },
  { id: "mywork", label: "My Work", icon: CheckCircle2 },
  { id: "team", label: "Team", icon: Users },
  { id: "tasks", label: "Tasks", icon: List },
  { id: "chat", label: "Chat", icon: MessageSquare },
  { id: "ai", label: "AI Companion", icon: Rocket },
]

export default function ProjectMemberPage() {
  const { id } = useParams()
  const currentUser = getStoredUser()
  const myUserId = currentUser?.id || ""

  const [activeTab, setActiveTab] = useState("overview")
  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [members, setMembers] = useState([])
  const [tasks, setTasks] = useState([])
  const [activity, setActivity] = useState([])
  const [claiming, setClaiming] = useState(null)
  const [selectedTask, setSelectedTask] = useState(null)
  const [updatingTask, setUpdatingTask] = useState(false)

  const loadProject = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const [projectPayload, membersPayload, tasksPayload, activityPayload] = await Promise.all([
        apiFetch(`/api/v1/projects/${id}`),
        apiFetch(`/api/v1/projects/${id}/members`).catch(() => ({ data: { members: [] } })),
        apiFetch(`/api/v1/tasks/${id}`).catch(() => ({ data: { tasks: [] } })),
        apiFetch(`/api/v1/activity/project/${id}`).catch(() => ({ data: { activity: [] } })),
      ])
      setProject(projectPayload.data.project)
      setMembers(membersPayload.data.members || [])
      setTasks(tasksPayload.data.tasks || [])
      setActivity(activityPayload.data.activity || [])
    } catch (e) {
      setError(e.message)
      if (e.status === 404) setError("Project not found")
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => { loadProject() }, [loadProject])

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
          <Link href="/dashboard" className="mb-8 inline-flex items-center gap-2 text-sm font-black hover:underline">
            <ArrowLeft className="size-4" /> Back to dashboard
          </Link>
          <p className="mt-8 text-xl font-black">{error}</p>
        </section>
      </div>
    )
  }

  if (!project) return null

  const totalSlots = project.roles?.reduce((sum, r) => sum + r.slotsTotal, 0) || 0
  const filledSlots = project.roles?.reduce((sum, r) => sum + r.slotsFilled, 0) || 0

  return (
    <div className="min-h-screen bg-[#f7f7f3] text-[#171717]">
      {/* Header */}
      <section className="border-b border-[#d9d8d2] bg-[#fbfbfa] px-6 py-4 sm:px-10 lg:px-20 xl:px-28">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="flex size-9 items-center justify-center border border-[#d9d8d2] bg-white hover:border-[#171717]">
            <ArrowLeft className="size-4" />
          </Link>
          <div className="flex-1">
            <h1 className="text-xl font-black">{project.title}</h1>
            <p className="text-sm font-semibold text-[#55544f]">
              {project.category} &middot; {formatStage(project.stage)}
            </p>
          </div>
          <Link
            href={`/projects/${id}`}
            className="inline-flex h-9 items-center gap-2 border border-[#d9d8d2] bg-white px-4 text-sm font-black hover:border-[#171717]"
          >
            <ExternalLink className="size-4" /> Public View
          </Link>
        </div>
      </section>

      {/* Tabs */}
      <section className="border-b border-[#d9d8d2] bg-white px-6 sm:px-10 lg:px-20 xl:px-28">
        <div className="flex gap-0 -mb-px overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex items-center gap-2 px-4 py-3 text-sm font-black border-b-2 whitespace-nowrap transition ${
                activeTab === tab.id
                  ? "border-[#171717] text-[#171717]"
                  : "border-transparent text-[#77766f] hover:text-[#171717]"
              }`}
            >
              <tab.icon className="size-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </section>

      {/* Content */}
      <section className="px-6 py-8 sm:px-10 lg:px-20 xl:px-28">
        {activeTab === "overview" && (
          <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
            <div className="space-y-8">
              {/* Stats */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  { label: "Team Size", value: members.length, icon: Users },
                  { label: "Tasks", value: tasks.length, icon: List },
                  { label: "Completed", value: tasks.filter((t) => t.status === "done").length, icon: CheckCircle2 },
                  { label: "Team Spots", value: `${filledSlots}/${totalSlots}`, icon: MapPin },
                ].map((s) => (
                  <div key={s.label} className="border border-[#d9d8d2] bg-[#fbfbfa] p-5">
                    <div className="flex items-center gap-2">
                      <s.icon className="size-4 text-[#77766f]" />
                      <p className="text-sm font-black uppercase tracking-[0.14em] text-[#77766f]">{s.label}</p>
                    </div>
                    <p className="mt-3 text-4xl font-black">{s.value}</p>
                  </div>
                ))}
              </div>

              {/* Progress */}
              <div className="border border-[#d9d8d2] bg-[#fbfbfa] p-5">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-black">Progress</h2>
                  <span className="text-sm font-black text-[#77766f]">{project.progressPercent || 0}%</span>
                </div>
                <div className="mt-4 h-3 bg-[#e5e3dc]">
                  <div className="h-full bg-[#171717] transition-all" style={{ width: `${project.progressPercent || 0}%` }} />
                </div>
                {project.nextMilestone && (
                  <p className="mt-4 flex items-center gap-2 text-sm font-bold text-[#55544f]">
                    <Target className="size-4" /> Next: {project.nextMilestone}
                  </p>
                )}
              </div>

              {/* About */}
              <div className="border border-[#d9d8d2] bg-[#fbfbfa] p-5">
                <h2 className="text-xl font-black">About</h2>
                <p className="mt-3 font-semibold leading-relaxed text-[#55544f]">{project.description}</p>
              </div>

              {/* Activity */}
              <div className="border border-[#d9d8d2] bg-[#fbfbfa] p-5">
                <h2 className="text-xl font-black">Recent Activity</h2>
                <div className="mt-5 grid gap-4">
                  {(activity || []).slice(0, 10).map((item) => (
                    <div key={item._id || item.id} className="flex gap-3">
                      <div className="flex size-9 shrink-0 items-center justify-center bg-[#2f2f2d] text-white">
                        <Activity className="size-4" />
                      </div>
                      <div>
                        <p className="text-sm font-bold leading-snug">{titleCase(item.type?.replace(/_/g, " ") || "")}</p>
                        <p className="mt-1 text-xs font-semibold text-[#77766f]">{formatDateRel(item.createdAt)}</p>
                      </div>
                    </div>
                  ))}
                  {(!activity || activity.length === 0) && (
                    <p className="text-sm font-semibold text-[#55544f]">No activity yet.</p>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
              <div className="border border-[#d9d8d2] bg-[#fbfbfa] p-5">
                <h3 className="mb-4 text-sm font-black uppercase tracking-[0.14em] text-[#77766f]">Details</h3>
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
                      <p className="text-xs font-semibold text-[#77766f]">Created</p>
                    </div>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        )}

        {activeTab === "mywork" && (
          <div>
            <h2 className="text-2xl font-black mb-6">My Work</h2>
            {(() => {
              const myTasks = tasks.filter((t) => t.assignee?.id === myUserId)
              return myTasks.length === 0 ? (
                <div className="border border-[#d9d8d2] bg-[#fbfbfa] p-8 text-center">
                  <CheckCircle2 className="mx-auto size-10 text-[#77766f]" />
                  <p className="mt-4 text-xl font-black">No tasks assigned to you</p>
                  <p className="mt-2 font-semibold text-[#55544f]">Tasks assigned or claimed by you will appear here.</p>
                </div>
              ) : (
                <div className="grid gap-3">
                  {myTasks.map((task) => (
                    <button
                      key={task.id}
                      onClick={() => setSelectedTask(task)}
                      className="w-full border border-[#d9d8d2] bg-[#fbfbfa] p-4 text-left transition hover:border-[#171717]"
                    >
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-3 min-w-0">
                          <span className={`size-2 shrink-0 rounded-full ${
                            task.status === "todo" ? "bg-[#55544f]" :
                            task.status === "in_progress" ? "bg-[#2f2f2d]" :
                            task.status === "needs_review" ? "bg-[#cc8833]" :
                            task.status === "done" ? "bg-[#171717]" : "bg-[#d9d8d2]"
                          }`} />
                          <div className="min-w-0">
                            <h3 className="font-black truncate">{task.title}</h3>
                            <p className="text-xs font-semibold text-[#77766f]">
                              {task.assignmentType === "open" ? "Claimed by you" : "Assigned to you"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0 flex-wrap">
                          <span className={`px-2 py-0.5 text-xs font-black ${priorityColors[task.priority]}`}>
                            {titleCase(task.priority)}
                          </span>
                          <span className={`px-2 py-0.5 text-xs font-black ${statusClass[task.status]}`}>
                            {task.status === "in_progress" ? "In Progress" : task.status === "needs_review" ? "Needs Review" : titleCase(task.status)}
                          </span>
                          {task.dueDate && <span className="text-xs font-semibold text-[#77766f]">{formatDateRel(task.dueDate)}</span>}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )
            })()}
          </div>
        )}

        {activeTab === "team" && (
          <div>
            <h2 className="text-2xl font-black mb-6">Team ({members.length})</h2>
            {members.length === 0 ? (
              <div className="border border-[#d9d8d2] bg-[#fbfbfa] p-8 text-center">
                <Users className="mx-auto size-10 text-[#77766f]" />
                <p className="mt-4 text-xl font-black">No team members yet</p>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {members.map((m) => (
                  <div key={m.id} className="border border-[#d9d8d2] bg-[#fbfbfa] p-5">
                    <div className="flex items-center gap-3">
                      <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-[#2f2f2d] text-base font-black text-white">
                        {m.user?.fullName?.split(" ").map((n) => n[0]).join("").slice(0, 2) || "?"}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-black truncate">{m.user?.fullName || "Unknown"}</h3>
                        <p className="text-sm font-semibold text-[#55544f]">{m.roleTitle || "Member"}</p>
                        {m.joinedAt && <p className="text-xs font-semibold text-[#77766f]">Joined {formatDateRel(m.joinedAt)}</p>}
                      </div>
                    </div>
                    {m.user?.skills?.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-1.5">
                        {m.user.skills.map((skill) => (
                          <span key={skill} className="border border-[#d9d8d2] px-2 py-0.5 text-xs font-bold text-[#55544f]">{skill}</span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "tasks" && (
          <div>
            <h2 className="text-2xl font-black mb-6">Tasks ({tasks.length})</h2>
            {tasks.length === 0 ? (
              <div className="border border-[#d9d8d2] bg-[#fbfbfa] p-8 text-center">
                <List className="mx-auto size-10 text-[#77766f]" />
                <p className="mt-4 text-xl font-black">No tasks yet</p>
                <p className="mt-2 font-semibold text-[#55544f]">Tasks will appear here once the project owner creates them.</p>
              </div>
            ) : (
              <div className="grid gap-3">
                {tasks.map((task) => {
                  const canClaim = task.assignmentType === "open" && !task.assignee
                  return (
                    <button
                      key={task.id}
                      onClick={() => setSelectedTask(task)}
                      className="w-full border border-[#d9d8d2] bg-[#fbfbfa] p-4 text-left transition hover:border-[#171717]"
                    >
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-3 min-w-0">
                          <span className={`size-2 shrink-0 rounded-full ${
                            task.status === "todo" ? "bg-[#55544f]" :
                            task.status === "in_progress" ? "bg-[#2f2f2d]" :
                            task.status === "needs_review" ? "bg-[#cc8833]" :
                            task.status === "done" ? "bg-[#171717]" : "bg-[#d9d8d2]"
                          }`} />
                          <div className="min-w-0">
                            <h3 className="font-black truncate">{task.title}</h3>
                            <p className="text-xs font-semibold text-[#77766f]">
                              {task.assignmentType === "open"
                                ? task.assignee ? `Claimed by ${task.assignee.fullName}` : "Open for anyone"
                                : task.assignee?.fullName
                                  ? `Assigned to ${task.assignee.fullName}`
                                  : "Unassigned"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0 flex-wrap">
                          {task.assignmentType === "open" && (
                            <span className="px-2 py-0.5 text-xs font-black border border-[#171717] text-[#171717] bg-white">
                              Open
                            </span>
                          )}
                          <span className={`px-2 py-0.5 text-xs font-black ${priorityColors[task.priority]}`}>
                            {titleCase(task.priority)}
                          </span>
                          <span className={`px-2 py-0.5 text-xs font-black ${statusClass[task.status]}`}>
                            {task.status === "in_progress" ? "In Progress" : task.status === "needs_review" ? "Needs Review" : titleCase(task.status)}
                          </span>
                          {task.dueDate && <span className="text-xs font-semibold text-[#77766f]">{formatDateRel(task.dueDate)}</span>}
                          {canClaim && (
                            <span
                              onClick={async (e) => {
                                e.stopPropagation()
                                setClaiming(task.id)
                                try {
                                  await apiFetch(`/api/v1/tasks/${task.id}/claim`, { method: "POST" })
                                  const refreshed = await apiFetch(`/api/v1/tasks/${id}`)
                                  setTasks(refreshed.data.tasks || [])
                                } catch {} finally { setClaiming(null) }
                              }}
                              className="h-8 px-3 bg-[#171717] text-white text-xs font-black inline-flex items-center hover:bg-[#2f2f2d] disabled:opacity-60 cursor-pointer"
                            >
                              {claiming === task.id ? "Claiming..." : "Claim"}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === "chat" && (
          <PlaceholderTab icon={MessageSquare} title="Chat" message="Team chat coming soon. Members will be able to discuss project updates in real-time." />
        )}

        {activeTab === "ai" && (
          <PlaceholderTab icon={Rocket} title="AI Companion" message="AI assistance is on the roadmap. Future features include task suggestions, code review, and automated status updates." />
        )}
      </section>

      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          myUserId={myUserId}
          onClose={() => setSelectedTask(null)}
          onUpdate={(updated) => {
            setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)))
            setSelectedTask(updated)
          }}
          onRefreshTasks={async () => {
            const refreshed = await apiFetch(`/api/v1/tasks/${id}`)
            setTasks(refreshed.data.tasks || [])
          }}
        />
      )}
    </div>
  )
}

function TaskDetailModal({ task, myUserId, onClose, onUpdate, onRefreshTasks }) {
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState("")

  const isMyTask = task.assignee?.id === myUserId
  const isDone = task.status === "done"

  const handleMarkDone = async () => {
    setSubmitting(true)
    setError("")
    try {
      const payload = await apiFetch(`/api/v1/tasks/${task.id}`, {
        method: "PATCH",
        body: JSON.stringify({ status: "needs_review" }),
      })
      onUpdate(payload.data.task)
      setSubmitted(true)
    } catch (e) {
      setError(e.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (!task) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#171717]/70 p-4">
      <div className="w-full max-w-xl border border-[#171717] bg-[#fbfbfa] p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black">{task.title}</h2>
          <button onClick={onClose} className="p-1 hover:text-[#77766f]">
            <X className="size-5" />
          </button>
        </div>

        {error && (
          <p className="mt-4 border border-[#171717] bg-white p-3 text-sm font-bold">{error}</p>
        )}

        {/* Status & Priority badges */}
        <div className="mt-6 flex flex-wrap gap-2">
          <span className={`px-2.5 py-1 text-xs font-black ${statusClass[task.status] || statusClass.todo}`}>
            {task.status === "in_progress" ? "In Progress" : task.status === "needs_review" ? "Needs Review" : titleCase(task.status)}
          </span>
          <span className={`px-2.5 py-1 text-xs font-black ${priorityColors[task.priority] || priorityColors.medium}`}>
            {titleCase(task.priority)}
          </span>
          {task.assignmentType === "open" && (
            <span className="px-2.5 py-1 text-xs font-black border border-[#171717] text-[#171717] bg-white">
              Open Task
            </span>
          )}
        </div>

        {/* Description */}
        {task.description && (
          <div className="mt-5">
            <p className="text-sm font-black text-[#77766f] uppercase tracking-[0.12em]">Description</p>
            <p className="mt-2 font-semibold leading-relaxed text-[#55544f]">{task.description}</p>
          </div>
        )}

        {/* Details */}
        <div className="mt-5 grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-black text-[#77766f] uppercase tracking-[0.12em]">Assigned to</p>
            <p className="mt-2 font-black">{task.assignee?.fullName || "Unassigned"}</p>
          </div>
          <div>
            <p className="text-sm font-black text-[#77766f] uppercase tracking-[0.12em]">Due Date</p>
            <p className="mt-2 font-black">{task.dueDate ? formatDate(task.dueDate) : "No deadline"}</p>
          </div>
          <div>
            <p className="text-sm font-black text-[#77766f] uppercase tracking-[0.12em]">Created</p>
            <p className="mt-2 font-black">{formatDate(task.createdAt)}</p>
          </div>
          <div>
            <p className="text-sm font-black text-[#77766f] uppercase tracking-[0.12em]">Created by</p>
            <p className="mt-2 font-black">{task.createdBy || "Project owner"}</p>
          </div>
        </div>

        {/* Submitted message */}
        {submitted && (
          <div className="mt-6 border border-[#171717] bg-[#171717] p-4 text-white">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="size-5" />
              <p className="text-sm font-black">Task submitted for review</p>
            </div>
            <p className="mt-2 text-sm font-semibold text-white/75">
              The project owner will review your work and mark it as complete.
            </p>
          </div>
        )}

        {/* Actions */}
        {!submitted && (
          <div className="mt-6 flex gap-3 pt-4 border-t border-[#d9d8d2]">
            {isMyTask && !isDone && (
              <button
                onClick={handleMarkDone}
                disabled={submitting}
                className="h-11 flex-1 bg-[#171717] font-black text-sm flex items-center justify-center gap-2 text-white"
              >
                <CheckCircle2 className="size-4" />
                {submitting ? "Submitting..." : "Mark as Done"}
              </button>
            )}
            <button
              onClick={() => {
                alert("Need help feature coming soon. The project owner will be notified.")
              }}
              className="h-11 flex-1 border border-[#d9d8d2] font-black text-sm flex items-center justify-center gap-2 hover:border-[#171717]"
            >
              <MessageSquare className="size-4" />
              Need Help
            </button>
            <button
              onClick={onClose}
              className="h-11 flex-1 border border-[#171717] font-black text-sm"
            >
              Close
            </button>
          </div>
        )}

        {submitted && (
          <div className="mt-4 flex justify-center">
            <button onClick={onClose} className="h-11 px-8 border border-[#171717] font-black text-sm">
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function PlaceholderTab({ icon: Icon, title, message }) {
  return (
    <div className="border border-[#d9d8d2] bg-[#fbfbfa] p-12 text-center">
      <Icon className="mx-auto size-12 text-[#77766f]" />
      <h2 className="mt-6 text-2xl font-black">{title}</h2>
      <p className="mx-auto mt-4 max-w-lg font-semibold text-[#55544f]">{message}</p>
    </div>
  )
}
