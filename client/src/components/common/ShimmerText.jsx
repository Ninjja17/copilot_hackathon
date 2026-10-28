import React from 'react';

/**
 * ShimmerText Component (Inspira UI / Animate UI Pattern)
 * Subtle luminous gradient sweep scanning across text.
 */
export default function ShimmerText({
  children,
  className = '',
  shimmerColor = '#D4FF24',
  baseColor = '#FFFFFF',
  duration = 4
}) {
  return (
    <span
      className={`shimmer-text-element ${className}`}
      style={{
        '--shimmer-color': shimmerColor,
        '--base-color': baseColor,
        '--duration': `${duration}s`
      }}
    >
      {children}
    </span>
  );
}
