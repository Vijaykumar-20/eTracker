import React, { useEffect, useState } from 'react';
import './ParticleText.css';

export default function ParticleText({ text }) {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    // Generate initial dynamic particles around the text
    const numParticles = 20;
    const newParticles = Array.from({ length: numParticles }).map((_, i) => ({
      id: i,
      x: Math.random() * 100, // percentage string
      y: Math.random() * 100, // percentage string
      size: Math.random() * 3 + 1, // 1px to 4px
      duration: Math.random() * 2 + 1, // 1s to 3s
      delay: Math.random() * 2, // 0s to 2s
      color: ['#06b6d4', '#a855f7', '#10b981', '#fde047'][Math.floor(Math.random() * 4)]
    }));
    setParticles(newParticles);
  }, [text]);

  return (
    <span className="particle-text-wrapper">
      <span className="particle-text-core">{text}</span>
      {particles.map(p => (
        <span
          key={p.id}
          className="particle"
          style={{
            '--x': `${p.x}%`,
            '--y': `${p.y}%`,
            '--size': `${p.size}px`,
            '--duration': `${p.duration}s`,
            '--delay': `${p.delay}s`,
            '--color': p.color
          }}
        />
      ))}
    </span>
  );
}
