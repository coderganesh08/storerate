export function formatDate(isoString) {
  return new Date(isoString).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

export function formatAverage(value) {
  return value == null ? '—' : value.toFixed(1);
}
