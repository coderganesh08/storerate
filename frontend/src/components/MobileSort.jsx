// Table headers are hidden on small screens (rows become stacked blocks), so this
// select + direction button takes over sorting there. It is hidden on wide screens by CSS.
export default function MobileSort({ options, sortBy, order, onChange }) {
  return (
    <div className="mobile-sort">
      <label className="sr-only" htmlFor="mobile-sort-select">
        Sort by
      </label>
      <select id="mobile-sort-select" value={sortBy} onChange={(e) => onChange(e.target.value, order)}>
        {options.map((option) => (
          <option key={option.key} value={option.key}>
            Sort: {option.label}
          </option>
        ))}
      </select>
      <button
        type="button"
        className="btn btn-secondary"
        onClick={() => onChange(sortBy, order === 'asc' ? 'desc' : 'asc')}
        aria-label={order === 'asc' ? 'Ascending, switch to descending' : 'Descending, switch to ascending'}
      >
        {order === 'asc' ? '▲ Asc' : '▼ Desc'}
      </button>
    </div>
  );
}
