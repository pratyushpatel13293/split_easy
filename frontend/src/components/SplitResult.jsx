import { X } from 'lucide-react'
import { Avatar } from './ui'
import { formatINR, toPaise } from '../lib/format'

/** Shows the equal split exactly as the backend returned it after POST /expenses. */
export default function SplitResult({ expense, onClose }) {
  const shares = expense.splits.map((s) => toPaise(s.shareAmount))
  const base = Math.min(...shares)
  return (
    <div className="rounded-xl border border-brand/30 bg-brand-tint/50 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-ink">“{expense.description}” split {expense.splits.length} ways</p>
          <p className="text-sm text-muted">
            {formatINR(expense.amount)} ÷ {expense.splits.length}, rounded down to the paisa. Any leftover goes to the payer.
          </p>
        </div>
        <button onClick={onClose} className="text-muted hover:text-ink" aria-label="Hide split"><X className="size-4" /></button>
      </div>
      <ul className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {expense.splits.map((s) => {
          const isPayer = s.userId === expense.paidByUserId
          const extra = toPaise(s.shareAmount) - base
          return (
            <li key={s.userId} className="flex items-center gap-2.5 rounded-lg bg-surface px-3 py-2 border border-line">
              <Avatar name={s.userName} id={s.userId} size="sm" />
              <span className="flex-1 min-w-0 truncate text-sm">
                {s.userName}{isPayer && <span className="text-muted"> (paid)</span>}
              </span>
              <span className="money text-sm font-semibold">{formatINR(s.shareAmount)}</span>
              {isPayer && extra > 0 && (
                <span className="money text-[11px] rounded-md bg-amber-100 text-amber-800 px-1.5 py-0.5" title="Leftover from rounding">
                  +{formatINR(extra / 100)}
                </span>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
