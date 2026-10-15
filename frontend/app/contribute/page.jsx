import Link from "next/link"
import {
  ArrowRight,
  BookOpen,
  Bug,
  Code,
  FileText,
  Globe,
  HeartHandshake,
  Megaphone,
  Palette,
  Sparkles,
} from "lucide-react"

import { PageHeader } from "@/components/page-header"
import { contributionTypes, featuredProjects, heroPoints } from "@/lib/data/contribute.data"

/** Contribute page: ways to contribute + featured projects. */
export default function ContributePage() {
  return (
    <div className="min-h-screen bg-canvas text-ink">
      <PageHeader
        eyebrow="Contribute"
        title="Use your skills where a team actually needs them."
        description="Find open roles across design, code, writing, testing, and mentorship. Every contribution becomes part of your project history."
        actions={
          <Link href="/find-projects" className="mt-6 inline-flex h-11 items-center gap-2 bg-ink px-5 text-sm font-black text-white">
            Browse projects
            <ArrowRight className="size-4" />
          </Link>
        }
      />

      <section className="px-6 py-12 sm:px-10 lg:px-20 xl:px-28">
        <div className="grid gap-4 md:grid-cols-3">
          {heroPoints.map(([Icon, title, description]) => (
            <div key={title} className="border border-line bg-surface p-5">
              <Icon className="size-5" />
              <h2 className="mt-5 text-xl font-black">{title}</h2>
              <p className="mt-2 font-semibold text-subtle">{description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-line bg-surface px-6 py-16 sm:px-10 lg:px-20 xl:px-28">
        <div className="mb-8">
          <h2 className="text-3xl font-black">Ways to contribute</h2>
          <p className="mt-2 font-semibold text-subtle">
            Choose the work type that fits your strengths and availability.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {contributionTypes.map(([Icon, title, description, skills, openings]) => (
            <article key={title} className="border border-line bg-white p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex size-11 items-center justify-center bg-charcoal text-white">
                  <Icon className="size-5" />
                </div>
                <span className="border border-line px-2.5 py-1 text-xs font-black text-subtle">
                  {openings} openings
                </span>
              </div>
              <h3 className="mt-5 text-2xl font-black">{title}</h3>
              <p className="mt-2 font-semibold leading-relaxed text-subtle">{description}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <span key={skill} className="border border-line px-2.5 py-1 text-xs font-black text-subtle">
                    {skill}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="px-6 py-16 sm:px-10 lg:px-20 xl:px-28">
        <div className="mb-8">
          <h2 className="text-3xl font-black">Projects needing help now</h2>
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          {featuredProjects.map(([title, description, needs, urgency]) => (
            <article key={title} className="border border-line bg-surface p-5">
              <span className={`px-2.5 py-1 text-xs font-black ${urgency === "High" ? "bg-ink text-white" : "border border-ink"}`}>
                {urgency} priority
              </span>
              <h3 className="mt-5 text-2xl font-black">{title}</h3>
              <p className="mt-2 font-semibold text-subtle">{description}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {needs.map((need) => (
                  <span key={need} className="border border-ink bg-white px-3 py-1 text-sm font-black">
                    {need}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
