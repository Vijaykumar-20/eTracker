import React, { useEffect, useState } from 'react';
import './PostboxAnimation.css';

export default function PostboxAnimation({ onComplete }) {
  const [doorOpen, setDoorOpen] = useState(false);

  useEffect(() => {
    // Open door after envelope flies in
    const doorTimer = setTimeout(() => {
      setDoorOpen(true);
    }, 1200);

    const finishTimer = setTimeout(() => {
      onComplete();
    }, 3000);

    return () => {
      clearTimeout(doorTimer);
      clearTimeout(finishTimer);
    };
  }, [onComplete]);

  return (
    <div className="postbox-overlay">
      <div className="postbox-scene">
        <svg width="200" height="300" viewBox="0 0 200 300" style={{ overflow: 'visible' }}>
          
          <defs>
            <linearGradient id="boxGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#a855f7" />
            </linearGradient>
          </defs>

          {/* Postbox Back/Inside */}
          <rect x="50" y="100" width="100" height="180" fill="#0f172a" rx="10" />

          {/* Postbox Top Dome */}
          <path d="M 50 100 C 50 20 150 20 150 100 Z" fill="url(#boxGrad)" />
          
          {/* Postbox details */}
          <path d="M 60 90 Q 100 60 140 90" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="4" strokeLinecap="round" />

          {/* Envelope (Data) */}
          <g className="envelope-anim">
            <rect x="70" y="-50" width="60" height="40" fill="#f8fafc" rx="4" />
            <path d="M 70 -50 L 100 -25 L 130 -50" fill="none" stroke="#cbd5e1" strokeWidth="2" />
            <text x="100" y="-20" fill="#0f172a" fontSize="12" fontWeight="bold" textAnchor="middle">DATA</text>
          </g>

          {/* Postbox Front Body (Below the Dome) */}
          <rect x="50" y="100" width="100" height="180" fill="url(#boxGrad)" />
          
          {/* The Slot Cutout */}
          <rect x="65" y="125" width="70" height="10" fill="#0b0f19" rx="5" />
          <rect x="65" y="125" width="70" height="3" fill="rgba(255,255,255,0.1)" rx="1" />

          {/* Inner Door Area (Revealed when door opens) */}
          <rect x="60" y="160" width="80" height="100" fill="#0b0f19" rx="4" />
          {doorOpen && (
             <g className="success-icon" style={{ transformOrigin: '100px 210px' }}>
               <circle cx="100" cy="210" r="25" fill="rgba(16, 185, 129, 0.2)" />
               <circle cx="100" cy="210" r="15" fill="#10b981" />
               <path d="M 93 210 L 98 215 L 108 205" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" />
               <text x="100" y="250" fill="#10b981" fontSize="12" fontWeight="bold" textAnchor="middle">SAVED</text>
             </g>
          )}

          {/* The Door */}
          <g className={`postbox-door ${doorOpen ? 'open' : ''}`} style={{ transformOrigin: '60px 160px' }}>
             <rect x="60" y="160" width="80" height="100" fill="#1e293b" rx="4" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
             <circle cx="125" cy="210" r="4" fill="#cbd5e1" />
             {/* Small vent details on door */}
             <rect x="70" y="170" width="30" height="4" fill="rgba(255,255,255,0.1)" rx="2" />
             <rect x="70" y="180" width="40" height="4" fill="rgba(255,255,255,0.1)" rx="2" />
          </g>

        </svg>

        <div className="status-text">{doorOpen ? 'Redirecting...' : 'Transferring Data...'}</div>
      </div>
    </div>
  );
}
