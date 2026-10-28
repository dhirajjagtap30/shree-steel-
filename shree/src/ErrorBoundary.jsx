import { Component } from 'react'
export default class ErrorBoundary extends Component {
  state = { err: null }
  static getDerivedStateFromError(err) { return { err } }
  componentDidCatch(err) { console.error(err) }
  render() {
    if (!this.state.err) return this.props.children
    return (
      <div style={{ padding: 32, font: '15px/1.6 system-ui', maxWidth: 720, margin: 'auto' }}>
        <h2>Something went wrong on this page</h2>
        <pre style={{ whiteSpace: 'pre-wrap', background: '#f3eef8', color: '#1a1523', padding: 14, borderRadius: 8 }}>{String(this.state.err?.stack || this.state.err)}</pre>
        <button onClick={() => { try { localStorage.clear() } catch {} location.hash = '#/'; location.reload() }}>Reset saved data &amp; reload</button>
      </div>
    )
  }
}
