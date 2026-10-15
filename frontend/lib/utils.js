import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/** Merge clsx classes with tailwind-merge. */
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

/** Extract up to 2 initials from a full name. */
export function getInitials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
}
