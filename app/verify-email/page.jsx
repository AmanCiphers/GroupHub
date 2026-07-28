"use client"

import { Suspense, useCallback, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { CheckCircle2, XCircle } from "lucide-react"
import { apiFetch, setAuthSession } from "@/lib/api"

function VerifyEmailPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  const [status, setStatus] = useState("verifying")
  const [error, setError] = useState("")

  const doVerify = useCallback(async () => {
    if (!token) {
      setStatus("error")
      setError("Missing verification token.")
      return
    }

    try {
      const payload = await apiFetch(`/api/v1/auth/verify-email?token=${encodeURIComponent(token)}`)
      if (payload.data?.user) {
        setAuthSession({ user: payload.data.user })
      }
      setStatus("success")
    } catch (err) {
      setStatus("error")
      setError(err.message || "Verification failed. The link may have expired.")
    }
  }, [token])

  useEffect(() => {
    if (status === "success") {
      const timer = setTimeout(() => router.push("/dashboard"), 4000)
      return () => clearTimeout(timer)
    }
  }, [status, router])

  useEffect(() => {
    doVerify()
  }, [doVerify])

  return (
    <div className="min-h-screen bg-[#f7f7f3] text-[#171717] flex items-center justify-center px-6">
      <div className="w-full max-w-md text-center">
        {status === "verifying" && (
          <div>
            <div className="mx-auto size-12 animate-spin rounded-full border-4 border-[#d9d8d2] border-t-[#171717]" />
            <h1 className="mt-6 text-2xl font-black">Verifying your email</h1>
            <p className="mt-3 font-semibold text-[#55544f]">Please wait while we verify your email address.</p>
          </div>
        )}

        {status === "success" && (
          <div>
            <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-[#171717]">
              <CheckCircle2 className="size-8 text-white" />
            </div>
            <h1 className="mt-6 text-3xl font-black leading-[1.1]">You&apos;re all set!</h1>
            <p className="mt-4 text-lg font-semibold text-[#55544f] leading-relaxed">
              Your email is verified and your account is active. You can now create projects, join teams, and start building.
            </p>
            <div className="mt-8 border border-[#d9d8d2] bg-[#fbfbfa] p-5 text-left">
              <p className="text-sm font-black uppercase tracking-[0.12em] text-[#77766f]">Ready to go</p>
              <ul className="mt-4 space-y-3">
                {["Complete your profile with skills and interests", "Browse projects looking for your skills", "Create your own project and recruit a team"].map((step, i) => (
                  <li key={step} className="flex items-start gap-3 text-sm font-semibold text-[#55544f]">
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[#171717] text-xs font-black text-white">{i + 1}</span>
                    {step}
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Link
                href="/dashboard"
                className="inline-flex h-12 items-center gap-2 bg-[#171717] px-8 text-sm font-black text-white transition hover:bg-[#2f2f2d]"
              >
                Go to Dashboard
              </Link>
              <Link
                href="/account"
                className="inline-flex h-12 items-center gap-2 border border-[#d9d8d2] bg-white px-8 text-sm font-black text-[#171717] transition hover:border-[#171717]"
              >
                Complete Profile
              </Link>
            </div>
          </div>
        )}

        {status === "error" && (
          <div>
            <div className="mx-auto flex size-16 items-center justify-center rounded-full border-2 border-[#171717]">
              <XCircle className="size-8 text-[#171717]" />
            </div>
            <h1 className="mt-6 text-2xl font-black">Verification link expired</h1>
            <p className="mt-3 font-semibold text-[#55544f] leading-relaxed">{error}</p>
            <p className="mt-2 text-sm font-semibold text-[#77766f]">
              Sign in to request a new verification link.
            </p>
            <div className="mt-8 flex flex-col items-center gap-3">
              <Link
                href="/account"
                className="inline-flex h-12 items-center gap-2 bg-[#171717] px-8 text-sm font-black text-white transition hover:bg-[#2f2f2d]"
              >
                Sign in
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function VerifyEmailPageWrapper() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#f7f7f3] text-[#171717] flex items-center justify-center px-6">
        <div className="text-center">
          <div className="mx-auto size-12 animate-spin rounded-full border-4 border-[#d9d8d2] border-t-[#171717]" />
          <p className="mt-6 text-lg font-black">Loading...</p>
        </div>
      </div>
    }>
      <VerifyEmailPage />
    </Suspense>
  )
}
