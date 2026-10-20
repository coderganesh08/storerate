import { useRef, useState } from 'react';

// Five clickable stars. Hovering previews a value, clicking calls onChange(1..5).
export default function StarRating({ value, onChange, label, disabled = false }) {
  const [hovered, setHovered] = useState(0);
  const buttonRefs = useRef([]);
  const shown = hovered || value;

  function handleKeyDown(event, current) {
    let next = current;
    if (event.key === 'ArrowRight' || event.key === 'ArrowUp') next = Math.min(5, current + 1);
    else if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') next = Math.max(1, current - 1);
    else if (event.key === 'Home') next = 1;
    else if (event.key === 'End') next = 5;
    else return;

    event.preventDefault();
    onChange(next);
    buttonRefs.current[next - 1]?.focus();
  }

  return (
    <div className="stars" role="radiogroup" aria-label={label} onMouseLeave={() => setHovered(0)}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          ref={(element) => { buttonRefs.current[n - 1] = element; }}
          type="button"
          role="radio"
          aria-checked={value === n}
          aria-label={`${n} star${n > 1 ? 's' : ''}`}
          tabIndex={value === n || (value === 0 && n === 1) ? 0 : -1}
          className={n <= shown ? 'star star-on' : 'star'}
          onMouseEnter={() => setHovered(n)}
          onKeyDown={(event) => handleKeyDown(event, value || n)}
          onClick={() => onChange(n)}
          disabled={disabled}
        >
          ★
        </button>
      ))}
    </div>
  );
}
