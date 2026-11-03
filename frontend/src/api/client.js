import axios from 'axios'

// One Axios instance for the whole app. All requests go through here.
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
})

/**
 * Turn any Axios error into { kind, status, message } the UI can show.
 * The backend's GlobalExceptionHandler returns { status, message }.
 * Spring's own default errors (e.g. malformed JSON) return { status, error, path }.
 */
export function toApiError(err) {
  if (err?.response) {
    const { status, data } = err.response
    // With the Vite proxy, a stopped backend comes back as a 5xx with an empty or non-JSON body.
    const backendDown = (status === 502 || status === 503 || status === 504 || status === 500) &&
      (data == null || typeof data !== 'object')
    if (backendDown) {
      return { kind: 'network', status, message: "Can't reach the SplitEasy API. Check that the Spring Boot app is running on port 8080." }
    }
    const message =
      (data && typeof data === 'object' && (data.message || data.detail || data.error)) ||
      `Request failed with status ${status}`
    const kind = status === 404 ? 'notFound' : status === 409 ? 'conflict' : status === 400 ? 'validation' : 'server'
    return { kind, status, message }
  }
  if (err?.code === 'ECONNABORTED') {
    return { kind: 'network', status: 0, message: 'The API took too long to respond. Try again.' }
  }
  return { kind: 'network', status: 0, message: "Can't reach the SplitEasy API. Check that the Spring Boot app is running on port 8080." }
}
