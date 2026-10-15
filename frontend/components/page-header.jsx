import { cn } from "@/lib/utils"

/**
 * Shared page hero header used across marketing/app pages.
 * Provides eyebrow, title, description and optional action slot.
 */
export function PageHeader({ eyebrowIcon: Icon, eyebrow, title, description, actions, className, children }) {
  return (
    <section
      className={cn(
        "border-b border-line bg-surface px-6 py-16 sm:px-10 lg:px-20 xl:px-28",
        className
      )}
    >
      <div className="grid gap-10 lg:grid-cols-[1fr_420px] lg:items-end">
        <div>
          {eyebrow && (
            <p className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.18em] text-quiet">
              {Icon && <Icon className="size-4" />}
              {eyebrow}
            </p>
          )}
          <h1 className="mt-5 max-w-4xl text-4xl font-black leading-[0.95] sm:text-6xl">
            {title}
          </h1>
        </div>
        <div>
          {description && (
            <p className="text-lg font-semibold leading-snug text-subtle">{description}</p>
          )}
          {actions}
        </div>
      </div>
      {children}
    </section>
  )
}
