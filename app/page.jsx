import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Check, CircleDot, Users } from "lucide-react"

const actions = [
  ["Discover Projects", "Join Teams"],
  ["Start Ideas", "Build Proof"],
]

const projectRoles = [
  {
    title: "AI Study Companion",
    roles: ["Frontend", "ML", "Product"],
    status: "2 roles open",
  },
  {
    title: "Campus Event Map",
    roles: ["Design", "Backend"],
    status: "Recruiting",
  },
  {
    title: "Portfolio Builder",
    roles: ["React", "UX Writing"],
    status: "New",
  },
]

const steps = [
  "Post what you want to build",
  "Match with complementary skills",
  "Ship with a focused team",
]

export default function HomePage() {
  return (
    <div className="bg-[#f7f7f3] text-[#171717]">
      <section className="grid min-h-[100svh] grid-cols-1 lg:grid-cols-[1fr_29vw]">
        <div className="flex bg-[#2f2f2d] px-6 pb-10 pt-28 text-white sm:px-10 sm:pb-14 lg:min-h-[90svh] lg:px-20 lg:pb-20 lg:pt-36 xl:px-28">
          <div className="flex w-full max-w-3xl flex-col justify-center">
            <h1 className="max-w-4xl text-5xl font-black leading-[0.95] tracking-normal text-white sm:text-6xl lg:text-7xl">
              Build What You Couldn&apos;t Alone
            </h1>

            <div className="mt-7 grid max-w-xl grid-cols-[1fr_auto_1fr] gap-3 text-lg font-bold leading-tight text-white sm:mt-10 sm:gap-5 sm:text-3xl">
              <div className="space-y-2">
                {actions.map(([left]) => (
                  <p key={left}>{left}</p>
                ))}
              </div>
              <div className="h-full w-px bg-white/80" />
              <div className="space-y-2">
                {actions.map(([, right]) => (
                  <p key={right}>{right}</p>
                ))}
              </div>
            </div>

            <p className="mt-7 max-w-xl text-base font-semibold leading-snug text-white/85 sm:mt-10 sm:text-xl">
              GroupHub turns early ideas into focused project teams, matching
              open roles with people ready to learn, contribute, and ship.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:mt-12 sm:flex-row">
              <Link
                href="/dashboard"
                className="inline-flex h-12 w-full items-center justify-center rounded-md border border-white/70 px-8 text-sm font-semibold text-white transition hover:bg-white hover:text-[#2f2f2d] sm:h-11 sm:w-fit"
              >
                Get Started
              </Link>
              <Link
                href="/find-projects"
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-md bg-white/10 px-5 text-sm font-semibold text-white transition hover:bg-white/15 sm:h-11 sm:w-fit sm:bg-transparent sm:px-2 sm:text-white/85 sm:hover:text-white"
              >
                Browse projects
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
        </div>

        <div className="relative flex items-center justify-center border-b border-[#d9d8d2] bg-[#fbfbfa] px-6 py-8 sm:px-8 sm:py-10 lg:min-h-[90svh] lg:border-b-0 lg:px-10 lg:py-16">
          <Image
            src="/home-team-illustration.png"
            alt="Students collaborating around a table"
            width={760}
            height={570}
            priority
            className="w-full max-w-[320px] object-contain sm:max-w-[440px] lg:max-w-[520px]"
          />
        </div>
      </section>

      <section className="border-y border-[#d9d8d2] bg-[#fbfbfa] px-6 py-12 sm:px-10 sm:py-16 lg:px-20 xl:px-28">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start lg:gap-12">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#62615d]">
              Project-first
            </p>
            <h2 className="mt-4 max-w-xl text-3xl font-black leading-[1.05] tracking-normal text-[#171717] sm:text-5xl">
              Turn loose ideas into teams with clear roles.
            </h2>
          </div>

          <div className="grid gap-3">
            {projectRoles.map((project) => (
              <Link
                href="/find-projects"
                key={project.title}
                className="group grid gap-4 rounded-md border border-[#d9d8d2] bg-white p-4 transition hover:border-[#171717] sm:grid-cols-[1fr_auto] sm:items-center sm:p-5"
              >
                <div>
                  <div className="flex items-center gap-2 text-sm font-semibold text-[#62615d]">
                    <CircleDot className="size-4" />
                    {project.status}
                  </div>
                  <h3 className="mt-2 text-xl font-black text-[#171717]">
                    {project.title}
                  </h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {project.roles.map((role) => (
                    <span
                      key={role}
                      className="rounded-full border border-[#d9d8d2] px-3 py-1 text-sm font-semibold text-[#31312f]"
                    >
                      {role}
                    </span>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#f7f7f3] px-6 py-14 sm:px-10 sm:py-20 lg:px-20 xl:px-28">
        <div className="grid gap-8 lg:grid-cols-3 lg:gap-12">
          <div className="lg:col-span-1">
            <div className="flex size-12 items-center justify-center rounded-full bg-[#2f2f2d] text-white">
              <Users className="size-5" />
            </div>
            <h2 className="mt-5 text-3xl font-black leading-[1.05] text-[#171717] sm:mt-6">
              Simple enough to start. Structured enough to finish.
            </h2>
          </div>

          <div className="grid gap-4 lg:col-span-2">
            {steps.map((step, index) => (
              <div
                key={step}
                className="grid grid-cols-[auto_auto_1fr] items-start gap-4 border-b border-[#d9d8d2] py-5 sm:flex sm:items-center sm:gap-5"
              >
                <span className="text-sm font-black text-[#62615d]">
                  0{index + 1}
                </span>
                <Check className="size-5 shrink-0 text-[#171717]" />
                <p className="text-lg font-bold leading-snug text-[#171717] sm:text-xl">{step}</p>
              </div>
            ))}
            <Link
              href="/tutorials"
              className="mt-6 inline-flex w-fit items-center gap-2 text-sm font-black text-[#171717] underline underline-offset-4"
            >
              See how it works
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
