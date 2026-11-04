"use client"

import Link from "next/link"
import { ArrowRight, CircleDot, Lightbulb, Target, Users } from "lucide-react"
import { getInitials } from "@/lib/utils"
import { values, team } from "@/lib/data/about.data"
import { PageHeader } from "@/components/page-header"
import {
  CardSkeleton,
  TextSkeleton,
  ProfilePreviewSkeleton,
  PageHeaderSkeleton,
} from "@/components/skeleton"

/** About page: mission, values, team. */
export default function AboutPage() {
  return (
    <div className="min-h-screen bg-canvas text-ink">
      <PageHeader
        eyebrow="About GroupHub"
        title="We help people turn unfinished ideas into working teams."
        description="GroupHub exists for builders who have momentum but not every skill. The product makes missing roles visible and makes joining a team feel less awkward."
      >
  
      </PageHeader>

      <section className="px-6 py-16 sm:px-10 lg:px-20 xl:px-28">
        <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="border border-ink bg-charcoal p-7 text-white">
            <Target className="size-8" />
            <h2 className="mt-6 text-3xl font-black">The mission</h2>
            <p className="mt-4 text-lg font-semibold leading-snug text-white/75">
              Make collaboration easier to start, easier to trust, and easier
              to finish for students, early professionals, and independent builders.
            </p>
          </div>

          <div className="border border-line bg-surface p-7">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-quiet">
              Origin
            </p>
            <div className="mt-5 space-y-5 text-lg font-semibold leading-relaxed text-body">
              <p>
                The first version came from a familiar problem: someone had an
                idea, some motivation, and a partial skill set, but no obvious
                way to find the missing teammates.
              </p>
              <p>
                Instead of building another social profile network, GroupHub is
                becoming a project-first workspace where roles, stage, commitment,
                and skill fit are visible before anyone applies.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-line bg-surface px-6 py-16 sm:px-10 lg:px-20 xl:px-28">
        <div className="grid gap-10 lg:grid-cols-[0.7fr_1.3fr]">
          <div>
            <Lightbulb className="size-8" />
            <h2 className="mt-5 text-3xl font-black">Principles</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {values.map(([title, description]) => (
              <div key={title} className="border border-line bg-white p-5">
                <CircleDot className="size-5" />
                <h3 className="mt-4 text-xl font-black">{title}</h3>
                <p className="mt-2 font-semibold leading-relaxed text-subtle">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-16 sm:px-10 lg:px-20 xl:px-28">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Users className="size-8" />
            <h2 className="mt-5 text-3xl font-black">The team behind it</h2>
          </div>
          <Link href="/contact" className="inline-flex items-center gap-2 text-sm font-black underline underline-offset-4">
            Talk to us
            <ArrowRight className="size-4" />
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
          {team.map(([name, role, bio]) => (
            <div key={name} className="border border-line bg-surface p-5">
              <div className="flex size-14 items-center justify-center rounded-full bg-charcoal text-lg font-black text-white">
                {getInitials(name)}
              </div>
              <h3 className="mt-5 text-xl font-black">{name}</h3>
              <p className="mt-1 text-sm font-black uppercase tracking-[0.12em] text-faint">
                {role}
              </p>
              <p className="mt-3 text-sm font-semibold leading-relaxed text-subtle">
                {bio}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-line bg-surface px-6 py-16 sm:px-10 lg:px-20 xl:px-28">
        <div className="text-center max-w-2xl mx-auto">
          <Lightbulb className="size-10 mx-auto" />
          <h2 className="mt-5 text-3xl font-black">Ready to build with us?</h2>
          <p className="mt-3 text-lg font-semibold text-subtle">
            Whether you have a project idea or want to contribute your skills,
            GroupHub helps you find the right team.
          </p>
          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/find-projects"
              className="inline-flex h-11 w-fit items-center gap-2 border border-ink bg-ink px-6 text-sm font-black text-white transition hover:bg-transparent hover:text-ink mx-auto"
            >
              Find a project
              <ArrowRight className="size-4" />
            </Link>
            <Link
              href="/projects/new"
              className="inline-flex h-11 w-fit items-center gap-2 border border-ink px-6 text-sm font-black transition hover:bg-ink hover:text-white mx-auto"
            >
              Start a project
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

/** Static page — no data fetching needed, but keep skeleton for consistency. */
function AboutLoading() {
  return (
    <div className="min-h-screen bg-canvas text-ink">
      <PageHeader
        eyebrow="About GroupHub"
        title="We help people turn unfinished ideas into working teams."
        description="GroupHub exists for builders who have momentum but not every skill."
      >
        <PageHeaderSkeleton />
      </PageHeader>

      <section className="px-6 py-16 sm:px-10 lg:px-20 xl:px-28">
        <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          <CardSkeleton className="h-[200px]" />
          <CardSkeleton className="h-[200px]" />
        </div>
      </section>

      <section className="border-y border-line bg-surface px-6 py-16 sm:px-10 lg:px-20 xl:px-28">
        <div className="grid gap-10 lg:grid-cols-[0.7fr_1.3fr]">
          <CardSkeleton className="h-[100px]" />
          <div className="grid gap-4 md:grid-cols-2">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        </div>
      </section>

      <section className="px-6 py-16 sm:px-10 lg:px-20 xl:px-28">
        <CardSkeleton className="h-[150px]" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
          <ProfilePreviewSkeleton />
          <ProfilePreviewSkeleton />
        </div>
      </section>

      <section className="border-y border-line bg-surface px-6 py-16 sm:px-10 lg:px-20 xl:px-28">
        <CardSkeleton className="max-w-2xl mx-auto" />
      </section>
    </div>
  )
}