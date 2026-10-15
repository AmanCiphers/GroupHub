import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Check, CircleDot, Users } from "lucide-react"
import { actions, projectRoles, steps } from "@/lib/data/home.data"

/** Marketing landing page. */
export default function HomePage() {
  return (
    <div className="bg-canvas text-ink">
      <section className="grid min-h-[100svh] grid-cols-1 lg:grid-cols-[1fr_29vw]">
        <div className="flex bg-charcoal px-6 pb-16 pt-36 text-white sm:px-10 sm:pb-20 lg:min-h-[90svh] lg:px-20 lg:pb-24 lg:pt-44 xl:px-28">
          <div className="flex w-full max-w-3xl flex-col items-center justify-center text-center sm:items-start sm:text-left">
            <h1 className="max-w-4xl text-4xl font-black leading-[0.95] tracking-normal text-white sm:text-5xl lg:text-6xl">
              Build What You Couldn&apos;t Alone
            </h1>

            <div className="mt-5 grid max-w-xl grid-cols-[1fr_auto_1fr] gap-3 text-base font-bold leading-tight text-white sm:mt-8 sm:gap-4 sm:text-2xl">
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

            <p className="mt-5 max-w-xl text-sm font-semibold leading-snug text-white/85 sm:mt-8 sm:text-lg">
              GroupHub turns early ideas into focused project teams, matching
              open roles with people ready to learn, contribute, and ship.
            </p>

            <div className="mt-8 flex flex-col items-center gap-3 sm:mt-12 sm:flex-row sm:justify-start">
              <Link
                href="/dashboard"
                className="inline-flex h-12 w-full items-center justify-center rounded-md border border-white/70 px-8 text-sm font-semibold text-white transition hover:bg-white hover:text-charcoal sm:h-11 sm:w-fit"
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

        <div className="relative flex items-center justify-center border-b border-line bg-surface px-6 py-12 sm:px-8 sm:py-14 lg:min-h-[90svh] lg:border-b-0 lg:px-10 lg:py-20">
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

      <section className="border-y border-line bg-surface px-6 py-12 sm:px-10 sm:py-16 lg:px-20 xl:px-28">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start lg:gap-12">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-quiet">
              Project-first
            </p>
            <h2 className="mt-4 max-w-xl text-3xl font-black leading-[1.05] tracking-normal text-ink sm:text-5xl">
              Turn loose ideas into teams with clear roles.
            </h2>
          </div>

          <div className="grid gap-3">
            {projectRoles.map((project) => (
              <Link
                href="/find-projects"
                key={project.title}
                className="group grid gap-4 rounded-md border border-line bg-white p-4 transition hover:border-ink sm:grid-cols-[1fr_auto] sm:items-center sm:p-5"
              >
                <div>
                  <div className="flex items-center gap-2 text-sm font-semibold text-quiet">
                    <CircleDot className="size-4" />
                    {project.status}
                  </div>
                  <h3 className="mt-2 text-xl font-black text-ink">
                    {project.title}
                  </h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {project.roles.map((role) => (
                    <span
                      key={role}
                      className="rounded-full border border-line px-3 py-1 text-sm font-semibold text-ink-soft"
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

      <section className="bg-canvas px-6 py-14 sm:px-10 sm:py-20 lg:px-20 xl:px-28 flex flex-col items-center justify-center ">
        <div className="grid gap-8 lg:grid-cols-3 lg:gap-12 justify-between  lg:pl-60">
          <div className="lg:col-span-1 ">
            <div className="flex size-12 items-center justify-center rounded-full bg-charcoal text-white">
              <Users className="size-5" />
            </div>
            <h2 className="mt-5 text-3xl font-black leading-[1.05] text-ink sm:mt-6">
              Simple enough to start. Structured enough to finish.
            </h2>
          </div>

          <div className="grid gap-4 lg:col-span-2">
            {steps.map((step, index) => (
              <div
                key={step}
                className="grid grid-cols-[auto_auto_1fr] items-start gap-4 border-b border-line py-5 sm:flex sm:items-center sm:gap-5"
              >
                <span className="text-sm font-black text-quiet">
                  0{index + 1}
                </span>
                <Check className="size-5 shrink-0 text-ink" />
                <p className="text-lg font-bold leading-snug text-ink sm:text-xl">{step}</p>
              </div>
            ))}
            <Link
              href="/tutorials"
              className="mt-6 inline-flex w-fit items-center gap-2 text-sm font-black text-ink underline underline-offset-4"
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
