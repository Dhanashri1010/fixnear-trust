import React, { useState } from 'react';

export default function InitialsAvatar({ name = 'FixNear User', avatarUrl = '', size = 40, style = {} }) {
  const [imgError, setImgError] = useState(false);

  const getInitials = (str) => {
    if (!str) return 'FN';
    const parts = str.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const isStockOrUnsplash = (url) => {
    return !url || url.includes('unsplash.com') || url.includes('via.placeholder.com');
  };

  if (avatarUrl && !imgError && !isStockOrUnsplash(avatarUrl)) {
    return (
      <img
        src={avatarUrl}
        alt={name}
        onError={() => setImgError(true)}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          borderRadius: '50%',
          objectFit: 'cover',
          ...style,
        }}
      />
    );
  }

  const initials = getInitials(name);
  const fontSize = Math.max(11, Math.round(size * 0.4));

  return (
    <div
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '50%',
        backgroundColor: 'var(--forest-100)',
        color: 'var(--forest-800)',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 700,
        fontSize: `${fontSize}px`,
        letterSpacing: '0.04em',
        border: '1px solid var(--forest-200)',
        userSelect: 'none',
        flexShrink: 0,
        ...style,
      }}
      title={name}
    >
      {initials}
    </div>
  );
}

