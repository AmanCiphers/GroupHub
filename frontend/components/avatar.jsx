import { getInitials } from "@/lib/utils"
import { cn } from "@/lib/utils"

/** Circular avatar showing initials. */
export function Avatar({ name, size = "md", className }) {
  const sizes = {
    sm: "size-10 text-sm",
    md: "size-14 text-lg",
  }
  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full bg-charcoal text-white font-black",
        sizes[size],
        className
      )}
    >
      {getInitials(name)}
    </div>
  )
}
