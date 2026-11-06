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
            <p className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.16em] text-quiet">
              {Icon && <Icon className="size-4" />}
              {eyebrow}
              <span aria-hidden="true" className="h-px w-8 bg-line-strong" />
            </p>
          )}
          <h1 className="mt-6 max-w-4xl text-display font-black tracking-tight">
            {title}
          </h1>
        </div>
        <div className="flex flex-col items-start gap-4">
          {description && (
            <p className="max-w-lg text-lg font-normal leading-relaxed text-subtle">{description}</p>
          )}
          {actions}
        </div>
      </div>
      {children}
    </section>
  )
}
