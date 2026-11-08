export default function PageSpinner() {
  return (
    <div className="d-flex min-vh-100 align-items-center justify-content-center text-secondary">
      <div className="spinner-border spinner-border-sm me-2" role="status" />
      Loading…
    </div>
  );
}
