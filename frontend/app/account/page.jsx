"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowRight, Github, Lock, Mail, User } from "lucide-react"
import { useDispatch, useSelector } from "react-redux"
import { Field } from "@/components/field"
import {
  clearError,
  loginUser,
  registerUser,
} from "@/lib/features/auth/authSlice"

const profilePoints = [
  "Show your skills and availability",
  "Save projects and track applications",
  "Create teams around early ideas",
]

const emptyForm = { name: "", email: "", password: "", confirmPassword: "" }

/** Auth page: login/register form with Redux integration. */
export default function AccountPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [form, setForm] = useState(emptyForm)
  const [localError, setLocalError] = useState("")
  const [notice, setNotice] = useState("")

  const dispatch = useDispatch()
  const router = useRouter()
  const { status, error } = useSelector((state) => state.auth)
  const loading = status === "loading"

  const update = (key) => (event) =>
    setForm((prev) => ({ ...prev, [key]: event.target.value }))

  const switchMode = () => {
    setIsLogin((prev) => !prev)
    setForm(emptyForm)
    setLocalError("")
    setNotice("")
    dispatch(clearError())
  }

  const onSubmit = async (event) => {
    event.preventDefault()
    setLocalError("")
    setNotice("")
    dispatch(clearError())

    if (!isLogin && form.password !== form.confirmPassword) {
      setLocalError("Passwords do not match.")
      return
    }

    if (isLogin) {
      const result = await dispatch(
        loginUser({ email: form.email, password: form.password })
      )
      if (loginUser.fulfilled.match(result)) {
        router.push("/dashboard")
      }
      return
    }

    const result = await dispatch(
      registerUser({
        name: form.name,
        email: form.email,
        password: form.password,
      })
    )
    if (registerUser.fulfilled.match(result)) {
      setForm(emptyForm)
      setIsLogin(true)
      setNotice("Account created. Please sign in.")
    }
  }

  const message = localError || error

  return (
    <div className="min-h-screen bg-canvas text-ink">
      <section className="grid min-h-[calc(100vh-73px)] lg:grid-cols-[0.95fr_1.05fr]">
        <div className="flex items-center bg-charcoal px-6 py-16 text-white sm:px-10 lg:px-20 xl:px-28">
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
              <p className="text-sm font-black uppercase tracking-[0.18em] text-quiet">
                {isLogin ? "Welcome back" : "Create profile"}
              </p>
              <h2 className="mt-3 text-3xl font-black">
                {isLogin ? "Sign in to GroupHub" : "Start building with a team"}
              </h2>
            </div>

            <div className="mt-8 border border-line bg-surface p-5">
              <div className="grid gap-3">
                <button
                  type="button"
                  disabled
                  className="flex h-11 items-center justify-center gap-2 border border-line bg-white text-sm font-black text-faint"
                >
                  <Github className="size-4" />
                  Continue with GitHub (coming soon)
                </button>
              </div>

              <div className="my-6 flex items-center gap-3">
                <div className="h-px flex-1 bg-line" />
                <span className="text-xs font-black uppercase tracking-[0.14em] text-faint">
                  or
                </span>
                <div className="h-px flex-1 bg-line" />
              </div>

              <form className="space-y-4" onSubmit={onSubmit}>
                {!isLogin && (
                  <Field
                    icon={User}
                    id="name"
                    label="Full name"
                    placeholder="John Doe"
                    value={form.name}
                    onChange={update("name")}
                  />
                )}
                <Field
                  icon={Mail}
                  id="email"
                  label="Email"
                  placeholder="you@example.com"
                  type="email"
                  value={form.email}
                  onChange={update("email")}
                />
                <Field
                  icon={Lock}
                  id="password"
                  label="Password"
                  placeholder="Password"
                  type="password"
                  value={form.password}
                  onChange={update("password")}
                />
                {!isLogin && (
                  <Field
                    icon={Lock}
                    id="confirmPassword"
                    label="Confirm password"
                    placeholder="Confirm password"
                    type="password"
                    value={form.confirmPassword}
                    onChange={update("confirmPassword")}
                  />
                )}
                {isLogin && (
                  <div className="text-right">
                    <Link href="#" className="text-xs font-black underline underline-offset-4">
                      Forgot password?
                    </Link>
                  </div>
                )}

                {message && (
                  <p className="border border-ink bg-white px-3 py-2 text-sm font-semibold text-ink">
                    {message}
                  </p>
                )}

                {notice && (
                  <p className="border border-line bg-white px-3 py-2 text-sm font-semibold text-subtle">
                    {notice}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="flex h-11 w-full items-center justify-center gap-2 bg-ink text-sm font-black text-white transition disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading
                    ? "Please wait..."
                    : isLogin
                      ? "Sign In"
                      : "Create Account"}
                  {!loading && <ArrowRight className="size-4" />}
                </button>
              </form>
            </div>

            <p className="mt-6 text-center text-sm font-semibold text-subtle">
              {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
              <button
                onClick={switchMode}
                className="font-black text-ink underline underline-offset-4"
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

