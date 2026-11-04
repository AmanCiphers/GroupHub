"use client"

import { Suspense, useCallback, useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import {
  ArrowUpRight,
  Bookmark,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  CircleDot,
  Clock,
  Filter,
  MapPin,
  Search,
  Sparkles,
  Users,
  X,
} from "lucide-react"

import { PageHeader } from "@/components/page-header"
import { MultiSelect } from "@/components/multi-select"
import { fetchProjects } from "@/lib/features/projects/projectsSlice"
import {
  COMMITMENT,
  PROJECT_CATEGORIES,
  PROJECT_STAGES,
  SKILLS,
} from "@/lib/data/enums"

function parseFilters(params) {
  return {
    q: (params.get("q") || "").trim(),
    categories: params.getAll("category"),
    skills: params.getAll("skill"),
    stages: params.getAll("stage"),
    commitments: params.getAll("commitment"),
    page: Math.max(1, parseInt(params.get("page") || "1", 10) || 1),
  }
}

function timeAgo(date) {
  if (!date) return "recently"
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (seconds < 60) return "just now"
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes} min ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days} day${days === 1 ? "" : "s"} ago`
  return new Date(date).toLocaleDateString()
}

function initials(name) {
  if (!name) return "?"
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

/** Project discovery with URL-synced, server-side filters. */
export default function FindProjectsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-canvas" />}>
      <FindProjectsContent />
    </Suspense>
  )
}

function FindProjectsContent() {
  const dispatch = useDispatch()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const paramsKey = searchParams.toString()
  const filters = parseFilters(searchParams)

  const { projects, status, error, total, pages, facets } = useSelector(
    (state) => state.projects
  )

  const [searchInput, setSearchInput] = useState(filters.q)
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  const [savedProjects, setSavedProjects] = useState([])

  const updateParams = useCallback(
    (mutate) => {
      const next = new URLSearchParams(paramsKey)
      mutate(next)
      const queryString = next.toString()
      router.replace(queryString ? `${pathname}?${queryString}` : pathname, {
        scroll: false,
      })
    },
    [paramsKey, pathname, router]
  )

  const toggleValue = useCallback(
    (key, value) => {
      updateParams((next) => {
        const values = next.getAll(key)
        next.delete(key)
        const updated = values.includes(value)
          ? values.filter((item) => item !== value)
          : [...values, value]
        updated.forEach((item) => next.append(key, item))
        next.delete("page")
      })
    },
    [updateParams]
  )

  const clearValues = useCallback(
    (key) => {
      updateParams((next) => {
        next.delete(key)
        next.delete("page")
      })
    },
    [updateParams]
  )

  const goToPage = useCallback(
    (target) => {
      updateParams((next) => {
        if (target <= 1) next.delete("page")
        else next.set("page", String(target))
      })
    },
    [updateParams]
  )

  const clearAll = useCallback(() => {
    setSearchInput("")
    router.replace(pathname, { scroll: false })
  }, [pathname, router])

  useEffect(() => {
    const current = parseFilters(new URLSearchParams(paramsKey))
    const params = { page: current.page, facets: 1 }

    if (current.q) params.query = current.q
    if (current.categories.length) params.category = current.categories.join(",")
    if (current.skills.length) params.skill = current.skills.join(",")
    if (current.stages.length) params.stage = current.stages.join(",")
    if (current.commitments.length) {
      params.commitment = current.commitments.join(",")
    }

    const request = dispatch(fetchProjects(params))
    return () => request.abort()
  }, [dispatch, paramsKey])

  useEffect(() => {
    setSearchInput(filters.q)
  }, [filters.q])

  useEffect(() => {
    const trimmed = searchInput.trim()
    if (trimmed === filters.q) return

    const timer = setTimeout(() => {
      updateParams((next) => {
        if (trimmed) next.set("q", trimmed)
        else next.delete("q")
        next.delete("page")
      })
    }, 300)

    return () => clearTimeout(timer)
  }, [searchInput, filters.q, updateParams])

  const toggleSave = (projectId) => {
    setSavedProjects((prev) =>
      prev.includes(projectId)
        ? prev.filter((id) => id !== projectId)
        : [...prev, projectId]
    )
  }

  const chips = [
    ...(filters.q
      ? [
          {
            key: "q",
            label: `“${filters.q}”`,
            onRemove: () => {
              setSearchInput("")
              updateParams((next) => {
                next.delete("q")
                next.delete("page")
              })
            },
          },
        ]
      : []),
    ...filters.categories.map((value) => ({
      key: `category:${value}`,
      label: value,
      onRemove: () => toggleValue("category", value),
    })),
    ...filters.skills.map((value) => ({
      key: `skill:${value}`,
      label: value,
      onRemove: () => toggleValue("skill", value),
    })),
    ...filters.stages.map((value) => ({
      key: `stage:${value}`,
      label: value,
      onRemove: () => toggleValue("stage", value),
    })),
    ...filters.commitments.map((value) => ({
      key: `commitment:${value}`,
      label: value,
      onRemove: () => toggleValue("commitment", value),
    })),
  ]

  const activeCount = chips.length
  const isLoading = status === "loading"
  const isRefreshing = isLoading && projects.length > 0

  return (
    <div className="min-h-screen bg-canvas text-ink">
      <PageHeader
        eyebrowIcon={Sparkles}
        eyebrow="Role-based discovery"
        title="Find projects that need what you can bring."
        description="Browse teams by open roles, skill gaps, stage, and commitment. Save the promising ones, then apply when the fit is clear."
      >
        <div className="mt-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-quiet" />
            <input
              type="text"
              placeholder="Search by project, role, skill, or keyword"
              className="h-14 w-full border border-line-strong bg-white pl-12 pr-4 text-base font-semibold text-ink outline-none transition placeholder:text-faint focus:border-ink"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
            />
          </div>
        </div>
      </PageHeader>

      <section className="px-6 py-8 sm:px-10 lg:px-20 xl:px-28">
        <div className="mb-4 lg:hidden">
          <button
            type="button"
            onClick={() => setMobileFiltersOpen((prev) => !prev)}
            className="flex h-11 w-full items-center justify-between border border-line-strong bg-white px-4 text-sm font-black text-ink"
          >
            <span className="flex items-center gap-2">
              <Filter className="size-4" />
              Filters
              {activeCount > 0 && (
                <span className="flex size-5 items-center justify-center rounded-full bg-ink text-xs text-white">
                  {activeCount}
                </span>
              )}
            </span>
            <span className="text-xs uppercase tracking-[0.14em] text-quiet">
              {mobileFiltersOpen ? "Hide" : "Show"}
            </span>
          </button>
        </div>

        <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
          <aside
            className={`${
              mobileFiltersOpen ? "block" : "hidden"
            } lg:sticky lg:top-24 lg:block lg:self-start`}
          >
            <div className="border border-line bg-surface">
              <div className="flex items-center justify-between border-b border-line px-5 py-4">
                <h2 className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.14em]">
                  <Filter className="size-4" />
                  Filters
                </h2>
                <button
                  className="text-xs font-black text-quiet underline underline-offset-4 hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
                  onClick={clearAll}
                  disabled={activeCount === 0}
                >
                  Reset
                </button>
              </div>

              <div className="space-y-5 p-5">
                <MultiSelect
                  label="Category"
                  options={PROJECT_CATEGORIES}
                  selected={filters.categories}
                  counts={facets.categories}
                  onToggle={(value) => toggleValue("category", value)}
                  onClear={() => clearValues("category")}
                  searchPlaceholder="Search categories…"
                />

                <MultiSelect
                  label="Skills"
                  options={SKILLS}
                  selected={filters.skills}
                  counts={facets.skills}
                  onToggle={(value) => toggleValue("skill", value)}
                  onClear={() => clearValues("skill")}
                  searchPlaceholder="Search skills…"
                />

                <MultiSelect
                  label="Stage"
                  options={PROJECT_STAGES}
                  selected={filters.stages}
                  counts={facets.stages}
                  onToggle={(value) => toggleValue("stage", value)}
                  onClear={() => clearValues("stage")}
                  searchPlaceholder="Search stages…"
                />

                <MultiSelect
                  label="Commitment"
                  options={COMMITMENT}
                  selected={filters.commitments}
                  counts={facets.commitments}
                  onToggle={(value) => toggleValue("commitment", value)}
                  onClear={() => clearValues("commitment")}
                  searchPlaceholder="Search commitment…"
                />
              </div>

              <div className="border-t border-line p-4 lg:hidden">
                <button
                  type="button"
                  onClick={() => setMobileFiltersOpen(false)}
                  className="inline-flex h-11 w-full items-center justify-center border border-ink bg-ink px-4 text-sm font-black text-white"
                >
                  Show results
                </button>
              </div>
            </div>
          </aside>

          <div>
            {chips.length > 0 && (
              <div className="mb-4 flex flex-wrap items-center gap-2">
                {chips.map((chip) => (
                  <button
                    key={chip.key}
                    type="button"
                    onClick={chip.onRemove}
                    className="inline-flex items-center gap-1.5 border border-ink bg-white px-2.5 py-1 text-xs font-black text-ink transition hover:bg-ink hover:text-white"
                  >
                    {chip.label}
                    <X className="size-3" />
                  </button>
                ))}
                <button
                  type="button"
                  onClick={clearAll}
                  className="text-xs font-black text-quiet underline underline-offset-4 hover:text-ink"
                >
                  Clear all
                </button>
              </div>
            )}

            <div className="mb-5 flex flex-col gap-3 border-b border-line pb-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.14em] text-quiet">
                  {total} open project{total === 1 ? "" : "s"}
                  {isRefreshing && (
                    <span className="ml-2 normal-case tracking-normal text-faint">
                      updating…
                    </span>
                  )}
                </p>
                <p className="mt-1 text-sm font-semibold text-subtle">
                  Sorted by most recent.
                </p>
              </div>
              <Link
                href="/projects/new"
                className="inline-flex h-10 w-fit items-center gap-2 border border-ink bg-ink px-4 text-sm font-black text-white transition hover:bg-transparent hover:text-ink"
              >
                Post a project
                <ArrowUpRight className="size-4" />
              </Link>
            </div>

            {isLoading && projects.length === 0 && (
              <div className="border border-line bg-surface p-10 text-center">
                <p className="text-xl font-black text-ink">Loading projects…</p>
              </div>
            )}

            {status === "error" && (
              <div className="mb-4 border border-red-300 bg-red-50 p-4 text-sm font-bold text-red-700">
                {error || "Something went wrong while loading projects."}
              </div>
            )}

            <div className="grid gap-4">
              {projects.map((project) => {
                const isSaved = savedProjects.includes(project._id)
                const ownerName = project.ownerId?.name || "Unknown"
                const spotsOpen = project.spotsOpen ?? project.maxTeamSize ?? 0
                const teamSize = project.teamSize ?? project.maxTeamSize ?? 0

                return (
                  <article
                    key={project._id}
                    className="group border border-line bg-surface p-5 transition hover:border-ink sm:p-6"
                  >
                    <div className="grid gap-6 xl:grid-cols-[1fr_220px]">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="bg-charcoal px-2.5 py-1 text-xs font-black uppercase tracking-[0.12em] text-white">
                            {project.category}
                          </span>
                          <span className="flex items-center gap-1.5 border border-line bg-white px-2.5 py-1 text-xs font-black text-subtle">
                            <CircleDot className="size-3" />
                            {project.stage}
                          </span>
                          <span className="flex items-center gap-1.5 border border-line bg-white px-2.5 py-1 text-xs font-black text-subtle">
                            <Clock className="size-3" />
                            {project.commitment}
                          </span>
                        </div>

                        <div className="mt-4 flex items-start justify-between gap-4">
                          <div>
                            <h2 className="text-2xl font-black leading-tight text-ink transition group-hover:underline group-hover:underline-offset-4">
                              {project.title}
                            </h2>
                            <p className="mt-3 max-w-3xl text-base font-medium leading-relaxed text-subtle">
                              {project.description}
                            </p>
                          </div>
                          <button
                            onClick={() => toggleSave(project._id)}
                            className="flex size-10 shrink-0 items-center justify-center border border-line bg-white text-ink transition hover:border-ink"
                            aria-label={
                              isSaved ? "Unsave project" : "Save project"
                            }
                          >
                            <Bookmark
                              className={`size-5 ${
                                isSaved ? "fill-ink" : ""
                              }`}
                            />
                          </button>
                        </div>

                        <div className="mt-5 grid gap-4 md:grid-cols-2">
                          <div>
                            <p className="mb-2 text-xs font-black uppercase tracking-[0.14em] text-faint">
                              Skills
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {(project.skills || []).length > 0 ? (
                                project.skills.map((skill) => (
                                  <span
                                    key={skill}
                                    className="border border-ink bg-white px-3 py-1 text-sm font-black text-ink"
                                  >
                                    {skill}
                                  </span>
                                ))
                              ) : (
                                <span className="text-sm font-semibold text-faint">
                                  No skills listed
                                </span>
                              )}
                            </div>
                          </div>
                          <div>
                            <p className="mb-2 text-xs font-black uppercase tracking-[0.14em] text-faint">
                              Tags
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {(project.tags || []).length > 0 ? (
                                project.tags.map((tag) => (
                                  <span
                                    key={tag}
                                    className="border border-line bg-white px-3 py-1 text-sm font-bold text-subtle"
                                  >
                                    {tag}
                                  </span>
                                ))
                              ) : (
                                <span className="text-sm font-semibold text-faint">
                                  No tags
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-line pt-4 text-sm font-semibold text-subtle">
                          <span className="flex items-center gap-1.5">
                            <Users className="size-4" />
                            {spotsOpen} of {teamSize} spots open
                          </span>
                          <span className="flex items-center gap-1.5">
                            <MapPin className="size-4" />
                            {project.location}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Briefcase className="size-4" />
                            {project.applicantCount ?? 0} applicants
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col justify-between border-t border-line pt-5 xl:border-l xl:border-t-0 xl:pl-6 xl:pt-0">
                        <div>
                          <div className="flex items-center justify-between">
                            <p className="text-xs font-black uppercase tracking-[0.14em] text-faint">
                              Team
                            </p>
                          </div>
                          <p className="mt-2 text-4xl font-black text-ink">
                            {project.memberCount ?? 0}
                          </p>
                          <p className="mt-2 text-sm font-semibold text-subtle">
                            members on board.
                          </p>
                        </div>

                        <div className="mt-8">
                          <div className="mb-4 flex items-center gap-3">
                            <div className="flex size-10 items-center justify-center rounded-full bg-charcoal text-sm font-black text-white">
                              {initials(ownerName)}
                            </div>
                            <div>
                              <p className="text-sm font-black text-ink">
                                {ownerName}
                              </p>
                              <p className="text-xs font-semibold text-faint">
                                Posted {timeAgo(project.createdAt)}
                              </p>
                            </div>
                          </div>
                          <Link
                            href={`/projects/${project._id}`}
                            className="inline-flex h-11 w-full items-center justify-center gap-2 border border-ink bg-transparent px-4 text-sm font-black text-ink transition hover:bg-ink hover:text-white"
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

            {!isLoading && status !== "error" && projects.length === 0 && (
              <div className="border border-line bg-surface p-10 text-center">
                <p className="text-xl font-black text-ink">
                  No projects found.
                </p>
                <p className="mt-2 font-semibold text-subtle">
                  Try a broader search or reset the filters.
                </p>
                {activeCount > 0 && (
                  <button
                    onClick={clearAll}
                    className="mt-4 inline-flex h-10 items-center justify-center border border-ink bg-ink px-4 text-sm font-black text-white transition hover:bg-transparent hover:text-ink"
                  >
                    Reset filters
                  </button>
                )}
              </div>
            )}

            {pages > 1 && (
              <div className="mt-8 flex items-center justify-between border-t border-line pt-6">
                <button
                  onClick={() => goToPage(filters.page - 1)}
                  disabled={filters.page <= 1 || isLoading}
                  className="inline-flex h-10 items-center gap-2 border border-ink px-4 text-sm font-black text-ink transition hover:bg-ink hover:text-white disabled:cursor-not-allowed disabled:border-line disabled:text-faint disabled:hover:bg-transparent"
                >
                  <ChevronLeft className="size-4" />
                  Previous
                </button>
                <p className="text-sm font-black uppercase tracking-[0.14em] text-quiet">
                  Page {filters.page} of {pages}
                </p>
                <button
                  onClick={() => goToPage(filters.page + 1)}
                  disabled={filters.page >= pages || isLoading}
                  className="inline-flex h-10 items-center gap-2 border border-ink px-4 text-sm font-black text-ink transition hover:bg-ink hover:text-white disabled:cursor-not-allowed disabled:border-line disabled:text-faint disabled:hover:bg-transparent"
                >
                  Next
                  <ChevronRight className="size-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
