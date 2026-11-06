"use client"

import { useEffect, useRef, useState } from "react"
import { Check, ChevronDown, Search } from "lucide-react"

/**
 * Searchable multi-select dropdown used for discovery facets.
 * `counts` is an optional value -> count map for showing facet totals.
 */
export function MultiSelect({
  label,
  options,
  selected,
  counts,
  onToggle,
  onClear,
  searchPlaceholder = "Search…",
}) {
  const [open, setOpen] = useState(false)
  const [term, setTerm] = useState("")
  const containerRef = useRef(null)

  useEffect(() => {
    if (!open) return

    const handlePointerDown = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setOpen(false)
      }
    }
    const handleKeyDown = (event) => {
      if (event.key === "Escape") setOpen(false)
    }

    document.addEventListener("mousedown", handlePointerDown)
    document.addEventListener("keydown", handleKeyDown)
    return () => {
      document.removeEventListener("mousedown", handlePointerDown)
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [open])

  const query = term.trim().toLowerCase()
  const filtered = query
    ? options.filter((option) => option.toLowerCase().includes(query))
    : options

  const summary =
    selected.length === 0
      ? "All"
      : selected.length === 1
        ? selected[0]
        : `${selected.length} selected`

  return (
    <div ref={containerRef} className="relative">
      <div className="mb-1.5 flex items-center justify-between ">
        <span className="text-xs font-black uppercase tracking-[0.14em] text-faint">
          {label}
        </span>
        {selected.length > 0 && (
          <button
            type="button"
            onClick={onClear}
            className="text-xs font-black text-quiet underline underline-offset-4 hover:text-ink"
          >
            Clear
          </button>
        )}
      </div>

      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        className="flex h-10 w-full items-center justify-between gap-2 border border-line-strong bg-white px-3 text-left text-sm font-bold text-ink outline-none transition focus:border-ink"
      >
        <span className={`truncate ${selected.length === 0 ? "text-subtle" : ""}`}>
          {summary}
        </span>
        <ChevronDown
          className={`size-4 shrink-0 text-quiet transition ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div className="absolute z-30 mt-1 w-full border border-line bg-white shadow-lg">
          <div className="relative border-b border-line">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-faint" />
            <input
              autoFocus
              value={term}
              onChange={(event) => setTerm(event.target.value)}
              placeholder={searchPlaceholder}
              className="h-10 w-full bg-white pl-9 pr-3 text-sm font-semibold text-ink outline-none placeholder:text-faint"
            />
          </div>

          <div className="max-h-64 overflow-y-auto p-1">
            {filtered.length === 0 && (
              <p className="px-3 py-4 text-sm font-semibold text-faint">
                No matches.
              </p>
            )}

            {filtered.map((option) => {
              const isSelected = selected.includes(option)
              const count = counts?.[option]

              return (
                <button
                  key={option}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => onToggle(option)}
                  className="flex w-full items-center justify-between gap-2 px-2 py-1.5 text-left text-sm font-bold text-subtle transition hover:bg-wash hover:text-ink"
                >
                  <span className="flex items-center gap-2">
                    <span
                      className={`flex size-4 shrink-0 items-center justify-center border ${
                        isSelected
                          ? "border-ink bg-ink text-white"
                          : "border-line bg-white"
                      }`}
                    >
                      {isSelected && <Check className="size-3" />}
                    </span>
                    {option}
                  </span>
                  {typeof count === "number" && count > 0 && (
                    <span className="text-xs font-black text-faint">
                      {count}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
