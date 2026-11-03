import { Link } from 'react-router-dom'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Plus, ReceiptIndianRupee, UserPlus, UsersRound } from 'lucide-react'
import { getBalances, getGroup, listAllExpenses, listGroups, listUsers } from '../api/spliteasy'
import { useAsync } from '../lib/useAsync'
import { formatDateTime, formatINR, fromPaise, parseDate, toPaise } from '../lib/format'
import { Avatar, Card, EmptyState, ErrorState, Loading, PageHeader } from '../components/ui'

/** Everything on this page is computed from real API responses. Nothing is invented. */
async function loadDashboard() {
  const [users, groups] = await Promise.all([listUsers(), listGroups()])
  const perGroup = await Promise.all(groups.map(async (g) => {
    const [details, expenses, balances] = await Promise.all([getGroup(g.id), listAllExpenses(g.id), getBalances(g.id)])
    return { ...g, members: details.members, expenses, balances }
  }))
  return { users, groups: perGroup }
}

function Stat({ label, value, sub }) {
  return (
    <div className="card px-5 py-4">
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-1 font-display text-[28px] font-semibold money leading-tight">{value}</p>
      {sub && <p className="text-xs text-muted mt-0.5">{sub}</p>}
    </div>
  )
}

const quickActions = (
  <>
    <Link to="/users" className="btn btn-ghost"><UserPlus className="size-4" aria-hidden /> Add a person</Link>
    <Link to="/groups" className="btn btn-ghost"><UsersRound className="size-4" aria-hidden /> Create a group</Link>
    <Link to="/expenses" className="btn btn-primary"><Plus className="size-4" aria-hidden /> Add an expense</Link>
  </>
)

export default function Dashboard() {
  const { data, error, loading, reload } = useAsync(loadDashboard, [])

  if (loading && !data) return <><PageHeader title="Dashboard" /><Loading label="Loading your groups…" /></>
  if (error) return <><PageHeader title="Dashboard" /><div className="card"><ErrorState error={error} onRetry={reload} /></div></>

  const { users, groups } = data
  const allExpenses = groups.flatMap((g) => g.expenses.map((e) => ({ ...e, group: g })))
  const totalPaise = allExpenses.reduce((s, e) => s + toPaise(e.amount), 0)
  const unsettledPaise = groups.reduce((s, g) => s + g.balances.reduce((t, b) => t + Math.max(0, toPaise(b.balance)), 0), 0)
  const time = (e) => parseDate(e.createdAt)?.getTime() ?? 0
  const recent = [...allExpenses].sort((a, b) => time(b) - time(a) || b.id - a.id).slice(0, 6)
  const chartData = groups
    .map((g) => ({ name: g.name, total: fromPaise(g.expenses.reduce((s, e) => s + toPaise(e.amount), 0)) }))
    .filter((d) => d.total > 0)

  if (users.length === 0 && groups.length === 0) {
    return (
      <>
        <PageHeader title="Welcome to SplitEasy" description="Three steps to your first split." />
        <ol className="grid gap-4 md:grid-cols-3">
          {[
            ['Add the people', 'Everyone who shares costs needs a profile with a name and email.', '/users', 'Add a person'],
            ['Create a group', 'A trip, a flat, an office lunch. Then add people to it.', '/groups', 'Create a group'],
            ['Add an expense', 'Say who paid and how much. SplitEasy splits it equally.', '/expenses', 'Add an expense'],
          ].map(([t, d, to, cta], i) => (
            <li key={t} className="card p-5 flex flex-col">
              <span className="grid place-items-center size-8 rounded-full bg-brand-tint text-brand-deep font-semibold text-sm">{i + 1}</span>
              <h2 className="mt-3 text-lg font-semibold">{t}</h2>
              <p className="text-sm text-muted mt-1 flex-1">{d}</p>
              <Link to={to} className={`btn mt-4 ${i === 0 ? 'btn-primary' : 'btn-ghost'}`}>{cta}</Link>
            </li>
          ))}
        </ol>
      </>
    )
  }

  return (
    <>
      <PageHeader title="Dashboard"
        description={`${formatINR(fromPaise(unsettledPaise))} is still waiting to be settled across ${groups.length} group${groups.length === 1 ? '' : 's'}.`}
        actions={quickActions} />

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Stat label="Total spent" value={formatINR(fromPaise(totalPaise))} sub={`${allExpenses.length} expense${allExpenses.length === 1 ? '' : 's'}`} />
        <Stat label="Waiting to be settled" value={formatINR(fromPaise(unsettledPaise))} sub="Sum of what people are owed" />
        <Stat label="Groups" value={groups.length} />
        <Stat label="People" value={users.length} />
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-[1.2fr_1fr]">
        <Card title="Recent expenses" bodyClassName="pt-3">
          {recent.length === 0 ? (
            <EmptyState icon={ReceiptIndianRupee} title="No expenses yet"
              action={<Link to="/expenses" className="btn btn-primary">Add an expense</Link>}>
              Expenses from every group will show up here.
            </EmptyState>
          ) : (
            <ul className="divide-y divide-line">
              {recent.map((e) => {
                const payer = e.group.members.find((m) => m.id === e.paidByUserId)
                return (
                  <li key={e.id}>
                    <Link to={`/groups/${e.group.id}?tab=expenses`} className="flex items-center gap-3 px-5 py-3 hover:bg-canvas/70">
                      <Avatar name={payer?.name ?? '?'} id={e.paidByUserId} />
                      <div className="min-w-0 flex-1">
                        <p className="font-medium truncate">{e.description}</p>
                        <p className="text-sm text-muted truncate">{payer?.name ?? `User ${e.paidByUserId}`} paid in {e.group.name}, {formatDateTime(e.createdAt)}</p>
                      </div>
                      <span className="money font-semibold">{formatINR(e.amount)}</span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          )}
        </Card>

        <Card title="Spending by group">
          {chartData.length === 0 ? (
            <p className="text-sm text-muted py-6">The chart appears once a group has an expense.</p>
          ) : (
            <div className="h-64" role="img" aria-label={`Spending by group: ${chartData.map((d) => `${d.name} ${formatINR(d.total)}`).join(', ')}`}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical" margin={{ left: 8, right: 16, top: 4, bottom: 4 }}>
                  <CartesianGrid horizontal={false} stroke="#e1e8e6" />
                  <XAxis type="number" tickFormatter={(v) => `₹${v.toLocaleString('en-IN')}`} tick={{ fill: '#5b6b7f', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" width={96} tick={{ fill: '#0f2137', fontSize: 13 }} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ fill: '#f4f7f6' }} formatter={(v) => [formatINR(v), 'Spent']}
                    contentStyle={{ borderRadius: 10, border: '1px solid #e1e8e6', fontSize: 13 }} />
                  <Bar dataKey="total" fill="#0b6e66" radius={[0, 6, 6, 0]} barSize={22} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>
      </div>
    </>
  )
}
