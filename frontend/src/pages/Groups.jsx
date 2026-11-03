import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, Loader2, Plus, UsersRound } from 'lucide-react'
import { createGroup, getGroup, listGroups } from '../api/spliteasy'
import { toApiError } from '../api/client'
import { useAsync } from '../lib/useAsync'
import { useToast } from '../components/Toast'
import { Avatar, Card, EmptyState, ErrorState, Field, Loading, PageHeader } from '../components/ui'
import { useNavigate } from 'react-router-dom'

async function loadGroups() {
  const groups = await listGroups()
  // GET /groups returns id + name only, so fetch each group's members for the cards.
  return Promise.all(groups.map((g) => getGroup(g.id)))
}

export default function Groups() {
  const toast = useToast()
  const navigate = useNavigate()
  const { data, error, loading, reload } = useAsync(loadGroups, [])
  const [name, setName] = useState('')
  const [nameError, setNameError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function submit(e) {
    e.preventDefault()
    if (submitting) return
    if (!name.trim()) { setNameError('Give the group a name, like "Goa Trip".'); return }
    setNameError('')
    setSubmitting(true)
    try {
      const g = await createGroup({ name: name.trim() })
      toast.success(`Group "${g.name}" created. Add its members next.`)
      navigate(`/groups/${g.id}?tab=members`)
    } catch (err) {
      toast.error(toApiError(err).message)
      setSubmitting(false)
    }
  }

  return (
    <>
      <PageHeader title="Groups" description="Each group keeps its own expenses, balances and suggested payments." />
      <div className="grid gap-5 lg:grid-cols-[1fr_340px] lg:items-start">
        <div>
          {loading && !data ? <div className="card"><Loading /></div> : error ? <div className="card"><ErrorState error={error} onRetry={reload} /></div> :
            data.length === 0 ? (
              <div className="card"><EmptyState icon={UsersRound} title="No groups yet">Create one for a trip, a flat or a team lunch.</EmptyState></div>
            ) : (
              <ul className="grid gap-3 sm:grid-cols-2">
                {data.map((g) => (
                  <li key={g.id}>
                    <Link to={`/groups/${g.id}`} className="card flex flex-col p-5 h-full hover:border-brand/50 transition-colors group">
                      <div className="flex items-start justify-between gap-3">
                        <h2 className="text-lg font-semibold">{g.name}</h2>
                        <ChevronRight className="size-5 text-muted group-hover:text-brand-deep" aria-hidden />
                      </div>
                      <p className="text-sm text-muted mt-0.5">{g.members.length} member{g.members.length === 1 ? '' : 's'}</p>
                      <div className="mt-4 flex -space-x-2">
                        {g.members.slice(0, 6).map((m) => (
                          <span key={m.id} className="ring-2 ring-white rounded-full" title={m.name}><Avatar name={m.name} id={m.id} size="sm" /></span>
                        ))}
                        {g.members.length > 6 && (
                          <span className="ring-2 ring-white rounded-full size-7 grid place-items-center bg-canvas text-[11px] text-muted">+{g.members.length - 6}</span>
                        )}
                        {g.members.length === 0 && <span className="text-sm text-brand-deep font-medium">Add members</span>}
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
        </div>

        <Card title="Create a group">
          <form onSubmit={submit} noValidate className="grid gap-4">
            <Field label="Group name" htmlFor="group-name" error={nameError}>
              <input id="group-name" className="input" placeholder="Goa Trip" value={name} aria-invalid={!!nameError}
                onChange={(e) => setName(e.target.value)} />
            </Field>
            <button className="btn btn-primary" disabled={submitting}>
              {submitting ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Plus className="size-4" aria-hidden />}
              {submitting ? 'Creating…' : 'Create group'}
            </button>
          </form>
        </Card>
      </div>
    </>
  )
}
