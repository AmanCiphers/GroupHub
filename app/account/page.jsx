"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowRight, Github, Lock, Mail, User } from "lucide-react"

const profilePoints = [
  "Show your skills and availability",
  "Save projects and track applications",
  "Create teams around early ideas",
]

export default function AccountPage() {
  const [isLogin, setIsLogin] = useState(true)

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
                <button className="flex h-11 items-center justify-center gap-2 border border-[#171717] bg-white text-sm font-black">
                  <Github className="size-4" />
                  Continue with GitHub
                </button>
                <button className="flex h-11 items-center justify-center gap-2 border border-[#d9d8d2] bg-white text-sm font-black">
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

              <form className="space-y-4">
                {!isLogin && (
                  <Field icon={User} id="name" label="Full name" placeholder="John Doe" />
                )}
                <Field icon={Mail} id="email" label="Email" placeholder="you@example.com" type="email" />
                <Field icon={Lock} id="password" label="Password" placeholder="Password" type="password" />
                {!isLogin && (
                  <Field icon={Lock} id="confirmPassword" label="Confirm password" placeholder="Confirm password" type="password" />
                )}
                {isLogin && (
                  <div className="text-right">
                    <Link href="#" className="text-xs font-black underline underline-offset-4">
                      Forgot password?
                    </Link>
                  </div>
                )}
                <button className="flex h-11 w-full items-center justify-center gap-2 bg-[#171717] text-sm font-black text-white">
                  {isLogin ? "Sign In" : "Create Account"}
                  <ArrowRight className="size-4" />
                </button>
              </form>
            </div>

            <p className="mt-6 text-center text-sm font-semibold text-[#55544f]">
              {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
              <button
                onClick={() => setIsLogin(!isLogin)}
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

function Field({ icon: Icon, id, label, type = "text", placeholder }) {
  return (
    <label htmlFor={id} className="block">
      <span className="text-sm font-black">{label}</span>
      <span className="relative mt-2 block">
        <Icon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#77766f]" />
        <input
          id={id}
          type={type}
          placeholder={placeholder}
          className="h-11 w-full border border-[#d9d8d2] bg-white pl-10 pr-3 font-semibold outline-none transition focus:border-[#171717]"
          required
        />
      </span>
    </label>
  )
}
