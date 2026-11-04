"use client"

import { useRef, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useDispatch, useSelector } from "react-redux"
import { ArrowLeft, RefreshCw, Sparkles } from "lucide-react"

import { PageHeader } from "@/components/page-header"
import { ChipPicker } from "@/components/chip-picker"
import { api } from "@/lib/api"
import { createProject } from "@/lib/features/projects/projectsSlice"
import {
  PROJECT_CATEGORIES,
  PROJECT_STAGES,
  PROJECT_VISIBILITY,
  PROJECT_JOIN_POLICY,
  COMMITMENT,
  COMPENSATION,
  EXPERIENCE_LEVEL,
  SKILLS,
  PROJECT_TAGS,
} from "@/lib/data/enums"

const TITLE_MAX = 120
const DESC_MAX = 2000
const WHY_MAX = 2000
const AUDIENCE_MAX = 500
const STATUS_MAX = 1000
const CONTACT_MAX = 500

const emptyForm = {
  title: "",
  description: "",
  whyBuilding: "",
  targetAudience: "",
  compensation: "",
  experienceLevel: "",
  currentStatus: "",
  targetEndDate: "",
  contactInfo: "",
  category: "",
  stage: "Idea",
  visibility: "public",
  joinPolicy: "approval",
  commitment: "3 hrs/week",
  location: "Remote",
  maxTeamSize: "5",
  startDate: "",
  skills: [],
  tags: [],
  roles: [
    { title: "", description: "", skills: [], slots: 1, status: "Open" },
  ],
}

function validate(form) {
  const errors = {}
  const title = form.title.trim()
  const description = form.description.trim()
  const audience = form.targetAudience.trim()

  if (!title) errors.title = "A project title is required."
  else if (title.length > TITLE_MAX)
    errors.title = `Keep the title under ${TITLE_MAX} characters.`

  if (!description) errors.description = "Tell people what you are building."
  else if (description.length > DESC_MAX)
    errors.description = `Keep the description under ${DESC_MAX} characters.`

  if (!audience) errors.targetAudience = "Who will this help?"
  else if (audience.length > AUDIENCE_MAX)
    errors.targetAudience = `Keep it under ${AUDIENCE_MAX} characters.`

  if (!form.compensation) errors.compensation = "Pick a compensation model."
  if (!form.experienceLevel) errors.experienceLevel = "Pick an experience level."

  if (!form.category) errors.category = "Pick a category."

  const size = Number(form.maxTeamSize)
  if (!/^\d+$/.test(String(form.maxTeamSize).trim()) || size < 1)
    errors.maxTeamSize = "Must be a whole number of at least 1."

  if (!Array.isArray(form.roles) || form.roles.length === 0) {
    errors.roles = "At least one role is required."
  } else {
    form.roles.forEach((role, idx) => {
      if (!role.title?.trim()) {
        errors.roles = `Role ${idx + 1} needs a title.`
      }
    })
  }

  return errors
}

function Field({ label, required, error, hint, children }) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <label className="text-xs font-black uppercase tracking-[0.14em] text-faint">
          {label} {required && <span className="text-red-600">*</span>}
        </label>
        {hint}
      </div>
      {children}
      {error && (
        <p className="mt-1 text-xs font-semibold text-red-600">{error}</p>
      )}
    </div>
  )
}

function FormSection({ number, title, description, children }) {
  return (
    <section className="px-4 py-5 sm:px-6">
      <div className="flex items-start gap-3">
        <span className="flex size-7 shrink-0 items-center justify-center bg-charcoal text-sm font-black text-white">
          {number}
        </span>
        <div>
          <h3 className="text-sm font-black uppercase tracking-[0.14em] text-ink">
            {title}
          </h3>
          {description && (
            <p className="mt-0.5 text-xs font-semibold text-faint">{description}</p>
          )}
        </div>
      </div>
      <div className="mt-4">{children}</div>
    </section>
  )
}

