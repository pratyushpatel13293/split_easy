import { Link } from 'react-router-dom'
export default function NotFound() {
  return (
    <div className="card p-10 text-center">
      <h1 className="text-2xl font-semibold">Page not found</h1>
      <p className="text-muted mt-1">That address doesn't match any page in SplitEasy.</p>
      <Link to="/" className="btn btn-primary mt-5">Go to the dashboard</Link>
    </div>
  )
}
