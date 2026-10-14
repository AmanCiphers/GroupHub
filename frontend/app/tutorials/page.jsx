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

const categories = ["All", "Getting Started", "Projects", "Collaboration", "Advanced"]

const tutorials = [
  ["Creating Your First Profile", "Showcase skills, availability, and what you want to learn.", "Getting Started", "5 min", "Beginner", Users],
  ["Launching a New Project", "Write a listing with clear roles and a useful first milestone.", "Projects", "8 min", "Beginner", Rocket],
  ["Finding the Right Team Members", "Use role and skill filters to find complementary contributors.", "Getting Started", "6 min", "Beginner", Users],
  ["Applying to Projects", "Explain fit, availability, and what you can ship first.", "Projects", "7 min", "Beginner", BookOpen],
  ["Effective Team Communication", "Keep async teams aligned without adding process drag.", "Collaboration", "10 min", "Intermediate", MessageSquare],
  ["Managing Project Milestones", "Break ideas into small proofs and visible progress.", "Projects", "12 min", "Intermediate", Settings],
  ["Building Your Reputation", "Turn reliable contributions into profile trust.", "Collaboration", "8 min", "Intermediate", Users],
  ["Advanced Search Techniques", "Find narrow roles, early projects, and high-fit teams faster.", "Advanced", "6 min", "Advanced", Settings],
]

export default function TutorialsPage() {
  return (
    <div className="min-h-screen bg-[#f7f7f3] text-[#171717]">
      <section className="border-b border-[#d9d8d2] bg-[#fbfbfa] px-6 py-16 sm:px-10 lg:px-20 xl:px-28">
        <div className="grid gap-10 lg:grid-cols-[1fr_420px] lg:items-end">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-[#62615d]">
              Tutorials
            </p>
            <h1 className="mt-5 max-w-4xl text-4xl font-black leading-[0.95] sm:text-6xl">
              Learn the habits that make small teams ship.
            </h1>
          </div>
          <p className="text-lg font-semibold leading-snug text-[#55544f]">
            Short guides for creating a profile, starting projects, applying to
            roles, and keeping collaboration clear.
          </p>
        </div>
      </section>

      <section className="px-6 py-8 sm:px-10 lg:px-20 xl:px-28">
        <div className="flex flex-wrap gap-2">
          {categories.map((category, index) => (
            <button
              key={category}
              className={`border px-4 py-2 text-sm font-black ${
                index === 0
                  ? "border-[#171717] bg-[#171717] text-white"
                  : "border-[#d9d8d2] bg-[#fbfbfa] text-[#55544f] hover:border-[#171717]"
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
            <article key={title} className="group flex min-h-[260px] flex-col border border-[#d9d8d2] bg-[#fbfbfa] p-5 transition hover:border-[#171717]">
              <div className="flex items-start justify-between gap-4">
                <div className="flex size-11 items-center justify-center bg-[#2f2f2d] text-white">
                  <Icon className="size-5" />
                </div>
                <span className="border border-[#d9d8d2] bg-white px-2.5 py-1 text-xs font-black text-[#55544f]">
                  {difficulty}
                </span>
              </div>
              <h2 className="mt-5 text-xl font-black leading-tight group-hover:underline group-hover:underline-offset-4">
                {title}
              </h2>
              <p className="mt-3 flex-1 text-sm font-semibold leading-relaxed text-[#55544f]">
                {description}
              </p>
              <div className="mt-5 flex items-center justify-between border-t border-[#d9d8d2] pt-4 text-sm font-bold text-[#62615d]">
                <span className="flex items-center gap-1.5">
                  <Clock className="size-4" />
                  {duration}
                </span>
                <span className="flex items-center gap-1.5">
                  <BookOpen className="size-4" />
                  {category}
                </span>
              </div>
              <button className="mt-5 inline-flex h-10 items-center justify-center gap-2 border border-[#171717] text-sm font-black transition hover:bg-[#171717] hover:text-white">
                <Play className="size-4" />
                Start
              </button>
            </article>
          ))}
        </div>

        <div className="mt-12 border border-[#171717] bg-[#2f2f2d] p-8 text-white">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-3xl font-black">Ready to use it on a real project?</h2>
              <p className="mt-2 font-semibold text-white/70">
                Apply the guides while browsing live teams and open roles.
              </p>
            </div>
            <Link href="/find-projects" className="inline-flex h-11 w-fit items-center gap-2 border border-white px-5 text-sm font-black transition hover:bg-white hover:text-[#171717]">
              Find projects
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
