// The single row a table shows when it has no data rows: loading, error (with retry) or empty.
export default function TableMessageRow({ colSpan, status, error, onRetry, emptyTitle, emptyHint }) {
  let content;

  if (status === 'loading') {
    content = <p className="muted">Loading…</p>;
  } else if (status === 'error') {
    content = (
      <>
        <p className="field-error">{error}</p>
        <button type="button" className="btn btn-secondary btn-small" onClick={onRetry}>
          Try again
        </button>
      </>
    );
  } else {
    content = (
      <>
        <p>
          <strong>{emptyTitle}</strong>
        </p>
        {emptyHint && <p className="muted">{emptyHint}</p>}
      </>
    );
  }

  return (
    <tr>
      <td colSpan={colSpan} className="cell-message">
        {content}
      </td>
    </tr>
  );
}
