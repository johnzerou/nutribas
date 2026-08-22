import React from 'react';
import { Link } from 'react-router-dom';

export function CitrusEmblem({ size = 36, className = '' }) {
  return (
    <svg 
      className={`citrus-emblem ${className}`} 
      width={size} 
      height={size} 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      style={{ minWidth: size, minHeight: size }}
    >
      <defs>
        <linearGradient id="nutribasGrad" x1="85%" y1="15%" x2="15%" y2="85%">
          <stop offset="0%" stopColor="#f59e0b" />
          <stop offset="45%" stopColor="#ea580c" />
          <stop offset="100%" stopColor="#dc2626" />
        </linearGradient>
        <linearGradient id="nutribasGradRing" x1="90%" y1="10%" x2="10%" y2="90%">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="50%" stopColor="#ea580c" />
          <stop offset="100%" stopColor="#b91c1c" />
        </linearGradient>
      </defs>
      
      {/* Outer Ring */}
      <circle cx="50" cy="50" r="45" fill="url(#nutribasGradRing)" />
      <circle cx="50" cy="50" r="40" fill="var(--surface-color, #ffffff)" />
      
      {/* Inner Orange Gradient Circle */}
      <circle cx="50" cy="50" r="37" fill="url(#nutribasGrad)" />
      
      {/* Citrus Slice Divider Lines */}
      <line x1="50" y1="13" x2="50" y2="87" stroke="var(--surface-color, #ffffff)" strokeWidth="3" strokeLinecap="round" />
      <line x1="18" y1="31.5" x2="82" y2="68.5" stroke="var(--surface-color, #ffffff)" strokeWidth="3" strokeLinecap="round" />
      <line x1="18" y1="68.5" x2="82" y2="31.5" stroke="var(--surface-color, #ffffff)" strokeWidth="3" strokeLinecap="round" />
      
      {/* Center Seed/Dot */}
      <circle cx="50" cy="50" r="3.8" fill="var(--surface-color, #ffffff)" />
    </svg>
  );
}

export default function Logo({ 
  size = 'medium', 
  showSubtitle = false, 
  subtitleText = 'Gestão Nutricional',
  to = null,
  className = '',
  iconOnly = false
}) {
  const iconSizes = {
    small: 28,
    medium: 36,
    large: 46,
    xlarge: 56
  };

  const currentIconSize = typeof size === 'number' ? size : (iconSizes[size] || 36);

  const content = (
    <div className={`brand-logo-container ${size} ${className}`}>
      <CitrusEmblem size={currentIconSize} />
      {!iconOnly && (
        <div className="brand-logo-text-group">
          <span className="brand-logo-name">Nutribas</span>
          {showSubtitle && <span className="brand-badge">{subtitleText}</span>}
        </div>
      )}
    </div>
  );

  if (to) {
    return (
      <Link to={to} className="brand-logo-link" style={{ textDecoration: 'none' }}>
        {content}
      </Link>
    );
  }

  return content;
}
