import { createContext, useCallback, useContext, useRef, useState } from 'react'
import { CheckCircle2, AlertCircle, X } from 'lucide-react'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const nextId = useRef(1)

  const dismiss = useCallback((id) => setToasts((t) => t.filter((x) => x.id !== id)), [])
  const push = useCallback((type, message) => {
    const id = nextId.current++
    setToasts((t) => [...t, { id, type, message }].slice(-3)) // keep the newest 3
    setTimeout(() => dismiss(id), type === 'error' ? 6000 : 3500)
  }, [dismiss])

  const api = { success: (m) => push('success', m), error: (m) => push('error', m) }

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div aria-live="polite" className="fixed z-50 bottom-20 lg:bottom-6 right-4 left-4 sm:left-auto flex flex-col gap-2 sm:w-96">
        {toasts.map((t) => (
          <div key={t.id} role={t.type === 'error' ? 'alert' : 'status'}
            className="toast-in flex items-start gap-3 rounded-xl bg-ink text-white px-4 py-3 shadow-[var(--shadow-pop)]">
            {t.type === 'success'
              ? <CheckCircle2 className="size-5 shrink-0 text-emerald-300" aria-hidden />
              : <AlertCircle className="size-5 shrink-0 text-rose-300" aria-hidden />}
            <p className="text-sm leading-snug flex-1">{t.message}</p>
            <button onClick={() => dismiss(t.id)} className="text-white/60 hover:text-white" aria-label="Dismiss">
              <X className="size-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => useContext(ToastContext)
