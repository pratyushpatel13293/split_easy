import { Scale } from 'lucide-react'
import { Avatar, Card, EmptyState } from './ui'
import { formatINR, toPaise } from '../lib/format'

/**
 * Diverging bars around zero: people who owe extend left (rose),
 * people who are owed extend right (emerald). Numbers come straight from GET /balances.
 */
export default function BalancesPanel({ balances }) {
  if (!balances.length) {
    return <Card><EmptyState icon={Scale} title="No members yet">Balances appear once the group has members.</EmptyState></Card>
  }
  const sorted = [...balances].sort((a, b) => toPaise(b.balance) - toPaise(a.balance))
  const max = Math.max(1, ...sorted.map((b) => Math.abs(toPaise(b.balance))))
  const total = sorted.reduce((s, b) => s + toPaise(b.balance), 0)

  return (
    <Card title="Balances" description="Net position for each member, across every expense in this group.">
      <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted mb-5">
        <span className="inline-flex items-center gap-1.5"><i className="size-2.5 rounded-full bg-owed" />Positive: is owed money</span>
        <span className="inline-flex items-center gap-1.5"><i className="size-2.5 rounded-full bg-owes" />Negative: owes money</span>
        <span className="inline-flex items-center gap-1.5"><i className="size-2.5 rounded-full bg-line-strong" />Zero: settled</span>
      </div>

      <ul className="grid gap-3">
        {sorted.map((b, i) => {
          const p = toPaise(b.balance)
          const pct = (Math.abs(p) / max) * 50
          const tone = p > 0 ? 'text-owed' : p < 0 ? 'text-owes' : 'text-muted'
          const label = p > 0 ? 'is owed' : p < 0 ? 'owes' : 'settled'
          return (
            <li key={b.userId} className="grid grid-cols-[1fr_auto] sm:grid-cols-[minmax(0,10rem)_1fr_7.5rem] items-center gap-x-4 gap-y-1.5">
              <div className="flex items-center gap-2.5 min-w-0">
                <Avatar name={b.userName} id={b.userId} size="sm" />
                <span className="font-medium truncate">{b.userName}</span>
              </div>
              <div className="relative h-7 rounded-md bg-canvas col-span-2 order-last sm:col-span-1 sm:order-none" aria-hidden>
                <span className="absolute inset-y-0 left-1/2 w-px bg-line-strong" />
                {p !== 0 && (
                  <span className={`bar-grow absolute inset-y-1 rounded ${p > 0 ? 'bg-owed origin-left' : 'bg-owes origin-right'}`}
                    style={{ [p > 0 ? 'left' : 'right']: '50%', width: `${pct}%`, animationDelay: `${i * 60}ms` }} />
                )}
              </div>
              <p className={`text-right money leading-tight ${tone}`}>
                <span className="font-semibold">{p > 0 ? '+' : ''}{formatINR(b.balance)}</span>
                <span className="block text-xs text-muted">{label}</span>
              </p>
            </li>
          )
        })}
      </ul>

      <p className="mt-5 pt-4 border-t border-line text-sm text-muted">
        All balances add up to <span className={`money font-semibold ${total === 0 ? 'text-owed' : 'text-owes'}`}>{formatINR(total / 100)}</span>.
        {total === 0 && ' Money owed and money owed back always match, thanks to the rounding rule.'}
      </p>
    </Card>
  )
}
