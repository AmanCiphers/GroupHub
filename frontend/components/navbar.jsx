"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Menu, X, Users, LogOut } from "lucide-react"
import { useEffect, useCallback, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { fetchMe, logoutUser } from "@/lib/features/auth/authSlice"

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/tutorials", label: "Tutorials" },
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/find-projects", label: "Find Projects" },
  { href: "/contribute", label: "Contribute" },
]

/** Global navigation with auth-aware actions and mobile drawer. */
export function Navbar() {
  const pathname = usePathname()
  const isHome = pathname === "/"
  const dispatch = useDispatch()
  const initialized = useSelector((state) => state.auth.initialized)

  useEffect(() => {
    if (!initialized) {
      dispatch(fetchMe())
    }
  }, [dispatch, initialized])

  if (isHome) {
    return (
      <div className="flex flex-col">
  
        <header className="absolute inset-x-0 top- z-[70]">
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
                    className="text-md font-medium text-white/78 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>

              <MobileMenu hiddenClass="xl:hidden" />
            </div>

            <div className="hidden min-h-24 items-center gap-8 bg-surface px-10 text-ink xl:flex">
              <AccountActions variant="home" />
            </div>
          </nav>
        </header>
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      <header className="sticky top-0 z-[70] border-b border-white/15 bg-charcoal text-white">
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
            <AccountActions />
          </div>

          <MobileMenu hiddenClass="lg:hidden" />
        </nav>
      </header>
    </div>
  )
}

function AccountActions({ variant = "default" }) {
  const dispatch = useDispatch()
  const router = useRouter()
  const user = useSelector((state) => state.auth.user)

  const isHome = variant === "home"

  const accountClass = isHome
    ? "text-lg font-medium transition-colors hover:text-quiet"
    : "text-sm font-bold text-white/70 hover:text-white"
  const dashboardClass = isHome
    ? "text-lg font-medium transition-colors hover:text-quiet"
    : "border border-white px-4 py-2 text-sm font-black transition hover:bg-white hover:text-ink"
  const nameClass = isHome
    ? "text-lg font-medium text-quiet"
    : "text-sm font-bold text-white/70"
  const logoutClass = isHome
    ? "flex items-center gap-2 text-lg font-medium text-quiet transition-colors hover:text-ink"
    : "flex items-center gap-2 text-sm font-bold text-white/70 transition-colors hover:text-white"

  if (!user) {
    return (
      <>
        <Link href="/account" className={accountClass}>
          Account
        </Link>
        <Link href="/dashboard" className={dashboardClass}>
          Dashboard
        </Link>
      </>
    )
  }

  const handleLogout = async () => {
    await dispatch(logoutUser())
    router.push("/")
  }

  return (
    <>
      <Link href="/profile" className={nameClass}>
        Hi, {user.name}
      </Link>
      <Link href="/dashboard" className={dashboardClass}>
        Dashboard
      </Link>
      <button onClick={handleLogout} className={logoutClass}>
        <LogOut className="size-4" />
        Log out
      </button>
    </>
  )
}

function MobileMenu({ hiddenClass }) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const dispatch = useDispatch()
  const router = useRouter()
  const user = useSelector((state) => state.auth.user)

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

  const links = user
    ? navLinks
    : [...navLinks, { href: "/account", label: "Account" }, { href: "/dashboard", label: "Dashboard" }]

  const handleLogout = async () => {
    close()
    await dispatch(logoutUser())
    router.push("/")
  }

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
          className="fixed inset-0 z-[80] bg-ink/60 backdrop-blur-sm"
          onClick={close}
        />
      )}

      <div
        className={`fixed bottom-0 right-0 top-0 z-[85] w-[min(80vw,320px)] border-l border-white/10 bg-charcoal p-6 pt-20 shadow-2xl transition-transform duration-300 ease-out ${
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
            {user ? (
              <>
                <p className="mb-4 text-sm font-semibold text-white/40">
                  Signed in as {user.email}
                </p>
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center justify-center gap-2 rounded-md border border-white/20 px-4 py-3 text-base font-bold text-white transition-colors hover:bg-white/5"
                >
                  <LogOut className="size-4" />
                  Log out
                </button>
              </>
            ) : (
              <p className="text-sm font-semibold text-white/30">
                Find roles, build teams, and move projects forward.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