function CategoryPicker({ value, onChange, error }) {
  return (
    <div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
        {PROJECT_CATEGORIES.map((cat) => {
          const selected = value === cat
          return (
            <button
              key={cat}
              type="button"
              onClick={() => onChange(cat)}
              aria-pressed={selected}
              className={`h-11 border px-3 text-left text-sm font-bold transition ${
                selected
                  ? "border-ink bg-ink text-white"
                  : "border-line bg-white text-subtle hover:border-ink hover:text-ink"
              }`}
            >
              {cat}
            </button>
          )
        })}
      </div>
      {error && <p className="mt-1.5 text-xs font-semibold text-red-600">{error}</p>}
    </div>
  )
}

/** Dedicated page for creating a new project. */
export default function NewProjectPage() {
  const dispatch = useDispatch()
  const router = useRouter()
  const csrfToken = useSelector((state) => state.auth.csrfToken)
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState({})
  const [submitError, setSubmitError] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [rewriting, setRewriting] = useState(false)
  const [rewriteError, setRewriteError] = useState(null)
  const [suggesting, setSuggesting] = useState(false)
  const [suggestError, setSuggestError] = useState(null)
  const titleRef = useRef(null)

  const update = (key) => (e) => {
    const value = e.target.value
    setForm((prev) => ({ ...prev, [key]: value }))
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  const setArray = (key) => (value) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const aiContext = () => ({
    title: form.title,
    whyBuilding: form.whyBuilding,
    description: form.description,
    category: form.category,
    targetAudience: form.targetAudience,
    currentStatus: form.currentStatus,
  })

  const handleRewrite = async () => {
    setRewriteError(null)
    setRewriting(true)
    try {
      const { description } = await api.rewriteDescription(aiContext(), csrfToken)
      setForm((prev) => ({ ...prev, description }))
    } catch (error) {
      setRewriteError(error.message || "Failed to rewrite description.")
    } finally {
      setRewriting(false)
    }
  }

  const handleSuggest = async () => {
    setSuggestError(null)
    setSuggesting(true)
    try {
      const { skills } = await api.recommendSkills(aiContext(), csrfToken)
      setForm((prev) => {
        const merged = [...prev.skills]
        for (const skill of skills) {
          const key = skill.toLowerCase()
          if (!merged.some((s) => s.toLowerCase() === key) && merged.length < 30) {
            merged.push(skill)
          }
        }
        return { ...prev, skills: merged }
      })
    } catch (error) {
      setSuggestError(error.message || "Failed to get skill suggestions.")
    } finally {
      setSuggesting(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitError(null)

    const nextErrors = validate(form)
    setErrors(nextErrors)
    if (Object.values(nextErrors).some(Boolean)) return

    const maxTeamSize = Number(form.maxTeamSize)

    setSubmitting(true)
    try {
      await dispatch(
        createProject({
          title: form.title,
          description: form.description,
          whyBuilding: form.whyBuilding.trim(),
          targetAudience: form.targetAudience.trim(),
          compensation: form.compensation,
          experienceLevel: form.experienceLevel,
          currentStatus: form.currentStatus.trim(),
          targetEndDate: form.targetEndDate ? new Date(form.targetEndDate).toISOString() : undefined,
          contactInfo: form.contactInfo.trim(),
          category: form.category,
          stage: form.stage,
          visibility: form.visibility,
          joinPolicy: form.joinPolicy,
          commitment: form.commitment,
          location: form.location.trim() || "Remote",
          maxTeamSize,
          startDate: form.startDate ? new Date(form.startDate).toISOString() : undefined,
          skills: form.skills,
          tags: form.tags,
          roles: form.roles.map((r) => ({
            title: r.title.trim(),
            description: (r.description || "").trim(),
            skills: r.skills,
            slots: Number(r.slots) || 1,
            status: r.status,
          })),
        })
      ).unwrap()
      router.push("/dashboard")
    } catch (error) {
      setSubmitError(error.message || "Failed to create project.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-canvas text-ink">
      <PageHeader
        eyebrow="Workspace"
        title="Create a new project."
        description="Define the idea, the skills you need, and how the team will work."
      />

      <section className="px-6 pb-20 sm:px-10 lg:px-20 xl:px-28">
        <Link
          href="/dashboard"
          className="mb-6 mt-6 inline-flex items-center gap-2 text-sm font-black underline underline-offset-4"
        >
          <ArrowLeft className="size-4" />
          Back to dashboard
        </Link>

        <form
          className="w-full divide-y divide-line border border-ink bg-surface"
          onSubmit={handleSubmit}
          noValidate
        >
          <FormSection
            number={1}
            title="Basics"
            description="A clear title and description help people understand your project."
          >
            <div className="space-y-4">
              <Field
                label="Project title"
                required
                error={errors.title}
                hint={
                  <span className="text-xs font-semibold text-faint">
                    {form.title.length}/{TITLE_MAX}
                  </span>
                }
              >
                <input
                  ref={titleRef}
                  maxLength={TITLE_MAX}
                  className={`h-11 w-full border bg-white px-3 font-semibold outline-none focus:border-ink ${
                    errors.title ? "border-red-600" : "border-line"
                  }`}
                  placeholder="e.g. AI-Powered Study Companion"
                  value={form.title}
                  onChange={update("title")}
                />
              </Field>
              <Field
                label="What are you building?"
                required
                error={errors.description}
                hint={
                  <div className="flex items-center gap-2">
                    {rewriteError && (
                      <span className="text-xs font-semibold text-red-600">{rewriteError}</span>
                    )}
                    <span className="text-xs font-semibold text-faint">
                      {form.description.length}/{DESC_MAX}
                    </span>
                  </div>
                }
              >
                <textarea
                  maxLength={DESC_MAX}
                  className={`min-h-28 w-full border bg-white p-3 font-semibold outline-none focus:border-ink ${
                    errors.description ? "border-red-600" : "border-line"
                  }`}
                  placeholder="Describe the idea, the problem, and the goal."
                  value={form.description}
                  onChange={update("description")}
                />
                <button
                  type="button"
                  onClick={handleRewrite}
                  disabled={rewriting || !form.description.trim()}
                  className="mt-2 inline-flex h-9 items-center gap-2 border border-ink bg-white px-3 text-xs font-black text-ink transition hover:bg-ink hover:text-white disabled:opacity-50"
                >
                  {rewriting ? (
                    <RefreshCw className="size-4 animate-spin" />
                  ) : (
                    <Sparkles className="size-4" />
                  )}
                  {rewriting ? "Rewriting…" : "Rewrite with AI"}
                </button>
              </Field>
              <Field
                label="Why are you building this?"
                error={errors.whyBuilding}
                hint={
                  <span className="text-xs font-semibold text-faint">
                    {form.whyBuilding.length}/{WHY_MAX}
                  </span>
                }
              >
                <textarea
                  maxLength={WHY_MAX}
                  className="min-h-24 w-full border border-line bg-white p-3 font-semibold outline-none focus:border-ink"
                  placeholder="What motivated you to start? What problem are you trying to solve?"
                  value={form.whyBuilding}
                  onChange={update("whyBuilding")}
                />
              </Field>
            </div>
          </FormSection>

          <FormSection
            number={2}
            title="Impact"
            description="Help people see who benefits and how far along you are."
          >
            <div className="space-y-4">
              <Field
                label="Who is this for?"
                required
                error={errors.targetAudience}
                hint={
                  <span className="text-xs font-semibold text-faint">
                    {form.targetAudience.length}/{AUDIENCE_MAX}
                  </span>
                }
              >
                <input
                  maxLength={AUDIENCE_MAX}
                  className={`h-11 w-full border bg-white px-3 font-semibold outline-none focus:border-ink ${
                    errors.targetAudience ? "border-red-600" : "border-line"
                  }`}
                  placeholder="e.g. Students, small business owners, remote teams"
                  value={form.targetAudience}
                  onChange={update("targetAudience")}
                />
              </Field>
              <Field
                label="What's already done?"
                error={errors.currentStatus}
                hint={
                  <span className="text-xs font-semibold text-faint">
                    {form.currentStatus.length}/{STATUS_MAX}
                  </span>
                }
              >
                <textarea
                  maxLength={STATUS_MAX}
                  className="min-h-24 w-full border border-line bg-white p-3 font-semibold outline-none focus:border-ink"
                  placeholder="Share current progress or blockers (optional)."
                  value={form.currentStatus}
                  onChange={update("currentStatus")}
                />
              </Field>
            </div>
          </FormSection>

          <FormSection
            number={3}
            title="Classify your project"
            description="Pick a category, set expectations, and tell us how far along it is."
          >
            <div className="space-y-5">
              <div className="grid gap-5 lg:grid-cols-[1fr_280px]">
                <Field label="Category" required>
                  <CategoryPicker
                    value={form.category}
                    onChange={(value) => {
                      setForm((prev) => ({ ...prev, category: value }))
                      if (errors.category)
                        setErrors((prev) => ({ ...prev, category: undefined }))
                    }}
                    error={errors.category}
                  />
                </Field>
                <Field label="Stage">
                  <select
                    className="h-11 w-full border border-line bg-white px-3 font-semibold outline-none focus:border-ink"
                    value={form.stage}
                    onChange={update("stage")}
                  >
                    {PROJECT_STAGES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Compensation" required error={errors.compensation}>
                  <select
                    className={`h-11 w-full border bg-white px-3 font-semibold outline-none focus:border-ink ${
                      errors.compensation ? "border-red-600" : "border-line"
                    }`}
                    value={form.compensation}
                    onChange={update("compensation")}
                  >
                    <option value="">Select compensation</option>
                    {COMPENSATION.map((c) => (
                      <option key={c} value={c}>
                        {c.charAt(0).toUpperCase() + c.slice(1)}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Experience level" required error={errors.experienceLevel}>
                  <select
                    className={`h-11 w-full border bg-white px-3 font-semibold outline-none focus:border-ink ${
                      errors.experienceLevel ? "border-red-600" : "border-line"
                    }`}
                    value={form.experienceLevel}
                    onChange={update("experienceLevel")}
                  >
                    <option value="">Select experience level</option>
                    {EXPERIENCE_LEVEL.map((lvl) => (
                      <option key={lvl} value={lvl}>
                        {lvl.charAt(0).toUpperCase() + lvl.slice(1)}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>
            </div>
          </FormSection>

          <FormSection
            number={4}
            title="How your team works"
            description="Set expectations for who can join and how much time it needs."
          >
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Field label="Visibility">
                <select
                  className="h-11 w-full border border-line bg-white px-3 font-semibold outline-none focus:border-ink"
                  value={form.visibility}
                  onChange={update("visibility")}
                >
                  {PROJECT_VISIBILITY.map((v) => (
                    <option key={v} value={v}>
                      {v.charAt(0).toUpperCase() + v.slice(1)}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="How members join">
                <select
                  className="h-11 w-full border border-line bg-white px-3 font-semibold outline-none focus:border-ink"
                  value={form.joinPolicy}
                  onChange={update("joinPolicy")}
                >
                  {PROJECT_JOIN_POLICY.map((p) => (
                    <option key={p} value={p}>
                      {p.charAt(0).toUpperCase() + p.slice(1)}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Commitment">
                <select
                  className="h-11 w-full border border-line bg-white px-3 font-semibold outline-none focus:border-ink"
                  value={form.commitment}
                  onChange={update("commitment")}
                >
                  {COMMITMENT.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Location">
                <input
                  className="h-11 w-full border border-line bg-white px-3 font-semibold outline-none focus:border-ink"
                  placeholder="e.g. Remote, San Francisco"
                  value={form.location}
                  onChange={update("location")}
                />
              </Field>
              <Field label="Max team size" error={errors.maxTeamSize}>
                <input
                  type="number"
                  min="1"
                  className={`h-11 w-full border bg-white px-3 font-semibold outline-none focus:border-ink ${
                    errors.maxTeamSize ? "border-red-600" : "border-line"
                  }`}
                  value={form.maxTeamSize}
                  onChange={update("maxTeamSize")}
                />
              </Field>
              <Field label="Start date">
                <input
                  type="date"
                  className="h-11 w-full border border-line bg-white px-3 font-semibold outline-none focus:border-ink"
                  value={form.startDate}
                  onChange={update("startDate")}
                />
              </Field>
              <Field label="Target end date">
                <input
                  type="date"
                  className="h-11 w-full border border-line bg-white px-3 font-semibold outline-none focus:border-ink"
                  value={form.targetEndDate}
                  onChange={update("targetEndDate")}
                />
              </Field>
              <Field
                label="Contact for questions"
                error={errors.contactInfo}
                hint={
                  <span className="text-xs font-semibold text-faint">
                    {form.contactInfo.length}/{CONTACT_MAX}
                  </span>
                }
              >
                <input
                  maxLength={CONTACT_MAX}
                  className="h-11 w-full border border-line bg-white px-3 font-semibold outline-none focus:border-ink"
                  placeholder="e.g. Discord, email (optional)"
                  value={form.contactInfo}
                  onChange={update("contactInfo")}
                />
              </Field>
            </div>
          </FormSection>

          <FormSection
            number={5}
            title="Open roles"
            description="Define the roles you are hiring for. At least one role is required."
          >
            <div className="space-y-4">
              {form.roles.map((role, idx) => (
                <div
                  key={idx}
                  className="border border-line bg-white p-4 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-black uppercase tracking-[0.14em] text-faint">
                      Role {idx + 1}
                    </h4>
                    {form.roles.length > 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          setForm((prev) => ({
                            ...prev,
                            roles: prev.roles.filter((_, i) => i !== idx),
                          }))
                          if (errors.roles)
                            setErrors((prev) => ({ ...prev, roles: undefined }))
                        }}
                        className="text-xs font-semibold text-red-600 hover:text-red-700"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-black uppercase tracking-[0.14em] text-faint">
                        Role title <span className="text-red-600">*</span>
                      </label>
                      <input
                        maxLength={80}
                        className={`mt-1.5 h-11 w-full border bg-white px-3 font-semibold outline-none focus:border-ink ${
                          errors.roles ? "border-red-600" : "border-line"
                        }`}
                        placeholder="e.g. Frontend Developer"
                        value={role.title}
                        onChange={(e) => {
                          setForm((prev) => ({
                            ...prev,
                            roles: prev.roles.map((r, i) =>
                              i === idx ? { ...r, title: e.target.value } : r
                            ),
                          }))
                          if (errors.roles)
                            setErrors((prev) => ({ ...prev, roles: undefined }))
                        }}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-black uppercase tracking-[0.14em] text-faint">
                        Role description
                        <span className="text-xs font-semibold text-faint ml-2">
                          ({role.description?.length || 0}/1000)
                        </span>
                      </label>
                      <textarea
                        maxLength={1000}
                        className="mt-1.5 min-h-24 w-full border border-line bg-white p-3 font-semibold outline-none focus:border-ink"
                        placeholder="Describe what this role will do, key responsibilities, and what you're looking for."
                        value={role.description || ""}
                        onChange={(e) => {
                          setForm((prev) => ({
                            ...prev,
                            roles: prev.roles.map((r, i) =>
                              i === idx ? { ...r, description: e.target.value } : r
                            ),
                          }))
                        }}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-black uppercase tracking-[0.14em] text-faint">
                        Skills for this role
                      </label>
                      <ChipPicker
                        suggestions={SKILLS}
                        placeholder="Add a skill…"
                        value={role.skills}
                        onChange={(skills) => {
                          setForm((prev) => ({
                            ...prev,
                            roles: prev.roles.map((r, i) =>
                              i === idx ? { ...r, skills } : r
                            ),
                          }))
                        }}
                      />
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <label className="text-xs font-black uppercase tracking-[0.14em] text-faint">
                          Slots
                        </label>
                        <input
                          type="number"
                          min="1"
                          className="mt-1.5 h-11 w-full border border-line bg-white px-3 font-semibold outline-none focus:border-ink"
                          value={role.slots}
                          onChange={(e) => {
                            setForm((prev) => ({
                              ...prev,
                              roles: prev.roles.map((r, i) =>
                                i === idx ? { ...r, slots: Number(e.target.value) || 1 } : r
                              ),
                            }))
                          }}
                        />
                      </div>
                      <div>
                        <label className="text-xs font-black uppercase tracking-[0.14em] text-faint">
                          Status
                        </label>
                        <select
                          className="mt-1.5 h-11 w-full border border-line bg-white px-3 font-semibold outline-none focus:border-ink"
                          value={role.status}
                          onChange={(e) => {
                            setForm((prev) => ({
                              ...prev,
                              roles: prev.roles.map((r, i) =>
                                i === idx ? { ...r, status: e.target.value } : r
                              ),
                            }))
                          }}
                        >
                          <option value="Open">Open</option>
                          <option value="Filled">Filled</option>
                          <option value="Closed">Closed</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {form.roles.length < 5 && (
                <button
                  type="button"
                  onClick={() => {
                    setForm((prev) => ({
                      ...prev,
                      roles: [...prev.roles, { title: "", description: "", skills: [], slots: 1, status: "Open" }],
                    }))
                  }}
                  className="inline-flex items-center gap-2 border-2 border-dashed border-line bg-white px-4 py-2 text-sm font-black text-subtle transition hover:border-ink hover:text-ink"
                >
                  <span className="size-5 flex items-center justify-center border border-ink text-ink font-black">
                    +
                  </span>
                  Add another role
                </button>
              )}
              {errors.roles && (
                <p className="text-xs font-semibold text-red-600">{errors.roles}</p>
              )}
            </div>
          </FormSection>

          <FormSection
            number={6}
            title="Skills & tags"
            description="Click suggestions to add them, or type your own and press Enter."
          >
            <div className="space-y-5">
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-xs font-black uppercase tracking-[0.14em] text-faint">
                    Skills you need
                  </p>
                  <button
                    type="button"
                    onClick={handleSuggest}
                    disabled={suggesting}
                    className="inline-flex h-8 items-center gap-1.5 border border-ink bg-white px-3 text-xs font-black text-ink transition hover:bg-ink hover:text-white disabled:opacity-50"
                  >
                    {suggesting ? (
                      <RefreshCw className="size-3.5 animate-spin" />
                    ) : (
                      <Sparkles className="size-3.5" />
                    )}
                    {suggesting ? "Suggesting…" : "Suggest technologies"}
                  </button>
                </div>
                {suggestError && (
                  <p className="mb-2 text-xs font-semibold text-red-600">{suggestError}</p>
                )}
                <ChipPicker
                  suggestions={SKILLS}
                  placeholder="Add a custom skill…"
                  value={form.skills}
                  onChange={setArray("skills")}
                />
              </div>
              <div>
                <p className="mb-2 text-xs font-black uppercase tracking-[0.14em] text-faint">
                  Tags
                </p>
                <ChipPicker
                  suggestions={PROJECT_TAGS}
                  placeholder="Add a custom tag…"
                  value={form.tags}
                  onChange={setArray("tags")}
                />
              </div>
            </div>
          </FormSection>

          <div className="flex flex-col gap-3 bg-surface px-4 py-5 sm:px-6">
            {submitError && (
              <p className="text-sm font-semibold text-red-600">{submitError}</p>
            )}
            <div className="flex gap-3">
              <Link
                href="/dashboard"
                className="flex h-11 flex-1 items-center justify-center border border-ink font-black"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={submitting}
                className="h-11 flex-1 bg-ink font-black text-white transition hover:bg-transparent hover:text-ink disabled:opacity-60"
              >
                {submitting ? "Creating..." : "Create Project"}
              </button>
            </div>
          </div>
        </form>
      </section>
    </div>
  )
}