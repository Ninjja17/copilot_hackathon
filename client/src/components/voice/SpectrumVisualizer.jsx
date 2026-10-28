import React from 'react';

export default function SpectrumVisualizer({ isSpeaking, isListening }) {
  const bars = [18, 42, 70, 95, 60, 85, 45, 90, 75, 50, 30, 65, 80, 40, 20];

  return (
    <div className={`spectrum-bar-cluster ${isSpeaking ? 'active-speaking' : isListening ? 'active-listening' : ''}`}>
      {bars.map((height, i) => (
        <span
          key={i}
          className="spectrum-bar"
          style={{
            height: isSpeaking || isListening ? `${height}%` : '8%',
            animationDelay: `${(i * 0.07).toFixed(2)}s`
          }}
        />
      ))}
    </div>
  );
}
