// A column header that sorts when clicked. The arrow shows the current direction;
// columns that are not the active sort show a dim two-way arrow.
export default function SortHeader({ label, column, sortBy, order, onSort }) {
  const active = sortBy === column;
  const ariaSort = active ? (order === 'asc' ? 'ascending' : 'descending') : 'none';

  return (
    <th aria-sort={ariaSort}>
      <button type="button" className="sort-button" onClick={() => onSort(column)}>
        {label}
        <span className={active ? 'sort-arrow sort-arrow-active' : 'sort-arrow'} aria-hidden="true">
          {active ? (order === 'asc' ? '▲' : '▼') : '↕'}
        </span>
      </button>
    </th>
  );
}
