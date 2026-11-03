import { AlertTriangle, RotateCw, Loader2, WifiOff } from 'lucide-react'
import { initials } from '../lib/format'

const AVATAR_TONES = [
  'bg-emerald-100 text-emerald-800', 'bg-teal-100 text-teal-800', 'bg-sky-100 text-sky-800',
  'bg-amber-100 text-amber-800', 'bg-violet-100 text-violet-800', 'bg-rose-100 text-rose-800',
]

/** Colour is picked from the user id, so the same person always has the same colour. */
export function Avatar({ name, id, size = 'md' }) {
  const tone = AVATAR_TONES[Math.abs(Number(id ?? 0)) % AVATAR_TONES.length]
  const sizes = { sm: 'size-7 text-[11px]', md: 'size-9 text-xs', lg: 'size-11 text-sm' }
  return (
    <span aria-hidden className={`inline-grid place-items-center rounded-full font-semibold shrink-0 ${tone} ${sizes[size]}`}>
      {initials(name)}
    </span>
  )
}

export function PageHeader({ title, description, actions }) {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-7">
      <div className="max-w-2xl">
        <h1 className="text-[28px] sm:text-[32px] font-semibold text-ink">{title}</h1>
        {description && <p className="mt-1.5 text-muted">{description}</p>}
      </div>
      {actions && <div className="flex gap-2 flex-wrap">{actions}</div>}
    </header>
  )
}

export function Loading({ label = 'Loading…', className = '' }) {
  return (
    <div role="status" className={`flex items-center justify-center gap-2 py-12 text-muted ${className}`}>
      <Loader2 className="size-5 animate-spin" aria-hidden /> <span className="text-sm">{label}</span>
    </div>
  )
}

export function ErrorState({ error, onRetry, compact = false }) {
  const offline = error?.kind === 'network'
  const Icon = offline ? WifiOff : AlertTriangle
  return (
    <div role="alert" className={`flex flex-col items-center text-center ${compact ? 'py-8' : 'py-14'} px-6`}>
      <span className={`grid place-items-center size-11 rounded-full ${offline ? 'bg-amber-50 text-amber-700' : 'bg-owes-tint text-owes'}`}>
        <Icon className="size-5" aria-hidden />
      </span>
      <p className="mt-3 font-semibold text-ink">{offline ? 'API not reachable' : 'Something went wrong'}</p>
      <p className="mt-1 text-sm text-muted max-w-md">{error?.message}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn btn-ghost mt-4">
          <RotateCw className="size-4" aria-hidden /> Try again
        </button>
      )}
    </div>
  )
}

export function EmptyState({ icon: Icon, title, children, action }) {
  return (
    <div className="flex flex-col items-center text-center py-12 px-6">
      {Icon && (
        <span className="grid place-items-center size-12 rounded-2xl bg-brand-tint text-brand-deep">
          <Icon className="size-6" aria-hidden />
        </span>
      )}
      <p className="mt-3 font-semibold text-ink">{title}</p>
      {children && <p className="mt-1 text-sm text-muted max-w-sm">{children}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

export function Field({ label, htmlFor, error, hint, children }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="block text-sm font-medium text-ink-soft mb-1.5">{label}</label>
      {children}
      {error
        ? <p id={`${htmlFor}-error`} className="mt-1.5 text-sm text-owes">{error}</p>
        : hint && <p className="mt-1.5 text-xs text-muted">{hint}</p>}
    </div>
  )
}

export function Card({ title, description, actions, children, className = '', bodyClassName = 'p-5' }) {
  return (
    <section className={`card ${className}`}>
      {(title || actions) && (
        <div className="flex items-start justify-between gap-3 px-5 pt-5">
          <div>
            {title && <h2 className="text-lg font-semibold">{title}</h2>}
            {description && <p className="text-sm text-muted mt-0.5">{description}</p>}
          </div>
          {actions}
        </div>
      )}
      <div className={bodyClassName}>{children}</div>
    </section>
  )
}
