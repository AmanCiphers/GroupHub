"use client"
import { useEffect, useRef, useState } from "react"
import { X } from "lucide-react"

export default function PillInput({ values, onChange, placeholder, suggestions }) {
  const [input, setInput] = useState("")
  const [showSuggestions, setShowSuggestions] = useState(false)
  const inputRef = useRef(null)
  const wrapperRef = useRef(null)

  const filtered = suggestions
    ? suggestions.filter(
        (s) =>
          !values.some((v) => v.toLowerCase() === s.toLowerCase()) &&
          s.toLowerCase().includes(input.toLowerCase())
      )
    : []

  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  function addItems(raw) {
    const items = raw
      .split(/[,;]/)
      .map((s) => s.trim())
      .filter(Boolean)
    if (!items.length) return
    const existing = new Set(values.map((v) => v.toLowerCase()))
    const newItems = items.filter((item) => !existing.has(item.toLowerCase()))
    if (!newItems.length) return
    onChange([...values, ...newItems])
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault()
      if (input) addItems(input)
      setInput("")
      setShowSuggestions(false)
    }
    if (e.key === "Backspace" && !input && values.length) {
      onChange(values.slice(0, -1))
    }
  }

  function selectSuggestion(suggestion) {
    onChange([...values, suggestion])
    setInput("")
    setShowSuggestions(false)
    inputRef.current?.focus()
  }

  function remove(index) {
    onChange(values.filter((_, i) => i !== index))
  }

  return (
    <div ref={wrapperRef} className="relative">
      <div
        className="flex min-h-11 flex-wrap items-center gap-1.5 border border-[#d9d8d2] bg-white px-3 py-1.5 focus-within:border-[#171717] cursor-text"
        onClick={() => inputRef.current?.focus()}
      >
        {values.map((value, index) => (
          <span key={index} className="flex items-center gap-1 border border-[#171717] bg-white px-2 py-0.5 text-sm font-black">
            {value}
            <button type="button" onClick={() => remove(index)} className="hover:text-[#77766f]">
              <X className="size-3" />
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => {
            setInput(e.target.value)
            setShowSuggestions(true)
          }}
          onFocus={() => setShowSuggestions(true)}
          onKeyDown={handleKeyDown}
          onPaste={(e) => {
            e.preventDefault()
            const text = e.clipboardData.getData("text")
            addItems(text)
          }}
          className="min-w-[120px] flex-1 border-0 bg-transparent px-0 py-1 font-semibold outline-none text-sm"
          placeholder={values.length ? "" : placeholder}
        />
      </div>
      {showSuggestions && filtered.length > 0 && (
        <div className="absolute left-0 right-0 top-full z-10 mt-1 max-h-48 overflow-y-auto border border-[#d9d8d2] bg-white shadow-lg">
          {filtered.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => selectSuggestion(s)}
              className="w-full px-3 py-2 text-left text-sm font-semibold hover:bg-[#efeee8]"
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
