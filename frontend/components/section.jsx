import { cn } from "@/lib/utils"

/** Reusable content section with consistent horizontal/vertical padding. */
export function Section({ className, children, ...props }) {
  return (
    <section
      className={cn("px-6 py-12 sm:px-10 lg:px-20 xl:px-28", className)}
      {...props}
    >
      {children}
    </section>
  )
}
