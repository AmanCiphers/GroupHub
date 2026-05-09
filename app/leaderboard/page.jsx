import { Award, Flame, Medal, Rocket, Star, Trophy, Users } from "lucide-react"

const topContributors = [
  ["Jessica Kim", "@jessicak", 12450, 28, 156, "Elite Contributor", ["React", "TypeScript", "UI/UX"]],
  ["Marcus Chen", "@mchen", 11200, 24, 142, "Top Mentor", ["Python", "ML", "Data Science"]],
  ["Sarah Williams", "@sarahw", 10850, 31, 128, "Project Leader", ["Product", "Strategy", "Marketing"]],
]

const leaderboard = [
  [4, "Alex Johnson", "@alexj", 9800, 19],
  [5, "Emily Rodriguez", "@emilyr", 9450, 22],
  [6, "David Park", "@davidp", 8900, 17],
  [7, "Olivia Martinez", "@oliviam", 8650, 21],
  [8, "James Wilson", "@jamesw", 8200, 15],
  [9, "Sophia Lee", "@sophial", 7950, 18],
  [10, "Daniel Brown", "@danielb", 7700, 14],
]

const stats = [
  [Users, "Active contributors", "2,450"],
  [Rocket, "Projects completed", "1,280"],
  [Award, "Badges earned", "8,900"],
  [Flame, "Streak leaders", "156"],
]

export default function LeaderboardPage() {
  return (
    <div className="min-h-screen bg-[#f7f7f3] text-[#171717]">
      <section className="border-b border-[#d9d8d2] bg-[#fbfbfa] px-6 py-16 sm:px-10 lg:px-20 xl:px-28">
        <div className="grid gap-10 lg:grid-cols-[1fr_420px] lg:items-end">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-[#62615d]">
              Leaderboard
            </p>
            <h1 className="mt-5 max-w-4xl text-4xl font-black leading-[0.95] sm:text-6xl">
              Recognize the builders who keep teams moving.
            </h1>
          </div>
          <p className="text-lg font-semibold leading-snug text-[#55544f]">
            Points reward completed work, mentorship, reviews, and reliable
            project momentum.
          </p>
        </div>
      </section>

      <section className="px-6 py-8 sm:px-10 lg:px-20 xl:px-28">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map(([Icon, label, value]) => (
            <div key={label} className="border border-[#d9d8d2] bg-[#fbfbfa] p-5">
              <Icon className="size-5" />
              <p className="mt-4 text-3xl font-black">{value}</p>
              <p className="mt-1 text-sm font-black uppercase tracking-[0.12em] text-[#77766f]">
                {label}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="px-6 pb-10 sm:px-10 lg:px-20 xl:px-28">
        <div className="mb-5 flex flex-wrap gap-2">
          {["All Time", "This Month", "This Week"].map((period, index) => (
            <button
              key={period}
              className={`border px-4 py-2 text-sm font-black ${
                index === 0
                  ? "border-[#171717] bg-[#171717] text-white"
                  : "border-[#d9d8d2] bg-[#fbfbfa] text-[#55544f]"
              }`}
            >
              {period}
            </button>
          ))}
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {topContributors.map(([name, username, points, projects, contributions, badge, skills], index) => (
            <article key={name} className={`border p-5 ${index === 0 ? "border-[#171717] bg-[#2f2f2d] text-white" : "border-[#d9d8d2] bg-[#fbfbfa]"}`}>
              <div className="flex items-center justify-between gap-4">
                {index === 0 ? <Trophy className="size-7" /> : <Medal className="size-7" />}
                <span className={`px-2.5 py-1 text-xs font-black ${index === 0 ? "bg-white text-[#171717]" : "border border-[#d9d8d2] bg-white text-[#55544f]"}`}>
                  {badge}
                </span>
              </div>
              <div className="mt-6 flex items-center gap-4">
                <div className={`flex size-14 items-center justify-center rounded-full text-lg font-black ${index === 0 ? "bg-white text-[#171717]" : "bg-[#2f2f2d] text-white"}`}>
                  {name.split(" ").map((part) => part[0]).join("")}
                </div>
                <div>
                  <h2 className="text-xl font-black">{name}</h2>
                  <p className={`text-sm font-semibold ${index === 0 ? "text-white/65" : "text-[#77766f]"}`}>{username}</p>
                </div>
              </div>
              <div className="mt-6 grid grid-cols-3 gap-3 border-t border-current/20 pt-5">
                <Metric value={points.toLocaleString()} label="points" />
                <Metric value={projects} label="projects" />
                <Metric value={contributions} label="helps" />
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <span key={skill} className={`border px-2.5 py-1 text-xs font-black ${index === 0 ? "border-white/30 text-white/80" : "border-[#d9d8d2] text-[#55544f]"}`}>
                    {skill}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-[#d9d8d2] bg-[#fbfbfa] px-6 py-12 sm:px-10 lg:px-20 xl:px-28">
        <div className="grid gap-3">
          {leaderboard.map(([rank, name, username, points, projects]) => (
            <div key={rank} className="grid gap-4 border border-[#d9d8d2] bg-white p-4 sm:grid-cols-[60px_1fr_auto] sm:items-center">
              <span className="text-2xl font-black text-[#77766f]">#{rank}</span>
              <div className="flex items-center gap-4">
                <div className="flex size-10 items-center justify-center rounded-full bg-[#2f2f2d] text-sm font-black text-white">
                  {name.split(" ").map((part) => part[0]).join("")}
                </div>
                <div>
                  <h3 className="font-black">{name}</h3>
                  <p className="text-sm font-semibold text-[#77766f]">{username}</p>
                </div>
              </div>
              <div className="flex gap-8 text-sm font-black">
                <span>{points.toLocaleString()} pts</span>
                <span>{projects} projects</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="px-6 py-16 sm:px-10 lg:px-20 xl:px-28">
        <h2 className="text-3xl font-black">How to climb</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-4">
          {[
            [Rocket, "+100", "Complete a project"],
            [Users, "+50", "Join a new team"],
            [Star, "+25", "Receive a 5-star review"],
            [Award, "+75", "Mentor a new member"],
          ].map(([Icon, points, action]) => (
            <div key={action} className="border border-[#d9d8d2] bg-[#fbfbfa] p-5">
              <Icon className="size-5" />
              <p className="mt-5 text-3xl font-black">{points}</p>
              <p className="mt-1 text-sm font-bold text-[#55544f]">{action}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

function Metric({ value, label }) {
  return (
    <div>
      <p className="text-xl font-black">{value}</p>
      <p className="text-xs font-black uppercase tracking-[0.12em] opacity-60">{label}</p>
    </div>
  )
}
