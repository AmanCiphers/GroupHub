"use client"

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react"
import { createPortal } from "react-dom"
import { Check, ChevronDown } from "lucide-react"

/**
 * Accessible custom select. Renders its menu in a portal so it is not clipped
 * by scroll containers or modals.
 */
export function Select({
  value,
  onChange,
  options = [],
  placeholder = "Select an option",
  disabled = false,
  className = "",
  menuClassName = "",
  name,
  ariaLabel,
}) {
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const [position, setPosition] = useState({
    top: 0,
    bottom: 0,
    left: 0,
    width: 0,
    dropUp: false,
  })

  const rootRef = useRef(null)
  const menuRef = useRef(null)
  const generatedId = useId()
  const listId = `select-list-${generatedId}`
  const optionId = (index) => `select-option-${generatedId}-${index}`

  const normalized = useMemo(
    () =>
      options.map((option) =>
        typeof option === "string"
          ? { value: option, label: option }
          : {
              value: option.value,
              label: option.label ?? String(option.value),
              disabled: option.disabled,
            }
      ),
    [options]
  )

  const selectedIndex = normalized.findIndex(
    (option) => String(option.value) === String(value)
  )
  const selected = selectedIndex >= 0 ? normalized[selectedIndex] : null

  const measure = useCallback(() => {
    const rect = rootRef.current?.getBoundingClientRect()
    if (!rect) return

    const estimatedHeight = Math.min(
      256,
      Math.max(normalized.length * 40 + 8, 44)
    )
    const spaceBelow = window.innerHeight - rect.bottom
    const dropUp = spaceBelow < estimatedHeight && rect.top > spaceBelow

    setPosition({
      top: rect.bottom + 4,
      bottom: window.innerHeight - rect.top + 4,
      left: rect.left,
      width: Math.max(rect.width, 160),
      dropUp,
    })
  }, [normalized.length])

  useEffect(() => {
    if (!open) return

    measure()
    window.addEventListener("resize", measure)
    window.addEventListener("scroll", measure, true)

    return () => {
      window.removeEventListener("resize", measure)
      window.removeEventListener("scroll", measure, true)
    }
  }, [open, measure])

  useEffect(() => {
    if (!open) return

    const onPointerDown = (event) => {
      if (
        rootRef.current?.contains(event.target) ||
        menuRef.current?.contains(event.target)
      ) {
        return
      }
      setOpen(false)
    }

    document.addEventListener("pointerdown", onPointerDown)
    return () => document.removeEventListener("pointerdown", onPointerDown)
  }, [open])

  useEffect(() => {
    if (!open) return
    const active = menuRef.current?.querySelector(
      `[data-index="${activeIndex}"]`
    )
    active?.scrollIntoView({ block: "nearest" })
  }, [open, activeIndex])

  const openMenu = () => {
    if (disabled) return
    setActiveIndex(selectedIndex >= 0 ? selectedIndex : 0)
    measure()
    setOpen(true)
  }

  const move = (direction) => {
    if (!normalized.length) return
    let next = activeIndex
    for (let step = 0; step < normalized.length; step += 1) {
      next = (next + direction + normalized.length) % normalized.length
      if (!normalized[next]?.disabled) break
    }
    setActiveIndex(next)
  }

  const commit = (index) => {
    const option = normalized[index]
    if (!option || option.disabled) return
    onChange?.(option.value)
    setOpen(false)
  }

  const handleKeyDown = (event) => {
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault()
        if (!open) openMenu()
        else move(1)
        break
      case "ArrowUp":
        event.preventDefault()
        if (!open) openMenu()
        else move(-1)
        break
      case "Home":
        if (open) {
          event.preventDefault()
          setActiveIndex(0)
        }
        break
      case "End":
        if (open) {
          event.preventDefault()
          setActiveIndex(normalized.length - 1)
        }
        break
      case "Enter":
      case " ":
        event.preventDefault()
        if (!open) openMenu()
        else commit(activeIndex)
        break
      case "Escape":
        if (open) {
          event.preventDefault()
          setOpen(false)
        }
        break
      case "Tab":
        setOpen(false)
        break
      default:
        break
    }
  }

  return (
    <div ref={rootRef} className="relative w-full">
      <button
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-activedescendant={
          open && normalized.length ? optionId(activeIndex) : undefined
        }
        aria-label={ariaLabel}
        disabled={disabled}
        onClick={() => (open ? setOpen(false) : openMenu())}
        onKeyDown={handleKeyDown}
        className={`flex w-full items-center justify-between gap-2 border border-line bg-white px-3 text-left font-semibold outline-none transition focus:border-ink disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      >
        <span className={`truncate ${selected ? "" : "text-faint"}`}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown
          className={`size-4 shrink-0 text-quiet transition ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {name && <input type="hidden" name={name} value={value ?? ""} />}

      {open &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={menuRef}
            id={listId}
            role="listbox"
            className={`fixed z-[1200] max-h-64 overflow-auto border border-ink bg-white shadow-xl ${menuClassName}`}
            style={{
              top: position.dropUp ? undefined : position.top,
              bottom: position.dropUp ? position.bottom : undefined,
              left: position.left,
              width: position.width,
            }}
          >
            {normalized.length === 0 ? (
              <p className="px-3 py-2 text-sm font-semibold text-faint">
                No options
              </p>
            ) : (
              normalized.map((option, index) => {
                const isSelected =
                  String(option.value) === String(value)
                return (
                  <button
                    key={`${option.value}-${index}`}
                    id={optionId(index)}
                    data-index={index}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    disabled={option.disabled}
                    onMouseDown={(event) => event.preventDefault()}
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => commit(index)}
                    className={`flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-40 ${
                      index === activeIndex
                        ? "bg-wash text-ink"
                        : "text-subtle hover:bg-wash hover:text-ink"
                    }`}
                  >
                    <span className="truncate">{option.label}</span>
                    {isSelected && <Check className="size-4 shrink-0" />}
                  </button>
                )
              })
            )}
          </div>,
          document.body
        )}
    </div>
  )
}
