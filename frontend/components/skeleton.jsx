"use client"

export function Skeleton({ className = "", style, ...props }) {
  return (
    <div
      className={`animate-pulse bg-track rounded ${className}`}
      style={style}
      {...props}
    />
  )
}

export function TextSkeleton({ lines = 1, className = "", ...props }) {
  return (
    <div className={className} {...props}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className="h-4 w-full rounded"
          style={{ width: i === lines - 1 ? "60%" : "100%" }}
        />
      ))}
    </div>
  )
}

export function CardSkeleton({ className = "", ...props }) {
  return (
    <div className={`border border-line bg-surface p-5 ${className}`} {...props}>
      <Skeleton className="h-6 w-1/3 mb-4" />
      <TextSkeleton lines={3} />
    </div>
  )
}

export function StatCardSkeleton({ className = "", ...props }) {
  return (
    <div className={`border border-line bg-surface p-5 ${className}`} {...props}>
      <Skeleton className="h-4 w-1/4 mb-3" />
      <Skeleton className="h-10 w-1/2 mb-1" />
      <Skeleton className="h-3 w-1/3" />
    </div>
  )
}

export function ProjectCardSkeleton({ className = "", ...props }) {
  return (
    <article className={`border border-line bg-surface p-5 ${className}`} {...props}>
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-6 w-20" />
      </div>
      <Skeleton className="h-5 w-3/4 mb-2" />
      <Skeleton className="h-4 w-1/2 mb-2" />
      <div className="flex flex-wrap gap-1.5 mb-3">
        <Skeleton className="h-5 w-16" />
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-5 w-14" />
      </div>
      <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-16" />
      </div>
    </article>
  )
}

export function RoleCardSkeleton({ className = "", ...props }) {
  return (
    <article className={`border border-line bg-surface p-5 ${className}`} {...props}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <Skeleton className="h-6 w-28" />
            <Skeleton className="h-6 w-14" />
          </div>
          <div className="flex flex-wrap gap-1.5">
            <Skeleton className="h-5 w-14" />
            <Skeleton className="h-5 w-20" />
          </div>
        </div>
        <div className="shrink-0">
          <Skeleton className="h-10 w-28" />
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-28" />
      </div>
    </article>
  )
}

export function ApplicationRowSkeleton({ className = "", ...props }) {
  return (
    <div className={`flex flex-col gap-3 border border-line bg-surface p-4 sm:flex-row sm:items-center sm:justify-between ${className}`} {...props}>
      <div className="flex items-start gap-3">
        <Skeleton className="size-10 rounded-full" />
        <div>
          <Skeleton className="h-5 w-32 mb-1" />
          <Skeleton className="h-4 w-48 mb-1" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
      <div className="flex items-center gap-3 sm:flex-row-reverse">
        <Skeleton className="h-6 w-20" />
        <Skeleton className="h-8 w-24" />
      </div>
    </div>
  )
}

export function ProfilePreviewSkeleton({ className = "", ...props }) {
  return (
    <div className={`border border-ink bg-surface p-5 ${className}`} {...props}>
      <p className="text-xs font-black uppercase tracking-[0.14em] text-faint mb-4">Profile preview</p>
      <div className="mt-4 flex items-center gap-3">
        <Skeleton className="size-14 rounded-full" />
        <div className="min-w-0">
          <Skeleton className="h-6 w-40 mb-1" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
      <Skeleton className="mt-4 h-4 w-48" />
      <div className="mt-4 flex flex-wrap gap-1.5">
        <Skeleton className="h-5 w-16" />
        <Skeleton className="h-5 w-16" />
        <Skeleton className="h-5 w-16" />
      </div>
      <div className="mt-5 border-t border-line pt-4">
        <div className="mb-2 flex items-center justify-between text-xs font-black uppercase tracking-[0.12em] text-faint">
          <span>Profile strength</span>
          <span>0%</span>
        </div>
        <div className="h-2 bg-track">
          <div className="h-full bg-ink" style={{ width: "0%" }} />
        </div>
      </div>
    </div>
  )
}

export function PageHeaderSkeleton({ className = "", ...props }) {
  return (
    <div className={className} {...props}>
      <Skeleton className="h-5 w-24 mb-2" />
      <Skeleton className="h-8 w-3/4 mb-2" />
      <Skeleton className="h-5 w-1/2" />
    </div>
  )
}

export function FormFieldSkeleton({ className = "", ...props }) {
  return (
    <div className={`space-y-1.5 ${className}`} {...props}>
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-11 w-full" />
    </div>
  )
}

export function TableRowSkeleton({ cols = 4, className = "", ...props }) {
  return (
    <div className={`flex items-center gap-4 border-b border-line py-3 ${className}`} {...props}>
      {Array.from({ length: cols }).map((_, i) => (
        <Skeleton key={i} className="h-4 flex-1" style={{ width: i === 0 ? "30%" : "20%" }} />
      ))}
    </div>
  )
}

export function ListSkeleton({ items = 4, component: Component = CardSkeleton, ...props }) {
  return (
    <div className="grid gap-4" {...props}>
      {Array.from({ length: items }).map((_, i) => (
        <Component key={i} {...props} />
      ))}
    </div>
  )
}