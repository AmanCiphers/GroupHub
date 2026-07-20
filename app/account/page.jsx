"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowRight,
  Github,
  Globe,
  Link as LinkIcon,
  Lock,
  LogOut,
  Mail,
  MapPin,
  Save,
  User,
} from "lucide-react"
import { apiFetch, getStoredUser, setAuthSession, clearAuthSession } from "@/lib/api"
import PillInput from "@/components/PillInput"
import { Skeleton } from "@/components/ui/skeleton"

const profilePoints = [
  "Show your skills and availability",
  "Save projects and track applications",
  "Create teams around early ideas",
]

const experienceLevels = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
  { value: "expert", label: "Expert" },
]

export default function AccountPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [profile, setProfile] = useState(null)
  const [profileLoading, setProfileLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [skillsPills, setSkillsPills] = useState([])
  const [interestsPills, setInterestsPills] = useState([])
  const router = useRouter()

  const loadProfile = useCallback(async () => {
    setProfileLoading(true)
    try {
      const payload = await apiFetch("/api/v1/users/me")
      setProfile(payload.data.user)
      setSkillsPills(payload.data.user?.skills || [])
      setInterestsPills(payload.data.user?.interests || [])
      setAuthSession({ user: payload.data.user })
    } catch {
      clearAuthSession()
    } finally {
      setProfileLoading(false)
    }
  }, [])

  useEffect(() => {
    if (getStoredUser()) {
      loadProfile()
    } else {
      setProfileLoading(false)
    }
  }, [loadProfile])

  const handleAuth = async (event) => {
    event.preventDefault()
    setError("")
    setLoading(true)

    const formData = new FormData(event.currentTarget)
    const body = isLogin
      ? {
          email: formData.get("email"),
          password: formData.get("password"),
        }
      : {
          fullName: formData.get("fullName"),
          email: formData.get("email"),
          password: formData.get("password"),
          confirmPassword: formData.get("confirmPassword"),
        }

    try {
      const payload = await apiFetch(
        isLogin ? "/api/v1/auth/login" : "/api/v1/auth/register",
        {
          method: "POST",
          body: JSON.stringify(body),
          retryOnUnauthorized: false,
        }
      )

      setAuthSession(payload.data)
      router.push("/dashboard")
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }

  const handleProfileUpdate = async (event) => {
    event.preventDefault()
    setSaving(true)
    setError("")
    setSaved(false)

    const formData = new FormData(event.currentTarget)

    const body = {
      fullName: String(formData.get("fullName") || "").trim(),
      username: String(formData.get("username") || "").trim() || undefined,
      bio: String(formData.get("bio") || "").trim(),
      skills: skillsPills.length ? skillsPills : undefined,
      interests: interestsPills.length ? interestsPills : undefined,
      location: String(formData.get("location") || "").trim(),
      availabilityHoursPerWeek: Number(formData.get("availabilityHoursPerWeek") || 0),
      experienceLevel: formData.get("experienceLevel"),
      socialLinks: {
        github: String(formData.get("github") || "").trim(),
        twitter: String(formData.get("twitter") || "").trim(),
        linkedin: String(formData.get("linkedin") || "").trim(),
        website: String(formData.get("website") || "").trim(),
      },
    }

    // Clean empty social links
    Object.keys(body.socialLinks).forEach((key) => {
      if (!body.socialLinks[key]) delete body.socialLinks[key]
    })

    try {
      const payload = await apiFetch("/api/v1/users/me", {
        method: "PATCH",
        body: JSON.stringify(body),
      })
      setProfile(payload.data.user)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSaving(false)
    }
  }

  const handleSignOut = async () => {
    await apiFetch("/api/v1/auth/logout", { method: "POST" }).catch(() => {})
    clearAuthSession()
    setProfile(null)
    router.push("/")
  }

  const initials = profile?.fullName
    ? profile.fullName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "?"

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-[#f7f7f3] text-[#171717]">
        <section className="border-b border-[#d9d8d2] bg-[#fbfbfa] px-6 py-10 sm:px-10 lg:px-20 xl:px-28">
          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-20 rounded-none" />
            <Skeleton className="mt-1 h-10 w-48 rounded-none" />
          </div>
        </section>
        <section className="px-6 py-8 sm:px-10 lg:px-20 xl:px-28">
          <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
            <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
              <div className="border border-[#d9d8d2] bg-[#fbfbfa] p-6 text-center">
                <Skeleton className="mx-auto size-20 rounded-full" />
                <Skeleton className="mx-auto mt-4 h-5 w-28 rounded-none" />
                <Skeleton className="mx-auto mt-1 h-4 w-20 rounded-none" />
                <Skeleton className="mt-6 h-10 w-full rounded-none" />
              </div>
            </aside>
            <div className="space-y-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="border border-[#d9d8d2] bg-[#fbfbfa] p-6">
                  <Skeleton className="h-4 w-24 rounded-none" />
                  <div className="mt-4 grid gap-5 sm:grid-cols-2">
                    <Skeleton className="h-11 w-full rounded-none" />
                    <Skeleton className="h-11 w-full rounded-none" />
                    <div className="sm:col-span-2">
                      <Skeleton className="h-24 w-full rounded-none" />
                    </div>
                  </div>
                </div>
              ))}
              <div className="flex gap-4 pb-10">
                <Skeleton className="h-11 w-36 rounded-none" />
                <Skeleton className="h-11 w-40 rounded-none" />
              </div>
            </div>
          </div>
        </section>
      </div>
    )
  }

  if (getStoredUser() && !profile) {
    return (
      <div className="min-h-screen bg-[#f7f7f3] text-[#171717] flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-black">Could not load profile.</p>
          <button onClick={handleSignOut} className="mt-4 text-sm font-black underline underline-offset-4">
            Sign out and try again
          </button>
        </div>
      </div>
    )
  }

  if (profile) {
    return (
      <div className="min-h-screen bg-[#f7f7f3] text-[#171717]">
        <section className="border-b border-[#d9d8d2] bg-[#fbfbfa] px-6 py-10 sm:px-10 lg:px-20 xl:px-28">
          <div className="flex flex-col gap-2">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-[#62615d]">
              Account
            </p>
            <h1 className="text-4xl font-black leading-[0.95] sm:text-5xl">
              Your profile
            </h1>
          </div>
        </section>

        <section className="px-6 py-8 sm:px-10 lg:px-20 xl:px-28">
          <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
            <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
              <div className="border border-[#d9d8d2] bg-[#fbfbfa] p-6 text-center">
                <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-[#2f2f2d] text-2xl font-black text-white">
                  {initials}
                </div>
                <p className="mt-4 text-lg font-black">{profile.fullName}</p>
                <p className="mt-1 text-sm font-semibold text-[#77766f]">
                  @{profile.username || "set a username"}
                </p>
                <button
                  onClick={handleSignOut}
                  className="mt-6 inline-flex h-10 w-full items-center justify-center gap-2 border border-[#d9d8d2] bg-white text-sm font-black transition hover:border-[#171717]"
                >
                  <LogOut className="size-4" />
                  Sign out
                </button>
              </div>
            </aside>

            <div>
              {error && (
                <p className="mb-6 border border-[#171717] bg-white p-3 text-sm font-bold">{error}</p>
              )}
              {saved && (
                <p className="mb-6 border border-[#171717] bg-[#171717] p-3 text-sm font-bold text-white">
                  Profile saved successfully.
                </p>
              )}
              <form className="space-y-8" onSubmit={handleProfileUpdate}>
                <fieldset className="border border-[#d9d8d2] bg-[#fbfbfa] p-6">
                  <legend className="text-sm font-black uppercase tracking-[0.14em] text-[#77766f]">Basic info</legend>
                  <div className="mt-4 grid gap-5 sm:grid-cols-2">
                    <div>
                      <label className="text-sm font-black">Full name</label>
                      <input name="fullName" defaultValue={profile.fullName} className="mt-2 h-11 w-full border border-[#d9d8d2] bg-white px-3 font-semibold outline-none focus:border-[#171717]" required />
                    </div>
                    <div>
                      <label className="text-sm font-black">Username</label>
                      <div className="relative mt-2">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-[#77766f]">@</span>
                        <input name="username" defaultValue={profile.username || ""} className="h-11 w-full border border-[#d9d8d2] bg-white pl-8 pr-3 font-semibold outline-none focus:border-[#171717]" />
                      </div>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-sm font-black">Email</label>
                      <div className="relative mt-2">
                        <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#77766f]" />
                        <input value={profile.email} className="h-11 w-full border border-[#d9d8d2] bg-[#efeee8] pl-10 pr-3 font-semibold text-[#77766f]" readOnly />
                      </div>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-sm font-black">Bio</label>
                      <textarea name="bio" defaultValue={profile.bio || ""} rows={4} className="mt-2 min-h-24 w-full border border-[#d9d8d2] bg-white p-3 font-semibold outline-none focus:border-[#171717]" />
                    </div>
                  </div>
                </fieldset>

                <fieldset className="border border-[#d9d8d2] bg-[#fbfbfa] p-6">
                  <legend className="text-sm font-black uppercase tracking-[0.14em] text-[#77766f]">Skills & interests</legend>
                  <div className="mt-4 grid gap-5 sm:grid-cols-2">
                    <div>
                      <label className="text-sm font-black">Skills</label>
                      <div className="mt-2">
                        <PillInput values={skillsPills} onChange={setSkillsPills} placeholder="Type a skill and press Enter" />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-black">Interests</label>
                      <div className="mt-2">
                        <PillInput values={interestsPills} onChange={setInterestsPills} placeholder="Type an interest and press Enter" />
                      </div>
                    </div>
                  </div>
                </fieldset>

                <fieldset className="border border-[#d9d8d2] bg-[#fbfbfa] p-6">
                  <legend className="text-sm font-black uppercase tracking-[0.14em] text-[#77766f]">Work preferences</legend>
                  <div className="mt-4 grid gap-5 sm:grid-cols-3">
                    <div>
                      <label className="text-sm font-black">Location</label>
                      <div className="relative mt-2">
                        <MapPin className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#77766f]" />
                        <input name="location" defaultValue={profile.location || ""} className="h-11 w-full border border-[#d9d8d2] bg-white pl-10 pr-3 font-semibold outline-none focus:border-[#171717]" placeholder="City, Country" />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-black">Hours / week</label>
                      <input name="availabilityHoursPerWeek" type="number" min="0" max="80" defaultValue={profile.availabilityHoursPerWeek || 0} className="mt-2 h-11 w-full border border-[#d9d8d2] bg-white px-3 font-semibold outline-none focus:border-[#171717]" />
                    </div>
                    <div>
                      <label className="text-sm font-black">Experience</label>
                      <select name="experienceLevel" defaultValue={profile.experienceLevel || "beginner"} className="mt-2 h-11 w-full border border-[#d9d8d2] bg-white px-3 font-semibold outline-none focus:border-[#171717]">
                        {experienceLevels.map((level) => (
                          <option key={level.value} value={level.value}>{level.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </fieldset>

                <fieldset className="border border-[#d9d8d2] bg-[#fbfbfa] p-6">
                  <legend className="text-sm font-black uppercase tracking-[0.14em] text-[#77766f]">Social links</legend>
                  <div className="mt-4 grid gap-5 sm:grid-cols-2">
                    <div>
                      <label className="text-sm font-black">GitHub</label>
                      <div className="relative mt-2">
                        <Github className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#77766f]" />
                        <input name="github" defaultValue={profile.socialLinks?.github || ""} className="h-11 w-full border border-[#d9d8d2] bg-white pl-10 pr-3 font-semibold outline-none focus:border-[#171717]" placeholder="https://github.com/username" />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-black">Twitter</label>
                      <div className="relative mt-2">
                        <svg className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#77766f]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
                        <input name="twitter" defaultValue={profile.socialLinks?.twitter || ""} className="h-11 w-full border border-[#d9d8d2] bg-white pl-10 pr-3 font-semibold outline-none focus:border-[#171717]" placeholder="https://twitter.com/username" />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-black">LinkedIn</label>
                      <div className="relative mt-2">
                        <svg className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#77766f]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
                        <input name="linkedin" defaultValue={profile.socialLinks?.linkedin || ""} className="h-11 w-full border border-[#d9d8d2] bg-white pl-10 pr-3 font-semibold outline-none focus:border-[#171717]" placeholder="https://linkedin.com/in/username" />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-black">Website</label>
                      <div className="relative mt-2">
                        <Globe className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#77766f]" />
                        <input name="website" defaultValue={profile.socialLinks?.website || ""} className="h-11 w-full border border-[#d9d8d2] bg-white pl-10 pr-3 font-semibold outline-none focus:border-[#171717]" placeholder="https://yoursite.com" />
                      </div>
                    </div>
                  </div>
                </fieldset>

                <div className="flex items-center gap-4 pb-10">
                  <button
                    type="submit"
                    className="inline-flex h-11 items-center gap-2 bg-[#171717] px-6 text-sm font-black text-white transition hover:bg-[#2f2f2d] disabled:opacity-60"
                    disabled={saving}
                  >
                    <Save className="size-4" />
                    {saving ? "Saving..." : "Save profile"}
                  </button>
                  <Link href="/dashboard" className="text-sm font-black underline underline-offset-4">
                    Back to dashboard
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </section>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f7f7f3] text-[#171717]">
      <section className="grid min-h-[calc(100vh-73px)] lg:grid-cols-[0.95fr_1.05fr]">
        <div className="flex items-center bg-[#2f2f2d] px-6 py-16 text-white sm:px-10 lg:px-20 xl:px-28">
          <div className="max-w-xl">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-white/60">
              Account
            </p>
            <h1 className="mt-5 text-4xl font-black leading-[0.95] sm:text-6xl">
              Your project identity starts here.
            </h1>
            <p className="mt-6 text-lg font-semibold leading-snug text-white/78">
              Build a profile that makes it easy for teams to understand what
              you can contribute and what you want to learn next.
            </p>
            <div className="mt-10 grid gap-4">
              {profilePoints.map((point, index) => (
                <div key={point} className="flex items-center gap-4 border-b border-white/15 pb-4">
                  <span className="text-sm font-black text-white/55">0{index + 1}</span>
                  <p className="font-bold">{point}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center px-6 py-16 sm:px-10 lg:px-20">
          <div className="w-full max-w-md">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.18em] text-[#62615d]">
                {isLogin ? "Welcome back" : "Create profile"}
              </p>
              <h2 className="mt-3 text-3xl font-black">
                {isLogin ? "Sign in to GroupHub" : "Start building with a team"}
              </h2>
            </div>

            <div className="mt-8 border border-[#d9d8d2] bg-[#fbfbfa] p-5">
              <div className="grid gap-3">
                <button className="flex h-11 items-center justify-center gap-2 border border-[#171717] bg-white text-sm font-black" type="button">
                  <Github className="size-4" />
                  Continue with GitHub
                </button>
                <button className="flex h-11 items-center justify-center gap-2 border border-[#d9d8d2] bg-white text-sm font-black" type="button">
                  Continue with Google
                </button>
              </div>

              <div className="my-6 flex items-center gap-3">
                <div className="h-px flex-1 bg-[#d9d8d2]" />
                <span className="text-xs font-black uppercase tracking-[0.14em] text-[#77766f]">
                  or
                </span>
                <div className="h-px flex-1 bg-[#d9d8d2]" />
              </div>

              <form className="space-y-4" onSubmit={handleAuth}>
                {!isLogin && (
                  <Field icon={User} id="fullName" name="fullName" label="Full name" placeholder="John Doe" />
                )}
                <Field icon={Mail} id="email" name="email" label="Email" placeholder="you@example.com" type="email" />
                <Field icon={Lock} id="password" name="password" label="Password" placeholder="Password" type="password" />
                {!isLogin && (
                  <Field icon={Lock} id="confirmPassword" name="confirmPassword" label="Confirm password" placeholder="Confirm password" type="password" />
                )}
                {isLogin && (
                  <div className="text-right">
                    <Link href="#" className="text-xs font-black underline underline-offset-4">
                      Forgot password?
                    </Link>
                  </div>
                )}
                {error && (
                  <p className="border border-[#171717] bg-white p-3 text-sm font-bold text-[#171717]">
                    {error}
                  </p>
                )}
                <button
                  className="flex h-11 w-full items-center justify-center gap-2 bg-[#171717] text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={loading}
                >
                  {loading ? "Please wait..." : isLogin ? "Sign In" : "Create Account"}
                  <ArrowRight className="size-4" />
                </button>
              </form>
            </div>

            <p className="mt-6 text-center text-sm font-semibold text-[#55544f]">
              {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
              <button
                onClick={() => {
                  setError("")
                  setIsLogin(!isLogin)
                }}
                className="font-black text-[#171717] underline underline-offset-4"
              >
                {isLogin ? "Sign up" : "Sign in"}
              </button>
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}

function Field({ icon: Icon, id, name, label, type = "text", placeholder }) {
  return (
    <label htmlFor={id} className="block">
      <span className="text-sm font-black">{label}</span>
      <span className="relative mt-2 block">
        <Icon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#77766f]" />
        <input
          id={id}
          name={name || id}
          type={type}
          placeholder={placeholder}
          className="h-11 w-full border border-[#d9d8d2] bg-white pl-10 pr-3 font-semibold outline-none transition focus:border-[#171717]"
          required
        />
      </span>
    </label>
  )
}
