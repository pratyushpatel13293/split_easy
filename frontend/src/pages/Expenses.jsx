import { Link, useSearchParams } from 'react-router-dom'
import { UsersRound } from 'lucide-react'
import { getGroup, listGroups } from '../api/spliteasy'
import { useAsync } from '../lib/useAsync'
import { Card, EmptyState, ErrorState, Loading, PageHeader } from '../components/ui'
import ExpensesPanel from '../components/ExpensesPanel'

export default function Expenses() {
  const [params, setParams] = useSearchParams()
  const groups = useAsync(listGroups, [])
  const selectedId = params.get('group') ?? (groups.data?.[0] ? String(groups.data[0].id) : '')
  const group = useAsync(() => (selectedId ? getGroup(selectedId) : Promise.resolve(null)), [selectedId])

  return (
    <>
      <PageHeader title="Expenses" description="Pick a group, then record who paid. Shares are calculated by the server." />
      {groups.loading && !groups.data ? <Loading /> : groups.error ? <div className="card"><ErrorState error={groups.error} onRetry={groups.reload} /></div> :
        groups.data.length === 0 ? (
          <div className="card"><EmptyState icon={UsersRound} title="Create a group first"
            action={<Link to="/groups" className="btn btn-primary">Create a group</Link>}>
            Every expense belongs to a group, and is split between that group's members.
          </EmptyState></div>
        ) : (
          <div className="grid gap-5">
            <Card bodyClassName="p-4 sm:p-5">
              <label htmlFor="group-select" className="block text-sm font-medium text-ink-soft mb-1.5">Group</label>
              <select id="group-select" className="input sm:max-w-sm" value={selectedId}
                onChange={(e) => setParams({ group: e.target.value })}>
                {groups.data.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
              </select>
            </Card>
            {group.loading && !group.data ? <Loading /> : group.error ? <div className="card"><ErrorState error={group.error} onRetry={group.reload} /></div> :
              group.data && (
                <ExpensesPanel key={group.data.id} groupId={group.data.id} members={group.data.members}
                  onGoToMembers={undefined} />
              )}
            {group.data && group.data.members.length === 0 && (
              <p className="text-sm text-muted -mt-2">
                <Link to={`/groups/${group.data.id}?tab=members`} className="font-medium text-brand-deep underline underline-offset-2">Add members to {group.data.name}</Link> to start.
              </p>
            )}
          </div>
        )}
    </>
  )
}
