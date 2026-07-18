"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import {
  Activity,
  ArrowLeft,
  ArrowUpRight,
  BarChart3,
  Bell,
  BookOpen,
  Briefcase,
  Calendar,
  CheckCircle2,
  ChevronDown,
  CircleDot,
  Clock,
  Edit3,
  ExternalLink,
  FileText,
  Flag,
  List,
  Loader2,
  LogOut,
  MapPin,
  MessageSquare,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Rocket,
  Search,
  Settings,
  Target,
  Trash2,
  Trophy,
  UserPlus,
  Users,
  X,
} from "lucide-react"
import { apiFetch } from "@/lib/api"

// ─── helpers ───────────────────────────────────────────────────────────────

const statusClass = {
  active: "bg-[#171717] text-white",
  recruiting: "bg-white text-[#171717] border border-[#171717]",
  pending: "bg-[#efeee8] text-[#55544f]",
  accepted: "bg-[#171717] text-white",
  rejected: "bg-white text-[#77766f] border border-[#d9d8d2]",
  withdrawn: "bg-white text-[#77766f] border border-[#d9d8d2]",
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

function titleCase(value) {
  return value ? String(value).replace(/\b\w/g, (l) => l.toUpperCase()) : ""
}

function formatDate(value) {
  if (!value) return ""
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value))
}

function formatDateRel(value) {
  if (!value) return ""
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(new Date(value))
}

function classNames(...args) {
  return args.filter(Boolean).join(" ")
}

