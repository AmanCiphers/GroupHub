"use client"

import { useEffect, useState } from "react"
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
import { apiFetch } from "@/lib/api"

const contributionTypes = [
  [Code, "Development", "Build features, fix bugs, and connect project architecture.", ["Frontend", "Backend", "Mobile", "DevOps"]],
  [Palette, "Design", "Clarify flows, prototype screens, and shape product identity.", ["UI Design", "UX Research", "Branding"]],
  [Megaphone, "Marketing", "Help projects find users through content and launch strategy.", ["Content", "Social", "SEO"]],
  [BookOpen, "Documentation", "Turn rough projects into readable guides and onboarding.", ["Writing", "Tutorials", "API Docs"]],
  [HeartHandshake, "Mentorship", "Review work, coach new builders, and raise team quality.", ["Code Review", "Career Advice", "Pairing"]],
  [Bug, "Testing & QA", "Find issues, test flows, and make releases more reliable.", ["Manual QA", "Automation", "Bug Reports"]],
]

export default function ContributePage() {
  const [categoryCounts, setCategoryCounts] = useState({})
  const [featured, setFeatured] = useState([])

  useEffect(() => {
    apiFetch("/api/v1/projects?limit=50&status=recruiting")
      .then((payload) => {
        const projects = payload.data.projects || []
        const counts = {}
        projects.forEach((p) => {
          const cat = p.category
          const openRoles = (p.roles || []).filter((r) => r.status === "open" && r.slotsOpen > 0).length
          counts[cat] = (counts[cat] || 0) + openRoles
        })
        setCategoryCounts(counts)

        const withOpenRoles = projects
          .filter((p) => (p.roles || []).some((r) => r.status === "open" && r.slotsOpen > 0))
          .sort((a, b) => {
            const aOpen = (a.roles || []).reduce((s, r) => s + (r.slotsOpen || 0), 0)
            const bOpen = (b.roles || []).reduce((s, r) => s + (r.slotsOpen || 0), 0)
            return bOpen - aOpen
          })
          .slice(0, 3)
        setFeatured(withOpenRoles)
      })
      .catch(() => {})
  }, [])

  function totalOpenings(category) {
    const catMap = {
      Development: ["Technology", "Engineering"],
      Design: ["Design"],
      Marketing: ["Marketing"],
      Documentation: ["Documentation", "Content"],
      Mentorship: ["Education", "Mentorship"],
      "Testing & QA": ["Testing", "QA"],
    }
    const keys = catMap[category] || [category]
    let total = 0
    keys.forEach((key) => { total += categoryCounts[key] || 0 })
    return total || 0
  }

  return (
    <div className="min-h-screen bg-[#f7f7f3] text-[#171717]">
      <section className="border-b border-[#d9d8d2] bg-[#fbfbfa] px-6 py-16 sm:px-10 lg:px-20 xl:px-28">
        <div className="grid gap-10 lg:grid-cols-[1fr_420px] lg:items-end">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-[#62615d]">
              Contribute
            </p>
            <h1 className="mt-5 max-w-4xl text-4xl font-black leading-[0.95] sm:text-6xl">
              Use your skills where a team actually needs them.
            </h1>
          </div>
          <div>
            <p className="text-lg font-semibold leading-snug text-[#55544f]">
              Find open roles across design, code, writing, testing, and mentorship.
              Every contribution becomes part of your project history.
            </p>
            <Link href="/find-projects" className="mt-6 inline-flex h-11 items-center gap-2 bg-[#171717] px-5 text-sm font-black text-white">
              Browse projects
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="px-6 py-12 sm:px-10 lg:px-20 xl:px-28">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            [Sparkles, "Build proof", "Real project work that shows what you can do."],
            [Globe, "Meet builders", "Collaborate beyond your immediate network."],
            [FileText, "Earn history", "Keep visible contributions attached to your profile."],
          ].map(([Icon, title, description]) => (
            <div key={title} className="border border-[#d9d8d2] bg-[#fbfbfa] p-5">
              <Icon className="size-5" />
              <h2 className="mt-5 text-xl font-black">{title}</h2>
              <p className="mt-2 font-semibold text-[#55544f]">{description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-[#d9d8d2] bg-[#fbfbfa] px-6 py-16 sm:px-10 lg:px-20 xl:px-28">
        <div className="mb-8">
          <h2 className="text-3xl font-black">Ways to contribute</h2>
          <p className="mt-2 font-semibold text-[#55544f]">
            Choose the work type that fits your strengths and availability.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {contributionTypes.map(([Icon, title, description, skills]) => {
            const openings = totalOpenings(title)
            return (
              <article key={title} className="border border-[#d9d8d2] bg-white p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex size-11 items-center justify-center bg-[#2f2f2d] text-white">
                    <Icon className="size-5" />
                  </div>
                  <span className="border border-[#d9d8d2] px-2.5 py-1 text-xs font-black text-[#55544f]">
                    {openings} {openings === 1 ? "opening" : "openings"}
                  </span>
                </div>
                <h3 className="mt-5 text-2xl font-black">{title}</h3>
                <p className="mt-2 font-semibold leading-relaxed text-[#55544f]">{description}</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {skills.map((skill) => (
                    <span key={skill} className="border border-[#d9d8d2] px-2.5 py-1 text-xs font-black text-[#55544f]">
                      {skill}
                    </span>
                  ))}
                </div>
              </article>
            )
          })}
        </div>
      </section>

      <section className="px-6 py-16 sm:px-10 lg:px-20 xl:px-28">
        <div className="mb-8">
          <h2 className="text-3xl font-black">Projects needing help now</h2>
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          {featured.map((project) => {
            const openRoles = (project.roles || []).filter((r) => r.status === "open" && r.slotsOpen > 0)
            const totalOpen = openRoles.reduce((s, r) => s + r.slotsOpen, 0)
            return (
              <Link key={project.id} href={`/projects/${project.id}`} className="group border border-[#d9d8d2] bg-[#fbfbfa] p-5 block hover:border-[#171717] transition">
                <span className="inline-block px-2.5 py-1 text-xs font-black bg-[#171717] text-white">
                  {totalOpen} open {totalOpen === 1 ? "spot" : "spots"}
                </span>
                <h3 className="mt-5 text-2xl font-black group-hover:underline group-hover:underline-offset-4">{project.title}</h3>
                <p className="mt-2 font-semibold text-[#55544f]">{project.description}</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {openRoles.map((role) => (
                    <span key={role.id} className="border border-[#171717] bg-white px-3 py-1 text-sm font-black">
                      {role.title}
                    </span>
                  ))}
                </div>
              </Link>
            )
          })}
          {featured.length === 0 && (
            <div className="border border-[#d9d8d2] bg-[#fbfbfa] p-6 text-center lg:col-span-3">
              <p className="text-lg font-black">No projects recruiting right now.</p>
              <p className="mt-2 font-semibold text-[#55544f]">Check back soon or browse all projects.</p>
              <Link href="/find-projects" className="mt-4 inline-flex items-center gap-2 text-sm font-black underline underline-offset-4">
                Browse all projects
                <ArrowRight className="size-4" />
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
