export default function MetricCard({ icon: Icon, label, value, note }) {
  return (
    <article className="metric-card">
      <span className="metric-icon" aria-hidden="true">
        <Icon size={19} strokeWidth={1.8} />
      </span>
      <div className="metric-copy">
        <p className="metric-label">{label}</p>
        <p className="metric-value">{value}</p>
        {note && <p className="metric-note">{note}</p>}
      </div>
    </article>
  );
}
