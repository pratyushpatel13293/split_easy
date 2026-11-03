import { useCallback, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { ArrowLeft, RotateCw } from 'lucide-react'
import { getBalances, getGroup, getSettlements, listExpenses } from '../api/spliteasy'
import { useAsync } from '../lib/useAsync'
import { formatINR } from '../lib/format'
import { Avatar, Card, ErrorState, Loading } from '../components/ui'
import MembersPanel from '../components/MembersPanel'
import ExpensesPanel from '../components/ExpensesPanel'
import BalancesPanel from '../components/BalancesPanel'
import SettlementsPanel from '../components/SettlementsPanel'

const TABS = [
  ['overview', 'Overview'], ['members', 'Members'], ['expenses', 'Expenses'],
  ['balances', 'Balances'], ['settlements', 'Settlements'],
]

/** Balances + settlements for the Overview, Balances and Settlements tabs. */
function useMoney(groupId, version, enabled) {
  return useAsync(async () => {
    if (!enabled) return null
    const [balances, settlements, firstPage] = await Promise.all([
      getBalances(groupId), getSettlements(groupId), listExpenses(groupId, 0, 1),
    ])
    return { balances, settlements, expenseCount: firstPage.page.totalElements }
  }, [groupId, version, enabled])
}

export default function GroupDetail() {
  const { id } = useParams()
  const [params, setParams] = useSearchParams()
  const tab = TABS.some(([k]) => k === params.get('tab')) ? params.get('tab') : 'overview'
  const setTab = (t) => setParams(t === 'overview' ? {} : { tab: t }, { replace: true })

  const [version, setVersion] = useState(0)
  const bump = useCallback(() => setVersion((v) => v + 1), [])
  const group = useAsync(() => getGroup(id), [id, version])
  const money = useMoney(id, version, !!group.data)

  if (group.loading && !group.data) return <Loading label="Loading group…" />
  if (group.error) {
    return (
      <div className="card">
        <ErrorState error={group.error} onRetry={group.error.kind === 'notFound' ? undefined : group.reload} />
        <div className="pb-8 text-center"><Link to="/groups" className="btn btn-ghost">Back to groups</Link></div>
      </div>
    )
  }
  const g = group.data

  return (
    <>
      <Link to="/groups" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink mb-4">
        <ArrowLeft className="size-4" aria-hidden /> All groups
      </Link>
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="text-[30px] sm:text-[34px] font-semibold">{g.name}</h1>
          <div className="mt-2 flex items-center gap-3">
            <div className="flex -space-x-2">
              {g.members.slice(0, 8).map((m) => (
                <span key={m.id} className="ring-2 ring-canvas rounded-full" title={m.name}><Avatar name={m.name} id={m.id} size="sm" /></span>
              ))}
            </div>
            <span className="text-sm text-muted">{g.members.length} member{g.members.length === 1 ? '' : 's'}</span>
          </div>
        </div>
        <button className="btn btn-ghost self-start sm:self-auto" onClick={bump}>
          <RotateCw className="size-4" aria-hidden /> Refresh
        </button>
      </header>

      <div role="tablist" aria-label="Group sections" className="flex gap-1 overflow-x-auto border-b border-line mb-6 -mx-4 px-4 sm:mx-0 sm:px-0">
        {TABS.map(([key, label]) => (
          <button key={key} role="tab" aria-selected={tab === key} onClick={() => setTab(key)}
            className={`px-3.5 py-2.5 text-[15px] font-medium border-b-2 -mb-px whitespace-nowrap transition-colors ${
              tab === key ? 'border-brand-deep text-brand-deep' : 'border-transparent text-muted hover:text-ink'}`}>
            {label}
          </button>
        ))}
      </div>

      <div role="tabpanel">
        {tab === 'members' && <MembersPanel group={g} onChanged={bump} />}
        {tab === 'expenses' && <ExpensesPanel groupId={g.id} members={g.members} onChanged={bump} onGoToMembers={() => setTab('members')} />}
        {(tab === 'overview' || tab === 'balances' || tab === 'settlements') && (
          (money.loading || !money.data) && !money.error ? <Loading /> :
          money.error ? <div className="card"><ErrorState error={money.error} onRetry={money.reload} /></div> :
          tab === 'balances' ? <BalancesPanel balances={money.data.balances} /> :
          tab === 'settlements' ? <SettlementsPanel settlements={money.data.settlements} members={g.members} /> :
          <Overview group={g} money={money.data} setTab={setTab} />
        )}
      </div>
    </>
  )
}

function Overview({ group, money, setTab }) {
  const owed = money.balances.reduce((s, b) => s + Math.max(0, Math.round(b.balance * 100)), 0)
  return (
    <div className="grid gap-5">
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-3">
        <div className="card px-5 py-4">
          <p className="text-sm text-muted">Expenses</p>
          <p className="font-display text-[28px] font-semibold money">{money.expenseCount}</p>
        </div>
        <div className="card px-5 py-4">
          <p className="text-sm text-muted">Waiting to be settled</p>
          <p className="font-display text-[28px] font-semibold money">{formatINR(owed / 100)}</p>
        </div>
        <div className="card px-5 py-4 col-span-2 lg:col-span-1">
          <p className="text-sm text-muted">Payments needed to settle</p>
          <p className="font-display text-[28px] font-semibold money">{money.settlements.length}</p>
        </div>
      </div>
      {group.members.length === 0 ? (
        <Card title="Start by adding members">
          <p className="text-sm text-muted">This group is empty. Add people, then record what they spend.</p>
          <button className="btn btn-primary mt-4" onClick={() => setTab('members')}>Add members</button>
        </Card>
      ) : (
        <div className="grid gap-5 lg:grid-cols-2 lg:items-start">
          <BalancesPanel balances={money.balances} />
          <div className="grid gap-5">
            <SettlementsPanel settlements={money.settlements} members={group.members} />
            <button className="btn btn-primary justify-self-start" onClick={() => setTab('expenses')}>Add an expense</button>
          </div>
        </div>
      )}
    </div>
  )
}
