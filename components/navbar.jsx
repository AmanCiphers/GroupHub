"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X, Users } from "lucide-react"
import { useEffect, useCallback, useRef, useState } from "react"

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
  { href: "/tutorials", label: "Tutorials" },
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/find-projects", label: "Find Projects" },
]

export function Navbar() {
  const pathname = usePathname()
  const isHome = pathname === "/"

  if (isHome) {
    return (
      <header className="absolute inset-x-0 top-0 z-[70]">
        <nav className="xl:grid xl:grid-cols-[1fr_29vw] xl:items-start">
          <div className="flex min-h-24 items-center justify-between bg-transparent px-6 sm:px-10 lg:px-20 xl:px-10 xl:pl-28">
            <Link
              href="/"
              className="flex h-16 w-20 items-center justify-start text-white"
              aria-label="GroupHub home"
            >
              <div className="relative h-[48px] w-[62px]">
                <img
                  src="/Logo.svg"
                  alt=""
                  className="block h-full w-full object-contain object-left-center"
                />
              </div>
            </Link>

            <div className="hidden items-center gap-8 xl:flex">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-lg font-medium text-white/78 transition-colors hover:text-white"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <MobileMenu hiddenClass="xl:hidden" />
          </div>

          <div className="hidden min-h-24 items-center gap-8 bg-[#fbfbfa] px-10 text-[#171717] xl:flex">
            <Link
              href="/account"
              className="text-lg font-medium transition-colors hover:text-[#62615d]"
            >
              Account
            </Link>
            <Link
              href="/dashboard"
              className="text-lg font-medium transition-colors hover:text-[#62615d]"
            >
              Dashboard
            </Link>
          </div>
        </nav>
      </header>
    )
  }

  return (
    <header className="sticky top-0 z-[70] border-b border-white/15 bg-[#2f2f2d] text-white">
      <nav className="flex min-h-[72px] items-center justify-between px-6 sm:px-10 lg:px-20 xl:px-28">
        <Link href="/" className="flex h-14 w-20 items-center justify-start" aria-label="GroupHub home">
          <img src="/Logo.svg" alt="" className="h-11 w-auto" />
        </Link>

        <div className="hidden lg:flex lg:items-center lg:gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-bold transition-colors hover:text-white ${
                pathname === link.href ? "text-white" : "text-white/62"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden lg:flex lg:items-center lg:gap-4">
          <Link href="/account" className="text-sm font-bold text-white/70 hover:text-white">
            Account
          </Link>
          <Link href="/dashboard" className="border border-white px-4 py-2 text-sm font-black transition hover:bg-white hover:text-[#171717]">
            Dashboard
          </Link>
        </div>

        <MobileMenu hiddenClass="lg:hidden" />
      </nav>
    </header>
  )
}

function MobileMenu({ hiddenClass }) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  const close = useCallback(() => setOpen(false), [])

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => { document.body.style.overflow = "" }
  }, [open])

  useEffect(() => {
    close()
  }, [pathname, close])

  useEffect(() => {
    if (!open) return
    const handler = (e) => {
      if (e.key === "Escape") close()
    }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [open, close])

  const links = [
    ...navLinks,
    { href: "/account", label: "Account" },
    { href: "/dashboard", label: "Dashboard" },
  ]

  return (
    <div className={hiddenClass}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative z-[90] flex size-11 cursor-pointer items-center justify-center text-white"
        aria-label={open ? "Close menu" : "Open menu"}
      >
        {open ? <X className="size-7" /> : <Menu className="size-7" />}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[80] bg-[#171717]/60 backdrop-blur-sm"
          onClick={close}
        />
      )}

      <div
        className={`fixed bottom-0 right-0 top-0 z-[85] w-[min(80vw,320px)] border-l border-white/10 bg-[#2f2f2d] p-6 pt-20 shadow-2xl transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          <div className="mb-6 flex items-center gap-2 border-b border-white/10 pb-6">
            <Users className="size-5 text-white/40" />
            <span className="text-sm font-semibold text-white/40">Menu</span>
          </div>

          <nav className="flex flex-col gap-1">
            {links.map((link) => {
              const active = link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href)
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={close}
                  className={`rounded-md px-4 py-3 text-base font-bold transition-colors ${
                    active
                      ? "bg-white/10 text-white"
                      : "text-white/65 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  {link.label}
                </Link>
              )
            })}
          </nav>

          <div className="mt-auto border-t border-white/10 pt-6">
            <p className="text-sm font-semibold text-white/30">
              Find roles, build teams, and move projects forward.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
