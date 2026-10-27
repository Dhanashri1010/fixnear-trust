import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div style={{
      minHeight: '70vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 16px',
      textAlign: 'center'
    }}>
      <div style={{
        maxWidth: '480px',
        backgroundColor: '#FFFFFF',
        borderRadius: 'var(--radius-xl)',
        padding: '48px 32px',
        boxShadow: 'var(--shadow-md)',
        border: '1px solid var(--border-light)'
      }}>
        <div style={{
          fontSize: '64px',
          fontWeight: 900,
          color: 'var(--forest-700)',
          lineHeight: 1,
          marginBottom: '12px'
        }}>
          404
        </div>
        <h1 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '8px', color: 'var(--forest-900)' }}>
          Page Not Found
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '15px', marginBottom: '28px', lineHeight: 1.5 }}>
          The page you are looking for does not exist or has been moved.
        </p>
        <Link to="/" className="btn btn-primary" style={{ display: 'inline-flex', width: '100%', justifyContent: 'center' }}>
          <Home size={16} />
          <span>Return to Homepage</span>
        </Link>
      </div>
    </div>
  );
}
