"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useDispatch, useSelector } from "react-redux"
import {
  ArrowRight,
  Download,
  FileText,
  Github,
  Globe,
  Linkedin,
  Lock,
  MapPin,
  RefreshCw,
  Save,
  Trash2,
  Upload,
  User,
} from "lucide-react"

import { ChipPicker } from "@/components/chip-picker"
import { PageHeader } from "@/components/page-header"
import { api } from "@/lib/api"
import { setUser } from "@/lib/features/auth/authSlice"
import { COMMITMENT, EXPERIENCE_LEVEL, SKILLS } from "@/lib/data/enums"
import { getInitials } from "@/lib/utils"
import {
  Skeleton,
  CardSkeleton,
  FormFieldSkeleton,
  ProfilePreviewSkeleton,
  TextSkeleton,
} from "@/components/skeleton"

const RESUME_MAX_BYTES = 5 * 1024 * 1024
const RESUME_EXTENSIONS = [".pdf", ".doc", ".docx"]

const emptyProfile = {
  name: "",
  username: "",
  headline: "",
  location: "",
  bio: "",
  skills: [],
  links: { github: "", website: "", linkedin: "" },
  availability: "",
  experienceLevel: "",
}

const emptyPassword = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
}

function profileFromUser(user) {
  return {
    name: user?.name || "",
    username: user?.username || "",
    headline: user?.headline || "",
    location: user?.location || "",
    bio: user?.bio || "",
    skills: user?.skills || [],
    links: {
      github: user?.links?.github || "",
      website: user?.links?.website || "",
      linkedin: user?.links?.linkedin || "",
    },
    availability: user?.availability || "",
    experienceLevel: user?.experienceLevel || "",
  }
}

