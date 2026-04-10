import React from 'react';
import './BackgroundSVG.css';

export default function BackgroundSVG() {
  return (
    <div className="background-svg-wrapper">
      <svg width="100%" height="100%" viewBox="0 0 1000 800" preserveAspectRatio="xMidYMax meet" xmlns="http://www.w3.org/2000/svg">
        
        <defs>
          <linearGradient id="jarEdge" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#a855f7" stopOpacity="0.8" />
          </linearGradient>
          
          <linearGradient id="noteGreen" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>
          
          <linearGradient id="notePurple" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#7e22ce" />
          </linearGradient>

          <linearGradient id="noteCyan" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#0284c7" />
          </linearGradient>

          <radialGradient id="glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(168, 85, 247, 0.2)" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>

          {/* New Coin Gradients */}
          <radialGradient id="coinGold" cx="30%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#fde047" />
            <stop offset="100%" stopColor="#ca8a04" />
          </radialGradient>
          <radialGradient id="coinSilver" cx="30%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#f1f5f9" />
            <stop offset="100%" stopColor="#94a3b8" />
          </radialGradient>
        </defs>

        {/* Outer ambient glow */}
        <circle cx="500" cy="550" r="350" fill="url(#glow)" />

        {/* Falling Currency - Rupee Note & Coins */}
        <g className="falling-notes">
          {/* Rupee Note */}
          <g className="note anim-item-1">
            <rect x="-40" y="-20" width="80" height="40" rx="4" fill="url(#noteGreen)" opacity="0.9" />
            <circle cx="0" cy="0" r="12" fill="rgba(255,255,255,0.2)" />
            <text x="0" y="5" fill="white" fontSize="16" fontWeight="bold" textAnchor="middle">₹</text>
          </g>

          {/* ₹1 Coin */}
          <g className="note anim-item-2">
            <circle cx="0" cy="0" r="20" fill="url(#coinSilver)" />
            <circle cx="0" cy="0" r="16" fill="none" stroke="rgba(0,0,0,0.1)" strokeWidth="1" />
            <text x="0" y="5" fill="#1e293b" fontSize="14" fontWeight="bold" textAnchor="middle">₹1</text>
          </g>

          {/* ₹2 Coin */}
          <g className="note anim-item-3">
            <circle cx="0" cy="0" r="22" fill="url(#coinSilver)" />
            <circle cx="0" cy="0" r="18" fill="none" stroke="rgba(0,0,0,0.1)" strokeWidth="1" />
            <text x="0" y="5" fill="#1e293b" fontSize="14" fontWeight="bold" textAnchor="middle">₹2</text>
          </g>

          {/* ₹5 Coin */}
          <g className="note anim-item-4">
            <circle cx="0" cy="0" r="24" fill="url(#coinGold)" />
            <circle cx="0" cy="0" r="20" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
            <text x="0" y="5" fill="#422006" fontSize="14" fontWeight="bold" textAnchor="middle">₹5</text>
          </g>

          {/* ₹10 Coin (Bi-metallic) */}
          <g className="note anim-item-5">
            <circle cx="0" cy="0" r="26" fill="url(#coinGold)" />
            <circle cx="0" cy="0" r="18" fill="url(#coinSilver)" />
            <text x="0" y="5" fill="#1e293b" fontSize="14" fontWeight="bold" textAnchor="middle">₹10</text>
          </g>
        </g>

        {/* The Jar - Rendered ON TOP of the falling notes to complete the illusion */}
        <g transform="translate(350, 450)">
          {/* Jar Body Back (dark inner side) */}
          <path d="M 300 30 C 300 60 0 60 0 30 L 20 250 C 30 290 270 290 280 250 Z" fill="rgba(15, 23, 42, 0.6)" stroke="none" />
          
          {/* Jar Rim Back (Inner lip) */}
          <ellipse cx="150" cy="30" rx="150" ry="40" fill="rgba(6, 182, 212, 0.05)" stroke="rgba(255,255,255,0.1)" strokeWidth="2" />
        </g>

        {/* Jar Front details (Glass overlay) */}
        <g transform="translate(350, 450)" className="jar-front">
           <path d="M 0 30 C 0 80 300 80 300 30 L 280 250 C 270 290 30 290 20 250 Z" 
                 fill="rgba(30, 41, 59, 0.4)" 
                 stroke="url(#jarEdge)" 
                 strokeWidth="4" />
           
           {/* Specular reflections on glass */}
           <path d="M 40 80 Q 35 150 50 240" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="8" strokeLinecap="round" />
           <path d="M 260 80 Q 265 150 250 240" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="4" strokeLinecap="round" />

           {/* Jar Rim Front (Outer lip) */}
           <path d="M 0 30 C 0 80 300 80 300 30" fill="none" stroke="url(#jarEdge)" strokeWidth="6" />
           <path d="M 0 30 C 0 -20 300 -20 300 30" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}
