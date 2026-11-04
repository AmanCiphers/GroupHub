"use client"

import { useState } from "react"

/** Suggestion chips plus a free-text input for adding custom values. */
export function ChipPicker({ suggestions, placeholder, value, onChange }) {
  const [query, setQuery] = useState("")
  const [focused, setFocused] = useState(false)

  const normalized = value.map((v) => v.toLowerCase())

  const add = (item) => {
    const cleaned = item.trim()
    if (
      cleaned &&
      !normalized.includes(cleaned.toLowerCase()) &&
      value.length < 30
    ) {
      onChange([...value, cleaned])
    }
    setQuery("")
  }

  const remove = (item) => onChange(value.filter((v) => v !== item))

  const matches = suggestions
    .filter((s) => !normalized.includes(s.toLowerCase()))
    .filter((s) => s.toLowerCase().includes(query.trim().toLowerCase()))
    .slice(0, 6)

  return (
    <div className="space-y-3">
      <div>
        <p className="mb-2 text-xs font-black uppercase tracking-[0.14em] text-faint">
          Suggestions
        </p>
        <div className="flex flex-wrap gap-2">
          {suggestions.map((s) => {
            const selected = normalized.includes(s.toLowerCase())
            return (
              <button
                key={s}
                type="button"
                onClick={() => (selected ? remove(s) : add(s))}
                aria-pressed={selected}
                className={`border px-3 py-1.5 text-sm font-bold transition ${
                  selected
                    ? "border-ink bg-ink text-white"
                    : "border-line bg-white text-subtle hover:border-ink hover:text-ink"
                }`}
              >
                {s}
              </button>
            )
          })}
        </div>
      </div>

      {value.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-black uppercase tracking-[0.14em] text-faint">
            Selected ({value.length})
          </p>
          <div className="flex flex-wrap gap-2">
            {value.map((item) => (
              <span
                key={item}
                className="flex items-center gap-1.5 border border-ink bg-white px-3 py-1.5 text-sm font-black text-ink"
              >
                {item}
                <button
                  type="button"
                  onClick={() => remove(item)}
                  className="text-faint transition hover:text-ink"
                  aria-label={`Remove ${item}`}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="relative">
        <div className="flex items-center border border-line bg-white px-3 focus-within:border-ink">
          <span className="text-sm font-semibold text-faint">+</span>
          <input
            className="h-11 min-w-0 flex-1 bg-transparent px-2 font-semibold outline-none"
            placeholder={placeholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setTimeout(() => setFocused(false), 150)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                if (matches[0]) add(matches[0])
                else if (query.trim()) add(query)
              }
            }}
          />
        </div>
        {focused && matches.length > 0 && (
          <div className="absolute z-10 mt-1 w-full border border-line bg-white shadow-lg">
            {matches.map((s) => (
              <button
                key={s}
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault()
                  add(s)
                }}
                className="block w-full px-3 py-2 text-left text-sm font-semibold text-ink transition hover:bg-wash"
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
