import React, { useEffect, useRef } from 'react';

/**
 * CanvasFluidOrb
 * 3D Metallic Horizon AI Sphere (~190px) rendered on HTML5 Canvas.
 * Obsidian shadow bowl, pearl chrome dome, dynamic equatorial horizon band,
 * and Canvas UI shockwaves.
 */
export default function CanvasFluidOrb({ isSpeaking, isListening, onClick }) {
  const canvasRef = useRef(null);
  const shockwavesRef = useRef([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;
    let step = 0;

    const dpr = window.devicePixelRatio || 1;
    const size = 190;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;

    const cx = size / 2;
    const cy = size / 2;
    const radius = 78;

    const render = () => {
      step += isSpeaking ? 0.045 : isListening ? 0.06 : 0.02;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.scale(dpr, dpr);

      // 1. Force Field Shockwaves on Interaction / Speech
      for (let i = shockwavesRef.current.length - 1; i >= 0; i--) {
        const sw = shockwavesRef.current[i];
        sw.r += 2.8;
        sw.alpha *= 0.93;
        if (sw.alpha < 0.02) {
          shockwavesRef.current.splice(i, 1);
          continue;
        }
        ctx.beginPath();
        ctx.arc(cx, cy, sw.r, 0, Math.PI * 2);
        ctx.strokeStyle = sw.color === 'ruby'
          ? `rgba(212, 255, 36, ${sw.alpha})`
          : `rgba(21, 88, 201, ${sw.alpha})`;
        ctx.lineWidth = 1.6;
        ctx.stroke();
      }

      // 2. Outer Atmospheric Ambient Aura
      const auraGrad = ctx.createRadialGradient(cx, cy, radius * 0.9, cx, cy, radius * 1.15);
      if (isListening) {
        auraGrad.addColorStop(0, 'rgba(212, 255, 36, 0.2)');
        auraGrad.addColorStop(0.5, 'rgba(212, 255, 36, 0.05)');
        auraGrad.addColorStop(1, 'rgba(3, 4, 7, 0)');
      } else {
        auraGrad.addColorStop(0, 'rgba(21, 88, 201, 0.25)');
        auraGrad.addColorStop(0.5, 'rgba(21, 88, 201, 0.07)');
        auraGrad.addColorStop(1, 'rgba(3, 4, 7, 0)');
      }
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 1.15, 0, Math.PI * 2);
      ctx.fillStyle = auraGrad;
      ctx.fill();

      // 3. Clip strictly to Sphere Geometry
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.clip();

      // A. Base obsidian shadow sphere
      ctx.fillStyle = '#030407';
      ctx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2);

      // B. Deep Lower Hemisphere Shadow Bowl
      const bottomShadow = ctx.createRadialGradient(
        cx, cy + radius * 0.35, radius * 0.1,
        cx, cy + radius * 0.25, radius * 0.95
      );
      bottomShadow.addColorStop(0, '#010204');
      bottomShadow.addColorStop(0.55, '#060A14');
      bottomShadow.addColorStop(1, '#0D182E');
      ctx.fillStyle = bottomShadow;
      ctx.fillRect(cx - radius, cy, radius * 2, radius);

      // C. Dynamic Equatorial Horizon Band
      const bandWobble = isSpeaking
        ? Math.sin(step * 3) * 1.6
        : isListening
        ? Math.sin(step * 5) * 2.2
        : Math.sin(step) * 0.6;
      const bandY = cy + bandWobble;

      const bandGrad = ctx.createLinearGradient(0, bandY - 18, 0, bandY + 32);
      if (isListening) {
        bandGrad.addColorStop(0, 'rgba(212, 255, 36, 0)');
        bandGrad.addColorStop(0.28, 'rgba(212, 255, 36, 0.85)');
        bandGrad.addColorStop(0.55, 'rgba(180, 225, 20, 0.95)');
        bandGrad.addColorStop(0.8, 'rgba(120, 160, 10, 0.45)');
        bandGrad.addColorStop(1, 'rgba(3, 4, 7, 0)');
      } else {
        bandGrad.addColorStop(0, 'rgba(21, 88, 201, 0)');
        bandGrad.addColorStop(0.28, 'rgba(45, 130, 255, 0.85)');
        bandGrad.addColorStop(0.55, 'rgba(21, 88, 201, 0.98)');
        bandGrad.addColorStop(0.8, 'rgba(10, 45, 120, 0.55)');
        bandGrad.addColorStop(1, 'rgba(3, 4, 7, 0)');
      }

      ctx.fillStyle = bandGrad;
      ctx.beginPath();
      ctx.moveTo(cx - radius, bandY);
      for (let x = cx - radius; x <= cx + radius; x += 3) {
        const normX = (x - cx) / radius;
        const curve = Math.sqrt(Math.max(0, 1 - normX * normX)) * 2.2;
        const fluid = (isSpeaking || isListening) ? Math.sin(normX * 5 + step * 4) * 2.0 : 0;
        ctx.lineTo(x, bandY - 16 + fluid + curve);
      }
      for (let x = cx + radius; x >= cx - radius; x -= 3) {
        const normX = (x - cx) / radius;
        const curve = Math.sqrt(Math.max(0, 1 - normX * normX)) * 4.2;
        const fluid = (isSpeaking || isListening) ? Math.sin(normX * 5 + step * 4 + 1.2) * 2.0 : 0;
        ctx.lineTo(x, bandY + 32 + fluid + curve);
      }
      ctx.closePath();
      ctx.fill();

      // D. Upper Pearl / Satin Chrome Dome
      const domeGrad = ctx.createRadialGradient(
        cx,
        cy - radius * 0.28,
        radius * 0.08,
        cx,
        cy - radius * 0.08,
        radius * 0.94
      );
      domeGrad.addColorStop(0, '#FFFFFF');
      domeGrad.addColorStop(0.3, '#F4F7FC');
      domeGrad.addColorStop(0.62, '#D9E3F0');
      domeGrad.addColorStop(0.88, '#9EB4CE');
      domeGrad.addColorStop(1, isListening ? '#829462' : '#637D9E');

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(cx - radius, bandY);
      ctx.arc(cx, cy, radius, Math.PI, 0, false);
      for (let x = cx + radius; x >= cx - radius; x -= 3) {
        const normX = (x - cx) / radius;
        const fluid = (isSpeaking || isListening) ? Math.sin(normX * 5 + step * 4) * 1.6 : 0;
        ctx.lineTo(x, bandY + fluid);
      }
      ctx.closePath();
      ctx.fillStyle = domeGrad;
      ctx.fill();
      ctx.restore();

      // E. Soft Horizon Atmospheric Bleed
      const bleedGrad = ctx.createLinearGradient(0, bandY - 14, 0, bandY + 12);
      if (isListening) {
        bleedGrad.addColorStop(0, 'rgba(212, 255, 36, 0)');
        bleedGrad.addColorStop(0.5, 'rgba(212, 255, 36, 0.45)');
        bleedGrad.addColorStop(1, 'rgba(180, 220, 20, 0.88)');
      } else {
        bleedGrad.addColorStop(0, 'rgba(21, 88, 201, 0)');
        bleedGrad.addColorStop(0.5, 'rgba(21, 88, 201, 0.45)');
        bleedGrad.addColorStop(1, 'rgba(21, 88, 201, 0.92)');
      }
      ctx.fillStyle = bleedGrad;
      ctx.fillRect(cx - radius, bandY - 14, radius * 2, 26);

      // F. Lower Refraction Ground Ambient
      const underGlow = ctx.createRadialGradient(
        cx, cy + radius * 0.85, radius * 0.05,
        cx, cy + radius * 0.6, radius * 0.55
      );
      underGlow.addColorStop(0, isListening ? 'rgba(212, 255, 36, 0.15)' : 'rgba(21, 88, 201, 0.18)');
      underGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = underGlow;
      ctx.fillRect(cx - radius, cy + radius * 0.35, radius * 2, radius * 0.65);

      ctx.restore(); // End sphere clip

      // 4. Precision 1.2px Fresnel Perimeter Rim Light
      const rimGrad = ctx.createLinearGradient(cx, cy - radius, cx, cy + radius);
      rimGrad.addColorStop(0, 'rgba(255, 255, 255, 0.98)');
      rimGrad.addColorStop(0.36, 'rgba(225, 238, 255, 0.75)');
      rimGrad.addColorStop(0.5, isListening ? 'rgba(212, 255, 36, 1.0)' : 'rgba(85, 160, 255, 1.0)');
      rimGrad.addColorStop(0.66, isListening ? 'rgba(180, 225, 20, 0.65)' : 'rgba(21, 88, 201, 0.65)');
      rimGrad.addColorStop(0.86, 'rgba(40, 75, 140, 0.4)');
      rimGrad.addColorStop(1, 'rgba(255, 255, 255, 0.22)');

      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.strokeStyle = rimGrad;
      ctx.lineWidth = 1.3;
      ctx.stroke();

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [isSpeaking, isListening]);

  const handleOrbClick = (e) => {
    shockwavesRef.current.push({
      r: 25,
      alpha: 1.0,
      color: isListening ? 'ruby' : 'mint'
    });
    if (onClick) onClick(e);
  };

  return (
    <div className="ai-companion-stage">
      <div
        className="canvas-ai-orb-anchor"
        onClick={handleOrbClick}
        title="Canvas AI Sphere — Click to interact"
      >
        <canvas ref={canvasRef} className="canvas-orb-element" />
      </div>

      <div className="orb-state-chip">
        <span className="pulsing-dot"></span>
        <span>
          {isSpeaking
            ? 'AGENT SYNTHESIZING & SPEAKING'
            : isListening
            ? 'LISTENING TO CALLER VOICE...'
            : 'CONTINUOUS HANDS-FREE ACTIVE'}
        </span>
      </div>
    </div>
  );
}
