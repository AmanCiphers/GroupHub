"use client"

import { Suspense, useCallback, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { CheckCircle2, XCircle } from "lucide-react"
import { apiFetch } from "@/lib/api"

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
      await apiFetch(`/api/v1/auth/verify-email?token=${encodeURIComponent(token)}`)
      setStatus("success")
    } catch (err) {
      setStatus("error")
      setError(err.message || "Verification failed. The link may have expired.")
    }
  }, [token])

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
            <CheckCircle2 className="mx-auto size-12 text-[#171717]" />
            <h1 className="mt-6 text-2xl font-black">Email verified</h1>
            <p className="mt-3 font-semibold text-[#55544f]">
              Your email has been verified. You can now use all GroupHub features.
            </p>
            <Link
              href="/dashboard"
              className="mt-8 inline-flex h-11 items-center gap-2 bg-[#171717] px-6 text-sm font-black text-white transition hover:bg-[#2f2f2d]"
            >
              Go to Dashboard
            </Link>
          </div>
        )}

        {status === "error" && (
          <div>
            <XCircle className="mx-auto size-12 text-[#171717]" />
            <h1 className="mt-6 text-2xl font-black">Verification failed</h1>
            <p className="mt-3 font-semibold text-[#55544f]">{error}</p>
            <div className="mt-8 flex flex-col items-center gap-3">
              <button
                onClick={doVerify}
                className="inline-flex h-11 items-center gap-2 bg-[#171717] px-6 text-sm font-black text-white transition hover:bg-[#2f2f2d]"
              >
                Try again
              </button>
              <Link href="/account" className="text-sm font-black underline underline-offset-4">
                Sign in or create account
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