function formatBytes(bytes) {
  if (!bytes) return "0 KB"
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatDate(value) {
  if (!value) return ""
  return new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

function toHref(value) {
  if (!value) return ""
  return /^https?:\/\//i.test(value) ? value : `https://${value}`
}

function Notice({ message }) {
  if (!message) return null
  return (
    <p
      role={message.type === "error" ? "alert" : "status"}
      className={`border px-3 py-2 text-sm font-semibold ${
        message.type === "error"
          ? "border-red-300 bg-red-50 text-red-700"
          : "border-line bg-white text-subtle"
      }`}
    >
      {message.text}
    </p>
  )
}

function FormField({ label, hint, children }) {
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

function SettingsSection({ title, description, children }) {
  return (
    <section className="border border-line bg-surface">
      <div className="border-b border-line px-5 py-4">
        <h2 className="text-xl font-black">{title}</h2>
        {description && (
          <p className="mt-1 text-sm font-semibold text-subtle">{description}</p>
        )}
      </div>
      <div className="space-y-5 p-5">{children}</div>
    </section>
  )
}

function ProfileLoading() {
  return (
    <div className="min-h-screen bg-canvas text-ink">
      <PageHeader
        eyebrow="Account"
        title="Account settings."
        description="Shape how teammates see you and keep your account secure."
      />
      <section className="px-6 py-8 sm:px-10 lg:px-20 xl:px-28">
        <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
          <div className="space-y-8">
            <CardSkeleton />
            <div>
              <Skeleton className="h-6 w-32 mb-1" />
              <Skeleton className="h-4 w-24" />
            </div>
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>

          <aside className="space-y-6 self-start lg:sticky lg:top-24">
            <ProfilePreviewSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </aside>
        </div>
      </section>
    </div>
  )
}

/** Authenticated account settings: profile, resume, and password. */
export default function ProfilePage() {
  const router = useRouter()
  const dispatch = useDispatch()
  const { user, initialized, csrfToken } = useSelector((state) => state.auth)

  const [form, setForm] = useState(emptyProfile)
  const [profileBusy, setProfileBusy] = useState(false)
  const [profileMessage, setProfileMessage] = useState(null)

  const [passwordForm, setPasswordForm] = useState(emptyPassword)
  const [passwordBusy, setPasswordBusy] = useState(false)
  const [passwordMessage, setPasswordMessage] = useState(null)

  const [resumeBusy, setResumeBusy] = useState(false)
  const [resumeMessage, setResumeMessage] = useState(null)
  const fileInputRef = useRef(null)

  useEffect(() => {
    if (initialized && !user) {
      router.replace("/account?next=/profile")
    }
  }, [initialized, user, router])

  useEffect(() => {
    if (user) setForm(profileFromUser(user))
  }, [user])

  if (!initialized || !user) return <ProfileLoading />

  const update = (key) => (event) => {
    setForm((prev) => ({ ...prev, [key]: event.target.value }))
    setProfileMessage(null)
  }

  const updateLink = (key) => (event) => {
    setForm((prev) => ({
      ...prev,
      links: { ...prev.links, [key]: event.target.value },
    }))
    setProfileMessage(null)
  }

  const handleProfileSave = async (event) => {
    event.preventDefault()
    setProfileMessage(null)

    if (!form.name.trim()) {
      setProfileMessage({ type: "error", text: "Your name is required." })
      return
    }

    setProfileBusy(true)
    try {
      const { user: updated } = await api.updateProfile(form, csrfToken)
      dispatch(setUser(updated))
      setForm(profileFromUser(updated))
      setProfileMessage({ type: "success", text: "Profile saved." })
    } catch (error) {
      setProfileMessage({
        type: "error",
        text: error.message || "Could not save your profile.",
      })
    } finally {
      setProfileBusy(false)
    }
  }

  const handlePasswordSave = async (event) => {
    event.preventDefault()
    setPasswordMessage(null)

    if (passwordForm.newPassword.length < 8) {
      setPasswordMessage({
        type: "error",
        text: "New password must be at least 8 characters.",
      })
      return
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordMessage({
        type: "error",
        text: "New passwords do not match.",
      })
      return
    }

    setPasswordBusy(true)
    try {
      const { message } = await api.changePassword(
        {
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        },
        csrfToken
      )
      setPasswordForm(emptyPassword)
      setPasswordMessage({
        type: "success",
        text: message || "Password updated.",
      })
    } catch (error) {
      setPasswordMessage({
        type: "error",
        text: error.message || "Could not update your password.",
      })
    } finally {
      setPasswordBusy(false)
    }
  }

  const handleResumeUpload = async (event) => {
    const file = event.target.files?.[0]
    event.target.value = ""
    if (!file) return

    const extension = `.${file.name.split(".").pop()?.toLowerCase()}`
    if (!RESUME_EXTENSIONS.includes(extension)) {
      setResumeMessage({
        type: "error",
        text: "Upload a PDF, DOC, or DOCX file.",
      })
      return
    }

    if (file.size > RESUME_MAX_BYTES) {
      setResumeMessage({
        type: "error",
        text: "Resume must be 5 MB or smaller.",
      })
      return
    }

    setResumeBusy(true)
    setResumeMessage(null)
    try {
      const { user: updated } = await api.uploadResume(file, csrfToken)
      dispatch(setUser(updated))
      setResumeMessage({ type: "success", text: "Resume uploaded." })
    } catch (error) {
      setResumeMessage({
        type: "error",
        text: error.message || "Could not upload your resume.",
      })
    } finally {
      setResumeBusy(false)
    }
  }

  const handleResumeDelete = async () => {
    if (!window.confirm("Remove your resume from your profile?")) return

    setResumeBusy(true)
    setResumeMessage(null)
    try {
      const { user: updated } = await api.deleteResume(csrfToken)
      dispatch(setUser(updated))
      setResumeMessage({ type: "success", text: "Resume removed." })
    } catch (error) {
      setResumeMessage({
        type: "error",
        text: error.message || "Could not remove your resume.",
      })
    } finally {
      setResumeBusy(false)
    }
  }

  const handleResumeDownload = async () => {
    setResumeBusy(true)
    setResumeMessage(null)
    try {
      const blob = await api.downloadResume()
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement("a")
      anchor.href = url
      anchor.download = user.resume?.originalName || "resume"
      document.body.appendChild(anchor)
      anchor.click()
      anchor.remove()
      URL.revokeObjectURL(url)
    } catch (error) {
      setResumeMessage({
        type: "error",
        text: error.message || "Could not download your resume.",
      })
    } finally {
      setResumeBusy(false)
    }
  }

  const completedFields = [
    form.name,
    form.username,
    form.headline,
    form.bio,
    form.location,
    form.skills.length > 0,
    Object.values(form.links).some(Boolean),
    form.availability,
    form.experienceLevel,
    user.resume,
  ].filter(Boolean).length
  const completeness = Math.round((completedFields / 10) * 100)

  const hasLinks =
    form.links.github || form.links.website || form.links.linkedin

  return (
    <div className="min-h-screen bg-canvas text-ink">
      <PageHeader
        eyebrow="Account"
        title="Account settings."
        description="Shape how teammates see you, share your resume, and keep your account secure."
        actions={
          <Link
            href="/dashboard"
            className="inline-flex h-11 items-center gap-2 border border-ink bg-ink px-5 text-sm font-black text-white transition hover:bg-transparent hover:text-ink"
          >
            Back to dashboard
            <ArrowRight className="size-4" />
          </Link>
        }
      />

      <section className="px-6 py-8 sm:px-10 lg:px-20 xl:px-28">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="space-y-8">
            <form onSubmit={handleProfileSave} className="space-y-8">
              <SettingsSection
                title="Profile"
                description="This appears on your projects and applications."
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField label="Full name">
                    <input
                      className="h-11 w-full border border-line bg-white px-3 font-semibold outline-none focus:border-ink"
                      value={form.name}
                      onChange={update("name")}
                      maxLength={80}
                      placeholder="Your name"
                    />
                  </FormField>
                  <FormField label="Username">
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-faint">@</span>
                      <input
                        className="h-11 w-full border border-line bg-white pl-7 pr-3 font-semibold outline-none focus:border-ink"
                        value={form.username}
                        onChange={update("username")}
                        maxLength={30}
                        placeholder="yourusername"
                        pattern="[a-z0-9_-]*"
                        autoComplete="off"
                        autoCorrect="off"
                        autoCapitalize="off"
                        spellCheck={false}
                      />
                    </div>
                    <p className="mt-1 text-xs font-semibold text-faint">
                      {form.username.length}/30 · lowercase, numbers, _ or -
                    </p>
                  </FormField>
                  <FormField label="Location">
                    <input
                      className="h-11 w-full border border-line bg-white px-3 font-semibold outline-none focus:border-ink"
                      value={form.location}
                      onChange={update("location")}
                      maxLength={80}
                      placeholder="City, country or Remote"
                    />
                  </FormField>
                </div>

                <FormField
                  label="Headline"
                  hint={
                    <span className="text-xs font-semibold text-faint">
                      {form.headline.length}/120
                    </span>
                  }
                >
                  <input
                    className="h-11 w-full border border-line bg-white px-3 font-semibold outline-none focus:border-ink"
                    value={form.headline}
                    onChange={update("headline")}
                    maxLength={120}
                    placeholder="e.g. Frontend developer who cares about accessibility"
                  />
                </FormField>

                <FormField
                  label="Bio"
                  hint={
                    <span className="text-xs font-semibold text-faint">
                      {form.bio.length}/1000
                    </span>
                  }
                >
                  <textarea
                    className="min-h-28 w-full border border-line bg-white p-3 font-semibold outline-none focus:border-ink"
                    value={form.bio}
                    onChange={update("bio")}
                    maxLength={1000}
                    placeholder="What do you like building? What are you learning next?"
                  />
                </FormField>
              </SettingsSection>

              <SettingsSection
                title="Skills & availability"
                description="Help projects understand what you bring and how much time you have."
              >
                <FormField label="Skills">
                  <ChipPicker
                    suggestions={SKILLS}
                    placeholder="Add a custom skill…"
                    value={form.skills}
                    onChange={(skills) => {
                      setForm((prev) => ({ ...prev, skills }))
                      setProfileMessage(null)
                    }}
                  />
                </FormField>

                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField label="Availability">
                    <select
                      className="h-11 w-full border border-line bg-white px-3 font-semibold outline-none focus:border-ink"
                      value={form.availability}
                      onChange={update("availability")}
                    >
                      <option value="">Not specified</option>
                      {COMMITMENT.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </FormField>

                  <FormField label="Experience level">
                    <select
                      className="h-11 w-full border border-line bg-white px-3 font-semibold outline-none focus:border-ink"
                      value={form.experienceLevel}
                      onChange={update("experienceLevel")}
                    >
                      <option value="">Not specified</option>
                      {EXPERIENCE_LEVEL.map((option) => (
                        <option key={option} value={option}>
                          {option.charAt(0).toUpperCase() + option.slice(1)}
                        </option>
                      ))}
                    </select>
                  </FormField>
                </div>
              </SettingsSection>

              <SettingsSection
                title="Links"
                description="Optional. Add a portfolio, GitHub, or LinkedIn profile."
              >
                <FormField label="GitHub">
                  <div className="flex items-center border border-line bg-white focus-within:border-ink">
                    <Github className="ml-3 size-4 shrink-0 text-faint" />
                    <input
                      className="h-11 min-w-0 flex-1 bg-transparent px-2 font-semibold outline-none"
                      value={form.links.github}
                      onChange={updateLink("github")}
                      maxLength={200}
                      placeholder="github.com/yourname"
                    />
                  </div>
                </FormField>

                <FormField label="Website">
                  <div className="flex items-center border border-line bg-white focus-within:border-ink">
                    <Globe className="ml-3 size-4 shrink-0 text-faint" />
                    <input
                      className="h-11 min-w-0 flex-1 bg-transparent px-2 font-semibold outline-none"
                      value={form.links.website}
                      onChange={updateLink("website")}
                      maxLength={200}
                      placeholder="yourportfolio.com"
                    />
                  </div>
                </FormField>

                <FormField label="LinkedIn">
                  <div className="flex items-center border border-line bg-white focus-within:border-ink">
                    <Linkedin className="ml-3 size-4 shrink-0 text-faint" />
                    <input
                      className="h-11 min-w-0 flex-1 bg-transparent px-2 font-semibold outline-none"
                      value={form.links.linkedin}
                      onChange={updateLink("linkedin")}
                      maxLength={200}
                      placeholder="linkedin.com/in/yourname"
                    />
                  </div>
                </FormField>
              </SettingsSection>

              <div className="flex flex-col gap-3 border border-line bg-surface p-5">
                <Notice message={profileMessage} />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={profileBusy}
                    className="inline-flex h-11 items-center gap-2 bg-ink px-5 text-sm font-black text-white transition hover:bg-transparent hover:text-ink disabled:opacity-60"
                  >
                    {profileBusy ? (
                      <RefreshCw className="size-4 animate-spin" />
                    ) : (
                      <Save className="size-4" />
                    )}
                    {profileBusy ? "Saving…" : "Save profile"}
                  </button>
                </div>
              </div>
            </form>

            <SettingsSection
              title="Resume"
              description="Attach a PDF, DOC, or DOCX so project owners can review your experience."
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                className="hidden"
                onChange={handleResumeUpload}
              />

              {user.resume ? (
                <div className="flex flex-col gap-4 border border-line bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-3">
                    <div className="flex size-11 shrink-0 items-center justify-center bg-charcoal text-white">
                      <FileText className="size-5" />
                    </div>
                    <div>
                      <p className="font-black">{user.resume.originalName}</p>
                      <p className="mt-1 text-xs font-semibold text-faint">
                        {formatBytes(user.resume.size)} · Uploaded{" "}
                        {formatDate(user.resume.uploadedAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={handleResumeDownload}
                      disabled={resumeBusy}
                      className="inline-flex h-9 items-center gap-2 border border-ink px-3 text-xs font-black transition hover:bg-ink hover:text-white disabled:opacity-60"
                    >
                      <Download className="size-4" />
                      Download
                    </button>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={resumeBusy}
                      className="inline-flex h-9 items-center gap-2 border border-line bg-white px-3 text-xs font-black transition hover:border-ink disabled:opacity-60"
                    >
                      <Upload className="size-4" />
                      Replace
                    </button>
                    <button
                      type="button"
                      onClick={handleResumeDelete}
                      disabled={resumeBusy}
                      className="inline-flex h-9 items-center gap-2 border border-line bg-white px-3 text-xs font-black text-red-600 transition hover:border-red-600 disabled:opacity-60"
                    >
                      <Trash2 className="size-4" />
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <div className="border border-dashed border-line bg-white p-6 text-center">
                  <div className="mx-auto flex size-11 items-center justify-center border border-line bg-wash">
                    <FileText className="size-5 text-quiet" />
                  </div>
                  <p className="mt-3 font-black">No resume uploaded</p>
                  <p className="mt-1 text-sm font-semibold text-subtle">
                    PDF, DOC, or DOCX up to 5 MB.
                  </p>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={resumeBusy}
                    className="mt-4 inline-flex h-10 items-center gap-2 border border-ink bg-ink px-4 text-sm font-black text-white transition hover:bg-transparent hover:text-ink disabled:opacity-60"
                  >
                    <Upload className="size-4" />
                    {resumeBusy ? "Uploading…" : "Upload resume"}
                  </button>
                </div>
              )}

              <Notice message={resumeMessage} />
            </SettingsSection>

            <form onSubmit={handlePasswordSave}>
              <SettingsSection
                title="Password"
                description="Use at least 8 characters. You will stay signed in on this device."
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField label="Current password">
                    <div className="flex items-center border border-line bg-white focus-within:border-ink">
                      <Lock className="ml-3 size-4 shrink-0 text-faint" />
                      <input
                        type="password"
                        autoComplete="current-password"
                        className="h-11 min-w-0 flex-1 bg-transparent px-2 font-semibold outline-none"
                        value={passwordForm.currentPassword}
                        onChange={(event) =>
                          setPasswordForm((prev) => ({
                            ...prev,
                            currentPassword: event.target.value,
                          }))
                        }
                        placeholder="Current password"
                      />
                    </div>
                  </FormField>

                  <FormField label="New password">
                    <div className="flex items-center border border-line bg-white focus-within:border-ink">
                      <Lock className="ml-3 size-4 shrink-0 text-faint" />
                      <input
                        type="password"
                        autoComplete="new-password"
                        className="h-11 min-w-0 flex-1 bg-transparent px-2 font-semibold outline-none"
                        value={passwordForm.newPassword}
                        onChange={(event) =>
                          setPasswordForm((prev) => ({
                            ...prev,
                            newPassword: event.target.value,
                          }))
                        }
                        placeholder="New password"
                      />
                    </div>
                  </FormField>

                  <FormField label="Confirm new password">
                    <div className="flex items-center border border-line bg-white focus-within:border-ink">
                      <Lock className="ml-3 size-4 shrink-0 text-faint" />
                      <input
                        type="password"
                        autoComplete="new-password"
                        className="h-11 min-w-0 flex-1 bg-transparent px-2 font-semibold outline-none"
                        value={passwordForm.confirmPassword}
                        onChange={(event) =>
                          setPasswordForm((prev) => ({
                            ...prev,
                            confirmPassword: event.target.value,
                          }))
                        }
                        placeholder="Repeat new password"
                      />
                    </div>
                  </FormField>
                </div>

                <Notice message={passwordMessage} />

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={passwordBusy}
                    className="inline-flex h-11 items-center gap-2 border border-ink bg-ink px-5 text-sm font-black text-white transition hover:bg-transparent hover:text-ink disabled:opacity-60"
                  >
                    {passwordBusy ? (
                      <RefreshCw className="size-4 animate-spin" />
                    ) : (
                      <Lock className="size-4" />
                    )}
                    {passwordBusy ? "Updating…" : "Update password"}
                  </button>
                </div>
              </SettingsSection>
            </form>
          </div>

          <aside className="space-y-6 self-start lg:sticky lg:top-24">
            <div className="border border-ink bg-surface p-5">
              <p className="text-xs font-black uppercase tracking-[0.14em] text-faint">
                Profile preview
              </p>

              <div className="mt-4 flex items-center gap-3">
                <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-charcoal text-lg font-black text-white">
                  {getInitials(form.name)}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-xl font-black">
                    {form.name || "Your name"}
                  </p>
                  {form.username && (
                    <p className="mt-1 text-sm font-semibold text-faint">
                      @{form.username}
                    </p>
                  )}
                  <p className="mt-0.5 line-clamp-2 text-sm font-semibold text-subtle">
                    {form.headline || "Add a headline so teams know your focus."}
                  </p>
                </div>
              </div>

              {form.location && (
                <p className="mt-4 flex items-center gap-1.5 text-sm font-semibold text-subtle">
                  <MapPin className="size-4" />
                  {form.location}
                </p>
              )}

              {form.skills.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {form.skills.slice(0, 6).map((skill) => (
                    <span
                      key={skill}
                      className="border border-line bg-white px-2 py-0.5 text-xs font-bold text-subtle"
                    >
                      {skill}
                    </span>
                  ))}
                  {form.skills.length > 6 && (
                    <span className="px-1 py-0.5 text-xs font-bold text-faint">
                      +{form.skills.length - 6}
                    </span>
                  )}
                </div>
              )}

              {hasLinks && (
                <div className="mt-4 flex flex-wrap gap-3 border-t border-line pt-4 text-sm font-semibold">
                  {form.links.github && (
                    <a
                      href={toHref(form.links.github)}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1.5 text-subtle hover:text-ink"
                    >
                      <Github className="size-4" />
                      GitHub
                    </a>
                  )}
                  {form.links.website && (
                    <a
                      href={toHref(form.links.website)}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1.5 text-subtle hover:text-ink"
                    >
                      <Globe className="size-4" />
                      Website
                    </a>
                  )}
                  {form.links.linkedin && (
                    <a
                      href={toHref(form.links.linkedin)}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1.5 text-subtle hover:text-ink"
                    >
                      <Linkedin className="size-4" />
                      LinkedIn
                    </a>
                  )}
                </div>
              )}

              <div className="mt-5 border-t border-line pt-4">
                <div className="mb-2 flex items-center justify-between text-xs font-black uppercase tracking-[0.12em] text-faint">
                  <span>Profile strength</span>
                  <span>{completeness}%</span>
                </div>
                <div className="h-2 bg-track">
                  <div
                    className="h-full bg-ink transition-all"
                    style={{ width: `${completeness}%` }}
                  />
                </div>
                <p className="mt-3 text-xs font-semibold text-faint">
                  Add skills, links, availability, and a resume to make your
                  applications stronger.
                </p>
              </div>
            </div>

            <div className="border border-line bg-surface p-5">
              <h2 className="flex items-center gap-2 text-lg font-black">
                <User className="size-5" />
                Account
              </h2>
              <div className="mt-3 space-y-1 text-sm font-semibold text-subtle">
                <p className="truncate">{user.email}</p>
                <p className="text-xs uppercase tracking-[0.12em] text-faint">
                  {user.role || "user"}
                </p>
              </div>
              <Link
                href="/find-projects"
                className="mt-4 inline-flex items-center gap-2 text-sm font-black underline underline-offset-4"
              >
                Find a project
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </aside>
        </div>
      </section>
    </div>
  )
}
