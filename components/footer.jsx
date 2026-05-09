import Link from "next/link"
import { Github, Linkedin, Twitter } from "lucide-react"

const footerLinks = {
  Platform: [
    { href: "/find-projects", label: "Find Projects" },
    { href: "/contribute", label: "Contribute" },
    { href: "/tutorials", label: "Tutorials" },
    { href: "/leaderboard", label: "Leaderboard" },
  ],
  Company: [
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
    { href: "#", label: "Careers" },
    { href: "#", label: "Blog" },
  ],
  Legal: [
    { href: "#", label: "Privacy Policy" },
    { href: "#", label: "Terms of Service" },
    { href: "#", label: "Cookie Policy" },
  ],
}

export function Footer() {
  return (
    <footer className="border-t border-[#d9d8d2] bg-[#2f2f2d] text-white">
      <div className="px-6 py-12 sm:px-10 lg:px-20 xl:px-28">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Link href="/" className="inline-flex items-center" aria-label="GroupHub home">
              <img src="/Logo.svg" alt="" className="h-12 w-auto" />
            </Link>
            <p className="mt-5 max-w-sm text-sm font-semibold leading-relaxed text-white/65">
              Turn early ideas into focused project teams with visible roles,
              useful matching, and real collaboration momentum.
            </p>
            <div className="mt-6 flex gap-4">
              {[
                [Github, "GitHub"],
                [Twitter, "Twitter"],
                [Linkedin, "LinkedIn"],
              ].map(([Icon, label]) => (
                <a
                  key={label}
                  href="#"
                  className="text-white/60 transition-colors hover:text-white"
                  aria-label={label}
                >
                  <Icon className="size-5" />
                </a>
              ))}
            </div>
          </div>

          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="text-sm font-black uppercase tracking-[0.14em] text-white">
                {title}
              </h3>
              <ul className="mt-4 space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm font-semibold text-white/60 transition-colors hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 border-t border-white/15 pt-8">
          <p className="text-sm font-semibold text-white/50">
            {new Date().getFullYear()} GroupHub. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
