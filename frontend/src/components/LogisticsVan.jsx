import React from 'react';

export default function LogisticsVan({ className = "w-16 h-10" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M1 14H3V18H18V14H21L23 11V6H18V11H3L1 14Z" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
      <circle cx="6" cy="18" r="2.5" stroke="currentColor" strokeWidth="2"/>
      <circle cx="15" cy="18" r="2.5" stroke="currentColor" strokeWidth="2"/>
      <path d="M18 6V11" stroke="currentColor" strokeWidth="2"/>
      <rect x="4" y="8" width="10" height="3" rx="0.5" stroke="currentColor" strokeWidth="1"/>
    </svg>
  );
}
