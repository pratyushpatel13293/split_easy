import { ArrowRight, CheckCircle2, Info } from 'lucide-react'
import { Avatar, Card, EmptyState } from './ui'
import { formatINR } from '../lib/format'

export default function SettlementsPanel({ settlements, members }) {
  const byId = Object.fromEntries(members.map((m) => [m.id, m.name]))
  const name = (id) => byId[id] ?? `User ${id}`

  return (
    <Card title="Suggested payments" description="Make these payments outside the app and everyone in the group is settled.">
      {settlements.length === 0 ? (
        <EmptyState icon={CheckCircle2} title="Everyone is settled">No one owes anything in this group right now.</EmptyState>
      ) : (
        <ol className="grid gap-2.5">
          {settlements.map((s, i) => (
            <li key={`${s.fromUserId}-${s.toUserId}-${i}`}
              className="flex flex-wrap items-center gap-3 rounded-xl border border-line bg-canvas/60 px-4 py-3">
              <span className="flex items-center gap-2 min-w-0">
                <Avatar name={name(s.fromUserId)} id={s.fromUserId} size="sm" />
                <span className="font-medium truncate">{name(s.fromUserId)}</span>
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-surface border border-line px-3 py-1 text-sm">
                pays <span className="money font-semibold text-ink">{formatINR(s.amount)}</span>
                <ArrowRight className="size-3.5 text-brand-deep" aria-hidden />
              </span>
              <span className="flex items-center gap-2 min-w-0">
                <Avatar name={name(s.toUserId)} id={s.toUserId} size="sm" />
                <span className="font-medium truncate">{name(s.toUserId)}</span>
              </span>
            </li>
          ))}
        </ol>
      )}
      <div className="mt-5 flex gap-2.5 rounded-xl bg-brand-tint/60 p-3.5 text-sm text-ink-soft">
        <Info className="size-4 shrink-0 mt-0.5 text-brand-deep" aria-hidden />
        <p>
          These are suggestions, not recorded transfers. The server matches the person who owes the most with the person
          who is owed the most, repeatedly (two max-heaps). That needs at most one fewer payment than there are people,
          but it is not always the smallest possible number of payments.
        </p>
      </div>
    </Card>
  )
}
