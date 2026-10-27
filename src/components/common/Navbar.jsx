// ===================================================================
// FixNear Trust - Universal Navigation Bar
// React Router + Firebase Auth aware + Dynamic portal indicators
// ===================================================================

import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  ShieldCheck, 
  MapPin, 
  Search, 
  ChevronDown, 
  Wrench, 
  Sparkles,
  Navigation,
  User,
  LogIn,
  Globe
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { useAuth } from '../../context/AuthContext';
import { setLanguage, getLanguage, t } from '../../i18n/translations';
import AvatarDropdown from './AvatarDropdown';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setActiveUserAction, activeBookingId } = useStore();
  const { currentUser, userProfile, role } = useAuth();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState("Bandra West, Mumbai (400050)");
  const [navSearch, setNavSearch] = useState('');
  const [currentLang, setCurrentLang] = useState(getLanguage());

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    setCurrentLang(lang);
  };

  const isDemo = import.meta.env.VITE_DEMO_MODE === 'true' || import.meta.env.VITE_ENABLE_DEV_DEMO_SWITCHER === 'true';

  const handleNavSearch = (e) => {
    if (e.key === 'Enter' && navSearch.trim()) {
      navigate(`/search?q=${encodeURIComponent(navSearch.trim())}`);
    }
  };

  const displayName = userProfile?.name || currentUser?.displayName || "FixNear User";
  const displayAvatar = userProfile?.avatar || currentUser?.photoURL || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80";

  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 900 }} className="glass-nav">
      {/* Top Demo Notification Ribbon (Gated for Evaluator / Demo Mode) */}
      {isDemo && (
        <div style={{
          backgroundColor: 'var(--yellow-100)',
          borderBottom: '1px solid var(--yellow-200)',
          padding: '5px 16px',
          fontSize: '12px',
          color: 'var(--yellow-800)',
          textAlign: 'center',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px'
        }}>
          <Sparkles size={14} color="var(--yellow-800)" />
          <span>
            <strong>FixNear Trust:</strong> Verified Multi-Portal Home Services Platform (Customer • Technician • Admin)
          </span>
        </div>
      )}

      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '72px', gap: '16px' }}>
        
        {/* Brand Logo */}
        <Link 
          to="/"
          style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}
          title="Return to Home"
        >
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            backgroundColor: 'var(--forest-700)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <ShieldCheck size={24} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '20px', fontWeight: 800, color: 'var(--forest-900)', letterSpacing: '-0.03em' }}>
                FixNear
              </span>
              <span style={{
                fontSize: '10px',
                fontWeight: 800,
                letterSpacing: '0.08em',
                backgroundColor: 'var(--forest-100)',
                color: 'var(--forest-700)',
                padding: '2px 6px',
                borderRadius: '4px',
                textTransform: 'uppercase'
              }}>
                Trust
              </span>
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500 }}>
              Verified Home Services
            </div>
          </div>
        </Link>

        {/* Location Selector (Interactive Pill) */}
        <div 
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '7px 12px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-light)',
            fontSize: '13px',
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'border-color 150ms ease'
          }}
          title="Click to toggle location"
          className="nav-desktop-links"
          onClick={() => {
            setSelectedLocation(prev => 
              prev.includes("Bandra") 
                ? "Indiranagar, Bengaluru (560038)" 
                : "Bandra West, Mumbai (400050)"
            );
          }}
        >
          <MapPin size={16} color="var(--forest-700)" />
          <span style={{ color: 'var(--text-primary)', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {selectedLocation}
          </span>
          <ChevronDown size={14} color="var(--text-muted)" />
        </div>

        {/* Search Bar in Navbar */}
        <div 
          className="nav-desktop-links"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#FFFFFF',
            border: '1px solid var(--border-light)',
            borderRadius: 'var(--radius-sm)',
            padding: '6px 12px',
            width: '240px'
          }}
        >
          <Search size={15} color="var(--forest-700)" />
          <input 
            type="text"
            placeholder="Search catalog & pros..."
            value={navSearch}
            onChange={(e) => setNavSearch(e.target.value)}
            onKeyDown={handleNavSearch}
            style={{
              border: 'none',
              background: 'none',
              outline: 'none',
              fontSize: '13px',
              width: '100%',
              color: 'var(--text-primary)'
            }}
          />
        </div>

        {/* Navigation Links */}
        <nav className="nav-desktop-links" style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
          <Link 
            to="/services"
            style={{
              fontSize: '13.5px',
              fontWeight: location.pathname.startsWith('/services') ? 700 : 600,
              color: location.pathname.startsWith('/services') ? 'var(--forest-800)' : 'var(--text-secondary)',
              textDecoration: 'none'
            }}
          >
            Catalog
          </Link>

          <Link 
            to={`/track/${activeBookingId || 'FX-98214'}`}
            style={{
              fontSize: '13.5px',
              fontWeight: location.pathname.startsWith('/track') ? 700 : 600,
              color: location.pathname.startsWith('/track') ? 'var(--forest-800)' : 'var(--text-secondary)',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <Navigation size={13} color="var(--forest-700)" />
            <span>Track Job</span>
          </Link>

          <Link 
            to="/technician/tech-1"
            style={{
              fontSize: '13.5px',
              fontWeight: location.pathname.startsWith('/technician') ? 700 : 600,
              color: location.pathname.startsWith('/technician') ? 'var(--forest-800)' : 'var(--text-secondary)',
              textDecoration: 'none'
            }}
          >
            Experts
          </Link>

          <Link 
            to="/bookings"
            style={{
              fontSize: '13.5px',
              fontWeight: location.pathname === '/bookings' ? 700 : 600,
              color: location.pathname === '/bookings' ? 'var(--forest-800)' : 'var(--text-secondary)',
              textDecoration: 'none'
            }}
          >
            My Bookings
          </Link>

          <Link 
            to="/support"
            style={{
              fontSize: '13.5px',
              fontWeight: location.pathname === '/support' ? 700 : 600,
              color: location.pathname === '/support' ? 'var(--forest-800)' : 'var(--text-secondary)',
              textDecoration: 'none'
            }}
          >
            Help
          </Link>
        </nav>

        {/* Actions & Avatar / Login Trigger */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          
          {/* Language Selector Dropdown */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            backgroundColor: '#FFFFFF',
            border: '1px solid var(--border-light)',
            borderRadius: 'var(--radius-sm)',
            padding: '4px 8px'
          }}>
            <Globe size={14} color="var(--forest-700)" />
            <select
              value={currentLang}
              onChange={(e) => handleLanguageChange(e.target.value)}
              aria-label="Select Interface Language"
              style={{
                border: 'none',
                background: 'none',
                fontSize: '12px',
                fontWeight: 700,
                color: 'var(--forest-800)',
                cursor: 'pointer',
                outline: 'none'
              }}
            >
              <option value="en">EN</option>
              <option value="hi">हिंदी</option>
              <option value="mr">मराठी</option>
            </select>
          </div>

          <Link 
            to="/book"
            className="btn btn-primary btn-sm"
            style={{ textDecoration: 'none' }}
          >
            <Wrench size={14} />
            <span>Book</span>
          </Link>

          {/* User Account Avatar or Log In Button */}
          {currentUser ? (
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '4px',
                  borderRadius: 'var(--radius-full)',
                  border: '2px solid transparent',
                  borderColor: isDropdownOpen ? 'var(--forest-700)' : 'transparent',
                  transition: 'border-color 150ms ease',
                  background: 'transparent',
                  cursor: 'pointer'
                }}
                title="Open Account Menu"
                aria-label="Account Menu"
              >
                <div style={{ position: 'relative' }}>
                  <img 
                    src={displayAvatar} 
                    alt={displayName}
                    style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }} 
                  />
                  <span style={{
                    position: 'absolute',
                    bottom: '0',
                    right: '0',
                    width: '10px',
                    height: '10px',
                    backgroundColor: '#10B981',
                    borderRadius: '50%',
                    border: '2px solid #FFFFFF'
                  }} />
                </div>
                <ChevronDown size={14} color="var(--text-muted)" />
              </button>

              <AvatarDropdown 
                isOpen={isDropdownOpen}
                onClose={() => setIsDropdownOpen(false)}
                onSelectOption={(action) => setActiveUserAction(action)}
              />
            </div>
          ) : (
            <Link
              to="/login"
              className="btn btn-secondary btn-sm"
              style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <LogIn size={14} />
              <span>Log In</span>
            </Link>
          )}

        </div>

      </div>

      {/* Mobile Scrollable Quick Navigation (<= 768px) */}
      <div className="nav-mobile-scroll" style={{ display: 'none' }}>
        <Link to="/services" style={{ padding: '6px 14px', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--forest-100)', color: 'var(--forest-900)', fontSize: '13px', fontWeight: 700, whiteSpace: 'nowrap' }}>
          Catalog
        </Link>
        <Link to={`/track/${activeBookingId || 'FX-98214'}`} style={{ padding: '6px 14px', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--forest-100)', color: 'var(--forest-900)', fontSize: '13px', fontWeight: 700, whiteSpace: 'nowrap' }}>
          Track Job
        </Link>
        <Link to="/technician/tech-1" style={{ padding: '6px 14px', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--forest-100)', color: 'var(--forest-900)', fontSize: '13px', fontWeight: 700, whiteSpace: 'nowrap' }}>
          Experts
        </Link>
        <Link to="/bookings" style={{ padding: '6px 14px', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--forest-100)', color: 'var(--forest-900)', fontSize: '13px', fontWeight: 700, whiteSpace: 'nowrap' }}>
          My Bookings
        </Link>
        <Link to="/support" style={{ padding: '6px 14px', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--forest-100)', color: 'var(--forest-900)', fontSize: '13px', fontWeight: 700, whiteSpace: 'nowrap' }}>
          Help
        </Link>
      </div>
    </header>
  );
}
