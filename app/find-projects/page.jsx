"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  ArrowUpRight,
  Bookmark,
  Briefcase,
  CheckCircle2,
  CircleDot,
  Clock,
  Filter,
  MapPin,
  Search,
  SlidersHorizontal,
  Sparkles,
  Users,
} from "lucide-react"
import { apiFetch, getAccessToken, toQueryString } from "@/lib/api"

const fallbackCategories = [
  "All", "Technology", "Design", "Business", "Marketing", "Gaming", "Social Impact",
]

const skillFilters = [
  "React",
  "Python",
  "UI/UX",
  "Node.js",
  "TypeScript",
  "Figma",
  "Machine Learning",
  "Mobile",
  "Marketing",
  "Data Science",
]

function formatStage(stage) {
  return stage
    ? stage
        .split("-")
        .join(" ")
        .replace(/\b\w/g, (letter) => letter.toUpperCase())
    : "Idea"
}

function getOpenRoleStats(project) {
  const roles = project.roles || []
  const slotsOpen = roles.reduce((total, role) => total + (role.slotsOpen || 0), 0)
  const slotsTotal = roles.reduce((total, role) => total + (role.slotsTotal || 0), 0)

  return {
    slotsOpen,
    slotsTotal: slotsTotal || project.teamSizeTarget || 1,
  }
}

