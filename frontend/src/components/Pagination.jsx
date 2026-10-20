export default function Pagination({ page, pageSize, total, onChange }) {
  if (total === 0) return null;

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const first = (page - 1) * pageSize + 1;
  const last = Math.min(page * pageSize, total);

  return (
    <div className="pagination">
      <span className="muted">
        Showing {first}–{last} of {total}
      </span>
      <div className="pagination-buttons">
        <button type="button" className="btn btn-secondary btn-small" onClick={() => onChange(page - 1)} disabled={page <= 1}>
          Previous
        </button>
        <span className="muted">
          Page {page} of {totalPages}
        </span>
        <button
          type="button"
          className="btn btn-secondary btn-small"
          onClick={() => onChange(page + 1)}
          disabled={page >= totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
}
