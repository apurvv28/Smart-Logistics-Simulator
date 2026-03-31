import React from 'react';

export default function DeliveryVan({ className = "w-12 h-8" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M1 14H3V17H13V14H21L23 10V4H13V10H3L1 14Z" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
      <circle cx="6" cy="18" r="2" stroke="currentColor" strokeWidth="2"/>
      <circle cx="18" cy="18" r="2" stroke="currentColor" strokeWidth="2"/>
      <path d="M13 4V10" stroke="currentColor" strokeWidth="2"/>
      <rect x="15" y="6" width="4" height="2" rx="0.5" fill="currentColor"/>
    </svg>
  );
}