// ─── PillInput (reused from dashboard) ─────────────────────────────────────

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
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setShowSuggestions(false)
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  function addItems(raw) {
    const items = raw.split(/[,;]/).map((s) => s.trim()).filter(Boolean)
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
    if (e.key === "Backspace" && !input && values.length) onChange(values.slice(0, -1))
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
          onChange={(e) => { setInput(e.target.value); setShowSuggestions(true) }}
          onFocus={() => setShowSuggestions(true)}
          onKeyDown={handleKeyDown}
          onPaste={(e) => { e.preventDefault(); addItems(e.clipboardData.getData("text")) }}
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

// ─── Quick Status Dropdown ─────────────────────────────────────────────────

const STATUS_OPTIONS = [
  { value: "todo", label: "To Do" },
  { value: "in_progress", label: "In Progress" },
  { value: "needs_review", label: "Needs Review" },
  { value: "done", label: "Done" },
  { value: "cancelled", label: "Cancelled" },
]

function QuickStatusDropdown({ task, onUpdate }) {
  const [saving, setSaving] = useState(false)

  const handleChange = async (e) => {
    const newStatus = e.target.value
    if (newStatus === task.status) return
    setSaving(true)
    try {
      const payload = await apiFetch(`/api/v1/tasks/${task.id}`, {
        method: "PATCH",
        body: JSON.stringify({ status: newStatus }),
      })
      onUpdate(payload.data.task)
    } catch {
      // ignore
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="relative">
      <select
        value={task.status}
        onChange={handleChange}
        disabled={saving}
        className={classNames(
          "appearance-none px-2.5 py-1 pr-7 text-xs font-black outline-none cursor-pointer",
          statusClass[task.status] || statusClass.todo
        )}
        style={{ backgroundImage: "none" }}
      >
        {STATUS_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-white text-[#171717]">
            {opt.label}
          </option>
        ))}
      </select>
      {saving && (
        <span className="absolute right-1.5 top-1/2 -translate-y-1/2">
          <Loader2 className="size-3 animate-spin" />
        </span>
      )}
    </div>
  )
}

// ─── Review Actions ────────────────────────────────────────────────────────

function ReviewActions({ taskId, onUpdate, onChildCreated }) {
  const [feedback, setFeedback] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  const handleApprove = async () => {
    setSubmitting(true)
    setError("")
    try {
      const payload = await apiFetch(`/api/v1/tasks/${taskId}`, {
        method: "PATCH",
        body: JSON.stringify({ status: "done", reviewNote: "" }),
      })
      onUpdate(payload.data.task)
    } catch (e) {
      setError(e.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleRequestChanges = async () => {
    if (!feedback.trim()) return
    setSubmitting(true)
    setError("")
    try {
      const payload = await apiFetch(`/api/v1/tasks/${taskId}/feedback`, {
        method: "POST",
        body: JSON.stringify({ feedback: feedback.trim() }),
      })
      const { parent, child } = payload.data
      onUpdate(parent)
      if (onChildCreated) onChildCreated(child)
      setFeedback("")
    } catch (e) {
      setError(e.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-3 pt-4 border-t border-[#d9d8d2]">
      <p className="text-sm font-black text-[#77766f] uppercase tracking-[0.12em]">Review Task</p>
      {error && (
        <p className="border border-[#171717] bg-white p-3 text-sm font-bold">{error}</p>
      )}
      <div className="flex gap-3">
        <button
          onClick={handleApprove}
          disabled={submitting}
          className="h-10 flex-1 bg-[#171717] font-black text-sm text-white disabled:opacity-60"
        >
          {submitting ? "Approving..." : "Approve"}
        </button>
        <button
          onClick={() => document.getElementById("review-feedback-area")?.focus()}
          disabled={submitting}
          className="h-10 flex-1 border border-[#171717] font-black text-sm"
        >
          Request Changes
        </button>
      </div>
      <textarea
        id="review-feedback-area"
        value={feedback}
        onChange={(e) => setFeedback(e.target.value)}
        placeholder="Describe what needs to change..."
        rows={3}
        className="min-h-20 w-full border border-[#d9d8d2] bg-white p-3 font-semibold outline-none focus:border-[#171717]"
      />
      {feedback.trim() && (
        <button
          onClick={handleRequestChanges}
          disabled={submitting}
          className="h-10 w-full border border-[#cc8833] bg-[#cc8833] font-black text-sm text-white disabled:opacity-60"
        >
          {submitting ? "Sending..." : "Send Feedback & Set Back to To Do"}
        </button>
      )}
    </div>
  )
}

// ─── Task Detail Modal ─────────────────────────────────────────────────────

function TaskDetailModal({ task, projectMembers, onClose, onUpdate, onDelete, onChildCreated }) {
  const [editMode, setEditMode] = useState(false)
  const [form, setForm] = useState({ title: "", description: "", status: "", priority: "", assigneeId: "", dueDate: "", assignmentType: "assigned" })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [subtasks, setSubtasks] = useState([])
  const [loadingSubtasks, setLoadingSubtasks] = useState(false)

  useEffect(() => {
    if (task?.id) {
      setLoadingSubtasks(true)
      apiFetch(`/api/v1/tasks/${task.id}/subtasks`)
        .then((res) => setSubtasks(res.data.subtasks || []))
        .catch(() => setSubtasks([]))
        .finally(() => setLoadingSubtasks(false))
    }
  }, [task?.id])

  useEffect(() => {
    if (task) {
      setForm({
        title: task.title,
        description: task.description || "",
        status: task.status,
        priority: task.priority,
        assigneeId: task.assignee?.id || "",
        dueDate: task.dueDate ? task.dueDate.slice(0, 10) : "",
        assignmentType: task.assignmentType || "assigned",
      })
    }
  }, [task])

  if (!task) return null

  const handleSave = async () => {
    setSaving(true)
    setError("")
    try {
      const payload = await apiFetch(`/api/v1/tasks/${task.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          title: form.title.trim(),
          description: form.description.trim(),
          status: form.status,
          priority: form.priority,
          assignmentType: form.assignmentType,
          assigneeId: form.assignmentType === "assigned" ? (form.assigneeId || null) : null,
          dueDate: form.dueDate || null,
        }),
      })
      onUpdate(payload.data.task)
      setEditMode(false)
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#171717]/70 p-4">
      <div className="w-full max-w-2xl border border-[#171717] bg-[#fbfbfa] p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black">
            {editMode ? "Edit Task" : task.title}
          </h2>
          <button onClick={onClose} className="p-1 hover:text-[#77766f]">
            <X className="size-5" />
          </button>
        </div>

        {error && (
          <p className="mt-4 border border-[#171717] bg-white p-3 text-sm font-bold">{error}</p>
        )}

        {editMode ? (
          <div className="mt-6 space-y-4">
            <div>
              <label className="text-sm font-black">Title</label>
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="mt-1 h-11 w-full border border-[#d9d8d2] bg-white px-3 font-semibold outline-none focus:border-[#171717]"
              />
            </div>
            <div>
              <label className="text-sm font-black">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
                className="mt-1 min-h-20 w-full border border-[#d9d8d2] bg-white p-3 font-semibold outline-none focus:border-[#171717]"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-black">Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="mt-1 h-11 w-full border border-[#d9d8d2] bg-white px-3 font-semibold outline-none focus:border-[#171717]"
                >
                  <option value="todo">To Do</option>
                  <option value="in_progress">In Progress</option>
                  <option value="needs_review">Needs Review</option>
                  <option value="done">Done</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-black">Priority</label>
                <select
                  value={form.priority}
                  onChange={(e) => setForm({ ...form, priority: e.target.value })}
                  className="mt-1 h-11 w-full border border-[#d9d8d2] bg-white px-3 font-semibold outline-none focus:border-[#171717]"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-black">Assignee</label>
                <select
                  value={form.assigneeId}
                  onChange={(e) => setForm({ ...form, assigneeId: e.target.value })}
                  className="mt-1 h-11 w-full border border-[#d9d8d2] bg-white px-3 font-semibold outline-none focus:border-[#171717]"
                >
                  <option value="">Unassigned</option>
                  {projectMembers.map((m) => (
                    <option key={m.user?.id} value={m.user?.id}>
                      {m.user?.fullName}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-black">Due Date</label>
                <input
                  type="date"
                  value={form.dueDate}
                  onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                  className="mt-1 h-11 w-full border border-[#d9d8d2] bg-white px-3 font-semibold outline-none focus:border-[#171717]"
                />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setEditMode(false)}
                className="h-11 flex-1 border border-[#171717] font-black"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="h-11 flex-1 bg-[#171717] font-black text-white disabled:opacity-60"
                disabled={saving || !form.title.trim()}
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-6 space-y-5">
            <div className="flex flex-wrap gap-2">
              <QuickStatusDropdown task={task} onUpdate={onUpdate} />
              <span className={classNames("px-2.5 py-1 text-xs font-black", priorityColors[task.priority] || priorityColors.medium)}>
                {titleCase(task.priority)}
              </span>
            </div>

            {task.description && (
              <div>
                <p className="text-sm font-black text-[#77766f] uppercase tracking-[0.12em]">Description</p>
                <p className="mt-2 font-semibold leading-relaxed text-[#55544f]">{task.description}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-black text-[#77766f] uppercase tracking-[0.12em]">Type</p>
                <p className="mt-2 font-black">{task.assignmentType === "open" ? "Open to Anyone" : "Assigned"}</p>
              </div>
              <div>
                <p className="text-sm font-black text-[#77766f] uppercase tracking-[0.12em]">Assignee</p>
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

            {/* Review Note */}
            {task.reviewNote && (
              <div className="border border-[#d9d8d2] bg-white p-4">
                <p className="flex items-center gap-2 text-sm font-black text-[#cc8833] uppercase tracking-[0.12em]">
                  <MessageSquare className="size-4" /> Owner's Feedback
                </p>
                <p className="mt-2 font-semibold leading-relaxed text-[#55544f]">{task.reviewNote}</p>
              </div>
            )}

            {/* Review actions (owner only, when needs_review) */}
            {task.status === "needs_review" && (
              <ReviewActions taskId={task.id} onUpdate={onUpdate} onChildCreated={onChildCreated} />
            )}

            <div className="flex gap-3 pt-4 border-t border-[#d9d8d2]">
              <button
                onClick={() => setEditMode(true)}
                className="h-10 px-4 border border-[#171717] font-black text-sm flex items-center gap-2"
              >
                <Edit3 className="size-4" />
                Edit
              </button>
              <button
                onClick={() => { if (confirm("Delete this task?")) onDelete(task.id) }}
                className="h-10 px-4 border border-[#cc3333] text-[#cc3333] font-black text-sm flex items-center gap-2"
              >
                <Trash2 className="size-4" />
                Delete
              </button>
            </div>

            {/* Subtask tree */}
            {subtasks.length > 0 && (
              <div className="pt-4 border-t border-[#d9d8d2]">
                <p className="text-sm font-black text-[#77766f] uppercase tracking-[0.12em] flex items-center gap-2">
                  <List className="size-4" /> Subtasks ({subtasks.length})
                </p>
                <div className="mt-3 space-y-2">
                  {subtasks.map((sub) => (
                    <div
                      key={sub.id}
                      className="border border-[#d9d8d2] bg-white p-3 transition hover:border-[#171717]"
                    >
                      <div className="flex items-center gap-2">
                        <span className={classNames("size-2 shrink-0 rounded-full", {
                          "bg-[#55544f]": sub.status === "todo",
                          "bg-[#2f2f2d]": sub.status === "in_progress",
                          "bg-[#cc8833]": sub.status === "needs_review",
                          "bg-[#171717]": sub.status === "done",
                          "bg-[#d9d8d2]": sub.status === "cancelled",
                        })} />
                        <span className="font-black text-sm truncate">{sub.title}</span>
                        <span className={classNames("ml-auto px-2 py-0.5 text-xs font-black shrink-0", statusClass[sub.status])}>
                          {sub.status === "in_progress" ? "In Progress" : sub.status === "needs_review" ? "Needs Review" : titleCase(sub.status)}
                        </span>
                      </div>
                      <p className="mt-1 text-xs font-semibold text-[#77766f]">
                        Assigned to {sub.assignee?.fullName || "Unassigned"}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Create Task Modal ─────────────────────────────────────────────────────

function CreateTaskModal({ projectId, projectMembers, onClose, onCreated }) {
  const [form, setForm] = useState({
    title: "", description: "", priority: "medium", assigneeId: "", dueDate: "",
    assignmentType: "assigned",
  })
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState("")

  const handleCreate = async (e) => {
    e.preventDefault()
    setCreating(true)
    setError("")
    try {
      const payload = await apiFetch(`/api/v1/tasks/${projectId}`, {
        method: "POST",
        body: JSON.stringify({
          title: form.title.trim(),
          description: form.description.trim() || undefined,
          priority: form.priority,
          assignmentType: form.assignmentType,
          assigneeId: form.assignmentType === "assigned" ? (form.assigneeId || undefined) : undefined,
          dueDate: form.dueDate || undefined,
        }),
      })
      onCreated(payload.data.task)
      onClose()
    } catch (e) {
      setError(e.message)
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#171717]/70 p-4">
      <div className="w-full max-w-xl border border-[#171717] bg-[#fbfbfa] p-6">
        <h2 className="text-2xl font-black">Create Task</h2>
        {error && <p className="mt-4 border border-[#171717] bg-white p-3 text-sm font-bold">{error}</p>}
        <form className="mt-6 space-y-4" onSubmit={handleCreate}>
          <div>
            <label className="text-sm font-black">Title</label>
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="mt-1 h-11 w-full border border-[#d9d8d2] bg-white px-3 font-semibold outline-none focus:border-[#171717]"
              placeholder="What needs to be done?"
              required
            />
          </div>
          <div>
            <label className="text-sm font-black">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={2}
              className="mt-1 min-h-20 w-full border border-[#d9d8d2] bg-white p-3 font-semibold outline-none focus:border-[#171717]"
              placeholder="Optional details..."
            />
          </div>
          <div>
            <label className="text-sm font-black">Assignment Type</label>
            <div className="mt-1 flex gap-2">
              <button
                type="button"
                onClick={() => setForm({ ...form, assignmentType: "assigned", assigneeId: "" })}
                className={`flex-1 h-11 text-sm font-black border ${
                  form.assignmentType === "assigned"
                    ? "border-[#171717] bg-[#171717] text-white"
                    : "border-[#d9d8d2] bg-white text-[#55544f]"
                }`}
              >
                Assign to Member
              </button>
              <button
                type="button"
                onClick={() => setForm({ ...form, assignmentType: "open", assigneeId: "" })}
                className={`flex-1 h-11 text-sm font-black border ${
                  form.assignmentType === "open"
                    ? "border-[#171717] bg-[#171717] text-white"
                    : "border-[#d9d8d2] bg-white text-[#55544f]"
                }`}
              >
                Open to Anyone
              </button>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-black">Priority</label>
              <select
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
                className="mt-1 h-11 w-full border border-[#d9d8d2] bg-white px-3 font-semibold outline-none focus:border-[#171717]"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            {form.assignmentType === "assigned" && (
              <div>
                <label className="text-sm font-black">Assignee</label>
                <select
                  value={form.assigneeId}
                  onChange={(e) => setForm({ ...form, assigneeId: e.target.value })}
                  className="mt-1 h-11 w-full border border-[#d9d8d2] bg-white px-3 font-semibold outline-none focus:border-[#171717]"
                >
                  <option value="">Unassigned</option>
                  {projectMembers.map((m) => (
                    <option key={m.user?.id} value={m.user?.id}>
                      {m.user?.fullName}
                    </option>
                  ))}
                </select>
              </div>
            )}
            {form.assignmentType === "assigned" && <div />}
            <div>
              <label className="text-sm font-black">Due Date</label>
              <input
                type="date"
                value={form.dueDate}
                onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                className="mt-1 h-11 w-full border border-[#d9d8d2] bg-white px-3 font-semibold outline-none focus:border-[#171717]"
              />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="h-11 flex-1 border border-[#171717] font-black">
              Cancel
            </button>
            <button type="submit" className="h-11 flex-1 bg-[#171717] font-black text-white disabled:opacity-60" disabled={creating || !form.title.trim()}>
              {creating ? "Creating..." : "Create Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Create Role Modal ─────────────────────────────────────────────────────

function CreateRoleModal({ projectId, onClose, onCreated }) {
  const [form, setForm] = useState({
    title: "", description: "", slotsTotal: 1, workloadHoursPerWeek: 0,
  })
  const [skillPills, setSkillPills] = useState([])
  const [preferredPills, setPreferredPills] = useState([])
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState("")

  const handleCreate = async (e) => {
    e.preventDefault()
    setCreating(true)
    setError("")
    try {
      const payload = await apiFetch(`/api/v1/projects/${projectId}/roles`, {
        method: "POST",
        body: JSON.stringify({
          title: form.title.trim(),
          description: form.description.trim() || undefined,
          slotsTotal: Number(form.slotsTotal),
          workloadHoursPerWeek: Number(form.workloadHoursPerWeek),
          requiredSkills: skillPills,
          preferredSkills: preferredPills,
        }),
      })
      onCreated(payload.data.role)
      onClose()
    } catch (e) {
      setError(e.message)
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#171717]/70 p-4">
      <div className="w-full max-w-xl border border-[#171717] bg-[#fbfbfa] p-6">
        <h2 className="text-2xl font-black">Create Role</h2>
        {error && <p className="mt-4 border border-[#171717] bg-white p-3 text-sm font-bold">{error}</p>}
        <form className="mt-6 space-y-4" onSubmit={handleCreate}>
          <div>
            <label className="text-sm font-black">Role Title</label>
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="mt-1 h-11 w-full border border-[#d9d8d2] bg-white px-3 font-semibold outline-none focus:border-[#171717]"
              placeholder="e.g. Frontend Developer"
              required
            />
          </div>
          <div>
            <label className="text-sm font-black">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={2}
              className="mt-1 min-h-20 w-full border border-[#d9d8d2] bg-white p-3 font-semibold outline-none focus:border-[#171717]"
              placeholder="What will this role do?"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-black">Slots</label>
              <input
                type="number"
                min={1}
                max={20}
                value={form.slotsTotal}
                onChange={(e) => setForm({ ...form, slotsTotal: e.target.value })}
                className="mt-1 h-11 w-full border border-[#d9d8d2] bg-white px-3 font-semibold outline-none focus:border-[#171717]"
              />
            </div>
            <div>
              <label className="text-sm font-black">Hours / week</label>
              <input
                type="number"
                min={0}
                max={80}
                value={form.workloadHoursPerWeek}
                onChange={(e) => setForm({ ...form, workloadHoursPerWeek: e.target.value })}
                className="mt-1 h-11 w-full border border-[#d9d8d2] bg-white px-3 font-semibold outline-none focus:border-[#171717]"
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-black">Required Skills</label>
            <PillInput values={skillPills} onChange={setSkillPills} placeholder="Type skill and press Enter" />
          </div>
          <div>
            <label className="text-sm font-black">Preferred Skills</label>
            <PillInput values={preferredPills} onChange={setPreferredPills} placeholder="Type skill and press Enter" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="h-11 flex-1 border border-[#171717] font-black">Cancel</button>
            <button type="submit" className="h-11 flex-1 bg-[#171717] font-black text-white disabled:opacity-60" disabled={creating || !form.title.trim()}>
              {creating ? "Creating..." : "Create Role"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Main Manage Page ──────────────────────────────────────────────────────

const TABS = [
  { id: "overview", label: "Overview", icon: BarChart3 },
  { id: "applications", label: "Applications", icon: FileText },
  { id: "team", label: "Team", icon: Users },
  { id: "roles", label: "Roles", icon: Briefcase },
  { id: "tasks", label: "Tasks", icon: List },
  { id: "chat", label: "Chat", icon: MessageSquare },
  { id: "ai", label: "AI Companion", icon: Rocket },
  { id: "settings", label: "Settings", icon: Settings },
]

export default function ProjectManagePage() {
  const { id } = useParams()
  const router = useRouter()

  const [activeTab, setActiveTab] = useState("overview")
  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  // Applications
  const [applications, setApplications] = useState([])
  const [loadingApps, setLoadingApps] = useState(false)

  // Members
  const [members, setMembers] = useState([])
  const [loadingMembers, setLoadingMembers] = useState(false)

  // Activity
  const [activity, setActivity] = useState([])

  // Tasks
  const [tasks, setTasks] = useState([])
  const [taskStats, setTaskStats] = useState(null)
  const [loadingTasks, setLoadingTasks] = useState(false)
  const [selectedTask, setSelectedTask] = useState(null)
  const [showCreateTask, setShowCreateTask] = useState(false)

  // Roles
  const [showCreateRole, setShowCreateRole] = useState(false)

  // Metadata for settings
  const [categories, setCategories] = useState([])
  const [availableRoles, setAvailableRoles] = useState([])

  // Settings form
  const [settingsForm, setSettingsForm] = useState({
    title: "", description: "", category: "", stage: "", status: "", location: "", locationType: "",
    commitmentHoursPerWeek: "", commitmentLabel: "", progressPercent: "", nextMilestone: "",
  })
  const [skillPills, setSkillPills] = useState([])
  const [tagPills, setTagPills] = useState([])
  const [savingSettings, setSavingSettings] = useState(false)
  const [settingsError, setSettingsError] = useState("")

  // ─── Load Metadata ─────────────────────────────────────────────────────

  useEffect(() => {
    apiFetch("/api/v1/metadata").then((p) => {
      setCategories(p.data.categories || [])
      setAvailableRoles(p.data.roles || [])
    }).catch(() => {})
  }, [])

  // ─── Load Project ─────────────────────────────────────────────────────

  const loadProject = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const payload = await apiFetch(`/api/v1/projects/${id}`)
      setProject(payload.data.project)
    } catch (e) {
      setError(e.message)
      if (e.status === 404) setError("Project not found")
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => { loadProject() }, [loadProject])

  const loadApplications = useCallback(async () => {
    setLoadingApps(true)
    try {
      const payload = await apiFetch(`/api/v1/projects/${id}/applications`)
      setApplications(payload.data.applications || [])
    } catch {} finally { setLoadingApps(false) }
  }, [id])

  const loadMembers = useCallback(async () => {
    setLoadingMembers(true)
    try {
      const payload = await apiFetch(`/api/v1/projects/${id}/members`)
      setMembers(payload.data.members || [])
    } catch {} finally { setLoadingMembers(false) }
  }, [id])

  const loadActivity = useCallback(async () => {
    try {
      const payload = await apiFetch(`/api/v1/activity/project/${id}`)
      setActivity(payload.data.activity || [])
    } catch {}
  }, [id])

  const loadTasks = useCallback(async () => {
    setLoadingTasks(true)
    try {
      const [tasksPayload, statsPayload] = await Promise.all([
        apiFetch(`/api/v1/tasks/${id}`),
        apiFetch(`/api/v1/tasks/stats/${id}`),
      ])
      setTasks(tasksPayload.data.tasks || [])
      setTaskStats(statsPayload.data.stats)
    } catch {} finally { setLoadingTasks(false) }
  }, [id])

  // Load tab-specific data
  useEffect(() => {
    if (!project || error) return
    if (activeTab === "applications" && !applications.length) loadApplications()
    if (activeTab === "team" && !members.length) loadMembers()
    if (activeTab === "overview" && !activity.length) { loadActivity(); loadTasks() }
    if (activeTab === "tasks") { if (!tasks.length) loadTasks(); if (!members.length) loadMembers() }
  }, [activeTab, project])

  // Populate settings form when project loads
  useEffect(() => {
    if (project) {
      setSettingsForm({
        title: project.title || "",
        description: project.description || "",
        category: project.category || "",
        stage: project.stage || "",
        status: project.status || "recruiting",
        location: project.location || "",
        locationType: project.locationType || "",
        commitmentHoursPerWeek: String(project.commitmentHoursPerWeek || 0),
        commitmentLabel: project.commitmentLabel || "",
        progressPercent: String(project.progressPercent || 0),
        nextMilestone: project.nextMilestone || "",
      })
      setSkillPills(project.skills || [])
      setTagPills(project.tags || [])
    }
  }, [project])

  // ─── Handlers ──────────────────────────────────────────────────────────

  const handleReviewApplication = async (appId, status) => {
    try {
      await apiFetch(`/api/v1/applications/${appId}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      })
      await loadApplications()
      await loadProject()
    } catch (e) { setError(e.message) }
  }

  const handleSaveSettings = async (e) => {
    e.preventDefault()
    setSavingSettings(true)
    setSettingsError("")
    try {
      const payload = await apiFetch(`/api/v1/projects/${id}`, {
        method: "PATCH",
        body: JSON.stringify({
          title: settingsForm.title.trim(),
          description: settingsForm.description.trim(),
          category: settingsForm.category,
          stage: settingsForm.stage,
          status: settingsForm.status,
          location: settingsForm.location.trim() || undefined,
          locationType: settingsForm.locationType || undefined,
          commitmentHoursPerWeek: Number(settingsForm.commitmentHoursPerWeek),
          commitmentLabel: settingsForm.commitmentLabel.trim() || undefined,
          progressPercent: Number(settingsForm.progressPercent),
          nextMilestone: settingsForm.nextMilestone.trim() || undefined,
          skills: skillPills,
          tags: tagPills,
        }),
      })
      setProject(payload.data.project)
      setError("")
    } catch (e) {
      setSettingsError(e.message)
    } finally {
      setSavingSettings(false)
    }
  }

  const handleArchiveProject = async () => {
    if (!confirm("Archive this project? This can be reversed.")) return
    try {
      await apiFetch(`/api/v1/projects/${id}`, { method: "DELETE" })
      router.push("/dashboard")
    } catch (e) { setError(e.message) }
  }

  const handleTaskCreated = (task) => {
    setTasks((prev) => [task, ...prev])
  }

  const handleTaskUpdated = (task) => {
    setTasks((prev) => prev.map((t) => (t.id === task.id ? task : t)))
    setSelectedTask(task)
  }

  const handleChildCreated = (child) => {
    setTasks((prev) => [child, ...prev])
  }

  const handleTaskDeleted = async (taskId) => {
    try {
      await apiFetch(`/api/v1/tasks/${taskId}`, { method: "DELETE" })
      setTasks((prev) => prev.filter((t) => t.id !== taskId))
      setSelectedTask(null)
    } catch (e) { setError(e.message) }
  }

  const handleRoleClose = async (roleId) => {
    if (!confirm("Close this role?")) return
    try {
      await apiFetch(`/api/v1/roles/${roleId}`, { method: "DELETE" })
      await loadProject()
    } catch (e) { setError(e.message) }
  }

  // ─── Stats ────────────────────────────────────────────────────────────

  const totalSlots = project?.roles?.reduce((sum, r) => sum + r.slotsTotal, 0) || 0
  const filledSlots = project?.roles?.reduce((sum, r) => sum + r.slotsFilled, 0) || 0
  const openRoles = (project?.roles || []).filter((r) => r.status === "open" && r.slotsOpen > 0).length

  // ─── Render ───────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f7f3] text-[#171717]">
        <section className="px-6 py-20 sm:px-10 lg:px-20 xl:px-28">
          <p className="text-lg font-black">Loading project management...</p>
        </section>
      </div>
    )
  }

  if (error && !project) {
    return (
      <div className="min-h-screen bg-[#f7f7f3] text-[#171717]">
        <section className="px-6 py-20 sm:px-10 lg:px-20 xl:px-28">
          <Link href="/find-projects" className="mb-8 inline-flex items-center gap-2 text-sm font-black hover:underline">
            <ArrowLeft className="size-4" /> Back to projects
          </Link>
          <p className="mt-8 text-xl font-black">{error}</p>
        </section>
      </div>
    )
  }

  if (!project) return null

  return (
    <div className="min-h-screen bg-[#f7f7f3] text-[#171717]">
      {/* ─── Header ───────────────────────────────────────────────────── */}
      <section className="border-b border-[#d9d8d2] bg-[#fbfbfa] px-6 py-4 sm:px-10 lg:px-20 xl:px-28">
        <div className="flex items-center gap-4">
          <Link href={`/projects/${id}`} className="flex size-9 items-center justify-center border border-[#d9d8d2] bg-white hover:border-[#171717]">
            <ArrowLeft className="size-4" />
          </Link>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-black">{project.title}</h1>
              <span className={classNames("px-2 py-0.5 text-xs font-black", statusClass[project.status] || "")}>
                {titleCase(project.status)}
              </span>
            </div>
            <p className="text-sm font-semibold text-[#55544f]">
              {project.category} &middot; {formatStage(project.stage)}
            </p>
          </div>
          <Link
            href={`/projects/${id}`}
            className="inline-flex h-9 items-center gap-2 border border-[#d9d8d2] bg-white px-4 text-sm font-black hover:border-[#171717]"
          >
            <ExternalLink className="size-4" />
            Public View
          </Link>
        </div>
      </section>

      {/* ─── Tab Navigation ───────────────────────────────────────────── */}
      <section className="border-b border-[#d9d8d2] bg-white px-6 sm:px-10 lg:px-20 xl:px-28">
        <div className="flex gap-0 -mb-px overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={classNames(
                "inline-flex items-center gap-2 px-4 py-3 text-sm font-black border-b-2 whitespace-nowrap transition",
                activeTab === tab.id
                  ? "border-[#171717] text-[#171717]"
                  : "border-transparent text-[#77766f] hover:text-[#171717]"
              )}
            >
              <tab.icon className="size-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </section>

      {/* ─── Global Error ─────────────────────────────────────────────── */}
      {error && activeTab !== "settings" && (
        <section className="px-6 pt-6 sm:px-10 lg:px-20 xl:px-28">
          <p className="border border-[#171717] bg-white p-3 text-sm font-bold">{error}</p>
        </section>
      )}

      {/* ─── Tab Content ──────────────────────────────────────────────── */}
      <section className="px-6 py-8 sm:px-10 lg:px-20 xl:px-28">
        {activeTab === "overview" && (
          <OverviewTab
            project={project}
            activity={activity}
            taskStats={taskStats}
            totalSlots={totalSlots}
            filledSlots={filledSlots}
            openRoles={openRoles}
            members={members}
          />
        )}

        {activeTab === "applications" && (
          <ApplicationsTab
            applications={applications}
            loading={loadingApps}
            onReview={handleReviewApplication}
            onRefresh={loadApplications}
          />
        )}

        {activeTab === "team" && (
          <TeamTab members={members} loading={loadingMembers} onRefresh={loadMembers} />
        )}

        {activeTab === "roles" && (
          <RolesTab
            roles={project.roles || []}
            onCreateRole={() => setShowCreateRole(true)}
            onCloseRole={handleRoleClose}
          />
        )}

        {activeTab === "tasks" && (
          <TasksTab
            tasks={tasks}
            stats={taskStats}
            loading={loadingTasks}
            onRefresh={loadTasks}
            onCreateTask={() => setShowCreateTask(true)}
            onSelectTask={setSelectedTask}
          />
        )}

        {activeTab === "chat" && <PlaceholderTab icon={MessageSquare} title="Chat" message="Team chat coming soon. Members will be able to discuss project updates in real-time." />}

        {activeTab === "ai" && (
          <PlaceholderTab
            icon={Rocket}
            title="AI Companion"
            message="AI assistance is on the roadmap. Future features include task suggestions, code review, deadline predictions, and automated status updates."
          />
        )}

        {activeTab === "settings" && (
          <SettingsForm
            form={settingsForm}
            setForm={setSettingsForm}
            categories={categories}
            skillPills={skillPills}
            setSkillPills={setSkillPills}
            tagPills={tagPills}
            setTagPills={setTagPills}
            saving={savingSettings}
            error={settingsError}
            onSubmit={handleSaveSettings}
            onArchive={handleArchiveProject}
          />
        )}
      </section>

      {/* ─── Modals ──────────────────────────────────────────────────── */}
      {showCreateTask && (
        <CreateTaskModal
          projectId={id}
          projectMembers={members}
          onClose={() => setShowCreateTask(false)}
          onCreated={handleTaskCreated}
        />
      )}

      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          projectMembers={members}
          onClose={() => setSelectedTask(null)}
          onUpdate={handleTaskUpdated}
          onDelete={handleTaskDeleted}
          onChildCreated={handleChildCreated}
        />
      )}

      {showCreateRole && (
        <CreateRoleModal
          projectId={id}
          onClose={() => setShowCreateRole(false)}
          onCreated={() => loadProject()}
        />
      )}
    </div>
  )
}

