import { useState } from 'react'
import { ChevronLeft, ChevronRight, ReceiptIndianRupee, RotateCw, UserPlus } from 'lucide-react'
import { listExpenses } from '../api/spliteasy'
import { useAsync } from '../lib/useAsync'
import { formatDateTime, formatINR } from '../lib/format'
import { Avatar, Card, EmptyState, ErrorState, Loading } from './ui'
import AddExpenseForm from './AddExpenseForm'
import SplitResult from './SplitResult'

const PAGE_SIZE = 10

export default function ExpensesPanel({ groupId, members, onChanged, onGoToMembers }) {
  const [page, setPage] = useState(0)
  const [lastCreated, setLastCreated] = useState(null)
  const { data, error, loading, reload } = useAsync(() => listExpenses(groupId, page, PAGE_SIZE), [groupId, page])
  const names = Object.fromEntries(members.map((m) => [m.id, m.name]))

  function handleCreated(expense) {
    setLastCreated(expense)
    if (page === 0) reload(); else setPage(0) // newest first, so jump to page 0
    onChanged?.()
  }

  return (
    <div className="grid gap-5">
      <Card title="Add an expense" description="The amount is split equally between everyone in the group.">
        {members.length === 0 ? (
          <EmptyState icon={UserPlus} title="Add members first"
            action={onGoToMembers && <button className="btn btn-primary" onClick={onGoToMembers}>Add members</button>}>
            An expense is split between group members, so the group needs at least one.
          </EmptyState>
        ) : (
          <div className="grid gap-4">
            <AddExpenseForm groupId={groupId} members={members} onCreated={handleCreated} />
            {lastCreated && <SplitResult expense={lastCreated} onClose={() => setLastCreated(null)} />}
          </div>
        )}
      </Card>

      <Card title="Expenses" description="Newest first."
        bodyClassName="pt-3"
        actions={<button className="btn btn-ghost !px-2.5" onClick={reload} aria-label="Refresh expenses"><RotateCw className="size-4" /></button>}>
        {loading && !data ? <Loading /> : error ? <ErrorState error={error} onRetry={reload} compact /> :
          data.content.length === 0 ? (
            <EmptyState icon={ReceiptIndianRupee} title="No expenses yet">
              Add the first one above. It will show up here with who paid.
            </EmptyState>
          ) : (
            <>
              <ul className={`divide-y divide-line ${loading ? 'opacity-60' : ''}`}>
                {data.content.map((e) => (
                  <li key={e.id} className="flex items-center gap-3 px-5 py-3.5">
                    <Avatar name={names[e.paidByUserId] ?? '?'} id={e.paidByUserId} />
                    <div className="min-w-0 flex-1">
                      <p className="font-medium truncate">{e.description}</p>
                      <p className="text-sm text-muted truncate">
                        Paid by {names[e.paidByUserId] ?? `user ${e.paidByUserId}`}, {formatDateTime(e.createdAt)}
                      </p>
                    </div>
                    <span className="money font-semibold text-right">{formatINR(e.amount)}</span>
                  </li>
                ))}
              </ul>
              <div className="flex items-center justify-between border-t border-line px-5 py-3 text-sm">
                <span className="text-muted">
                  Page {data.page.number + 1} of {Math.max(1, data.page.totalPages)} ({data.page.totalElements} expense{data.page.totalElements === 1 ? '' : 's'})
                </span>
                <div className="flex gap-2">
                  <button className="btn btn-ghost !px-2.5 !py-1.5" disabled={page === 0 || loading}
                    onClick={() => setPage((p) => p - 1)} aria-label="Previous page"><ChevronLeft className="size-4" /></button>
                  <button className="btn btn-ghost !px-2.5 !py-1.5" disabled={page + 1 >= data.page.totalPages || loading}
                    onClick={() => setPage((p) => p + 1)} aria-label="Next page"><ChevronRight className="size-4" /></button>
                </div>
              </div>
            </>
          )}
      </Card>
    </div>
  )
}
