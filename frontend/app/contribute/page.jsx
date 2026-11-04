import Link from "next/link"
import {
  ArrowRight,
  BookOpen,
  Bug,
  Code,
  FileText,
  Globe,
  HeartHandshake,
  Megaphone,
  Palette,
  Sparkles,
} from "lucide-react"

import { PageHeader } from "@/components/page-header"
import {
  CardSkeleton,
  Skeleton,
  TextSkeleton,
  PageHeaderSkeleton,
} from "@/components/skeleton"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8762"

const contributionIcons = {
  Development: Code,
  Design: Palette,
  Marketing: Megaphone,
  Documentation: BookOpen,
  Mentorship: HeartHandshake,
  "Testing & QA": Bug,
}

async function fetchContributeData() {
  try {
    const res = await fetch(`${API_URL}/api/projects/contribute`, {
      next: { revalidate: 300 }, // 5 min revalidation
    })
    if (!res.ok) throw new Error("Failed to fetch")
    return res.json()
  } catch {
    return null
  }
}

function ContributionTypeCard({ type, count, skills }) {
  const Icon = contributionIcons[type] || Code
  return (
    <article className="border border-line bg-white p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex size-11 items-center justify-center bg-charcoal text-white">
          <Icon className="size-5" />
        </div>
        <span className="border border-line px-2.5 py-1 text-xs font-black text-subtle">
          {count} opening{count !== 1 ? "s" : ""}
        </span>
      </div>
      <h3 className="mt-5 text-2xl font-black">{type}</h3>
      <p className="mt-2 font-semibold leading-relaxed text-subtle">
        {skills.slice(0, 3).join(", ")}{skills.length > 3 ? "…" : ""}
      </p>
      <div className="mt-5 flex flex-wrap gap-2">
        {skills.slice(0, 6).map((skill) => (
          <span key={skill} className="border border-line px-2.5 py-1 text-xs font-black text-subtle">
            {skill}
          </span>
        ))}
      </div>
    </article>
  )
}

function FeaturedProjectCard({ project }) {
  return (
    <article key={project._id} className="border border-line bg-surface p-5">
      <span className={`px-2.5 py-1 text-xs font-black ${project.urgency === "High" ? "bg-ink text-white" : "border border-ink"}`}>
        {project.urgency} priority
      </span>
      <h3 className="mt-5 text-2xl font-black">{project.title}</h3>
      <p className="mt-2 font-semibold text-subtle">{project.description}</p>
      <div className="mt-5 flex flex-wrap gap-2">
        {project.needs.map((need) => (
          <span key={need} className="border border-ink bg-white px-3 py-1 text-sm font-black">
            {need}
          </span>
        ))}
      </div>
      <Link
        href={`/projects/${project._id}`}
        className="mt-4 inline-flex h-10 items-center gap-2 bg-ink px-4 text-sm font-black text-white transition hover:bg-transparent hover:text-ink"
      >
        View project
        <ArrowRight className="size-4" />
      </Link>
    </article>
  )
}

function ContributeLoading() {
  return (
    <div className="min-h-screen bg-canvas text-ink">
      <PageHeader
        eyebrow="Contribute"
        title="Use your skills where a team actually needs them."
        description="Find open roles across design, code, writing, testing, and mentorship. Every contribution becomes part of your project history."
      >
        <PageHeaderSkeleton />
      </PageHeader>

      <section className="px-6 py-12 sm:px-10 lg:px-20 xl:px-28">
        <div className="grid gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </section>

      <section className="border-y border-line bg-surface px-6 py-16 sm:px-10 lg:px-20 xl:px-28">
        <div className="mb-8">
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-80" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </section>

      <section className="px-6 py-16 sm:px-10 lg:px-20 xl:px-28">
        <Skeleton className="h-8 w-72 mb-8" />
        <div className="grid gap-4 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </section>
    </div>
  )
}

/** Contribute page: ways to contribute + featured projects (dynamic from API). */
export default async function ContributePage() {
  const data = await fetchContributeData()

  if (!data) {
    return <ContributeLoading />
  }

  const { contributionTypes, featuredProjects, heroPoints } = data

  return (
    <div className="min-h-screen bg-canvas text-ink">
      <PageHeader
        eyebrow="Contribute"
        title="Use your skills where a team actually needs them."
        description="Find open roles across design, code, writing, testing, and mentorship. Every contribution becomes part of your project history."
        actions={
          <Link href="/find-projects" className="mt-6 inline-flex h-11 items-center gap-2 bg-ink px-5 text-sm font-black text-white">
            Browse projects
            <ArrowRight className="size-4" />
          </Link>
        }
      />

      <section className="px-6 py-12 sm:px-10 lg:px-20 xl:px-28">
        <div className="grid gap-4 md:grid-cols-3">
          {heroPoints.map(([title, description], i) => (
            <div key={i} className="border border-line bg-surface p-5">
              <Sparkles className="size-5" />
              <h2 className="mt-5 text-xl font-black">{title}</h2>
              <p className="mt-2 font-semibold text-subtle">{description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-line bg-surface px-6 py-16 sm:px-10 lg:px-20 xl:px-28">
        <div className="mb-8">
          <h2 className="text-3xl font-black">Ways to contribute</h2>
          <p className="mt-2 font-semibold text-subtle">
            Choose the work type that fits your strengths and availability.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {contributionTypes.map(([type, count]) => {
            // Map type to its skills for display
            const skillsMap = {
              Development: ["Frontend", "Backend", "Mobile", "DevOps"],
              Design: ["UI Design", "UX Research", "Branding"],
              Marketing: ["Content", "Social", "SEO"],
              Documentation: ["Writing", "Tutorials", "API Docs"],
              Mentorship: ["Code Review", "Career Advice", "Pairing"],
              "Testing & QA": ["Manual QA", "Automation", "Bug Reports"],
            }
            return (
              <ContributionTypeCard
                key={type}
                type={type}
                count={count}
                skills={skillsMap[type] || []}
              />
            )
          })}
        </div>
      </section>

      <section className="px-6 py-16 sm:px-10 lg:px-20 xl:px-28">
        <div className="mb-8">
          <h2 className="text-3xl font-black">Projects needing help now</h2>
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          {featuredProjects.length > 0 ? (
            featuredProjects.map((project) => (
              <FeaturedProjectCard key={project._id} project={project} />
            ))
          ) : (
            <div className="lg:col-span-3 border border-line bg-surface p-10 text-center">
              <p className="text-xl font-black">No projects with open roles right now.</p>
              <p className="mt-2 text-subtle">Check back soon or browse all projects.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}