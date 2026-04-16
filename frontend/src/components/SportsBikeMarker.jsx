import React from 'react';

const SportsBikeMarker = ({ bearing = 0, speed = 0, isMoving = false }) => {
  const isHeadingLeft = bearing > 180;
  // wheel rotation speed based on travel speed
  const wheelRotationDuration = isMoving ? Math.max(0.1, 0.5 - (speed / 100)) : 0;
  const showSpeedLines = isMoving && speed > 20;
  const speedLineOpacity = Math.min(1, speed / 80);

  return (
    <div style={{
      width: '100px',
      height: '60px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      transform: `rotate(${bearing}deg) ${isHeadingLeft ? 'scaleY(-1)' : 'scaleY(1)'}`,
      transition: 'transform 0.3s ease-out'
    }}>
      <style>{`
        @keyframes bike-wheel-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes bike-speed-line {
          0% { transform: translateX(0); opacity: 0; }
          50% { opacity: ${speedLineOpacity}; }
          100% { transform: translateX(-30px); opacity: 0; }
        }
        @keyframes bike-vibration {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-1px); }
        }
        .bike-wheel { 
          animation: ${isMoving ? `bike-wheel-spin ${wheelRotationDuration}s linear infinite` : 'none'}; 
          transform-origin: center; 
        }
        .bike-speed-line { 
          animation: ${showSpeedLines ? 'bike-speed-line 0.4s ease-out infinite' : 'none'}; 
          opacity: 0; 
        }
        .bike-body { 
          animation: ${isMoving ? 'bike-vibration 0.1s ease-in-out infinite' : 'none'}; 
        }
      `}</style>

      <svg width="90" height="50" viewBox="0 0 90 50" fill="none" xmlns="http://www.w3.org/2000/svg" className="bike-body">
        {/* Shadow */}
        <ellipse cx="45" cy="46" rx="35" ry="4" fill="rgba(0,0,0,0.15)" />

        {/* Speed Lines */}
        {showSpeedLines && (
          <g className="bike-speed-line">
            <line x1="10" y1="15" x2="-10" y2="15" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" />
            <line x1="5" y1="25" x2="-15" y2="25" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" />
            <line x1="12" y1="35" x2="-8" y2="35" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" />
          </g>
        )}

        {/* Bike Frame */}
        <path d="M25 38L35 20H60L75 38" stroke="#1e1b4b" strokeWidth="4" strokeLinecap="round" />
        <path d="M35 20L40 10H55L60 20" fill="#4338ca" />
        <path d="M40 10L35 8H30" stroke="#1e1b4b" strokeWidth="2" strokeLinecap="round" /> {/* Handlebars */}
        
        {/* Seat */}
        <path d="M45 20C45 18 55 18 55 20H45Z" fill="#111827" />

        {/* Engine Area */}
        <rect x="40" y="22" width="18" height="12" rx="2" fill="#374151" />
        <circle cx="45" cy="30" r="3" fill="#4b5563" />
        <circle cx="53" cy="30" r="3" fill="#4b5563" />

        {/* Exhaust */}
        <path d="M35 38L20 40" stroke="#9ca3af" strokeWidth="3" strokeLinecap="round" />

        {/* Rear Wheel */}
        <g className="bike-wheel">
          <circle cx="22" cy="38" r="10" stroke="#0f172a" strokeWidth="4" fill="#1f2937" />
          <circle cx="22" cy="38" r="4" fill="#94a3b8" />
          <line x1="22" y1="28" x2="22" y2="48" stroke="#94a3b8" strokeWidth="1" />
          <line x1="12" y1="38" x2="32" y2="38" stroke="#94a3b8" strokeWidth="1" />
        </g>

        {/* Front Wheel */}
        <g className="bike-wheel">
          <circle cx="72" cy="38" r="10" stroke="#0f172a" strokeWidth="4" fill="#1f2937" />
          <circle cx="72" cy="38" r="4" fill="#94a3b8" />
          <line x1="72" y1="28" x2="72" y2="48" stroke="#94a3b8" strokeWidth="1" />
          <line x1="62" y1="38" x2="82" y2="38" stroke="#94a3b8" strokeWidth="1" />
        </g>

        {/* Lights */}
        <circle cx="78" cy="18" r="3" fill="#fbbf24" opacity="0.8" /> {/* Headlight */}
        <rect x="15" y="28" width="2" height="6" fill="#ef4444" /> {/* Taillight */}
      </svg>
    </div>
  );
};

export default SportsBikeMarker;
