import React, { useRef, useState } from 'react';

/**
 * SpotlightCard Component (Inspira UI / Skiper UI Pattern)
 * Mouse-tracking radial gradient spotlight hover with subtle 3D perspective tilt.
 */
export default function SpotlightCard({
  children,
  className = '',
  spotlightColor = 'rgba(21, 88, 201, 0.22)',
  tilt = true,
  onClick
}) {
  const cardRef = useRef(null);
  const [coords, setCoords] = useState({ x: 0, y: 0, opacity: 0 });
  const [transform, setTransform] = useState('');

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setCoords({ x, y, opacity: 1 });

    if (tilt) {
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -3; // Max 3deg tilt
      const rotateY = ((x - centerX) / centerX) * 3;
      setTransform(`perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-1px)`);
    }
  };

  const handleMouseLeave = () => {
    setCoords(prev => ({ ...prev, opacity: 0 }));
    if (tilt) {
      setTransform('perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)');
    }
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      className={`spotlight-card ${className}`}
      style={{
        transform: transform || undefined,
        transition: 'transform 0.18s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.2s ease'
      }}
    >
      {/* Dynamic Cursor Spotlight Layer */}
      <div
        className="spotlight-layer"
        style={{
          opacity: coords.opacity,
          background: `radial-gradient(circle 180px at ${coords.x}px ${coords.y}px, ${spotlightColor}, transparent 80%)`
        }}
        aria-hidden="true"
      />
      {children}
    </div>
  );
}
