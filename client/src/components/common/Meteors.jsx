import React from 'react';

/**
 * Meteors background effect
 */
export default function Meteors({ count = 14 }) {
  const meteors = [...new Array(count)].map((_, i) => ({
    id: i,
    top: -20,
    left: Math.floor(Math.random() * 800) - 200 + 'px',
    animationDelay: Math.random() * 2 + 0.2 + 's',
    animationDuration: Math.floor(Math.random() * 6 + 4) + 's'
  }));

  return (
    <div className="meteors-container">
      {meteors.map((m) => (
        <span
          key={m.id}
          className="meteor-stream"
          style={{
            top: m.top + 'px',
            left: m.left,
            animationDelay: m.animationDelay,
            animationDuration: m.animationDuration
          }}
        />
      ))}
    </div>
  );
}
