import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Loader2, UserPlus, Users } from 'lucide-react'
import { addMember, listUsers } from '../api/spliteasy'
import { toApiError } from '../api/client'
import { useAsync } from '../lib/useAsync'
import { useToast } from './Toast'
import { Avatar, Card, EmptyState, ErrorState, Loading } from './ui'

export default function MembersPanel({ group, onChanged }) {
  const toast = useToast()
  const users = useAsync(listUsers, [])
  const [selected, setSelected] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const memberIds = new Set(group.members.map((m) => m.id))
  const candidates = (users.data ?? []).filter((u) => !memberIds.has(u.id))

  async function submit(e) {
    e.preventDefault()
    if (!selected || submitting) return
    setSubmitting(true)
    try {
      const updated = await addMember(group.id, Number(selected))
      const added = updated.members.find((m) => m.id === Number(selected))
      toast.success(`${added?.name ?? 'User'} added to ${group.name}.`)
      setSelected('')
      onChanged?.()
    } catch (err) {
      // 409 here means "already a member": the backend message says exactly that.
      toast.error(toApiError(err).message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_340px] lg:items-start">
      <Card title={`Members (${group.members.length})`} bodyClassName="pt-3">
        {group.members.length === 0 ? (
          <EmptyState icon={Users} title="No members yet">Add people to this group to start splitting expenses.</EmptyState>
        ) : (
          <ul className="divide-y divide-line">
            {group.members.map((m) => (
              <li key={m.id} className="flex items-center gap-3 px-5 py-3">
                <Avatar name={m.name} id={m.id} />
                <div className="min-w-0">
                  <p className="font-medium truncate">{m.name}</p>
                  <p className="text-sm text-muted truncate">{m.email}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card title="Add a member" description="Pick someone who already has a SplitEasy profile.">
        {users.loading ? <Loading /> : users.error ? <ErrorState error={users.error} onRetry={users.reload} compact /> :
          candidates.length === 0 ? (
            <p className="text-sm text-muted">
              {users.data.length === 0 ? 'No people exist yet. ' : 'Everyone is already in this group. '}
              <Link to="/users" className="font-medium text-brand-deep underline underline-offset-2">Add a person</Link> first.
            </p>
          ) : (
            <form onSubmit={submit} className="grid gap-3">
              <label htmlFor="member-select" className="sr-only">Person</label>
              <select id="member-select" className="input" value={selected} onChange={(e) => setSelected(e.target.value)}>
                <option value="">Choose a person…</option>
                {candidates.map((u) => <option key={u.id} value={u.id}>{u.name} ({u.email})</option>)}
              </select>
              <button className="btn btn-primary" disabled={!selected || submitting}>
                {submitting ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <UserPlus className="size-4" aria-hidden />}
                {submitting ? 'Adding…' : 'Add to group'}
              </button>
            </form>
          )}
      </Card>
    </div>
  )
}
