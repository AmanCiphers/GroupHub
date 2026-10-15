import { cn } from "@/lib/utils"

/** Eyebrow label with optional icon. */
export function Eyebrow({ icon: Icon, children, className }) {
  return (
    <p className={cn("text-sm font-black uppercase tracking-[0.18em] text-quiet", className)}>
      {Icon && <Icon className="mr-2 inline size-4 align-text-bottom" />}
      {children}
    </p>
  )
}
