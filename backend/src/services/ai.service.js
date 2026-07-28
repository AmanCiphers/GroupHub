const { env } = require("../config/env")
const { tagRepository } = require("../repositories/tag.repository")

function buildHierarchyPrompt(items, label) {
  const groups = {}
  for (const t of items) {
    const key = [t.category || "Other", t.subCategory || "General"].join(" / ")
    if (!groups[key]) groups[key] = []
    groups[key].push(t.displayName || t.name)
  }
  return Object.entries(groups)
    .map(([group, names]) => `  ${group}: ${names.join(", ")}`)
    .join("\n")
}

async function aiRewrite(text) {
  if (!text.trim()) return { description: "", skills: [], roles: [] }

  const apiKey = env.GROQ_API_KEY
  if (!apiKey) return { description: text, skills: [], roles: [] }

  const [dbSkills, dbRoles] = await Promise.all([
    tagRepository.findByType("skill"),
    tagRepository.findByType("role"),
  ])

  const allSkills = dbSkills.map((t) => t.displayName || t.name)
  const allRoles = dbRoles.map((t) => t.displayName || t.name)

  const nameIndex = {}
  for (const t of dbSkills) nameIndex[(t.displayName || t.name).toLowerCase()] = t
  for (const t of dbRoles) nameIndex[(t.displayName || t.name).toLowerCase()] = t

  const allowedSkillNames = allSkills.map((s) => s.toLowerCase())
  const allowedRoleNames = allRoles.map((s) => s.toLowerCase())

  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: env.GROQ_MODEL,
        messages: [
          {
            role: "system",
            content: [
              "You are a project assistant. Return ONLY valid JSON (no markdown, no code fences):",
              '{ "description": "...", "skills": [...], "roles": [...] }',
              "",
              "- description: rewrite the project description to be clear and professional (2-4 sentences)",
              '- skills: array of objects { "name": "...", "category": "...", "subCategory": "..." } — pick 3-8 from the ALLOWED SKILLS below',
              '- roles: array of objects { "name": "...", "category": "...", "subCategory": "..." } — pick 1-4 from the ALLOWED ROLES below',
              "Only use names that appear in the allowed lists. Use the exact category and subCategory shown.",
              "",
              "ALLOWED SKILLS (category / subCategory → name):",
              buildHierarchyPrompt(dbSkills, "SKILLS"),
              "",
              "ALLOWED ROLES (category / subCategory → name):",
              buildHierarchyPrompt(dbRoles, "ROLES"),
            ].join("\n"),
          },
          { role: "user", content: text },
        ],
        temperature: 0.5,
        max_tokens: 1000,
      }),
    })

    if (!res.ok) return { description: text, skills: [], roles: [] }

    const data = await res.json()
    const raw = data.choices?.[0]?.message?.content?.trim() || ""

    let parsed
    try {
      parsed = JSON.parse(raw)
    } catch {
      const jsonMatch = raw.match(/\{[\s\S]*\}/)
      if (jsonMatch) parsed = JSON.parse(jsonMatch[0])
      else return { description: text, skills: [], roles: [] }
    }

    function intersect(allowed, suggested) {
      if (!Array.isArray(suggested)) return []
      return suggested.filter((s) => {
        const name = (s.name || s).toString().toLowerCase()
        return allowed.includes(name)
      })
    }

    const matchedSkills = intersect(allowedSkillNames, parsed.skills || []).slice(0, 8)
    const matchedRoles = intersect(allowedRoleNames, parsed.roles || []).slice(0, 4)

    const toUpsert = (items) =>
      items.map((s) => {
        const name = (s.name || s).toString().trim()
        const existing = nameIndex[name.toLowerCase()]
        return {
          name,
          category: s.category || existing?.category || null,
          subCategory: s.subCategory || existing?.subCategory || null,
        }
      })

    const skillItems = toUpsert(matchedSkills)
    const roleItems = toUpsert(matchedRoles)

    tagRepository.upsertMany(skillItems, "skill").catch(() => {})
    tagRepository.upsertMany(roleItems, "role").catch(() => {})

    return {
      description: parsed.description?.trim() || text,
      skills: skillItems.map((s) => s.name),
      roles: roleItems.map((r) => r.name),
    }
  } catch {
    return { description: text, skills: [], roles: [] }
  }
}

const aiService = { aiRewrite }

module.exports = { aiService }