export default function FindProjectsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [selectedSkill, setSelectedSkill] = useState("All")
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [categories, setCategories] = useState(fallbackCategories)

  useEffect(() => {
    apiFetch("/api/v1/metadata")
      .then((payload) => {
        const cats = (payload.data.categories || []).map((c) => c.value)
        setCategories(["All", ...cats])
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    let cancelled = false

    async function loadProjects() {
      setLoading(true)
      setError("")

      try {
        const query = toQueryString({
          q: searchQuery,
          category: selectedCategory,
          skill: selectedSkill,
        })
        const payload = await apiFetch(`/api/v1/projects${query}`)

        if (!cancelled) {
          setProjects(payload.data.projects || [])
        }
      } catch (requestError) {
        if (!cancelled) {
          setError(requestError.message)
          setProjects([])
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    const timeout = window.setTimeout(loadProjects, 250)
    return () => {
      cancelled = true
      window.clearTimeout(timeout)
    }
  }, [searchQuery, selectedCategory, selectedSkill])

  const toggleSave = async (project) => {
    if (!getAccessToken()) {
      setError("Sign in to save projects.")
      return
    }

    const wasSaved = project.isSaved

    setProjects((current) =>
      current.map((item) =>
        item.id === project.id ? { ...item, isSaved: !wasSaved } : item
      )
    )

    try {
      await apiFetch(`/api/v1/projects/${project.id}/save`, {
        method: wasSaved ? "DELETE" : "POST",
      })
    } catch (requestError) {
      setError(requestError.message)
      setProjects((current) =>
        current.map((item) =>
          item.id === project.id ? { ...item, isSaved: wasSaved } : item
        )
      )
    }
  }

  return (
    <div className="min-h-screen bg-[#f7f7f3] text-[#171717]">
      <section className="border-b border-[#d9d8d2] bg-[#fbfbfa] px-6 py-12 sm:px-10 lg:px-20 xl:px-28">
        <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-end">
          <div>
            <p className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.18em] text-[#62615d]">
              <Sparkles className="size-4" />
              Role-based discovery
            </p>
            <h1 className="mt-5 max-w-3xl text-4xl font-black leading-[0.95] tracking-normal text-[#171717] sm:text-6xl">
              Find projects that need what you can bring.
            </h1>
          </div>

          <div className="grid gap-5">
            <p className="max-w-2xl text-lg font-semibold leading-snug text-[#4a4945]">
              Browse teams by open roles, skill gaps, stage, and commitment.
              Save the promising ones, then apply when the fit is clear.
            </p>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-[#62615d]" />
              <input
                type="text"
                placeholder="Search by project, role, skill, or keyword"
                className="h-14 w-full border border-[#c9c8c1] bg-white pl-12 pr-4 text-base font-semibold text-[#171717] outline-none transition placeholder:text-[#77766f] focus:border-[#171717]"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 py-8 sm:px-10 lg:px-20 xl:px-28">
        <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="border border-[#d9d8d2] bg-[#fbfbfa]">
              <div className="flex items-center justify-between border-b border-[#d9d8d2] px-5 py-4">
                <h2 className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.14em]">
                  <Filter className="size-4" />
                  Filters
                </h2>
                <button
                  className="text-xs font-black text-[#62615d] underline underline-offset-4 hover:text-[#171717]"
                  onClick={() => {
                    setSelectedCategory("All")
                    setSelectedSkill("All")
                    setSearchQuery("")
                  }}
                >
                  Reset
                </button>
              </div>

              <div className="space-y-7 p-5">
                <div>
                  <h3 className="mb-3 text-sm font-black text-[#171717]">
                    Category
                  </h3>
                  <div className="grid gap-1">
                    {categories.map((category) => (
                      <button
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className={`flex items-center justify-between px-3 py-2 text-left text-sm font-bold transition ${
                          selectedCategory === category
                            ? "bg-[#2f2f2d] text-white"
                            : "text-[#55544f] hover:bg-[#efeee8] hover:text-[#171717]"
                        }`}
                      >
                        <span>{category}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="mb-3 text-sm font-black text-[#171717]">
                    Skills
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {["All", ...skillFilters].map((skill) => (
                      <button
                        key={skill}
                        onClick={() => setSelectedSkill(skill)}
                        className={`border px-3 py-1 text-xs font-black transition ${
                          selectedSkill === skill
                            ? "border-[#171717] bg-[#171717] text-white"
                            : "border-[#d9d8d2] bg-white text-[#55544f] hover:border-[#171717]"
                        }`}
                      >
                        {skill}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="border-t border-[#d9d8d2] pt-5">
                  <p className="flex items-center gap-2 text-sm font-bold text-[#55544f]">
                    <SlidersHorizontal className="size-4" />
                    More filters coming with profiles.
                  </p>
                </div>
              </div>
            </div>
          </aside>

          <div>
            <div className="mb-5 flex flex-col gap-3 border-b border-[#d9d8d2] pb-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.14em] text-[#62615d]">
                  {loading ? "Loading projects" : `${projects.length} open projects`}
                </p>
                <p className="mt-1 text-sm font-semibold text-[#55544f]">
                  Sorted by recent activity. AI fit ranking comes later.
                </p>
              </div>
              <Link
                href="/dashboard"
                className="inline-flex h-10 w-fit items-center gap-2 border border-[#171717] bg-[#171717] px-4 text-sm font-black text-white transition hover:bg-transparent hover:text-[#171717]"
              >
                Post a project
                <ArrowUpRight className="size-4" />
              </Link>
            </div>

            {error && (
              <p className="mb-4 border border-[#171717] bg-white p-3 text-sm font-bold">
                {error}
              </p>
            )}

            <div className="grid gap-4">
              {projects.map((project) => {
                const roleStats = getOpenRoleStats(project)
                const roleNames = (project.roles || []).map((role) => role.title)
                const isSaved = project.isSaved

                return (
                  <article
                    key={project.id}
                    className="group border border-[#d9d8d2] bg-[#fbfbfa] p-5 transition hover:border-[#171717] sm:p-6"
                  >
                    <div className="grid gap-6 xl:grid-cols-[1fr_220px]">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="bg-[#2f2f2d] px-2.5 py-1 text-xs font-black uppercase tracking-[0.12em] text-white">
                            {project.category}
                          </span>
                          <span className="flex items-center gap-1.5 border border-[#d9d8d2] bg-white px-2.5 py-1 text-xs font-black text-[#55544f]">
                            <CircleDot className="size-3" />
                            {formatStage(project.stage)}
                          </span>
                          <span className="flex items-center gap-1.5 border border-[#d9d8d2] bg-white px-2.5 py-1 text-xs font-black text-[#55544f]">
                            <Clock className="size-3" />
                            {project.commitmentLabel || `${project.commitmentHoursPerWeek || 0} hrs/week`}
                          </span>
                        </div>

                        <div className="mt-4 flex items-start justify-between gap-4">
                          <div>
                            <h2 className="text-2xl font-black leading-tight text-[#171717] transition group-hover:underline group-hover:underline-offset-4">
                              {project.title}
                            </h2>
                            <p className="mt-3 max-w-3xl text-base font-medium leading-relaxed text-[#55544f]">
                              {project.description}
                            </p>
                          </div>
                          <button
                            onClick={() => toggleSave(project)}
                            className="flex size-10 shrink-0 items-center justify-center border border-[#d9d8d2] bg-white text-[#171717] transition hover:border-[#171717]"
                            aria-label={isSaved ? "Unsave project" : "Save project"}
                          >
                            <Bookmark className={`size-5 ${isSaved ? "fill-[#171717]" : ""}`} />
                          </button>
                        </div>

                        <div className="mt-5 grid gap-4 md:grid-cols-2">
                          <div>
                            <p className="mb-2 text-xs font-black uppercase tracking-[0.14em] text-[#77766f]">
                              Open roles
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {(roleNames.length ? roleNames : ["Open role"]).map((role) => (
                                <span
                                  key={role}
                                  className="border border-[#171717] bg-white px-3 py-1 text-sm font-black text-[#171717]"
                                >
                                  {role}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div>
                            <p className="mb-2 text-xs font-black uppercase tracking-[0.14em] text-[#77766f]">
                              Skills
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {(project.skills || []).map((skill) => (
                                <span
                                  key={skill}
                                  className="border border-[#d9d8d2] bg-white px-3 py-1 text-sm font-bold text-[#55544f]"
                                >
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-[#d9d8d2] pt-4 text-sm font-semibold text-[#55544f]">
                          <span className="flex items-center gap-1.5">
                            <Users className="size-4" />
                            {roleStats.slotsOpen} of {roleStats.slotsTotal} spots open
                          </span>
                          <span className="flex items-center gap-1.5">
                            <MapPin className="size-4" />
                            {project.location}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Briefcase className="size-4" />
                            Applications tracked in dashboard
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col justify-between border-t border-[#d9d8d2] pt-5 xl:border-l xl:border-t-0 xl:pl-6 xl:pt-0">
                        <div>
                          <div className="flex items-center justify-between">
                            <p className="text-xs font-black uppercase tracking-[0.14em] text-[#77766f]">
                              Match
                            </p>
                            <CheckCircle2 className="size-5 text-[#171717]" />
                          </div>
                          <p className="mt-2 text-5xl font-black text-[#171717]">
                            --
                          </p>
                          <p className="mt-2 text-sm font-semibold text-[#55544f]">
                            AI fit scoring is planned for v2.
                          </p>
                        </div>

                        <div className="mt-8">
                          <div className="mb-4 flex items-center gap-3">
                            <div className="flex size-10 items-center justify-center rounded-full bg-[#2f2f2d] text-sm font-black text-white">
                              GH
                            </div>
                            <div>
                              <p className="text-sm font-black text-[#171717]">
                                GroupHub builder
                              </p>
                              <p className="text-xs font-semibold text-[#77766f]">
                                Posted recently
                              </p>
                            </div>
                          </div>
                          <Link
                            href={`/projects/${project.id}`}
                            className="inline-flex h-11 w-full items-center justify-center gap-2 border border-[#171717] bg-transparent px-4 text-sm font-black text-[#171717] transition hover:bg-[#171717] hover:text-white"
                          >
                            View project
                            <ArrowUpRight className="size-4" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>

            {!loading && projects.length === 0 && (
              <div className="border border-[#d9d8d2] bg-[#fbfbfa] p-10 text-center">
                <p className="text-xl font-black text-[#171717]">
                  No projects found.
                </p>
                <p className="mt-2 font-semibold text-[#55544f]">
                  Create one from the dashboard or try broader filters.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
