import { useState } from 'react'
import { Loader2, Search, UserPlus, Users as UsersIcon } from 'lucide-react'
import { createUser, listUsers } from '../api/spliteasy'
import { toApiError } from '../api/client'
import { useAsync } from '../lib/useAsync'
import { useToast } from '../components/Toast'
import { Avatar, Card, EmptyState, ErrorState, Field, Loading, PageHeader } from '../components/ui'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function Users() {
  const toast = useToast()
  const { data, error, loading, reload } = useAsync(listUsers, [])
  const [form, setForm] = useState({ name: '', email: '' })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [query, setQuery] = useState('')

  async function submit(e) {
    e.preventDefault()
    if (submitting) return
    const errs = {}
    if (!form.name.trim()) errs.name = 'Enter a name.'
    if (!form.email.trim()) errs.email = 'Enter an email address.'
    else if (!EMAIL_RE.test(form.email.trim())) errs.email = 'Enter a valid email, like amit@example.com.'
    setErrors(errs)
    if (Object.keys(errs).length) return

    setSubmitting(true)
    try {
      const u = await createUser({ name: form.name.trim(), email: form.email.trim() })
      toast.success(`${u.name} added.`)
      setForm({ name: '', email: '' })
      reload()
    } catch (err) {
      const apiErr = toApiError(err)
      if (apiErr.kind === 'conflict') setErrors({ email: apiErr.message }) // duplicate email from the backend
      else toast.error(apiErr.message)
    } finally {
      setSubmitting(false)
    }
  }

  const q = query.trim().toLowerCase()
  const shown = (data ?? []).filter((u) => !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q))

  return (
    <>
      <PageHeader title="People" description="Everyone who can be added to a group. Each email can only be used once." />
      <div className="grid gap-5 lg:grid-cols-[1fr_360px] lg:items-start">
        <Card title={data ? `All people (${data.length})` : 'All people'} bodyClassName="pt-3"
          actions={data?.length > 5 && (
            <label className="relative">
              <span className="sr-only">Search people</span>
              <Search className="size-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted" aria-hidden />
              <input className="input !py-1.5 !pl-8 w-44" placeholder="Search" value={query} onChange={(e) => setQuery(e.target.value)} />
            </label>
          )}>
          {loading && !data ? <Loading /> : error ? <ErrorState error={error} onRetry={reload} compact /> :
            data.length === 0 ? (
              <EmptyState icon={UsersIcon} title="No people yet">Add the first person with the form. You'll need at least two to split anything.</EmptyState>
            ) : shown.length === 0 ? (
              <p className="px-5 py-8 text-sm text-muted text-center">No one matches “{query}”.</p>
            ) : (
              <ul className="divide-y divide-line">
                {shown.map((u) => (
                  <li key={u.id} className="flex items-center gap-3 px-5 py-3">
                    <Avatar name={u.name} id={u.id} />
                    <div className="min-w-0 flex-1">
                      <p className="font-medium truncate">{u.name}</p>
                      <p className="text-sm text-muted truncate">{u.email}</p>
                    </div>
                    <span className="text-xs text-muted money">ID {u.id}</span>
                  </li>
                ))}
              </ul>
            )}
        </Card>

        <Card title="Add a person">
          <form onSubmit={submit} noValidate className="grid gap-4">
            <Field label="Name" htmlFor="user-name" error={errors.name}>
              <input id="user-name" className="input" placeholder="Amit Sharma" value={form.name} aria-invalid={!!errors.name}
                autoComplete="off" onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </Field>
            <Field label="Email" htmlFor="user-email" error={errors.email}>
              <input id="user-email" type="email" className="input" placeholder="amit@example.com" value={form.email} aria-invalid={!!errors.email}
                autoComplete="off" onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </Field>
            <button className="btn btn-primary" disabled={submitting}>
              {submitting ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <UserPlus className="size-4" aria-hidden />}
              {submitting ? 'Adding…' : 'Add person'}
            </button>
          </form>
        </Card>
      </div>
    </>
  )
}
