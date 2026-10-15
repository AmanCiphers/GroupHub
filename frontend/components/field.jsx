import { cn } from '@/lib/utils'

/** Controlled/uncontrolled text input with optional leading icon. */
export function Field({ icon: Icon, id, label, type = 'text', placeholder, value, onChange }) {
  return (
    <label htmlFor={id} className="block">
      <span className="text-sm font-black">{label}</span>
      <span className="relative mt-2 block">
        {Icon && (
          <Icon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-faint" />
        )}
        <input
          id={id}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className={cn(
            'h-11 w-full border border-line bg-white font-semibold outline-none transition focus:border-ink',
            Icon ? 'pl-10 pr-3' : 'px-3'
          )}
          required
        />
      </span>
    </label>
  )
}
