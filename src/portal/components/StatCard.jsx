export default function StatCard({ title, state, children }) {
  return (
    <div className="card shadow-sm h-100">
      <div className="card-body">
        <div className="text-muted small">{title}</div>
        <div className="fs-3 fw-semibold">
          {state.loading ? (
            <span className="spinner-border spinner-border-sm text-secondary" />
          ) : state.error ? (
            <span className="fs-6 fw-normal text-warning-emphasis">{state.error.message}</span>
          ) : (
            children(state.data)
          )}
        </div>
      </div>
    </div>
  );
}