// ─── Tab Components ────────────────────────────────────────────────────────

function formatStage(stage) {
  return stage
    ? stage.split("-").join(" ").replace(/\b\w/g, (l) => l.toUpperCase())
    : "Idea"
}

function OverviewTab({ project, activity, taskStats, totalSlots, filledSlots, openRoles, members }) {
  const stats = [
    { label: "Open Roles", value: openRoles, icon: Briefcase },
    { label: "Team Size", value: members.length, icon: Users },
    { label: "Total Tasks", value: taskStats?.total || 0, icon: List },
    { label: "Completed", value: taskStats?.done || 0, icon: CheckCircle2 },
  ]

  const progressPercent = project.progressPercent || 0

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
      <div className="space-y-8">
        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s) => (
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
            <span className="text-sm font-black text-[#77766f]">{progressPercent}%</span>
          </div>
          <div className="mt-4 h-3 bg-[#e5e3dc]">
            <div className="h-full bg-[#171717] transition-all" style={{ width: `${progressPercent}%` }} />
          </div>
          {project.nextMilestone && (
            <p className="mt-4 flex items-center gap-2 text-sm font-bold text-[#55544f]">
              <Target className="size-4" />
              Next: {project.nextMilestone}
            </p>
          )}
        </div>

        {/* About / Description */}
        <div className="border border-[#d9d8d2] bg-[#fbfbfa] p-5">
          <h2 className="text-xl font-black">About</h2>
          <p className="mt-3 font-semibold leading-relaxed text-[#55544f]">{project.description}</p>
          {project.skills?.length > 0 && (
            <div className="mt-5">
              <p className="mb-2 text-xs font-black uppercase tracking-[0.14em] text-[#77766f]">Skills</p>
              <div className="flex flex-wrap gap-2">
                {project.skills.map((s) => (
                  <span key={s} className="border border-[#171717] bg-white px-3 py-1 text-sm font-black">{s}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Recent Activity */}
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
                  {item.metadata?.message && (
                    <p className="mt-1 text-sm font-semibold text-[#55544f]">{item.metadata.message}</p>
                  )}
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
  )
}

function ApplicationsTab({ applications, loading, onReview, onRefresh }) {
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-black">
          Applications ({applications.length})
        </h2>
        <button onClick={onRefresh} className="inline-flex h-9 items-center gap-2 border border-[#d9d8d2] bg-white px-4 text-sm font-black hover:border-[#171717]">
          <RefreshCw className="size-4" /> Refresh
        </button>
      </div>

      {loading ? (
        <p className="font-semibold text-[#55544f]">Loading applications...</p>
      ) : applications.length === 0 ? (
        <div className="border border-[#d9d8d2] bg-[#fbfbfa] p-8 text-center">
          <FileText className="mx-auto size-10 text-[#77766f]" />
          <p className="mt-4 text-xl font-black">No applications yet</p>
          <p className="mt-2 font-semibold text-[#55544f]">Applications from candidates will appear here.</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {applications.map((app) => (
            <div key={app.id} className="border border-[#d9d8d2] bg-[#fbfbfa] p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex-1">
                  <div className="flex items-start gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#2f2f2d] text-sm font-black text-white">
                      {app.applicant?.fullName?.split(" ").map((n) => n[0]).join("").slice(0, 2) || "?"}
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-black">{app.applicant?.fullName || "Unknown"}</h3>
                        <span className={`px-2 py-0.5 text-xs font-black ${statusClass[app.status]}`}>
                          {titleCase(app.status)}
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-[#77766f]">
                        Applied for <span className="text-[#171717]">{app.role?.title}</span>
                      </p>
                      <p className="mt-1 text-xs font-semibold text-[#77766f]">{formatDateRel(app.createdAt)}</p>
                      {app.message && (
                        <p className="mt-3 border-l-2 border-[#d9d8d2] pl-3 text-sm font-semibold text-[#55544f]">
                          {app.message}
                        </p>
                      )}
                      {app.applicant?.skills?.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {app.applicant.skills.map((skill) => (
                            <span key={skill} className="border border-[#d9d8d2] px-2 py-0.5 text-xs font-bold text-[#55544f]">
                              {skill}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                {app.status === "pending" && (
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => onReview(app.id, "accepted")}
                      className="h-9 px-5 bg-[#171717] text-white text-xs font-black hover:bg-[#2f2f2d]"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => onReview(app.id, "rejected")}
                      className="h-9 px-5 border border-[#171717] text-xs font-black hover:bg-[#efeee8]"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function TeamTab({ members, loading, onRefresh }) {
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-black">Team ({members.length})</h2>
        <button onClick={onRefresh} className="inline-flex h-9 items-center gap-2 border border-[#d9d8d2] bg-white px-4 text-sm font-black hover:border-[#171717]">
          <RefreshCw className="size-4" /> Refresh
        </button>
      </div>

      {loading ? (
        <p className="font-semibold text-[#55544f]">Loading team...</p>
      ) : members.length === 0 ? (
        <div className="border border-[#d9d8d2] bg-[#fbfbfa] p-8 text-center">
          <Users className="mx-auto size-10 text-[#77766f]" />
          <p className="mt-4 text-xl font-black">No team members yet</p>
          <p className="mt-2 font-semibold text-[#55544f]">Team members will appear once applications are accepted.</p>
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
                  {m.joinedAt && (
                    <p className="text-xs font-semibold text-[#77766f]">Joined {formatDateRel(m.joinedAt)}</p>
                  )}
                </div>
              </div>
              {m.user?.skills?.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {m.user.skills.map((skill) => (
                    <span key={skill} className="border border-[#d9d8d2] px-2 py-0.5 text-xs font-bold text-[#55544f]">
                      {skill}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function RolesTab({ roles, onCreateRole, onCloseRole }) {
  const openRoles = roles.filter((r) => r.status === "open" && r.slotsOpen > 0)
  const filledRoles = roles.filter((r) => r.status !== "open" || r.slotsOpen === 0)

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-black">Roles ({roles.length})</h2>
        <button
          onClick={onCreateRole}
          className="inline-flex h-9 items-center gap-2 border border-[#171717] bg-[#171717] px-4 text-sm font-black text-white hover:bg-transparent hover:text-[#171717]"
        >
          <Plus className="size-4" /> Add Role
        </button>
      </div>

      {roles.length === 0 ? (
        <div className="border border-[#d9d8d2] bg-[#fbfbfa] p-8 text-center">
          <Briefcase className="mx-auto size-10 text-[#77766f]" />
          <p className="mt-4 text-xl font-black">No roles defined</p>
          <p className="mt-2 font-semibold text-[#55544f]">Add roles so applicants know what positions are open.</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {openRoles.map((role) => (
            <div key={role.id} className="border border-[#171717] bg-[#fbfbfa] p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-black">{role.title}</h3>
                    <span className="bg-[#171717] px-2 py-0.5 text-xs font-black text-white">{role.slotsOpen} open</span>
                  </div>
                  {role.description && (
                    <p className="mt-2 font-semibold text-[#55544f]">{role.description}</p>
                  )}
                  <div className="mt-3 flex flex-wrap gap-4 text-sm font-semibold text-[#55544f]">
                    <span>{role.slotsFilled}/{role.slotsTotal} filled</span>
                    {role.workloadHoursPerWeek > 0 && <span>{role.workloadHoursPerWeek} hrs/week</span>}
                  </div>
                  {role.requiredSkills?.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {role.requiredSkills.map((s) => (
                        <span key={s} className="border border-[#171717] bg-white px-2 py-0.5 text-xs font-black">{s}</span>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => onCloseRole(role.id)}
                  className="h-9 px-4 border border-[#d9d8d2] text-xs font-black hover:border-[#cc3333] hover:text-[#cc3333]"
                >
                  Close Role
                </button>
              </div>
            </div>
          ))}
          {filledRoles.map((role) => (
            <div key={role.id} className="border border-[#d9d8d2] bg-[#fbfbfa] p-4 opacity-60">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="font-black">{role.title}</h3>
                  <span className="text-xs font-semibold text-[#55544f]">{role.slotsFilled}/{role.slotsTotal} filled</span>
                </div>
                <CheckCircle2 className="size-4 text-[#55544f]" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function TasksTab({ tasks, stats, loading, onRefresh, onCreateTask, onSelectTask }) {
  const [filter, setFilter] = useState("all")

  const filtered = filter === "all"
    ? tasks
    : tasks.filter((t) => t.status === filter)

  const statusCounts = {
    todo: tasks.filter((t) => t.status === "todo").length,
    in_progress: tasks.filter((t) => t.status === "in_progress").length,
    needs_review: tasks.filter((t) => t.status === "needs_review").length,
    done: tasks.filter((t) => t.status === "done").length,
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-2xl font-black">
          Tasks {stats ? `(${stats.total})` : ""}
        </h2>
        <div className="flex items-center gap-2">
          <button onClick={onRefresh} className="flex size-9 items-center justify-center border border-[#d9d8d2] bg-white hover:border-[#171717]">
            <RefreshCw className="size-4" />
          </button>
          <button
            onClick={onCreateTask}
            className="inline-flex h-9 items-center gap-2 border border-[#171717] bg-[#171717] px-4 text-sm font-black text-white hover:bg-transparent hover:text-[#171717]"
          >
            <Plus className="size-4" /> New Task
          </button>
        </div>
      </div>

      {/* Task stats + filter */}
      <div className="mb-6 flex flex-wrap gap-3">
        {[
          { id: "all", label: "All", count: stats?.total || 0 },
          { id: "todo", label: "To Do", count: statusCounts.todo },
          { id: "in_progress", label: "In Progress", count: statusCounts.in_progress },
          { id: "needs_review", label: "Needs Review", count: statusCounts.needs_review },
          { id: "done", label: "Done", count: statusCounts.done },
        ].map((s) => (
          <button
            key={s.id}
            onClick={() => setFilter(s.id)}
            className={classNames(
              "px-4 py-2 text-sm font-black border",
              filter === s.id
                ? "border-[#171717] bg-[#171717] text-white"
                : "border-[#d9d8d2] bg-white text-[#55544f] hover:border-[#171717]"
            )}
          >
            {s.label} ({s.count})
          </button>
        ))}
      </div>

      {loading ? (
        <p className="font-semibold text-[#55544f]">Loading tasks...</p>
      ) : filtered.length === 0 ? (
        <div className="border border-[#d9d8d2] bg-[#fbfbfa] p-8 text-center">
          <List className="mx-auto size-10 text-[#77766f]" />
          <p className="mt-4 text-xl font-black">No tasks found</p>
          <p className="mt-2 font-semibold text-[#55544f]">
            {filter === "all" ? "Create your first task to get started." : `No tasks with status "${filter}".`}
          </p>
        </div>
      ) : (
        <div className="grid gap-3">
          {filtered.map((task) => (
            <button
              key={task.id}
              onClick={() => onSelectTask(task)}
              className="w-full border border-[#d9d8d2] bg-[#fbfbfa] p-4 text-left transition hover:border-[#171717]"
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <span className={classNames("size-2 shrink-0 rounded-full", {
                    "bg-[#55544f]": task.status === "todo",
                    "bg-[#2f2f2d]": task.status === "in_progress",
                    "bg-[#cc8833]": task.status === "needs_review",
                    "bg-[#171717]": task.status === "done",
                    "bg-[#d9d8d2]": task.status === "cancelled",
                  })} />
                  <div className="min-w-0">
                    <h3 className="font-black truncate">{task.title}</h3>
                    <p className="text-xs font-semibold text-[#77766f]">
                      {task.assignmentType === "open"
                        ? "Open to anyone"
                        : task.assignee?.fullName
                          ? `Assigned to ${task.assignee.fullName}`
                          : "Unassigned"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={classNames("px-2 py-0.5 text-xs font-black", priorityColors[task.priority])}>
                    {titleCase(task.priority)}
                  </span>
                  <span className={classNames("px-2 py-0.5 text-xs font-black", statusClass[task.status])}>
                    {task.status === "in_progress" ? "In Progress" : task.status === "needs_review" ? "Needs Review" : titleCase(task.status)}
                  </span>
                  {task.dueDate && (
                    <span className="text-xs font-semibold text-[#77766f]">{formatDateRel(task.dueDate)}</span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function SettingsForm({ form, setForm, categories, skillPills, setSkillPills, tagPills, setTagPills, saving, error, onSubmit, onArchive }) {
  const statusIsCompleted = form.status === "completed"
  return (
    <div className="max-w-2xl">
      <h2 className="text-2xl font-black">Project Settings</h2>
      <p className="mt-2 font-semibold text-[#55544f]">Edit your project details and configuration.</p>

      {error && (
        <p className="mt-4 border border-[#171717] bg-white p-3 text-sm font-bold">{error}</p>
      )}

      <form className="mt-6 space-y-4" onSubmit={onSubmit}>
        <div>
          <label className="text-sm font-black">Project Title</label>
          <input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="mt-1 h-11 w-full border border-[#d9d8d2] bg-white px-3 font-semibold outline-none focus:border-[#171717]"
            required
          />
        </div>

        <div>
          <label className="text-sm font-black">Description</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={4}
            className="mt-1 min-h-24 w-full border border-[#d9d8d2] bg-white p-3 font-semibold outline-none focus:border-[#171717]"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-black">Category</label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="mt-1 h-11 w-full border border-[#d9d8d2] bg-white px-3 font-semibold outline-none focus:border-[#171717]"
            >
              <option value="">Select</option>
              {categories.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-black">Stage</label>
            <select
              value={form.stage}
              onChange={(e) => setForm({ ...form, stage: e.target.value })}
              className="mt-1 h-11 w-full border border-[#d9d8d2] bg-white px-3 font-semibold outline-none focus:border-[#171717]"
            >
              <option value="idea">Idea</option>
              <option value="prototype">Prototype</option>
              <option value="in-development">In Development</option>
              <option value="beta">Beta</option>
              <option value="launched">Launched</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-black">Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="mt-1 h-11 w-full border border-[#d9d8d2] bg-white px-3 font-semibold outline-none focus:border-[#171717]"
            >
              <option value="recruiting">Recruiting</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
            </select>
            {statusIsCompleted && (
              <p className="mt-1 text-xs font-bold text-[#55544f]">Progress will be set to 100%.</p>
            )}
          </div>
          <div>
            <label className="text-sm font-black">Location</label>
            <input
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              className="mt-1 h-11 w-full border border-[#d9d8d2] bg-white px-3 font-semibold outline-none focus:border-[#171717]"
              placeholder="Remote / City"
            />
          </div>
          <div>
            <label className="text-sm font-black">Location Type</label>
            <select
              value={form.locationType}
              onChange={(e) => setForm({ ...form, locationType: e.target.value })}
              className="mt-1 h-11 w-full border border-[#d9d8d2] bg-white px-3 font-semibold outline-none focus:border-[#171717]"
            >
              <option value="">Select</option>
              <option value="remote">Remote</option>
              <option value="onsite">On-site</option>
              <option value="hybrid">Hybrid</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-black">Commitment (hrs/week)</label>
            <input
              type="number"
              min={0}
              max={80}
              value={form.commitmentHoursPerWeek}
              onChange={(e) => setForm({ ...form, commitmentHoursPerWeek: e.target.value })}
              className="mt-1 h-11 w-full border border-[#d9d8d2] bg-white px-3 font-semibold outline-none focus:border-[#171717]"
            />
          </div>
          <div>
            <label className="text-sm font-black">Commitment Label</label>
            <input
              value={form.commitmentLabel}
              onChange={(e) => setForm({ ...form, commitmentLabel: e.target.value })}
              className="mt-1 h-11 w-full border border-[#d9d8d2] bg-white px-3 font-semibold outline-none focus:border-[#171717]"
              placeholder="e.g. Part-time"
            />
          </div>
          <div>
            <label className="text-sm font-black">Progress (%)</label>
            <input
              type="number"
              min={0}
              max={100}
              value={form.progressPercent}
              onChange={(e) => setForm({ ...form, progressPercent: e.target.value })}
              className="mt-1 h-11 w-full border border-[#d9d8d2] bg-white px-3 font-semibold outline-none focus:border-[#171717]"
            />
          </div>
          <div>
            <label className="text-sm font-black">Next Milestone</label>
            <input
              value={form.nextMilestone}
              onChange={(e) => setForm({ ...form, nextMilestone: e.target.value })}
              className="mt-1 h-11 w-full border border-[#d9d8d2] bg-white px-3 font-semibold outline-none focus:border-[#171717]"
              placeholder="e.g. Beta launch"
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-black">Skills</label>
          <PillInput values={skillPills} onChange={setSkillPills} placeholder="Type skill and press Enter" />
        </div>

        <div>
          <label className="text-sm font-black">Tags</label>
          <PillInput values={tagPills} onChange={setTagPills} placeholder="Type tag and press Enter" />
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            className="h-11 flex-1 bg-[#171717] font-black text-white disabled:opacity-60"
            disabled={saving}
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
          <button
            type="button"
            onClick={onArchive}
            className="h-11 px-6 border border-[#d9d8d2] font-black text-[#55544f] hover:border-[#cc3333] hover:text-[#cc3333]"
          >
            Archive Project
          </button>
        </div>
      </form>
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
