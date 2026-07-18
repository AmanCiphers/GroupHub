"use client"

import { useEffect, useState } from "react"
import { Award, Flame, Medal, Rocket, Star, Trophy, Users } from "lucide-react"
import { apiFetch } from "@/lib/api"

const periods = [
  { value: "all", label: "All Time" },
  { value: "month", label: "This Month" },
  { value: "week", label: "This Week" },
]

export default function LeaderboardPage() {
  const [period, setPeriod] = useState("all")
  const [topThree, setTopThree] = useState([])
  const [leaderboard, setLeaderboard] = useState([])
  const [stats, setStats] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    apiFetch(`/api/v1/leaderboard${period !== "all" ? `?period=${period}` : ""}`)
      .then((payload) => {
        setTopThree(payload.data.topThree || [])
        setLeaderboard(payload.data.leaderboard || [])
        setStats(payload.data.stats || [])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [period])

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
          {(stats.length ? stats : [
            { label: "Active contributors", value: "--" },
            { label: "Projects completed", value: "--" },
            { label: "Team memberships", value: "--" },
            { label: "Streak leaders", value: "--" },
          ]).map((stat) => {
            const Icon = [Users, Rocket, Award, Flame][stats.indexOf(stat)] || Users
            return (
              <div key={stat.label} className="border border-[#d9d8d2] bg-[#fbfbfa] p-5">
                <Icon className="size-5" />
                <p className="mt-4 text-3xl font-black">{loading ? "--" : stat.value}</p>
                <p className="mt-1 text-sm font-black uppercase tracking-[0.12em] text-[#77766f]">
                  {stat.label}
                </p>
              </div>
            )
          })}
        </div>
      </section>

      <section className="px-6 pb-10 sm:px-10 lg:px-20 xl:px-28">
        <div className="mb-5 flex flex-wrap gap-2">
          {periods.map((p) => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={`border px-4 py-2 text-sm font-black ${
                period === p.value
                  ? "border-[#171717] bg-[#171717] text-white"
                  : "border-[#d9d8d2] bg-[#fbfbfa] text-[#55544f]"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-lg font-black text-[#55544f]">Loading...</p>
        ) : (
          <>
            <div className="grid gap-4 lg:grid-cols-3">
              {topThree.length === 0 && (
                <p className="lg:col-span-3 border border-[#d9d8d2] bg-[#fbfbfa] p-6 text-center font-semibold text-[#55544f]">
                  No contributors yet for this period. Start building to claim the top spot!
                </p>
              )}
              {topThree.map((user, index) => (
                <article
                  key={user.id}
                  className={`border p-5 ${index === 0 ? "border-[#171717] bg-[#2f2f2d] text-white" : "border-[#d9d8d2] bg-[#fbfbfa]"}`}
                >
                  <div className="flex items-center justify-between gap-4">
                    {index === 0 ? <Trophy className="size-7" /> : <Medal className="size-7" />}
                    <span className={`px-2.5 py-1 text-xs font-black ${index === 0 ? "bg-white text-[#171717]" : "border border-[#d9d8d2] bg-white text-[#55544f]"}`}>
                      {user.badge}
                    </span>
                  </div>
                  <div className="mt-6 flex items-center gap-4">
                    <div className={`flex size-14 items-center justify-center rounded-full text-lg font-black ${index === 0 ? "bg-white text-[#171717]" : "bg-[#2f2f2d] text-white"}`}>
                      {user.fullName.split(" ").map((part) => part[0]).join("").slice(0, 2)}
                    </div>
                    <div>
                      <h2 className="text-xl font-black">{user.fullName}</h2>
                      <p className={`text-sm font-semibold ${index === 0 ? "text-white/65" : "text-[#77766f]"}`}>{user.username}</p>
                    </div>
                  </div>
                  <div className="mt-6 grid grid-cols-3 gap-3 border-t border-current/20 pt-5">
                    <Metric value={user.points.toLocaleString()} label="points" />
                    <Metric value={user.projects} label="projects" />
                    <Metric value={user.contributions} label="helps" />
                  </div>
                  {user.skills.length > 0 && (
                    <div className="mt-5 flex flex-wrap gap-2">
                      {user.skills.map((skill) => (
                        <span key={skill} className={`border px-2.5 py-1 text-xs font-black ${index === 0 ? "border-white/30 text-white/80" : "border-[#d9d8d2] text-[#55544f]"}`}>
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}
                </article>
              ))}
            </div>

            {leaderboard.length > 0 && (
              <div className="mt-8 border-y border-[#d9d8d2] bg-[#fbfbfa] px-6 py-12 sm:px-10 lg:px-20 xl:px-28 -mx-6 sm:-mx-10 lg:-mx-20 xl:-mx-28">
                <div className="grid gap-3">
                  {leaderboard.map((user) => (
                    <div key={user.id} className="grid gap-4 border border-[#d9d8d2] bg-white p-4 sm:grid-cols-[60px_1fr_auto] sm:items-center">
                      <span className="text-2xl font-black text-[#77766f]">#{user.rank}</span>
                      <div className="flex items-center gap-4">
                        <div className="flex size-10 items-center justify-center rounded-full bg-[#2f2f2d] text-sm font-black text-white">
                          {user.fullName.split(" ").map((part) => part[0]).join("").slice(0, 2)}
                        </div>
                        <div>
                          <h3 className="font-black">{user.fullName}</h3>
                          <p className="text-sm font-semibold text-[#77766f]">{user.username}</p>
                        </div>
                      </div>
                      <div className="flex gap-8 text-sm font-black">
                        <span>{user.points.toLocaleString()} pts</span>
                        <span>{user.projects} projects</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
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
