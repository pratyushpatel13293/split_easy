import { useCallback, useEffect, useRef, useState } from 'react'
import { toApiError } from '../api/client'

/** Runs an async loader, tracks loading/error, and exposes reload(). */
export function useAsync(loader, deps = []) {
  const [state, setState] = useState({ data: null, error: null, loading: true })
  const latest = useRef(0)

  const run = useCallback(async () => {
    const id = ++latest.current
    setState((s) => ({ ...s, loading: true, error: null }))
    try {
      const data = await loader()
      if (id === latest.current) setState({ data, error: null, loading: false })
    } catch (err) {
      if (id === latest.current) setState({ data: null, error: toApiError(err), loading: false })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  useEffect(() => { run() }, [run])

  return { ...state, reload: run }
}
