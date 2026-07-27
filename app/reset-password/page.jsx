"use client"

import { Suspense, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Sparkles } from "lucide-react"
import { apiFetch } from "@/lib/api"

function ResetForm() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token")
  const router = useRouter()

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(event) {
    event.preventDefault()

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    setLoading(true)
    setError("")

    try {
      await apiFetch("/api/v1/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ token, password, confirmPassword }),
      })
      setDone(true)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <div className="mt-8 border border-[#d9d8d2] bg-[#fbfbfa] p-6 text-center">
        <p className="font-black">Invalid reset link</p>
        <p className="mt-2 text-sm font-semibold text-[#55544f]">
          This link is missing the reset token. Check the link you received.
        </p>
        <Link
          href="/forgot-password"
          className="mt-6 inline-flex items-center gap-2 text-sm font-black underline underline-offset-4"
        >
          Request a new reset link
        </Link>
      </div>
    )
  }

  if (done) {
    return (
      <div className="mt-8 border border-[#d9d8d2] bg-[#fbfbfa] p-6 text-center">
        <div className="mx-auto flex size-12 items-center justify-center bg-[#171717]">
          <Sparkles className="size-6 text-white" />
        </div>
        <p className="mt-4 font-black">Password reset successfully</p>
        <p className="mt-2 text-sm font-semibold text-[#55544f]">
          You can now sign in with your new password.
        </p>
        <Link
          href="/account"
          className="mt-6 inline-flex h-11 items-center justify-center gap-2 bg-[#171717] px-6 text-sm font-black text-white"
        >
          Sign in
        </Link>
      </div>
    )
  }

  return (
    <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
      <div>
        <label className="text-sm font-black" htmlFor="password">New password</label>
        <input
          id="password"
          type="password"
          required
          minLength={10}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 h-11 w-full border border-[#d9d8d2] bg-white px-3 font-semibold outline-none focus:border-[#171717]"
          placeholder="At least 10 characters"
        />
      </div>
      <div>
        <label className="text-sm font-black" htmlFor="confirmPassword">Confirm new password</label>
        <input
          id="confirmPassword"
          type="password"
          required
          minLength={10}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="mt-1 h-11 w-full border border-[#d9d8d2] bg-white px-3 font-semibold outline-none focus:border-[#171717]"
          placeholder="Repeat your password"
        />
      </div>
      <p className="text-xs font-semibold text-[#55544f]">
        Must be at least 10 characters with uppercase, lowercase, digit, and special character.
      </p>
      {error && (
        <p className="border border-[#171717] bg-white p-3 text-sm font-bold">{error}</p>
      )}
      <button
        type="submit"
        disabled={loading}
        className="flex h-11 w-full items-center justify-center gap-2 bg-[#171717] text-sm font-black text-white disabled:opacity-60"
      >
        {loading ? "Resetting..." : "Reset password"}
      </button>
    </form>
  )
}

export default function ResetPasswordPage() {
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
        <h1 className="mt-4 text-4xl font-black leading-[0.95]">Set a new password</h1>
        <p className="mt-4 text-base font-semibold text-[#55544f]">
          Choose a strong password you haven&apos;t used before.
        </p>

        <Suspense fallback={<div className="mt-8 h-48 animate-pulse bg-[#efeee8]" />}>
          <ResetForm />
        </Suspense>
      </div>
    </div>
  )
}
