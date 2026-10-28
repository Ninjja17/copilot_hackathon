import React from 'react';

/**
 * BorderBeam Component (Inspira UI / Magic UI Pattern)
 * An animated gradient light beam that travels around the border of a card or container.
 */
export default function BorderBeam({
  size = 180,
  duration = 8,
  colorFrom = '#D4FF24',
  colorTo = '#1558C9',
  borderWidth = 1.5,
  className = ''
}) {
  return (
    <div
      style={{
        '--size': `${size}px`,
        '--duration': `${duration}s`,
        '--color-from': colorFrom,
        '--color-to': colorTo,
        '--border-width': `${borderWidth}px`
      }}
      className={`border-beam-container ${className}`}
      aria-hidden="true"
    >
      <div className="border-beam-tracer" />
    </div>
  );
}
