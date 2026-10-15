"use client"

import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import {
  ArrowUpRight,
  Bookmark,
  Briefcase,
  CircleDot,
  Clock,
  Filter,
  MapPin,
  Search,
  SlidersHorizontal,
  Sparkles,
  Users,
} from "lucide-react"

import { PageHeader } from "@/components/page-header"
import { fetchProjects } from "@/lib/features/projects/projectsSlice"
import { PROJECT_CATEGORIES, SKILLS } from "@/lib/data/enums"

const categories = ["All", ...PROJECT_CATEGORIES]
const skillFilters = SKILLS

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

/** Project discovery with category/skill filters and search. */
export default function FindProjectsPage() {
  const dispatch = useDispatch()
  const { projects, status } = useSelector((state) => state.projects)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [selectedSkill, setSelectedSkill] = useState("All")
  const [savedProjects, setSavedProjects] = useState([])

  useEffect(() => {
    dispatch(fetchProjects({}))
  }, [dispatch])

  const toggleSave = (projectId) => {
    setSavedProjects((prev) =>
      prev.includes(projectId)
        ? prev.filter((id) => id !== projectId)
        : [...prev, projectId]
    )
  }

  const filteredProjects = projects.filter((project) => {
    const query = searchQuery.toLowerCase()
    const searchable = [
      project.title,
      project.description,
      project.category,
      ...(project.skills || []),
      ...(project.tags || []),
    ]
      .join(" ")
      .toLowerCase()

    const matchesSearch = searchable.includes(query)
    const matchesCategory =
      selectedCategory === "All" || project.category === selectedCategory
    const matchesSkill =
      selectedSkill === "All" || (project.skills || []).includes(selectedSkill)

    return matchesSearch && matchesCategory && matchesSkill
  })

  const isLoading = status === "loading" && projects.length === 0

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
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
          </div>
        </div>
      </PageHeader>

      <section className="px-6 py-8 sm:px-10 lg:px-20 xl:px-28">
        <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="border border-line bg-surface">
              <div className="flex items-center justify-between border-b border-line px-5 py-4">
                <h2 className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.14em]">
                  <Filter className="size-4" />
                  Filters
                </h2>
                <button
                  className="text-xs font-black text-quiet underline underline-offset-4 hover:text-ink"
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
                  <h3 className="mb-3 text-sm font-black text-ink">
                    Category
                  </h3>
                  <div className="grid gap-1">
                    {categories.map((name) => (
                      <button
                        key={name}
                        onClick={() => setSelectedCategory(name)}
                        className={`flex items-center justify-between px-3 py-2 text-left text-sm font-bold transition ${
                          selectedCategory === name
                            ? "bg-charcoal text-white"
                            : "text-subtle hover:bg-wash hover:text-ink"
                        }`}
                      >
                        <span>{name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="mb-3 text-sm font-black text-ink">
                    Skills
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setSelectedSkill("All")}
                      className={`border px-3 py-1 text-xs font-black transition ${
                        selectedSkill === "All"
                          ? "border-ink bg-ink text-white"
                          : "border-line bg-white text-subtle hover:border-ink"
                      }`}
                    >
                      All
                    </button>
                    {skillFilters.map((skill) => (
                      <button
                        key={skill}
                        onClick={() => setSelectedSkill(skill)}
                        className={`border px-3 py-1 text-xs font-black transition ${
                          selectedSkill === skill
                            ? "border-ink bg-ink text-white"
                            : "border-line bg-white text-subtle hover:border-ink"
                        }`}
                      >
                        {skill}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="border-t border-line pt-5">
                  <p className="flex items-center gap-2 text-sm font-bold text-subtle">
                    <SlidersHorizontal className="size-4" />
                    More filters coming with profiles.
                  </p>
                </div>
              </div>
            </div>
          </aside>

          <div>
            <div className="mb-5 flex flex-col gap-3 border-b border-line pb-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.14em] text-quiet">
                  {filteredProjects.length} open projects
                </p>
                <p className="mt-1 text-sm font-semibold text-subtle">
                  Sorted by most recent.
                </p>
              </div>
              <button className="inline-flex h-10 w-fit items-center gap-2 border border-ink bg-ink px-4 text-sm font-black text-white transition hover:bg-transparent hover:text-ink">
                Post a project
                <ArrowUpRight className="size-4" />
              </button>
            </div>

            {isLoading && (
              <div className="border border-line bg-surface p-10 text-center">
                <p className="text-xl font-black text-ink">Loading projects…</p>
              </div>
            )}

            <div className="grid gap-4">
              {filteredProjects.map((project) => {
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
                          <button className="inline-flex h-11 w-full items-center justify-center gap-2 border border-ink bg-transparent px-4 text-sm font-black text-ink transition hover:bg-ink hover:text-white">
                            View project
                            <ArrowUpRight className="size-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>

            {!isLoading && filteredProjects.length === 0 && (
              <div className="border border-line bg-surface p-10 text-center">
                <p className="text-xl font-black text-ink">
                  No projects found.
                </p>
                <p className="mt-2 font-semibold text-subtle">
                  Try a broader search or reset the filters.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}