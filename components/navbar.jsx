"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X } from "lucide-react"

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
      <>
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

          <NativeMobileMenu hiddenClass="xl:hidden" />
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
      </>
    )
  }

  return (
    <>
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

          <NativeMobileMenu hiddenClass="lg:hidden" />
        </nav>
      </header>
    </>
  )
}

function NativeMobileMenu({ hiddenClass }) {
  return (
    <details className={`group ${hiddenClass}`}>
      <summary
        className="relative z-[90] flex size-11 cursor-pointer list-none items-center justify-center text-white [&::-webkit-details-marker]:hidden"
        aria-label="Toggle menu"
      >
        <Menu className="size-7 group-open:hidden" />
        <X className="hidden size-7 group-open:block" />
      </summary>

      <div className="fixed inset-0 z-[80] hidden bg-[#171717]/45 group-open:block" />

      <div
        className="fixed bottom-0 right-0 top-0 z-[85] w-[min(82vw,360px)] translate-x-full border-l border-white/15 bg-[#2f2f2d] p-6 pt-24 shadow-2xl transition-transform duration-300 ease-out group-open:translate-x-0"
      >
        <div className="grid h-full content-start gap-8">
          <div>
            <p className=" max-w-56 text-sm font-semibold leading-relaxed text-white/60">
              Find roles, build teams, and move projects forward.
            </p>
          </div>

          <nav className="grid gap-3">
            {[
              ...navLinks,
              { href: "/account", label: "Account" },
              { href: "/dashboard", label: "Dashboard" },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block py-2 text-sm font-bold text-white/75 transition-colors hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </details>
  )
}
