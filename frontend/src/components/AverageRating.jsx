import { formatAverage } from '../utils/format.js';

// "4.2 / 5 · 12 ratings", or a plain note when nobody has rated yet.
// Leave `count` out to show just "4.2 / 5".
export default function AverageRating({ value, count }) {
  if (value == null) return <span className="muted">No ratings yet</span>;

  return (
    <span className="average-rating">
      <span className="star-on">★</span> <strong>{formatAverage(value)}</strong>
      <span className="muted">
        {' '}
        / 5{count != null && ` · ${count} ${count === 1 ? 'rating' : 'ratings'}`}
      </span>
    </span>
  );
}
