import React from 'react';
import bikeImg from '../../dist/assets/bike-removebg-preview.png';

const SportsBikeMarker = ({ bearing = 0, speed = 0, isMoving = false }) => {
  const isHeadingLeft = bearing > 180;

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
