"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  FileText,
  Send,
  Upload,
  X,
} from "lucide-react"

import { api } from "@/lib/api"
import { Select } from "@/components/select"
import { COMMITMENT } from "@/lib/data/enums"

const STEPS = [
  { title: "Your pitch", hint: "Why this role?" },
  { title: "Availability", hint: "Time, resume" },
  { title: "Review", hint: "Confirm & send" },
]

export function ApplyWizard({
  project,
  role,
  user,
  csrfToken,
  onClose,
  onSuccess,
}) {
  const hasProfileResume = Boolean(user?.resume?.originalName)
  const [step, setStep] = useState(0)
  const [message, setMessage] = useState("")
  const [experience, setExperience] = useState("")
  const [portfolioUrl, setPortfolioUrl] = useState("")
  const [availability, setAvailability] = useState(project.commitment || "")
  const [timezone, setTimezone] = useState("")
  const [startDate, setStartDate] = useState("")
  const [resumeMode, setResumeMode] = useState(
    hasProfileResume ? "profile" : "none"
  )
  const [resumeFile, setResumeFile] = useState(null)
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)

  const fileInputRef = useRef(null)

  useEffect(() => {
    document.body.style.overflow = "hidden"
    const handleKey = (event) => {
      if (event.key === "Escape" && !busy) onClose()
    }
    document.addEventListener("keydown", handleKey)
    return () => {
      document.body.style.overflow = ""
      document.removeEventListener("keydown", handleKey)
    }
  }, [busy, onClose])

  const validateStep = () => {
    if (step === 0) {
      const msg = message.trim()
      if (!msg) {
        setError("Tell the owner why you are interested.")
        return false
      }
      if (msg.length < 20) {
        setError("Add at least 20 characters about why you want to join.")
        return false
      }
      if (msg.length > 1000) {
        setError("Message cannot exceed 1000 characters.")
        return false
      }
      if (experience.length > 1000) {
        setError("Relevant experience cannot exceed 1000 characters.")
        return false
      }
      if (portfolioUrl) {
        try {
          const u = new URL(portfolioUrl.startsWith("http") ? portfolioUrl : `https://${portfolioUrl}`)
          if (!["http:", "https:"].includes(u.protocol)) throw new Error()
        } catch {
          setError("Portfolio URL must be a valid http(s) address.")
          return false
        }
      }
    }
    if (step === 1) {
      if (availability && !COMMITMENT.includes(availability)) {
        setError("Select a valid availability option.")
        return false
      }
      if (timezone.length > 80) {
        setError("Timezone must be 80 characters or fewer.")
        return false
      }
      if (startDate && isNaN(Date.parse(startDate))) {
        setError("Earliest start date is invalid.")
        return false
      }
      if (resumeMode === "upload" && !resumeFile) {
        setError("Choose a resume file or use your profile resume.")
        return false
      }
      if (resumeFile) {
        const ext = resumeFile.name.split(".").pop()?.toLowerCase()
        if (!["pdf", "doc", "docx"].includes(ext)) {
          setError("Resume must be a PDF, DOC, or DOCX file.")
          return false
        }
        if (resumeFile.size > 5 * 1024 * 1024) {
          setError("Resume must be 5 MB or smaller.")
          return false
        }
      }
    }
    return true
  }

  const next = () => {
    setError(null)
    if (!validateStep()) return
    if (step < STEPS.length - 1) setStep((s) => s + 1)
  }

  const back = () => {
    setError(null)
    if (step > 0) setStep((s) => s - 1)
  }

  const handleSubmit = async () => {
    setError(null)
    if (!validateStep()) return
    setBusy(true)
    try {
      const formData = new FormData()
      formData.append("message", message.trim())
      if (experience.trim()) formData.append("experience", experience.trim())
      if (portfolioUrl.trim()) formData.append("portfolioUrl", portfolioUrl.trim())
      if (availability) formData.append("availability", availability)
      if (timezone.trim()) formData.append("timezone", timezone.trim())
      if (startDate) formData.append("startDate", startDate)
      formData.append("useProfileResume", resumeMode === "profile" ? "true" : "false")
      if (resumeMode === "upload" && resumeFile) formData.append("resume", resumeFile)

      await api.applyToRole(project._id, role.id, formData, csrfToken)
      setBusy(false)
      onSuccess(`Application sent for ${role.title}.`)
      onClose()
    } catch (err) {
      setBusy(false)
      setError(err.message || "Could not send your application.")
    }
  }

  const handleFileChange = (event) => {
    const file = event.target.files?.[0]
    if (file) {
      setResumeFile(file)
    }
  }

  const handleBackdropClick = (event) => {
    if (event.target === event.currentTarget && !busy) onClose()
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/60 px-4 py-8"
      onClick={handleBackdropClick}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="wizard-title"
        className="w-full max-w-2xl border border-ink bg-surface p-6 max-h-[90vh] overflow-y-auto"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.14em] text-faint">
              Apply to
            </p>
            <h2 id="wizard-title" className="mt-1 text-2xl font-black">
              {role.title}
            </h2>
            <p className="mt-1 text-sm font-semibold text-subtle">
              {project.title}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            aria-label="Close application"
            className="flex size-9 shrink-0 items-center justify-center border border-line bg-white transition hover:border-ink disabled:opacity-50"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="mt-4 flex items-center gap-2">
          {STEPS.map((s, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <div
                className={`flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-black ${
                  idx < step
                    ? "bg-ink text-white"
                    : idx === step
                    ? "border-2 border-ink text-ink"
                    : "border-2 border-line text-faint"
                }`}
              >
                {idx < step ? <CheckCircle2 className="size-4" /> : idx + 1}
              </div>
              {idx < STEPS.length - 1 && (
                <div
                  className={`h-1 w-12 shrink-0 ${
                    idx < step ? "bg-ink" : "bg-line"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        <form onSubmit={(e) => e.preventDefault()} className="mt-6 space-y-4">
          {step === 0 && (
            <div className="space-y-4">
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label className="text-xs font-black uppercase tracking-[0.14em] text-faint">
                    Why this role? <span className="text-red-500">*</span>
                  </label>
                  <span className="text-xs font-semibold text-faint">
                    {message.length}/1000
                  </span>
                </div>
                <textarea
                  maxLength={1000}
                  className="min-h-32 w-full border border-line bg-white p-3 font-semibold outline-none focus:border-ink"
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  placeholder="Share why you are interested, relevant experience, or what you would like to help with."
                />
              </div>

              <div>
                <label className="text-xs font-black uppercase tracking-[0.14em] text-faint">
                  Relevant experience (optional)
                </label>
                <textarea
                  maxLength={1000}
                  className="mt-1.5 min-h-24 w-full border border-line bg-white p-3 font-semibold outline-none focus:border-ink"
                  value={experience}
                  onChange={(event) => setExperience(event.target.value)}
                  placeholder="Briefly describe past projects, internships, or skills that make you a good fit."
                />
              </div>

              <div>
                <label className="text-xs font-black uppercase tracking-[0.14em] text-faint">
                  Portfolio / work sample URL (optional)
                </label>
                <input
                  type="url"
                  maxLength={300}
                  className="mt-1.5 w-full border border-line bg-white p-3 font-semibold outline-none focus:border-ink"
                  value={portfolioUrl}
                  onChange={(event) => setPortfolioUrl(event.target.value)}
                  placeholder="https://your-portfolio.com or github.com/yourproject"
                />
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-black uppercase tracking-[0.14em] text-faint">
                  Availability
                </label>
                <Select
                  className="mt-1.5 p-3"
                  value={availability}
                  onChange={setAvailability}
                  options={[
                    { value: "", label: "Not specified" },
                    ...COMMITMENT.map((c) => ({ value: c, label: c })),
                  ]}
                />
              </div>

              <div>
                <label className="text-xs font-black uppercase tracking-[0.14em] text-faint">
                  Timezone (optional)
                </label>
                <input
                  type="text"
                  maxLength={80}
                  className="mt-1.5 w-full border border-line bg-white p-3 font-semibold outline-none focus:border-ink"
                  value={timezone}
                  onChange={(event) => setTimezone(event.target.value)}
                  placeholder="e.g., America/Los_Angeles (UTC-8)"
                />
              </div>

              <div>
                <label className="text-xs font-black uppercase tracking-[0.14em] text-faint">
                  Earliest start date (optional)
                </label>
                <input
                  type="date"
                  className="mt-1.5 w-full border border-line bg-white p-3 font-semibold outline-none focus:border-ink"
                  value={startDate}
                  onChange={(event) => setStartDate(event.target.value)}
                />
              </div>

              <div className="border border-line bg-white p-4 space-y-3">
                <label className="text-xs font-black uppercase tracking-[0.14em] text-faint">
                  Resume
                </label>

                {hasProfileResume && (
                  <>
                    <div className="space-y-2">
                      <label className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="resumeMode"
                          value="profile"
                          checked={resumeMode === "profile"}
                          onChange={() => setResumeMode("profile")}
                          className="size-4 accent-ink"
                        />
                        <span className="flex items-center gap-2">
                          <FileText className="size-4 text-quiet" />
                          Use resume from your profile
                          <span className="text-xs font-semibold text-faint">
                            ({user.resume.originalName}, {formatBytes(user.resume.size)})
                          </span>
                        </span>
                      </label>

                      <label className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="resumeMode"
                          value="upload"
                          checked={resumeMode === "upload"}
                          onChange={() => setResumeMode("upload")}
                          className="size-4 accent-ink"
                        />
                        <span className="flex items-center gap-2">
                          <Upload className="size-4 text-quiet" />
                          Upload a different resume
                        </span>
                      </label>

                      <label className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="resumeMode"
                          value="none"
                          checked={resumeMode === "none"}
                          onChange={() => setResumeMode("none")}
                          className="size-4 accent-ink"
                        />
                        <span className="flex items-center gap-2">
                          No resume
                        </span>
                      </label>
                    </div>

                    <p className="text-xs font-semibold text-faint">
                      Manage your profile resume in{" "}
                      <Link href="/profile" className="underline underline-offset-2 hover:text-ink">
                        Account Settings
                      </Link>
                    </p>
                  </>
                )}

                {!hasProfileResume && (
                  <div className="space-y-2">
                    <label className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="resumeMode"
                        value="upload"
                        checked={resumeMode === "upload"}
                        onChange={() => setResumeMode("upload")}
                        className="size-4 accent-ink"
                      />
                      <span className="flex items-center gap-2">
                        <Upload className="size-4 text-quiet" />
                        Upload a resume (optional)
                      </span>
                    </label>
                    <label className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="resumeMode"
                        value="none"
                        checked={resumeMode === "none"}
                        onChange={() => setResumeMode("none")}
                        className="size-4 accent-ink"
                      />
                      <span className="flex items-center gap-2">
                        No resume
                      </span>
                    </label>
                  </div>
                )}

                {resumeMode === "upload" && (
                  <div className="pt-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileChange}
                      className="sr-only"
                      id="wizard-resume-upload"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex h-10 items-center gap-2 border border-line bg-white px-4 text-sm font-black transition hover:border-ink"
                    >
                      <Upload className="size-4" />
                      Choose file
                    </button>
                    {resumeFile && (
                      <p className="mt-2 text-xs font-semibold text-subtle flex items-center gap-2">
                        <FileText className="size-3" />
                        {resumeFile.name} · {formatBytes(resumeFile.size)}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 border border-line bg-white p-4">
              <h3 className="text-lg font-black">Review your application</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="font-black text-faint">Why this role?</p>
                  <p className="mt-1 whitespace-pre-wrap">{message}</p>
                </div>
                {experience && (
                  <div>
                    <p className="font-black text-faint">Relevant experience</p>
                    <p className="mt-1 whitespace-pre-wrap">{experience}</p>
                  </div>
                )}
                {portfolioUrl && (
                  <div>
                    <p className="font-black text-faint">Portfolio</p>
                    <p className="mt-1">
                      <a href={portfolioUrl} target="_blank" rel="noreferrer" className="underline underline-offset-2 hover:text-ink">
                        {portfolioUrl}
                      </a>
                    </p>
                  </div>
                )}
                {availability && (
                  <div>
                    <p className="font-black text-faint">Availability</p>
                    <p className="mt-1">{availability}</p>
                  </div>
                )}
                {timezone && (
                  <div>
                    <p className="font-black text-faint">Timezone</p>
                    <p className="mt-1">{timezone}</p>
                  </div>
                )}
                {startDate && (
                  <div>
                    <p className="font-black text-faint">Earliest start</p>
                    <p className="mt-1">{new Date(startDate).toLocaleDateString()}</p>
                  </div>
                )}
                <div>
                  <p className="font-black text-faint">Resume</p>
                  <p className="mt-1">
                    {resumeMode === "profile" && (
                      <span className="flex items-center gap-2">
                        <FileText className="size-3 text-quiet" />
                        {user.resume.originalName} (from profile)
                      </span>
                    )}
                    {resumeMode === "upload" && (
                      <span className="flex items-center gap-2">
                        <FileText className="size-3 text-quiet" />
                        {resumeFile?.name || "Uploaded file"}
                      </span>
                    )}
                    {resumeMode === "none" && <span className="text-faint">No resume attached</span>}
                  </p>
                </div>
              </div>
            </div>
          )}

          {error && (
            <p className="border border-red-300 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
              {error}
            </p>
          )}

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end pt-2">
            <button
              type="button"
              onClick={step === 0 ? onClose : back}
              disabled={busy}
              className="inline-flex h-11 items-center justify-center border border-ink px-5 text-sm font-black transition hover:bg-wash disabled:opacity-60"
            >
              {step === 0 ? "Cancel" : (<> <ArrowLeft className="size-4 mr-1" /> Back </>)}
            </button>
            {step < STEPS.length - 1 ? (
              <button
                type="button"
                onClick={next}
                disabled={busy}
                className="inline-flex h-11 items-center justify-center gap-2 bg-ink px-5 text-sm font-black text-white transition hover:bg-transparent hover:text-ink disabled:opacity-60"
              >
                Next <ArrowRight className="size-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={busy}
                className="inline-flex h-11 items-center justify-center gap-2 bg-ink px-5 text-sm font-black text-white transition hover:bg-transparent hover:text-ink disabled:opacity-60"
              >
                {busy ? (
                  <>
                    <span className="animate-spin" style={{ width: 16, height: 16, border: "2px solid currentColor", borderRightColor: "transparent", borderRadius: "50%" }} />
                    Sending…
                  </>
                ) : (
                  <>
                    <Send className="size-4" />
                    Send application
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}

function formatBytes(bytes) {
  if (!bytes) return "0 B"
  const kb = bytes / 1024
  if (kb < 1024) return `${kb.toFixed(1)} KB`
  return `${(kb / 1024).toFixed(2)} MB`
}