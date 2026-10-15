import { cn } from "@/lib/utils"

/** Simple stat card with icon, value and label. */
export function StatTile({ icon: Icon, label, value, className }) {
  return (
    <div className={cn("border border-line bg-surface p-5", className)}>
      {Icon && <Icon className="size-5" />}
      {value && <p className="mt-4 text-3xl font-black">{value}</p>}
      {label && (
        <p className="mt-1 text-sm font-black uppercase tracking-[0.12em] text-faint">
          {label}
        </p>
      )}
    </div>
  )
}
