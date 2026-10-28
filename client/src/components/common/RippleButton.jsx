import React, { useState } from 'react';

/**
 * RippleButton Component (Animate UI Pattern)
 * Features dynamic expanding liquid shockwave ripple on click / tap.
 */
export default function RippleButton({
  children,
  onClick,
  className = '',
  disabled = false,
  rippleColor = 'rgba(212, 255, 36, 0.45)',
  type = 'button',
  ...rest
}) {
  const [ripples, setRipples] = useState([]);

  const handleClick = (e) => {
    if (disabled) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newRipple = {
      id: Date.now() + Math.random(),
      x,
      y
    };

    setRipples(prev => [...prev, newRipple]);

    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== newRipple.id));
    }, 650);

    if (onClick) onClick(e);
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={handleClick}
      className={`ripple-cta-button ${className}`}
      {...rest}
    >
      {ripples.map(r => (
        <span
          key={r.id}
          className="liquid-ripple-wave"
          style={{
            left: r.x,
            top: r.y,
            backgroundColor: rippleColor
          }}
          aria-hidden="true"
        />
      ))}
      <span className="ripple-btn-content">{children}</span>
    </button>
  );
}
