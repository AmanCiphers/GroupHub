import Link from "next/link"
import { ArrowRight, CircleDot, Lightbulb, Target, Users } from "lucide-react"

const values = [
  ["Community first", "Collaboration should feel approachable, visible, and useful from the first project."],
  ["Skill growth", "Every team should give people a way to contribute today and learn what comes next."],
  ["Clear roles", "Good projects move faster when needs, ownership, and expectations are explicit."],
  ["Real momentum", "We optimize for teams that ship proof, not profiles that sit untouched."],
]

const team = [
  ["Alex Chen", "Founder", "Started GroupHub after struggling to find design partners for student projects."],
  ["Sarah Mitchell", "Product", "Shapes the project matching flow and early-team experience."],
  ["Marcus Johnson", "Community", "Builds contributor rituals, onboarding, and trust systems."],
  ["Emily Rodriguez", "Engineering", "Turns collaboration workflows into simple product surfaces."],
]

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#f7f7f3] text-[#171717]">
      <section className="border-b border-[#d9d8d2] bg-[#fbfbfa] px-6 py-16 sm:px-10 lg:px-20 xl:px-28">
        <div className="grid gap-10 lg:grid-cols-[1fr_360px] lg:items-end">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-[#62615d]">
              About GroupHub
            </p>
            <h1 className="mt-5 max-w-4xl text-4xl font-black leading-[0.95] sm:text-6xl">
              We help people turn unfinished ideas into working teams.
            </h1>
          </div>
          <p className="text-lg font-semibold leading-snug text-[#55544f]">
            GroupHub exists for builders who have momentum but not every skill.
            The product makes missing roles visible and makes joining a team feel
            less awkward.
          </p>
        </div>
      </section>

      <section className="px-6 py-16 sm:px-10 lg:px-20 xl:px-28">
        <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="border border-[#171717] bg-[#2f2f2d] p-7 text-white">
            <Target className="size-8" />
            <h2 className="mt-6 text-3xl font-black">The mission</h2>
            <p className="mt-4 text-lg font-semibold leading-snug text-white/75">
              Make collaboration easier to start, easier to trust, and easier
              to finish for students, early professionals, and independent builders.
            </p>
          </div>

          <div className="border border-[#d9d8d2] bg-[#fbfbfa] p-7">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-[#62615d]">
              Origin
            </p>
            <div className="mt-5 space-y-5 text-lg font-semibold leading-relaxed text-[#4a4945]">
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

      <section className="border-y border-[#d9d8d2] bg-[#fbfbfa] px-6 py-16 sm:px-10 lg:px-20 xl:px-28">
        <div className="grid gap-10 lg:grid-cols-[0.7fr_1.3fr]">
          <div>
            <Lightbulb className="size-8" />
            <h2 className="mt-5 text-3xl font-black">Principles</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {values.map(([title, description]) => (
              <div key={title} className="border border-[#d9d8d2] bg-white p-5">
                <CircleDot className="size-5" />
                <h3 className="mt-4 text-xl font-black">{title}</h3>
                <p className="mt-2 font-semibold leading-relaxed text-[#55544f]">
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
            <div key={name} className="border border-[#d9d8d2] bg-[#fbfbfa] p-5">
              <div className="flex size-14 items-center justify-center rounded-full bg-[#2f2f2d] text-lg font-black text-white">
                {name.split(" ").map((part) => part[0]).join("")}
              </div>
              <h3 className="mt-5 text-xl font-black">{name}</h3>
              <p className="mt-1 text-sm font-black uppercase tracking-[0.12em] text-[#77766f]">
                {role}
              </p>
              <p className="mt-3 text-sm font-semibold leading-relaxed text-[#55544f]">
                {bio}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
