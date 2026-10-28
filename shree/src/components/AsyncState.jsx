// Shows a loading line or an error box (with retry) instead of its children. Reuses the site's existing classes.
export default function AsyncState({ loading, error, onRetry, children }) {
  if (error) {
    return (
      <div className="panel">
        <p className="err" role="alert">{error}</p>
        {onRetry && <button type="button" className="btn" style={{ marginTop: 12 }} onClick={onRetry}>Try again</button>}
      </div>
    )
  }
  if (loading) return <p className="lead" role="status">Loading…</p>
  return <>{children}</>
}
