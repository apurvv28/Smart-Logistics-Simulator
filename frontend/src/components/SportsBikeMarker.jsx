import React from 'react';
import bikeImg from '../assets/bike-removebg-preview.png';

const SportsBikeMarker = ({ bearing = 0, speed = 0, isMoving = false }) => {
  // Keep orientation mostly intact and only flip on clear reverse direction.
  const isHeadingLeft = bearing > 135 && bearing < 225;

  return (
    <div style={{
      width: '80px',
      height: '50px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      // NO rotation — just horizontal flip for direction
      transform: isHeadingLeft ? 'scaleX(-1)' : 'scaleX(1)',
      transition: 'transform 1.2s ease-out',
    }}>
      <img 
        src={bikeImg} 
        alt="Bike" 
        style={{ 
          width: '100%', 
          height: '100%', 
          objectFit: 'contain' 
        }} 
      />
    </div>
  );
};

export default SportsBikeMarker;
