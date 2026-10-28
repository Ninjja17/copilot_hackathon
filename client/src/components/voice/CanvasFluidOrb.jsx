import React, { useEffect, useRef } from 'react';

/**
 * CanvasFluidOrb
 * Next-Gen Gemini & OpenAI Advanced Voice Mode Living Organism (~240px).
 * Features:
 * 1. Living Organic Fluid Morphing Blob (Perlin/Harmonic multi-frequency deformation)
 * 2. Google Gemini 4-Point Celestial Luminous Star Core with counter-rotating flares
 * 3. OpenAI Advanced Voice Mode acoustic resonance rings radiating on speech
 * 4. Additive screen-blend chromatic plasma caustics & internal liquid refraction
 * 5. State-reactive energy physics: Serene Idle -> Acoustic Absorbing (Listening) -> Phonetic Squash & Stretch (Speaking)
 * 6. 3D orbital quantum stardust particles with depth layering
 */
export default function CanvasFluidOrb({ isSpeaking, isListening, onClick }) {
  const canvasRef = useRef(null);
  const shockwavesRef = useRef([]);
  const energyRef = useRef(0.2);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;
    let time = 0;

    const dpr = window.devicePixelRatio || 1;
    const size = 250;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;

    const cx = size / 2;
    const baseCy = size / 2;
    const baseRadius = 66;

    // 20 Orbital Quantum Stardust Particles
    const particles = Array.from({ length: 20 }, (_, i) => ({
      angle: (i / 20) * Math.PI * 2,
      speed: 0.014 + (i % 5) * 0.005,
      distOffset: ((i % 4) - 1.5) * 16,
      size: 1.2 + (i % 4) * 0.7,
      tilt: 0.38 + (i % 3) * 0.15,
      hue: i % 2 === 0 ? 'cyan' : 'lime'
    }));

    const render = () => {
      // Smoothly interpolate energy level based on active voice state
      const targetEnergy = isSpeaking ? 1.0 : isListening ? 0.75 : 0.22;
      energyRef.current += (targetEnergy - energyRef.current) * 0.08;
      const energy = energyRef.current;

      const speed = 0.02 + energy * 0.038;
      time += speed;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.scale(dpr, dpr);

      // Organic zero-g levitation physics
      const floatY = Math.sin(time * 1.5) * (3 + energy * 3);
      const cy = baseCy + floatY;

      // ========================================================
      // 1. Outer Volumetric Atmospheric Aurora Bloom
      // ========================================================
      const bloomRadius = baseRadius * (1.4 + energy * 0.5 + Math.sin(time * 2) * 0.05);
      const bloomGrad = ctx.createRadialGradient(cx, cy, baseRadius * 0.4, cx, cy, bloomRadius);
      if (isSpeaking) {
        bloomGrad.addColorStop(0, 'rgba(21, 88, 201, 0.45)');
        bloomGrad.addColorStop(0.45, 'rgba(0, 240, 255, 0.18)');
        bloomGrad.addColorStop(0.75, 'rgba(212, 255, 36, 0.08)');
        bloomGrad.addColorStop(1, 'rgba(3, 4, 7, 0)');
      } else if (isListening) {
        bloomGrad.addColorStop(0, 'rgba(0, 240, 255, 0.38)');
        bloomGrad.addColorStop(0.5, 'rgba(212, 255, 36, 0.22)');
        bloomGrad.addColorStop(0.8, 'rgba(21, 88, 201, 0.08)');
        bloomGrad.addColorStop(1, 'rgba(3, 4, 7, 0)');
      } else {
        bloomGrad.addColorStop(0, 'rgba(21, 88, 201, 0.28)');
        bloomGrad.addColorStop(0.5, 'rgba(56, 189, 248, 0.1)');
        bloomGrad.addColorStop(1, 'rgba(3, 4, 7, 0)');
      }
      ctx.beginPath();
      ctx.arc(cx, cy, bloomRadius, 0, Math.PI * 2);
      ctx.fillStyle = bloomGrad;
      ctx.fill();

      // ========================================================
      // 2. OpenAI-Style Acoustic Resonance Shockwaves
      // ========================================================
      const ringCount = 3;
      for (let i = 0; i < ringCount; i++) {
        const ringPhase = (time * 1.6 + i * (Math.PI * 2 / ringCount)) % (Math.PI * 2);
        const progress = ringPhase / (Math.PI * 2); // 0 to 1
        const ringR = baseRadius + progress * (42 + energy * 28);
        const ringAlpha = Math.sin(progress * Math.PI) * (0.15 + energy * 0.45);

        ctx.save();
        ctx.beginPath();
        // Slight harmonic undulation along the shockwave
        const numRingPoints = 48;
        for (let j = 0; j <= numRingPoints; j++) {
          const theta = (j / numRingPoints) * Math.PI * 2;
          const undulation = Math.sin(theta * 3 + time * 3) * (1.5 + energy * 3);
          const r = ringR + undulation;
          const rx = cx + Math.cos(theta) * r;
          const ry = cy + Math.sin(theta) * r;
          if (j === 0) ctx.moveTo(rx, ry);
          else ctx.lineTo(rx, ry);
        }
        ctx.closePath();
        ctx.strokeStyle = isListening
          ? `rgba(212, 255, 36, ${ringAlpha})`
          : `rgba(56, 189, 248, ${ringAlpha})`;
        ctx.lineWidth = 1.2 + energy * 0.8;
        ctx.shadowColor = isListening ? 'rgba(212, 255, 36, 0.8)' : 'rgba(56, 189, 248, 0.8)';
        ctx.shadowBlur = 10;
        ctx.stroke();
        ctx.restore();
      }

      // Handle click shockwaves
      for (let i = shockwavesRef.current.length - 1; i >= 0; i--) {
        const sw = shockwavesRef.current[i];
        sw.r += 3.8;
        sw.alpha *= 0.92;
        if (sw.alpha < 0.02) {
          shockwavesRef.current.splice(i, 1);
          continue;
        }
        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, sw.r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(212, 255, 36, ${sw.alpha})`;
        ctx.lineWidth = 2;
        ctx.shadowColor = 'rgba(212, 255, 36, 0.9)';
        ctx.shadowBlur = 14;
        ctx.stroke();
        ctx.restore();
      }

      // ========================================================
      // 3. Orbital Particles (Behind Body: sin(angle) < 0)
      // ========================================================
      particles.forEach((p) => {
        p.angle += p.speed * (1 + energy * 1.2);
        const sinA = Math.sin(p.angle);
        if (sinA < 0) {
          const cosA = Math.cos(p.angle);
          const orbitR = baseRadius + 18 + p.distOffset;
          const px = cx + cosA * orbitR;
          const py = cy + sinA * (orbitR * p.tilt);
          const alpha = 0.2 + (-sinA) * 0.4;
          ctx.beginPath();
          ctx.arc(px, py, p.size * 0.85, 0, Math.PI * 2);
          ctx.fillStyle = p.hue === 'cyan'
            ? `rgba(56, 189, 248, ${alpha})`
            : `rgba(212, 255, 36, ${alpha})`;
          ctx.fill();
        }
      });

      // ========================================================
      // 4. Primary Living Fluid Morphing Body (OpenAI + Gemini)
      // ========================================================
      const numPoints = 84;
      const fluidPoints = [];

      for (let i = 0; i < numPoints; i++) {
        const theta = (i / numPoints) * Math.PI * 2;

        // Multi-harmonic fluid deformation wave equation:
        // Harmonic 2: Elliptical squash & stretch (Voice pitch envelope)
        const h2 = Math.sin(theta * 2 + time * 1.8) * (5 + energy * 11);
        // Harmonic 3: Fluid trefoil wave (Liquid surface tension)
        const h3 = Math.cos(theta * 3 - time * 2.2) * (4 + energy * 9);
        // Harmonic 4: Gemini 4-Point Celestial Spark Modulation
        const h4 = Math.sin(theta * 4 + time * 1.1) * (6 + energy * 13);
        // Harmonic 5 & 7: High-frequency acoustic ripple (Phonetic texture)
        const h5 = Math.cos(theta * 5 + time * 3.4) * (2 + energy * 5.5);
        const h7 = Math.sin(theta * 7 - time * 4.2) * (1.5 + energy * 3.5);

        const r = baseRadius + h2 + h3 + h4 + h5 + h7;
        const x = cx + Math.cos(theta) * r;
        const y = cy + Math.sin(theta) * r;
        fluidPoints.push({ x, y });
      }

      // Draw smooth closed fluid spline
      ctx.beginPath();
      const firstMidX = (fluidPoints[0].x + fluidPoints[numPoints - 1].x) / 2;
      const firstMidY = (fluidPoints[0].y + fluidPoints[numPoints - 1].y) / 2;
      ctx.moveTo(firstMidX, firstMidY);

      for (let i = 0; i < numPoints; i++) {
        const p0 = fluidPoints[i];
        const p1 = fluidPoints[(i + 1) % numPoints];
        const midX = (p0.x + p1.x) / 2;
        const midY = (p0.y + p1.y) / 2;
        ctx.quadraticCurveTo(p0.x, p0.y, midX, midY);
      }
      ctx.closePath();

      // Fluid Body Gradient
      const gradAngle = time * 0.8;
      const gx1 = cx + Math.cos(gradAngle) * baseRadius;
      const gy1 = cy + Math.sin(gradAngle) * baseRadius;
      const gx2 = cx - Math.cos(gradAngle) * baseRadius;
      const gy2 = cy - Math.sin(gradAngle) * baseRadius;

      const bodyGrad = ctx.createLinearGradient(gx1, gy1, gx2, gy2);
      if (isSpeaking) {
        bodyGrad.addColorStop(0, '#00F0FF'); // Neon Cyan
        bodyGrad.addColorStop(0.3, '#1558C9'); // Electric Cobalt
        bodyGrad.addColorStop(0.65, '#0B1D3D'); // Deep Navy Void
        bodyGrad.addColorStop(0.85, '#2563EB'); // Royal Azure
        bodyGrad.addColorStop(1, '#D4FF24'); // Cyber Lime Crest
      } else if (isListening) {
        bodyGrad.addColorStop(0, '#D4FF24'); // Cyber Lime
        bodyGrad.addColorStop(0.32, '#00F0FF'); // Cyan
        bodyGrad.addColorStop(0.68, '#0B234A'); // Deep Abyss
        bodyGrad.addColorStop(0.9, '#1558C9'); // Cobalt
        bodyGrad.addColorStop(1, '#38BDF8'); // Ice Cyan
      } else {
        bodyGrad.addColorStop(0, '#38BDF8'); // Ice Cyan
        bodyGrad.addColorStop(0.35, '#1558C9'); // Cobalt
        bodyGrad.addColorStop(0.7, '#071224'); // Obsidian Base
        bodyGrad.addColorStop(1, '#1E40AF'); // Royal Blue
      }

      ctx.fillStyle = bodyGrad;
      ctx.fill();

      // Precision chromatic rim stroke
      ctx.strokeStyle = isSpeaking
        ? 'rgba(0, 240, 255, 0.75)'
        : isListening
        ? 'rgba(212, 255, 36, 0.85)'
        : 'rgba(56, 189, 248, 0.55)';
      ctx.lineWidth = 1.5 + energy * 0.8;
      ctx.stroke();

      // ========================================================
      // 5. Internal Liquid Caustics & Optical Refraction Sheen
      // ========================================================
      ctx.save();
      ctx.clip(); // Clip within the fluid body

      // Secondary counter-rotating inner fluid core (Depth caustics)
      ctx.globalCompositeOperation = 'screen';
      const innerRadius = baseRadius * (0.68 + energy * 0.12);
      const innerGrad = ctx.createRadialGradient(
        cx - innerRadius * 0.25,
        cy - innerRadius * 0.28,
        innerRadius * 0.1,
        cx,
        cy,
        innerRadius
      );
      if (isSpeaking) {
        innerGrad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
        innerGrad.addColorStop(0.28, 'rgba(0, 240, 255, 0.85)');
        innerGrad.addColorStop(0.65, 'rgba(21, 88, 201, 0.55)');
        innerGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      } else if (isListening) {
        innerGrad.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
        innerGrad.addColorStop(0.3, 'rgba(212, 255, 36, 0.85)');
        innerGrad.addColorStop(0.7, 'rgba(0, 240, 255, 0.45)');
        innerGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      } else {
        innerGrad.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
        innerGrad.addColorStop(0.35, 'rgba(56, 189, 248, 0.65)');
        innerGrad.addColorStop(0.75, 'rgba(21, 88, 201, 0.35)');
        innerGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      }

      ctx.beginPath();
      ctx.arc(cx - innerRadius * 0.1, cy - innerRadius * 0.1, innerRadius, 0, Math.PI * 2);
      ctx.fillStyle = innerGrad;
      ctx.fill();

      // ========================================================
      // 6. Google Gemini 4-Point Celestial Star Core
      // ========================================================
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(-time * 0.65); // Counter-rotates smoothly

      const starPoints = 4;
      const outerR = baseRadius * (0.55 + energy * 0.28 + Math.sin(time * 3) * 0.05);
      const innerR = outerR * 0.28;

      ctx.beginPath();
      for (let s = 0; s < starPoints * 2; s++) {
        const a = (s / (starPoints * 2)) * Math.PI * 2;
        const rad = s % 2 === 0 ? outerR : innerR;
        const sx = Math.cos(a) * rad;
        const sy = Math.sin(a) * rad;
        if (s === 0) ctx.moveTo(sx, sy);
        else ctx.lineTo(sx, sy);
      }
      ctx.closePath();

      const starGrad = ctx.createRadialGradient(0, 0, 2, 0, 0, outerR);
      starGrad.addColorStop(0, '#FFFFFF');
      starGrad.addColorStop(0.25, isListening ? '#D4FF24' : '#00F0FF');
      starGrad.addColorStop(0.65, isListening ? 'rgba(0, 240, 255, 0.7)' : 'rgba(21, 88, 201, 0.7)');
      starGrad.addColorStop(1, 'rgba(3, 4, 7, 0)');

      ctx.fillStyle = starGrad;
      ctx.shadowColor = isListening ? 'rgba(212, 255, 36, 0.9)' : 'rgba(0, 240, 255, 0.9)';
      ctx.shadowBlur = 16;
      ctx.fill();
      ctx.restore();

      // Specular liquid crest highlight (Top-left glass reflection)
      const specGrad = ctx.createLinearGradient(
        cx - baseRadius * 0.6,
        cy - baseRadius * 0.7,
        cx,
        cy
      );
      specGrad.addColorStop(0, 'rgba(255, 255, 255, 0.75)');
      specGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.15)');
      specGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');

      ctx.beginPath();
      ctx.ellipse(
        cx - baseRadius * 0.25,
        cy - baseRadius * 0.35,
        baseRadius * 0.38,
        baseRadius * 0.18,
        -Math.PI / 4,
        0,
        Math.PI * 2
      );
      ctx.fillStyle = specGrad;
      ctx.fill();

      ctx.restore(); // Restore clip

      // ========================================================
      // 7. Orbital Particles (In Front of Body: sin(angle) >= 0)
      // ========================================================
      particles.forEach((p) => {
        const sinA = Math.sin(p.angle);
        if (sinA >= 0) {
          const cosA = Math.cos(p.angle);
          const orbitR = baseRadius + 18 + p.distOffset;
          const px = cx + cosA * orbitR;
          const py = cy + sinA * (orbitR * p.tilt);
          const alpha = 0.4 + sinA * 0.6;
          ctx.beginPath();
          ctx.arc(px, py, p.size * (1 + energy * 0.3), 0, Math.PI * 2);
          ctx.fillStyle = p.hue === 'cyan'
            ? `rgba(56, 189, 248, ${alpha})`
            : `rgba(212, 255, 36, ${alpha})`;
          ctx.shadowColor = p.hue === 'cyan' ? 'rgba(56, 189, 248, 0.9)' : 'rgba(212, 255, 36, 0.9)';
          ctx.shadowBlur = 8;
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      });

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [isSpeaking, isListening]);

  const handleOrbClick = (e) => {
    shockwavesRef.current.push({
      r: 25,
      alpha: 1.0
    });
    if (onClick) onClick(e);
  };

  return (
    <div className="ai-companion-stage">
      <div
        className="canvas-ai-orb-anchor"
        onClick={handleOrbClick}
        title="Gemini & OpenAI Voice Organism — Click to speak or pause"
      >
        <canvas ref={canvasRef} className="canvas-orb-element" />
      </div>

      <div className="orb-state-chip">
        <span className={`pulsing-dot ${isSpeaking ? 'speaking' : isListening ? 'listening' : ''}`}></span>
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
