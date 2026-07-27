import Link from "next/link"
import { ArrowRight, CircleDot, Code, Lightbulb, Target, Users } from "lucide-react"

const values = [
  ["Discipline over destiny", "Meaningful work begins with consistency and resilience, not advantages. Keep showing up long before results are visible."],
  ["Direct collaboration", "The people you meet are the people who build your product. No account managers, no outsourcing, no layers."],
  ["Engineer-led quality", "AI accelerates the workflow, but every meaningful decision goes through human judgment and review."],
  ["Full code ownership", "Every project ships with complete code ownership. No lock-in, no black boxes."],
]

const process = [
  ["Discovery Call", "Understand goals, users, and what success looks like."],
  ["Product Planning", "Define scope, timeline, and technical direction."],
  ["Design & Build", "Iterative design and engineering with weekly updates."],
  ["Launch", "Deployment, testing, and production rollout."],
  ["Grow", "Maintenance, improvements, and future iterations."],
]

const team = [
  ["Aman", "Founder & Lead Developer", "Building CloverForge from the ground up across product direction, interface design, frontend systems, backend architecture, and shipping.", "https://aman.thecloverforge.com"],
  ["Brijesh Sharma", "Frontend Collaborator", "Frontend collaborator focused on building clean, responsive interfaces with attention to design detail and user experience.", "https://github.com/Brijesh-Sharma2004"],
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
              A CloverForge product.
            </h1>
          </div>
          <p className="text-lg font-semibold leading-snug text-[#55544f]">
            GroupHub is built by <Link href="https://thecloverforge.com" target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">CloverForge</Link>, an independent software studio in Punjab, India. We build modern platforms, tools, and experiences driven by ambition, precision, and relentless execution.
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
                a project-first workspace where roles, stage, commitment,
                and skill fit are visible before anyone applies.
              </p>
              <p>
                GroupHub is one of several products built under CloverForge, a studio founded by Aman — a Computer Science student and developer who started it after being offered a chance to build an application for a client. He wanted a name behind the work, a place where quality, learning, and long-term thinking mattered more than chasing short-term projects.
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
        <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <Code className="size-8" />
            <h2 className="mt-5 text-3xl font-black">How we build</h2>
          </div>
          <div className="grid gap-4">
            {process.map(([step, description], i) => (
              <div key={step} className="flex gap-5 border border-[#d9d8d2] bg-white p-5">
                <span className="flex size-10 shrink-0 items-center justify-center bg-[#2f2f2d] text-sm font-black text-white">
                  {i + 1}
                </span>
                <div>
                  <h3 className="text-xl font-black">{step}</h3>
                  <p className="mt-1 font-semibold leading-relaxed text-[#55544f]">
                    {description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-[#d9d8d2] bg-[#fbfbfa] px-6 py-16 sm:px-10 lg:px-20 xl:px-28">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Users className="size-8" />
            <h2 className="mt-5 text-3xl font-black">The team behind it</h2>
          </div>
          <p className="max-w-md font-semibold text-[#55544f]">
            CloverForge is still early. Projects move through a small, sharp team built around product quality, trust, and execution.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {team.map(([name, role, bio, url]) => (
            <div key={name} className="border border-[#d9d8d2] bg-white p-5">
              <div className="flex size-14 items-center justify-center rounded-full bg-[#2f2f2d] text-lg font-black text-white">
                {name.split(" ").map((part) => part[0]).join("")}
              </div>
              <div className="mt-5 flex items-center gap-3">
                <h3 className="text-xl font-black">{name}</h3>
                <span className="rounded-full bg-[#d9d8d2] px-2 py-0.5 text-xs font-black uppercase tracking-[0.1em] text-[#55544f]">
                  Active
                </span>
              </div>
              <p className="mt-1 text-sm font-black uppercase tracking-[0.12em] text-[#77766f]">
                {role}
              </p>
              <p className="mt-3 text-sm font-semibold leading-relaxed text-[#55544f]">
                {bio}
              </p>
              <Link href={url} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-1 text-sm font-black underline underline-offset-4">
                {url.replace("https://", "")}
                <ArrowRight className="size-3" />
              </Link>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
