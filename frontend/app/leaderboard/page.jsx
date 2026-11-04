"use client"

import { Award, Flame, Medal, Rocket, Star, Trophy, Users } from "lucide-react"
import { getInitials } from "@/lib/utils"
import { PageHeader } from "@/components/page-header"
import { howToClimb, leaderboard, stats, topContributors } from "@/lib/data/leaderboard.data"
import {
  CardSkeleton,
  TextSkeleton,
  StatCardSkeleton,
  PageHeaderSkeleton,
  ProfilePreviewSkeleton,
} from "@/components/skeleton"

/** Leaderboard: top contributors, full list, how-to-climb. */
export default function LeaderboardPage() {
  return (
    <div className="min-h-screen bg-canvas text-ink">
      <PageHeader
        eyebrow="Leaderboard"
        title="Recognize the builders who keep teams moving."
        description="Points reward completed work, mentorship, reviews, and reliable project momentum."
      >
        <PageHeaderSkeleton />
      </PageHeader>

      <section className="px-6 py-8 sm:px-10 lg:px-20 xl:px-28">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map(([Icon, label, value]) => (
            <div key={label} className="border border-line bg-surface p-5">
              <Icon className="size-5" />
              <p className="mt-4 text-3xl font-black">{value}</p>
              <p className="mt-1 text-sm font-black uppercase tracking-[0.12em] text-faint">
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
                  ? "border-ink bg-ink text-white"
                  : "border-line bg-surface text-subtle"
              }`}
            >
              {period}
            </button>
          ))}
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {topContributors.map(([name, username, points, projects, contributions, badge, skills], index) => (
            <article key={name} className={`border p-5 ${index === 0 ? "border-ink bg-charcoal text-white" : "border-line bg-surface"}`}>
              <div className="flex items-center justify-between gap-4">
                {index === 0 ? <Trophy className="size-7" /> : <Medal className="size-7" />}
                <span className={`px-2.5 py-1 text-xs font-black ${index === 0 ? "bg-white text-ink" : "border border-line bg-white text-subtle"}`}>
                  {badge}
                </span>
              </div>
              <div className="mt-6 flex items-center gap-4">
                <div className={`flex size-14 items-center justify-center rounded-full text-lg font-black ${index === 0 ? "bg-white text-ink" : "bg-charcoal text-white"}`}>
                  {getInitials(name)}
                </div>
                <div>
                  <h2 className="text-xl font-black">{name}</h2>
                  <p className={`text-sm font-semibold ${index === 0 ? "text-white/65" : "text-faint"}`}>{username}</p>
                </div>
              </div>
              <div className="mt-6 grid grid-cols-3 gap-3 border-t border-current/20 pt-5">
                <Metric value={points.toLocaleString()} label="points" />
                <Metric value={projects} label="projects" />
                <Metric value={contributions} label="helps" />
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <span key={skill} className={`border px-2.5 py-1 text-xs font-black ${index === 0 ? "border-white/30 text-white/80" : "border-line text-subtle"}`}>
                    {skill}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-line bg-surface px-6 py-12 sm:px-10 lg:px-20 xl:px-28">
        <div className="grid gap-3">
          {leaderboard.map(([rank, name, username, points, projects]) => (
            <div key={rank} className="grid gap-4 border border-line bg-white p-4 sm:grid-cols-[60px_1fr_auto] sm:items-center">
              <span className="text-2xl font-black text-faint">#{rank}</span>
              <div className="flex items-center gap-4">
                <div className="flex size-10 items-center justify-center rounded-full bg-charcoal text-sm font-black text-white">
                  {getInitials(name)}
                </div>
                <div>
                  <h3 className="font-black">{name}</h3>
                  <p className="text-sm font-semibold text-faint">{username}</p>
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
          {howToClimb.map(([Icon, points, action]) => (
            <div key={action} className="border border-line bg-surface p-5">
              <Icon className="size-5" />
              <p className="mt-5 text-3xl font-black">{points}</p>
              <p className="mt-1 text-sm font-bold text-subtle">{action}</p>
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

/** Static page — no data fetching, but keep skeleton for consistency. */
function LeaderboardLoading() {
  return (
    <div className="min-h-screen bg-canvas text-ink">
      <PageHeader
        eyebrow="Leaderboard"
        title="Recognize the builders who keep teams moving."
        description="Points reward completed work, mentorship, reviews, and reliable project momentum."
      >
        <PageHeaderSkeleton />
      </PageHeader>

      <section className="px-6 py-8 sm:px-10 lg:px-20 xl:px-28">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>
      </section>

      <section className="px-6 pb-10 sm:px-10 lg:px-20 xl:px-28">
        <div className="mb-5 flex flex-wrap gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-28" />
          ))}
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </section>

      <section className="border-y border-line bg-surface px-6 py-12 sm:px-10 lg:px-20 xl:px-28">
        <div className="grid gap-3">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="border border-line bg-white p-4">
              <div className="flex items-center gap-3">
                <Skeleton className="size-10 rounded-full" />
                <div>
                  <Skeleton className="h-5 w-32 mb-1" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
              <div className="flex gap-4">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-20" />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="px-6 py-16 sm:px-10 lg:px-20 xl:px-28">
        <Skeleton className="h-8 w-64 mb-6" />
        <div className="grid gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </section>
    </div>
  )
}