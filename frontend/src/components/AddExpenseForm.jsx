import { useEffect, useState } from 'react'
import { Plus, Loader2 } from 'lucide-react'
import { createExpense } from '../api/spliteasy'
import { toApiError } from '../api/client'
import { useToast } from './Toast'
import { Field } from './ui'
import { formatINR } from '../lib/format'

// Mirrors the backend's @Positive @Digits(integer = 10, fraction = 2) rule on amount.
const AMOUNT_RE = /^\d{1,10}(\.\d{1,2})?$/

export default function AddExpenseForm({ groupId, members, onCreated }) {
  const toast = useToast()
  const [form, setForm] = useState({ description: '', amount: '', paidByUserId: '' })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  // Default the payer to the first member; reset if the member list changes.
  useEffect(() => {
    setForm((f) => (members.some((m) => String(m.id) === String(f.paidByUserId))
      ? f : { ...f, paidByUserId: members[0] ? String(members[0].id) : '' }))
  }, [members])

  function validate() {
    const e = {}
    if (!form.description.trim()) e.description = 'Add a short description, like "Dinner".'
    const amt = form.amount.trim()
    if (!amt) e.amount = 'Enter an amount.'
    else if (!AMOUNT_RE.test(amt)) e.amount = 'Use a number with at most 2 decimal places.'
    else if (Number(amt) <= 0) e.amount = 'Amount must be more than ₹0.'
    if (!form.paidByUserId) e.paidByUserId = 'Choose who paid.'
    return e
  }

  async function submit(ev) {
    ev.preventDefault()
    if (submitting) return
    const e = validate()
    setErrors(e)
    if (Object.keys(e).length) return
    setSubmitting(true)
    try {
      const created = await createExpense(groupId, {
        description: form.description.trim(),
        amount: Number(form.amount),
        paidByUserId: Number(form.paidByUserId),
      })
      toast.success(`Added "${created.description}" for ${formatINR(created.amount)}.`)
      setForm((f) => ({ ...f, description: '', amount: '' }))
      setErrors({})
      onCreated?.(created)
    } catch (err) {
      toast.error(toApiError(err).message)
    } finally {
      setSubmitting(false)
    }
  }

  const share = AMOUNT_RE.test(form.amount.trim()) && Number(form.amount) > 0 && members.length
    ? Math.floor((Number(form.amount) * 100) / members.length) / 100 : null

  return (
    <form onSubmit={submit} noValidate className="grid gap-4 sm:grid-cols-[1.4fr_1fr_1fr_auto] sm:items-start">
      <Field label="Description" htmlFor="exp-desc" error={errors.description}>
        <input id="exp-desc" className="input" placeholder="Dinner at Fisherman's Wharf" value={form.description}
          aria-invalid={!!errors.description} maxLength={255}
          onChange={(e) => setForm({ ...form, description: e.target.value })} />
      </Field>
      <Field label="Amount (₹)" htmlFor="exp-amount" error={errors.amount}
        hint={share != null ? `About ${formatINR(share)} each, split ${members.length} ways` : undefined}>
        <input id="exp-amount" className="input money" inputMode="decimal" placeholder="1200.00" value={form.amount}
          aria-invalid={!!errors.amount}
          onChange={(e) => setForm({ ...form, amount: e.target.value })} />
      </Field>
      <Field label="Paid by" htmlFor="exp-payer" error={errors.paidByUserId}>
        <select id="exp-payer" className="input" value={form.paidByUserId} aria-invalid={!!errors.paidByUserId}
          onChange={(e) => setForm({ ...form, paidByUserId: e.target.value })}>
          {members.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
        </select>
      </Field>
      <div className="sm:pt-[26px]">
        <button type="submit" className="btn btn-primary w-full" disabled={submitting}>
          {submitting ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Plus className="size-4" aria-hidden />}
          {submitting ? 'Adding…' : 'Add expense'}
        </button>
      </div>
    </form>
  )
}
