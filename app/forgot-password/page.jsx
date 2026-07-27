"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Mail, Sparkles } from "lucide-react"
import { apiFetch } from "@/lib/api"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(event) {
    event.preventDefault()
    setLoading(true)
    setError("")

    try {
      await apiFetch("/api/v1/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email }),
      })
      setSent(true)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f7f7f3] px-6">
      <div className="w-full max-w-sm">
        <Link href="/account" className="mb-8 flex items-center gap-2 text-sm font-black text-[#55544f] hover:text-[#171717]">
          <ArrowLeft className="size-4" />
          Back to sign in
        </Link>

        <p className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.18em] text-[#62615d]">
          <Sparkles className="size-4" />
          Password reset
        </p>
        <h1 className="mt-4 text-4xl font-black leading-[0.95]">Forgot your password?</h1>
        <p className="mt-4 text-base font-semibold text-[#55544f]">
          Enter your email and we&apos;ll send you a reset link if an account exists.
        </p>

        {error && (
          <p className="mt-6 border border-[#171717] bg-white p-3 text-sm font-bold">{error}</p>
        )}

        {sent ? (
          <div className="mt-8 border border-[#d9d8d2] bg-[#fbfbfa] p-6 text-center">
            <div className="mx-auto flex size-12 items-center justify-center bg-[#171717]">
              <Mail className="size-6 text-white" />
            </div>
            <p className="mt-4 font-black">Check your email</p>
            <p className="mt-2 text-sm font-semibold text-[#55544f]">
              If an account exists for {email}, you&apos;ll receive a reset link shortly.
            </p>
          </div>
        ) : (
          <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="text-sm font-black" htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 h-11 w-full border border-[#d9d8d2] bg-white px-3 font-semibold outline-none focus:border-[#171717]"
                placeholder="you@example.com"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="flex h-11 w-full items-center justify-center gap-2 bg-[#171717] text-sm font-black text-white disabled:opacity-60"
            >
              {loading ? "Sending..." : "Send reset link"}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
