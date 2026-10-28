import React, { useEffect, useRef } from 'react';

/**
 * FluidWaveformVisualizer
 * Gemini & OpenAI-Grade 60fps Living Harmonic Audio Ribbon.
 * Features 4 interlaced fluid waves with dynamic Gaussian envelope tapering,
 * chromatic glow dispersion, and energy-responsive phonetic modulation.
 */
export default function FluidWaveformVisualizer({ isSpeaking, isListening }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;
    let phase = 0;

    const dpr = window.devicePixelRatio || 1;
    const width = 420;
    const height = 54;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const render = () => {
      // Dynamic phase speed based on conversational energy
      const speed = isSpeaking ? 0.058 : isListening ? 0.072 : 0.022;
      phase += speed;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.scale(dpr, dpr);

      const cy = height / 2;
      const targetAmp = isSpeaking ? 18 : isListening ? 15 : 4.5;

      // 4 Interwoven Chromatic Ribbon Layers (Gemini/OpenAI aesthetic)
      const waves = [
        // 1. Deep Cobalt Azure Harmonic Foundation
        {
          color: 'rgba(21, 88, 201, 0.55)',
          glow: 'rgba(21, 88, 201, 0.75)',
          lineWidth: 2.2,
          freq: 0.022,
          phaseOffset: phase * 0.85,
          ampMult: 0.82
        },
        // 2. Neon Cyan Vocal Resonator
        {
          color: 'rgba(0, 240, 255, 0.75)',
          glow: 'rgba(0, 240, 255, 0.85)',
          lineWidth: 1.8,
          freq: 0.034,
          phaseOffset: phase * 1.25 + Math.PI / 3.5,
          ampMult: 0.76
        },
        // 3. Cyber Lime Harmonic Crest
        {
          color: isListening ? '#D4FF24' : 'rgba(121, 176, 255, 0.9)',
          glow: isListening ? 'rgba(212, 255, 36, 0.95)' : 'rgba(121, 176, 255, 0.9)',
          lineWidth: 2.4,
          freq: 0.042,
          phaseOffset: phase * 1.6 + Math.PI / 1.6,
          ampMult: 1.0
        },
        // 4. White-Hot Incandescent Core Filament
        {
          color: 'rgba(255, 255, 255, 0.85)',
          glow: 'rgba(255, 255, 255, 0.9)',
          lineWidth: 1.2,
          freq: 0.05,
          phaseOffset: phase * 1.9 + Math.PI,
          ampMult: 0.65
        }
      ];

      waves.forEach((w) => {
        ctx.beginPath();
        ctx.strokeStyle = w.color;
        ctx.lineWidth = w.lineWidth;
        ctx.shadowColor = w.glow;
        ctx.shadowBlur = isSpeaking || isListening ? 14 : 6;

        for (let x = 0; x <= width; x += 3) {
          // Smooth Gaussian envelope: smoothly pins wave amplitude to 0 at edges
          const norm = (x - width / 2) / (width * 0.44);
          const envelope = Math.exp(-norm * norm);

          // Multi-harmonic equation with overtone harmonics
          const y =
            cy +
            Math.sin(x * w.freq + w.phaseOffset) * targetAmp * w.ampMult * envelope +
            Math.sin(x * w.freq * 2.2 + w.phaseOffset * 1.4) * (targetAmp * 0.38) * envelope +
            Math.cos(x * w.freq * 3.1 - w.phaseOffset * 0.8) * (targetAmp * 0.18) * envelope;

          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      });

      // Subtle traveling photon sparkles on speech crests
      if (isSpeaking || isListening) {
        const sparkleCount = 5;
        for (let s = 0; s < sparkleCount; s++) {
          const sx = ((phase * 45 + s * (width / sparkleCount)) % width);
          const norm = (sx - width / 2) / (width * 0.44);
          const env = Math.exp(-norm * norm);
          const sy = cy + Math.sin(sx * 0.04 + phase * 1.6) * targetAmp * env;

          ctx.beginPath();
          ctx.arc(sx, sy, 1.8, 0, Math.PI * 2);
          ctx.fillStyle = isListening ? '#D4FF24' : '#00F0FF';
          ctx.shadowColor = '#FFFFFF';
          ctx.shadowBlur = 8;
          ctx.fill();
        }
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [isSpeaking, isListening]);

  return (
    <div className="fluid-waveform-wrapper">
      <canvas ref={canvasRef} className="fluid-waveform-canvas" />
    </div>
  );
}
