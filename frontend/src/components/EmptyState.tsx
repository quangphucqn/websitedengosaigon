import { Link } from 'react-router-dom'

export function EmptyState({ title, body, actionTo, actionLabel }: { title: string; body: string; actionTo?: string; actionLabel?: string }) {
  return (
    <section className="empty-state">
      <h1>{title}</h1>
      <p>{body}</p>
      {actionTo && actionLabel && <Link className="button" to={actionTo}>{actionLabel}</Link>}
    </section>
  )
}
