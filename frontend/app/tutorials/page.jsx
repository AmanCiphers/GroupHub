import Link from "next/link"
import {
  ArrowRight,
  BookOpen,
  Clock,
  MessageSquare,
  Play,
  Rocket,
  Settings,
  Users,
} from "lucide-react"

import { PageHeader } from "@/components/page-header"
import { categories, tutorials } from "@/lib/data/tutorials.data"

/** Tutorials catalog with categories and CTA. */
export default function TutorialsPage() {
  return (
    <div className="min-h-screen bg-canvas text-ink">
      <PageHeader
        eyebrow="Tutorials"
        title="Learn the habits that make small teams ship."
        description="Short guides for creating a profile, starting projects, applying to roles, and keeping collaboration clear."
      />

      <section className="px-6 py-8 sm:px-10 lg:px-20 xl:px-28">
        <div className="flex flex-wrap gap-2">
          {categories.map((category, index) => (
            <button
              key={category}
              className={`border px-4 py-2 text-sm font-black ${
                index === 0
                  ? "border-ink bg-ink text-white"
                  : "border-line bg-surface text-subtle hover:border-ink"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </section>

      <section className="px-6 pb-20 sm:px-10 lg:px-20 xl:px-28">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {tutorials.map(([title, description, category, duration, difficulty, Icon]) => (
            <article key={title} className="group flex min-h-[260px] flex-col border border-line bg-surface p-5 transition hover:border-ink">
              <div className="flex items-start justify-between gap-4">
                <div className="flex size-11 items-center justify-center bg-charcoal text-white">
                  <Icon className="size-5" />
                </div>
                <span className="border border-line bg-white px-2.5 py-1 text-xs font-black text-subtle">
                  {difficulty}
                </span>
              </div>
              <h2 className="mt-5 text-xl font-black leading-tight group-hover:underline group-hover:underline-offset-4">
                {title}
              </h2>
              <p className="mt-3 flex-1 text-sm font-semibold leading-relaxed text-subtle">
                {description}
              </p>
              <div className="mt-5 flex items-center justify-between border-t border-line pt-4 text-sm font-bold text-quiet">
                <span className="flex items-center gap-1.5">
                  <Clock className="size-4" />
                  {duration}
                </span>
                <span className="flex items-center gap-1.5">
                  <BookOpen className="size-4" />
                  {category}
                </span>
              </div>
              <button className="mt-5 inline-flex h-10 items-center justify-center gap-2 border border-ink text-sm font-black transition hover:bg-ink hover:text-white">
                <Play className="size-4" />
                Start
              </button>
            </article>
          ))}
        </div>

        <div className="mt-12 border border-ink bg-charcoal p-8 text-white">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-3xl font-black">Ready to use it on a real project?</h2>
              <p className="mt-2 font-semibold text-white/70">
                Apply the guides while browsing live teams and open roles.
              </p>
            </div>
            <Link href="/find-projects" className="inline-flex h-11 w-fit items-center gap-2 border border-white px-5 text-sm font-black transition hover:bg-white hover:text-ink">
              Find projects
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
