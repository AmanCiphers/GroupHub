"use client"

import { useState } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  Briefcase,
  CalendarDays,
  CheckCircle2,
  CircleDot,
  Clock,
  Eye,
  FileText,
  FolderOpen,
  LayoutDashboard,
  Lock,
  MapPin,
  Plus,
  Settings,
  Shield,
  Trash2,
  UserPlus,
  Users,
  Wrench,
} from "lucide-react"

import { PageHeader } from "@/components/page-header"
import { ChipPicker } from "@/components/chip-picker"
import { Select } from "@/components/select"
import { api } from "@/lib/api"
import { getInitials } from "@/lib/utils"
import {
  COMMITMENT,
  COMPENSATION,
  EXPERIENCE_LEVEL,
  PROJECT_CATEGORIES,
  PROJECT_JOIN_POLICY,
  PROJECT_STAGES,
  PROJECT_TAGS,
  PROJECT_VISIBILITY,
  SKILLS,
} from "@/lib/data/enums"

const PROJECT_STATUS = ["Recruiting", "Active", "Completed", "Archived"]
const ROLE_STATUS = ["Open", "Filled", "Closed"]
const MEMBER_ROLES = ["Admin", "Mentor", "Member"]

const projectStatusClass = {
  Recruiting: "border border-ink bg-white text-ink",
  Active: "bg-ink text-white",
  Completed: "bg-wash text-subtle",
  Archived: "border border-line bg-white text-faint",
}

function formatDate(value) {
  if (!value) return "Not set"
  return new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

function toDateInput(value) {
  if (!value) return ""
  return new Date(value).toISOString().slice(0, 10)
}

function Field({ label, hint, children }) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <label className="text-xs font-black uppercase tracking-[0.14em] text-faint">
          {label}
        </label>
        {hint}
      </div>
      {children}
    </div>
  )
}

function StatCard({ icon: Icon, label, value }) {
  return (
    <div className="border border-line bg-surface p-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-black uppercase tracking-[0.14em] text-faint">
          {label}
        </p>
        <Icon className="size-4 text-quiet" />
      </div>
      <p className="mt-3 text-3xl font-black text-ink">{value}</p>
    </div>
  )
}

