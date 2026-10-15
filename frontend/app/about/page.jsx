import Link from "next/link"
import { ArrowRight, CircleDot, Lightbulb, Target, Users } from "lucide-react"
import { getInitials } from "@/lib/utils"
import { values, team } from "@/lib/data/about.data"
import { PageHeader } from "@/components/page-header"

/** About page: mission, values, team. */
export default function AboutPage() {
  return (
    <div className="min-h-screen bg-canvas text-ink">
      <PageHeader
        eyebrow="About GroupHub"
        title="We help people turn unfinished ideas into working teams."
        description="GroupHub exists for builders who have momentum but not every skill. The product makes missing roles visible and makes joining a team feel less awkward."
      />

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
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
    </div>
  )
}
