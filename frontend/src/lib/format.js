const inr = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2, maximumFractionDigits: 2 })

export const formatINR = (value) => inr.format(Number(value ?? 0))

/** Money as integer paise, so sums don't pick up floating-point noise. */
export const toPaise = (value) => Math.round(Number(value ?? 0) * 100)
export const fromPaise = (paise) => paise / 100

/** Backend sends LocalDateTime like 2026-10-09T09:15:51.4021817 (no zone, up to 7 fraction digits). */
export function parseDate(value) {
  if (!value) return null
  const trimmed = String(value).replace(/(\.\d{3})\d+/, '$1')
  const d = new Date(trimmed)
  return Number.isNaN(d.getTime()) ? null : d
}

const dateFmt = new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
const timeFmt = new Intl.DateTimeFormat('en-IN', { hour: 'numeric', minute: '2-digit' })
export function formatDate(value) {
  const d = parseDate(value)
  return d ? dateFmt.format(d) : '—'
}
export function formatDateTime(value) {
  const d = parseDate(value)
  return d ? `${dateFmt.format(d)}, ${timeFmt.format(d)}` : '—'
}

export function initials(name = '') {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  return (parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase()
}