function Detail({ icon: Icon, label, value }) {
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

function OverviewTab({ project, roles, members, onTab }) {
  const openRoles = roles.filter((role) => role.status === "Open")
  const pending = roles.reduce((sum, role) => sum + (role.pending || 0), 0)

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Users} label="Team members" value={members.length} />
        <StatCard icon={Briefcase} label="Open roles" value={openRoles.length} />
        <StatCard icon={UserPlus} label="Pending applications" value={pending} />
        <StatCard
          icon={FileText}
          label="Total applicants"
          value={project.applicantCount || 0}
        />
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <div className="border border-line bg-surface p-5">
            <h2 className="border-b border-line pb-3 text-lg font-black">
              Project brief
            </h2>
            <div className="mt-4 space-y-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.14em] text-faint">
                  Description
                </p>
                <p className="mt-1 text-sm font-semibold leading-relaxed text-subtle">
                  {project.description}
                </p>
              </div>
              {project.whyBuilding && (
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.14em] text-faint">
                    Why you are building it
                  </p>
                  <p className="mt-1 text-sm font-semibold leading-relaxed text-subtle">
                    {project.whyBuilding}
                  </p>
                </div>
              )}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.14em] text-faint">
                    Target audience
                  </p>
                  <p className="mt-1 text-sm font-semibold leading-relaxed text-subtle">
                    {project.targetAudience}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.14em] text-faint">
                    Current status
                  </p>
                  <p className="mt-1 text-sm font-semibold leading-relaxed text-subtle">
                    {project.currentStatus || "Not set"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="border border-line bg-surface p-5">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <h2 className="text-lg font-black">Milestones</h2>
              <span className="text-sm font-black text-quiet">
                {(project.milestones || []).filter((m) => m.status === "Done").length}/
                {(project.milestones || []).length} done
              </span>
            </div>
            <div className="mt-4 grid gap-2">
              {(project.milestones || []).length === 0 ? (
                <p className="border border-line bg-white p-4 text-sm font-semibold text-faint">
                  No milestones added yet.
                </p>
              ) : (
                project.milestones.map((milestone, index) => (
                  <div
                    key={`${milestone.title}-${index}`}
                    className="flex items-center justify-between gap-4 border border-line bg-white px-4 py-3"
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
          </div>
        </div>

        <aside className="space-y-5">
          <div className="border border-line bg-surface p-5">
            <h2 className="text-lg font-black">At a glance</h2>
            <div className="mt-4 grid gap-4">
              <Detail icon={CircleDot} label="Stage" value={project.stage} />
              <Detail
                icon={Briefcase}
                label="Compensation"
                value={project.compensation}
              />
              <Detail icon={Clock} label="Commitment" value={project.commitment} />
              <Detail
                icon={Users}
                label="Team size"
                value={`${members.length} of ${project.maxTeamSize}`}
              />
              <Detail icon={MapPin} label="Location" value={project.location} />
              <Detail
                icon={CircleDot}
                label="Experience"
                value={project.experienceLevel}
              />
              <Detail
                icon={CalendarDays}
                label="Started"
                value={formatDate(project.startDate)}
              />
              <Detail
                icon={CalendarDays}
                label="Target end"
                value={formatDate(project.targetEndDate)}
              />
            </div>
          </div>

          <div className="border border-ink bg-surface p-5">
            <h2 className="text-lg font-black">Quick actions</h2>
            <div className="mt-4 grid gap-2">
              <button
                type="button"
                onClick={() => onTab("team")}
                className="flex h-10 items-center justify-between border border-line bg-white px-3 text-sm font-black text-ink transition hover:border-ink"
              >
                Manage team
                <Users className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => onTab("roles")}
                className="flex h-10 items-center justify-between border border-line bg-white px-3 text-sm font-black text-ink transition hover:border-ink"
              >
                Manage roles
                <Briefcase className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => onTab("settings")}
                className="flex h-10 items-center justify-between border border-line bg-white px-3 text-sm font-black text-ink transition hover:border-ink"
              >
                Edit project info
                <Settings className="size-4" />
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}

function TeamTab({ project, members, csrfToken, run, busy }) {
  const [email, setEmail] = useState("")
  const [memberRole, setMemberRole] = useState("Member")

  const ownerId =
    typeof project.ownerId === "object" ? project.ownerId?._id : project.ownerId

  const handleAdd = async (event) => {
    event.preventDefault()
    const added = await run(
      "add-member",
      () => api.addProjectMember(project._id, { email, memberRole }, csrfToken),
      "Member added to the team."
    )
    if (added) {
      setEmail("")
      setMemberRole("Member")
    }
  }

  const handleRoleChange = (member, nextRole) =>
    run(
      `member-role-${member.id}`,
      () =>
        api.updateProjectMember(
          project._id,
          member.id,
          { memberRole: nextRole },
          csrfToken
        ),
      "Member role updated."
    )

  const handleRemove = (member) => {
    if (
      !window.confirm(
        `Remove ${member.user.name} from this project? They can be added again later.`
      )
    ) {
      return
    }
    run(
      `member-remove-${member.id}`,
      () => api.removeProjectMember(project._id, member.id, csrfToken),
      "Member removed."
    )
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
      <div>
        <div className="flex items-center justify-between border-b border-line pb-3">
          <h2 className="text-lg font-black">Team members</h2>
          <span className="text-sm font-black text-quiet">
            {members.length} of {project.maxTeamSize}
          </span>
        </div>

        <div className="mt-4 grid gap-3">
          {members.length === 0 ? (
            <p className="border border-line bg-surface p-5 text-sm font-semibold text-faint">
              No team members yet.
            </p>
          ) : (
            members.map((member) => {
              const isOwner = member.user.id === ownerId
              const isBusy = busy === `member-role-${member.id}` ||
                busy === `member-remove-${member.id}`

              return (
                <div
                  key={member.id}
                  className="flex flex-col gap-4 border border-line bg-surface p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex min-w-0 items-start gap-3">
                    <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-charcoal text-sm font-black text-white">
                      {getInitials(member.user.name)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate font-black">{member.user.name}</p>
                        {isOwner && (
                          <span className="flex items-center gap-1 border border-ink bg-white px-2 py-0.5 text-xs font-black text-ink">
                            <Shield className="size-3" />
                            Owner
                          </span>
                        )}
                      </div>
                      <p className="truncate text-sm font-semibold text-subtle">
                        {member.user.headline || member.user.email || "Team member"}
                      </p>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs font-semibold text-faint">
                        {member.user.email && <span>{member.user.email}</span>}
                        {member.roleTitle && <span>· {member.roleTitle}</span>}
                        <span>· joined {formatDate(member.joinedAt)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    {isOwner ? (
                      <span className="border border-line bg-white px-2.5 py-1 text-xs font-black text-faint">
                        Owner
                      </span>
                    ) : (
                      <>
                        <Select
                          className="h-9 w-32 text-xs"
                          value={member.memberRole}
                          disabled={isBusy}
                          onChange={(value) => handleRoleChange(member, value)}
                          options={MEMBER_ROLES}
                          ariaLabel={`Role for ${member.user.name}`}
                        />
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() => handleRemove(member)}
                          className="flex size-9 items-center justify-center border border-line bg-white text-red-600 transition hover:border-red-600 disabled:opacity-50"
                          aria-label={`Remove ${member.user.name}`}
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      <aside className="space-y-4 self-start">
        <form
          onSubmit={handleAdd}
          className="border border-ink bg-surface p-5"
        >
          <h2 className="text-lg font-black">Add a member</h2>
          <p className="mt-1 text-sm font-semibold text-subtle">
            Add an existing GroupHub user by email. They join immediately.
          </p>
          <div className="mt-4 space-y-3">
            <Field label="Email address">
              <input
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="teammate@example.com"
                className="h-11 w-full border border-line bg-white px-3 font-semibold outline-none focus:border-ink"
              />
            </Field>
            <Field label="Team role">
              <Select
                className="h-11"
                value={memberRole}
                onChange={setMemberRole}
                options={MEMBER_ROLES}
              />
            </Field>
            <button
              type="submit"
              disabled={busy === "add-member"}
              className="inline-flex h-11 w-full items-center justify-center gap-2 bg-ink text-sm font-black text-white transition hover:bg-transparent hover:text-ink disabled:opacity-60"
            >
              <UserPlus className="size-4" />
              {busy === "add-member" ? "Adding…" : "Add member"}
            </button>
          </div>
        </form>

        <div className="border border-line bg-surface p-5">
          <p className="text-xs font-black uppercase tracking-[0.14em] text-faint">
            How team roles work
          </p>
          <ul className="mt-3 space-y-2 text-sm font-semibold text-subtle">
            <li>
              <span className="font-black text-ink">Admin</span> can help manage
              the project.
            </li>
            <li>
              <span className="font-black text-ink">Mentor</span> guides the team
              without owning it.
            </li>
            <li>
              <span className="font-black text-ink">Member</span> contributes to
              the project.
            </li>
          </ul>
        </div>
      </aside>
    </div>
  )
}

function RoleForm({ initialRole, onSubmit, onCancel, busy }) {
  const [form, setForm] = useState({
    title: initialRole?.title || "",
    description: initialRole?.description || "",
    skills: initialRole?.skills || [],
    slots: initialRole?.slots || 1,
    status: initialRole?.status || "Open",
  })
  const [error, setError] = useState("")

  const submit = (event) => {
    event.preventDefault()
    if (!form.title.trim()) {
      setError("A role title is required.")
      return
    }
    setError("")
    onSubmit({
      title: form.title.trim(),
      description: form.description.trim(),
      skills: form.skills,
      slots: Number(form.slots) || 1,
      status: form.status,
    })
  }

  return (
    <form onSubmit={submit} className="mt-4 space-y-4 border-t border-line pt-4">
      <div className="grid gap-4 sm:grid-cols-[1fr_120px_140px]">
        <Field label="Role title">
          <input
            value={form.title}
            maxLength={80}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, title: event.target.value }))
            }
            placeholder="e.g. Frontend developer"
            className="h-11 w-full border border-line bg-white px-3 font-semibold outline-none focus:border-ink"
          />
        </Field>
        <Field label="Slots">
          <input
            type="number"
            min="1"
            value={form.slots}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, slots: event.target.value }))
            }
            className="h-11 w-full border border-line bg-white px-3 font-semibold outline-none focus:border-ink"
          />
        </Field>
        <Field label="Status">
          <Select
            className="h-11"
            value={form.status}
            onChange={(value) =>
              setForm((prev) => ({ ...prev, status: value }))
            }
            options={ROLE_STATUS}
          />
        </Field>
      </div>

      <Field
        label="Role description"
        hint={
          <span className="text-xs font-semibold text-faint">
            {form.description.length}/1000
          </span>
        }
      >
        <textarea
          value={form.description}
          maxLength={1000}
          onChange={(event) =>
            setForm((prev) => ({ ...prev, description: event.target.value }))
          }
          placeholder="What will this person do?"
          className="min-h-24 w-full border border-line bg-white p-3 font-semibold outline-none focus:border-ink"
        />
      </Field>

      <div>
        <p className="mb-2 text-xs font-black uppercase tracking-[0.14em] text-faint">
          Skills for this role
        </p>
        <ChipPicker
          suggestions={SKILLS}
          placeholder="Add a skill…"
          value={form.skills}
          onChange={(skills) => setForm((prev) => ({ ...prev, skills }))}
        />
      </div>

      {error && <p className="text-sm font-semibold text-red-600">{error}</p>}

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={busy}
          className="inline-flex h-10 items-center justify-center bg-ink px-5 text-sm font-black text-white transition hover:bg-transparent hover:text-ink disabled:opacity-60"
        >
          {busy ? "Saving…" : initialRole ? "Save role" : "Add role"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex h-10 items-center justify-center border border-ink px-5 text-sm font-black transition hover:bg-ink hover:text-white"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}

function RolesTab({ project, roles, csrfToken, run, busy }) {
  const [adding, setAdding] = useState(false)
  const [editingId, setEditingId] = useState(null)

  const handleCreate = async (payload) => {
    const created = await run(
      "create-role",
      () => api.addProjectRole(project._id, payload, csrfToken),
      "Role added."
    )
    if (created) setAdding(false)
  }

  const handleUpdate = async (roleId, payload) => {
    const updated = await run(
      `edit-role-${roleId}`,
      () => api.updateProjectRole(project._id, roleId, payload, csrfToken),
      "Role updated."
    )
    if (updated) setEditingId(null)
  }

  const handleDelete = (role) => {
    if (
      !window.confirm(
        `Delete the "${role.title}" role? Pending applications for this role will also be removed.`
      )
    ) {
      return
    }
    run(
      `delete-role-${role.id}`,
      () => api.deleteProjectRole(project._id, role.id, csrfToken),
      "Role removed."
    )
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-3">
        <div>
          <h2 className="text-lg font-black">Open roles</h2>
          <p className="mt-0.5 text-sm font-semibold text-subtle">
            Add, edit, or close the roles people can apply to.
          </p>
        </div>
        {!adding && (
          <button
            type="button"
            onClick={() => {
              setAdding(true)
              setEditingId(null)
            }}
            className="inline-flex h-10 items-center gap-2 bg-ink px-4 text-sm font-black text-white transition hover:bg-transparent hover:text-ink"
          >
            <Plus className="size-4" />
            Add role
          </button>
        )}
      </div>

      {adding && (
        <div className="mt-4 border border-ink bg-surface p-5">
          <h3 className="text-sm font-black uppercase tracking-[0.14em] text-faint">
            New role
          </h3>
          <RoleForm
            onSubmit={handleCreate}
            onCancel={() => setAdding(false)}
            busy={busy === "create-role"}
          />
        </div>
      )}

      <div className="mt-4 grid gap-3">
        {roles.length === 0 && !adding ? (
          <p className="border border-line bg-surface p-6 text-sm font-semibold text-faint">
            No roles yet. Add the first role so people can apply.
          </p>
        ) : (
          roles.map((role) => {
            const isEditing = editingId === role.id
            const isBusy =
              busy === `edit-role-${role.id}` ||
              busy === `delete-role-${role.id}`

            return (
              <article
                key={role.id}
                className="border border-line bg-surface p-5"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="bg-charcoal px-2.5 py-1 text-xs font-black uppercase tracking-[0.12em] text-white">
                        {role.title}
                      </span>
                      <span
                        className={`border px-2.5 py-1 text-xs font-black ${
                          role.status === "Open"
                            ? "border-ink bg-white text-ink"
                            : "border-line bg-white text-faint"
                        }`}
                      >
                        {role.status}
                      </span>
                    </div>
                    {role.description && (
                      <p className="mt-3 max-w-2xl text-sm font-semibold leading-relaxed text-subtle">
                        {role.description}
                      </p>
                    )}
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

                  {!isEditing && (
                    <div className="flex shrink-0 gap-2">
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => {
                          setEditingId(role.id)
                          setAdding(false)
                        }}
                        className="inline-flex h-9 items-center gap-1.5 border border-ink px-3 text-xs font-black transition hover:bg-ink hover:text-white disabled:opacity-50"
                      >
                        <Wrench className="size-3.5" />
                        Edit
                      </button>
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => handleDelete(role)}
                        className="inline-flex h-9 items-center gap-1.5 border border-line px-3 text-xs font-black text-red-600 transition hover:border-red-600 disabled:opacity-50"
                      >
                        <Trash2 className="size-3.5" />
                        Delete
                      </button>
                    </div>
                  )}
                </div>

                <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 border-t border-line pt-3 text-xs font-semibold text-faint">
                  <span className="flex items-center gap-1.5">
                    <Users className="size-3.5" />
                    {role.spotsRemaining} of {role.slots} spots open
                  </span>
                  <span className="flex items-center gap-1.5">
                    <UserPlus className="size-3.5" />
                    {role.applicants} applicant{role.applicants === 1 ? "" : "s"}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="size-3.5" />
                    {role.accepted} accepted
                  </span>
                  {role.pending > 0 && (
                    <span className="flex items-center gap-1.5">
                      <Clock className="size-3.5" />
                      {role.pending} pending
                    </span>
                  )}
                </div>

                {isEditing && (
                  <RoleForm
                    initialRole={role}
                    onSubmit={(payload) => handleUpdate(role.id, payload)}
                    onCancel={() => setEditingId(null)}
                    busy={busy === `edit-role-${role.id}`}
                  />
                )}
              </article>
            )
          })
        )}
      </div>
    </div>
  )
}

function SettingsTab({ project, csrfToken, run, busy }) {
  const [form, setForm] = useState({
    title: project.title || "",
    description: project.description || "",
    whyBuilding: project.whyBuilding || "",
    targetAudience: project.targetAudience || "",
    currentStatus: project.currentStatus || "",
    contactInfo: project.contactInfo || "",
    location: project.location || "",
    category: project.category || "",
    stage: project.stage || "Idea",
    status: project.status || "Recruiting",
    visibility: project.visibility || "public",
    joinPolicy: project.joinPolicy || "approval",
    commitment: project.commitment || "3 hrs/week",
    compensation: project.compensation || "volunteer",
    experienceLevel: project.experienceLevel || "any",
    maxTeamSize: project.maxTeamSize || 1,
    startDate: toDateInput(project.startDate),
    targetEndDate: toDateInput(project.targetEndDate),
    skills: project.skills || [],
    tags: project.tags || [],
  })

  const update = (key) => (event) =>
    setForm((prev) => ({ ...prev, [key]: event.target.value }))

  const updateValue = (key) => (value) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const submit = (event) => {
    event.preventDefault()
    run(
      "save-project",
      () =>
        api.updateProject(
          project._id,
          {
            ...form,
            maxTeamSize: Number(form.maxTeamSize) || 1,
            startDate: form.startDate || null,
            targetEndDate: form.targetEndDate || null,
          },
          csrfToken
        ),
      "Project information updated."
    )
  }

  return (
    <form onSubmit={submit} className="space-y-8">
      <div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-3">
          <div>
            <h2 className="text-lg font-black">Project information</h2>
            <p className="mt-0.5 text-sm font-semibold text-subtle">
              Changes are visible on the public project page immediately.
            </p>
          </div>
          <button
            type="submit"
            disabled={busy === "save-project"}
            className="inline-flex h-10 items-center gap-2 bg-ink px-5 text-sm font-black text-white transition hover:bg-transparent hover:text-ink disabled:opacity-60"
          >
            <CheckCircle2 className="size-4" />
            {busy === "save-project" ? "Saving…" : "Save changes"}
          </button>
        </div>

        <div className="mt-5 grid gap-5">
          <Field
            label="Project title"
            hint={
              <span className="text-xs font-semibold text-faint">
                {form.title.length}/120
              </span>
            }
          >
            <input
              value={form.title}
              maxLength={120}
              onChange={update("title")}
              className="h-11 w-full border border-line bg-white px-3 font-semibold outline-none focus:border-ink"
            />
          </Field>

          <Field
            label="Description"
            hint={
              <span className="text-xs font-semibold text-faint">
                {form.description.length}/2000
              </span>
            }
          >
            <textarea
              value={form.description}
              maxLength={2000}
              onChange={update("description")}
              className="min-h-28 w-full border border-line bg-white p-3 font-semibold outline-none focus:border-ink"
            />
          </Field>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Why you are building it">
              <textarea
                value={form.whyBuilding}
                maxLength={2000}
                onChange={update("whyBuilding")}
                className="min-h-24 w-full border border-line bg-white p-3 font-semibold outline-none focus:border-ink"
              />
            </Field>
            <Field label="Current status">
              <textarea
                value={form.currentStatus}
                maxLength={1000}
                onChange={update("currentStatus")}
                className="min-h-24 w-full border border-line bg-white p-3 font-semibold outline-none focus:border-ink"
              />
            </Field>
          </div>

          <Field label="Target audience">
            <input
              value={form.targetAudience}
              maxLength={500}
              onChange={update("targetAudience")}
              className="h-11 w-full border border-line bg-white px-3 font-semibold outline-none focus:border-ink"
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Field label="Category">
              <Select
                className="h-11"
                value={form.category}
                onChange={updateValue("category")}
                options={PROJECT_CATEGORIES}
              />
            </Field>
            <Field label="Stage">
              <Select
                className="h-11"
                value={form.stage}
                onChange={updateValue("stage")}
                options={PROJECT_STAGES}
              />
            </Field>
            <Field label="Status">
              <Select
                className="h-11"
                value={form.status}
                onChange={updateValue("status")}
                options={PROJECT_STATUS}
              />
            </Field>
            <Field label="Visibility">
              <Select
                className="h-11"
                value={form.visibility}
                onChange={updateValue("visibility")}
                options={PROJECT_VISIBILITY}
              />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Field label="Join policy">
              <Select
                className="h-11"
                value={form.joinPolicy}
                onChange={updateValue("joinPolicy")}
                options={PROJECT_JOIN_POLICY}
              />
            </Field>
            <Field label="Commitment">
              <Select
                className="h-11"
                value={form.commitment}
                onChange={updateValue("commitment")}
                options={COMMITMENT}
              />
            </Field>
            <Field label="Compensation">
              <Select
                className="h-11"
                value={form.compensation}
                onChange={updateValue("compensation")}
                options={COMPENSATION}
              />
            </Field>
            <Field label="Experience level">
              <Select
                className="h-11"
                value={form.experienceLevel}
                onChange={updateValue("experienceLevel")}
                options={EXPERIENCE_LEVEL}
              />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Field label="Location">
              <input
                value={form.location}
                maxLength={80}
                onChange={update("location")}
                className="h-11 w-full border border-line bg-white px-3 font-semibold outline-none focus:border-ink"
              />
            </Field>
            <Field label="Max team size">
              <input
                type="number"
                min="1"
                value={form.maxTeamSize}
                onChange={update("maxTeamSize")}
                className="h-11 w-full border border-line bg-white px-3 font-semibold outline-none focus:border-ink"
              />
            </Field>
            <Field label="Start date">
              <input
                type="date"
                value={form.startDate}
                onChange={update("startDate")}
                className="h-11 w-full border border-line bg-white px-3 font-semibold outline-none focus:border-ink"
              />
            </Field>
            <Field label="Target end date">
              <input
                type="date"
                value={form.targetEndDate}
                onChange={update("targetEndDate")}
                className="h-11 w-full border border-line bg-white px-3 font-semibold outline-none focus:border-ink"
              />
            </Field>
          </div>

          <Field label="Contact for questions">
            <input
              value={form.contactInfo}
              maxLength={500}
              onChange={update("contactInfo")}
              className="h-11 w-full border border-line bg-white px-3 font-semibold outline-none focus:border-ink"
            />
          </Field>
        </div>
      </div>

      <div className="border border-line bg-surface p-5">
        <h2 className="text-lg font-black">Skills & tags</h2>
        <p className="mt-1 text-sm font-semibold text-subtle">
          Skills power discovery and recommendations.
        </p>
        <div className="mt-5 grid gap-6">
          <div>
            <p className="mb-2 text-xs font-black uppercase tracking-[0.14em] text-faint">
              Skills
            </p>
            <ChipPicker
              suggestions={SKILLS}
              placeholder="Add a skill…"
              value={form.skills}
              onChange={(skills) => setForm((prev) => ({ ...prev, skills }))}
            />
          </div>
          <div>
            <p className="mb-2 text-xs font-black uppercase tracking-[0.14em] text-faint">
              Tags
            </p>
            <ChipPicker
              suggestions={PROJECT_TAGS}
              placeholder="Add a tag…"
              value={form.tags}
              onChange={(tags) => setForm((prev) => ({ ...prev, tags }))}
            />
          </div>
        </div>
      </div>
    </form>
  )
}

function LibraryTab() {
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-3">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-black">
            Shared library
            <span className="border border-line bg-white px-2 py-0.5 text-xs font-black text-faint">
              Coming soon
            </span>
          </h2>
          <p className="mt-0.5 text-sm font-semibold text-subtle">
            A shared space for project documents, assets, and files.
          </p>
        </div>
        <div className="flex gap-2 opacity-50">
          <button
            type="button"
            disabled
            className="inline-flex h-10 cursor-not-allowed items-center gap-2 border border-line bg-white px-4 text-sm font-black text-faint"
          >
            <Plus className="size-4" />
            New folder
          </button>
          <button
            type="button"
            disabled
            className="inline-flex h-10 cursor-not-allowed items-center gap-2 bg-ink px-4 text-sm font-black text-white opacity-60"
          >
            <FileText className="size-4" />
            Upload file
          </button>
        </div>
      </div>

      <div className="mt-5 cursor-not-allowed select-none opacity-55">
        <div className="border-2 border-dashed border-line bg-surface p-10 text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full border border-line bg-white">
            <Lock className="size-5 text-quiet" />
          </div>
          <p className="mt-4 text-xl font-black text-ink">
            Shared library is coming soon
          </p>
          <p className="mx-auto mt-2 max-w-lg text-sm font-semibold text-subtle">
            Store briefs, designs, contracts, and project assets in one place.
            Uploads, folders, and sharing permissions will be enabled here in a
            future update.
          </p>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {["Project briefs", "Design assets", "Research & docs"].map((label) => (
            <div
              key={label}
              className="flex items-center gap-3 border border-line bg-surface p-4"
            >
              <div className="flex size-10 items-center justify-center border border-line bg-white">
                <FolderOpen className="size-4 text-quiet" />
              </div>
              <div>
                <p className="text-sm font-black text-ink">{label}</p>
                <p className="text-xs font-semibold text-faint">No files yet</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function ProjectManager({ data, csrfToken, onRefresh, onPreview }) {
  const { project, roles = [], members = [] } = data
  const [tab, setTab] = useState("overview")
  const [busy, setBusy] = useState(null)
  const [notice, setNotice] = useState("")
  const [error, setError] = useState("")

  const run = async (key, action, successMessage) => {
    setBusy(key)
    setError("")
    setNotice("")
    try {
      await action()
      setNotice(successMessage)
      onRefresh()
      return true
    } catch (actionError) {
      setError(actionError.message || "Something went wrong.")
      return false
    } finally {
      setBusy(null)
    }
  }

  const tabs = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "team", label: "Team", icon: Users },
    { id: "roles", label: "Roles", icon: Briefcase },
    { id: "settings", label: "Settings", icon: Settings },
    { id: "library", label: "Shared library", icon: FolderOpen },
  ]

  return (
    <div className="min-h-screen bg-canvas text-ink">
      <PageHeader
        eyebrow={`Owner workspace · ${project.category}`}
        title={project.title}
        description="Run this project: manage the team, open roles, project information, and shared files."
        actions={
          <div className="mt-6 flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex w-fit px-2.5 py-1 text-xs font-black ${
                projectStatusClass[project.status] ||
                "border border-line bg-white text-subtle"
              }`}
            >
              {project.status}
            </span>
            <span className="flex items-center gap-1.5 border border-line bg-white px-2.5 py-1 text-xs font-black text-subtle">
              <Users className="size-3" />
              {members.length} of {project.maxTeamSize} members
            </span>
            <span className="flex items-center gap-1.5 border border-line bg-white px-2.5 py-1 text-xs font-black text-subtle">
              <Briefcase className="size-3" />
              {roles.filter((role) => role.status === "Open").length} open roles
            </span>
          </div>
        }
      />

      <section className="px-6 py-8 sm:px-10 lg:px-20 xl:px-28">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onPreview}
              className="inline-flex h-10 items-center gap-2 border border-ink px-4 text-sm font-black transition hover:bg-ink hover:text-white"
            >
              <Eye className="size-4" />
              View public page
            </button>
            <Link
              href="/find-projects"
              className="inline-flex h-10 items-center gap-2 border border-line bg-white px-4 text-sm font-black text-subtle transition hover:border-ink hover:text-ink"
            >
              <ArrowLeft className="size-4" />
              All projects
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex h-10 items-center gap-2 border border-line bg-white px-4 text-sm font-black text-subtle transition hover:border-ink hover:text-ink"
            >
              <LayoutDashboard className="size-4" />
              Dashboard
            </Link>
          </div>
        </div>

        <div className="border-b border-line">
          <div className="flex flex-wrap gap-1">
            {tabs.map((tabItem) => {
              const Icon = tabItem.icon
              const active = tab === tabItem.id
              return (
                <button
                  key={tabItem.id}
                  type="button"
                  onClick={() => setTab(tabItem.id)}
                  className={`inline-flex h-11 items-center gap-2 border-b-2 px-4 text-sm font-black transition ${
                    active
                      ? "border-ink text-ink"
                      : "border-transparent text-quiet hover:text-ink"
                  }`}
                >
                  <Icon className="size-4" />
                  {tabItem.label}
                </button>
              )
            })}
          </div>
        </div>

        {(notice || error) && (
          <div
            className={`mt-5 border px-4 py-3 text-sm font-bold ${
              error
                ? "border-red-300 bg-red-50 text-red-700"
                : "border-ink bg-white text-ink"
            }`}
          >
            {error || notice}
          </div>
        )}

        <div className="mt-6">
          {tab === "overview" && (
            <OverviewTab
              project={project}
              roles={roles}
              members={members}
              onTab={setTab}
            />
          )}
          {tab === "team" && (
            <TeamTab
              project={project}
              members={members}
              csrfToken={csrfToken}
              run={run}
              busy={busy}
            />
          )}
          {tab === "roles" && (
            <RolesTab
              project={project}
              roles={roles}
              csrfToken={csrfToken}
              run={run}
              busy={busy}
            />
          )}
          {tab === "settings" && (
            <SettingsTab
              project={project}
              csrfToken={csrfToken}
              run={run}
              busy={busy}
            />
          )}
          {tab === "library" && <LibraryTab />}
        </div>
      </section>
    </div>
  )
}
