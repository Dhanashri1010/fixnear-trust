// ===================================================================
// FixNear Trust - Universal Navigation Bar
// React Router + AuthContext aware + Real-time location selector
// ===================================================================

import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  ShieldCheck,
  MapPin,
  Search,
  ChevronDown,
  Wrench,
  Navigation,
  LogIn,
  Globe,
  Check
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import AvatarDropdown from './AvatarDropdown';
import InitialsAvatar from './InitialsAvatar';

const MAJOR_CITIES = [
  'Mumbai',
  'Bengaluru',
  'Delhi NCR',
  'Pune',
  'Hyderabad',
  'Kolkata',
  'Chennai',
];

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, userProfile, role, selectedCity, setSelectedCity } = useAuth();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);
  const [customCityInput, setCustomCityInput] = useState('');
  const [navSearch, setNavSearch] = useState('');
  const { lang: currentLang, changeLanguage, t } = useLanguage();

  const cityDropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (cityDropdownRef.current && !cityDropdownRef.current.contains(e.target)) {
        setIsCityDropdownOpen(false);
      }
    };
    if (isCityDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isCityDropdownOpen]);

  const handleLanguageChange = (lang) => {
    changeLanguage(lang);
  };

  const handleNavSearch = (e) => {
    if (e.key === 'Enter' && navSearch.trim()) {
      navigate(`/search?q=${encodeURIComponent(navSearch.trim())}`);
    }
  };

  const handleSelectCity = (city) => {
    setSelectedCity(city);
    setIsCityDropdownOpen(false);
  };

  const handleCustomCitySubmit = (e) => {
    e.preventDefault();
    if (customCityInput.trim()) {
      setSelectedCity(customCityInput.trim());
      setCustomCityInput('');
      setIsCityDropdownOpen(false);
    }
  };

  const displayName = userProfile?.name || currentUser?.name || 'Customer';

  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 900 }} className="glass-nav">
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

        {/* Real Dynamic Location Selector Pill */}
        <div style={{ position: 'relative' }} ref={cityDropdownRef}>
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
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'border-color 150ms ease'
            }}
            title="Click to select city"
            className="nav-desktop-links"
            onClick={() => setIsCityDropdownOpen(!isCityDropdownOpen)}
          >
            <MapPin size={16} color="var(--forest-700)" />
            <span style={{ color: 'var(--text-primary)', maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {selectedCity || 'Mumbai'}
            </span>
            <ChevronDown size={14} color="var(--text-muted)" />
          </div>

          {/* City Picker Dropdown */}
          {isCityDropdownOpen && (
            <div style={{
              position: 'absolute',
              top: 'calc(100% + 8px)',
              left: 0,
              width: '240px',
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-lg)',
              border: '1px solid var(--border-light)',
              padding: '8px',
              zIndex: 1000,
            }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', padding: '6px 8px' }}>
                Select Your Service City
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                {MAJOR_CITIES.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => handleSelectCity(c)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 10px',
                      borderRadius: 'var(--radius-sm)',
                      background: selectedCity === c ? 'var(--forest-50)' : 'none',
                      color: selectedCity === c ? 'var(--forest-800)' : 'var(--text-primary)',
                      fontWeight: selectedCity === c ? 700 : 500,
                      fontSize: '13px',
                      cursor: 'pointer',
                      border: 'none',
                      textAlign: 'left',
                      width: '100%',
                    }}
                  >
                    <span>{c}</span>
                    {selectedCity === c && <Check size={14} color="var(--forest-700)" />}
                  </button>
                ))}
              </div>

              {/* Custom Area / City input */}
              <form onSubmit={handleCustomCitySubmit} style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid var(--border-light)' }}>
                <input
                  type="text"
                  placeholder="Or type custom city..."
                  value={customCityInput}
                  onChange={(e) => setCustomCityInput(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '6px 8px',
                    fontSize: '12px',
                    borderRadius: '4px',
                    border: '1px solid var(--border-light)',
                    outline: 'none',
                  }}
                />
              </form>
            </div>
          )}
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
            placeholder={t('common.searchPlaceholder', 'Search catalog & pros...')}
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
            {t('nav.catalog', 'Catalog')}
          </Link>

          <Link
            to="/bookings"
            style={{
              fontSize: '13.5px',
              fontWeight: location.pathname.startsWith('/track') ? 700 : 600,
              color: location.pathname.startsWith('/track') ? 'var(--forest-800)' : 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              textDecoration: 'none'
            }}
          >
            <Navigation size={13} color="var(--forest-700)" />
            <span>{t('nav.track', 'Track')}</span>
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
            {t('nav.myBookings', 'My Bookings')}
          </Link>

          <Link
            to={currentUser?.role === 'provider' ? '/provider/dashboard' : '/signup?role=provider'}
            style={{
              fontSize: '13.5px',
              fontWeight: location.pathname.startsWith('/provider') ? 700 : 600,
              color: 'var(--forest-700)',
              textDecoration: 'none'
            }}
          >
            {t('nav.joinPartner', 'Join as Partner')}
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
            {t('nav.help', 'Help')}
          </Link>
        </nav>

        {/* Actions & Avatar / Login Trigger */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>

          {/* Language Selector Dropdown */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '4px 8px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-light)',
            backgroundColor: '#FFFFFF',
            fontSize: '12px',
            color: 'var(--text-secondary)'
          }}>
            <Globe size={13} color="var(--forest-700)" />
            <select
              value={currentLang}
              onChange={(e) => handleLanguageChange(e.target.value)}
              style={{
                border: 'none',
                background: 'transparent',
                fontSize: '12px',
                fontWeight: 600,
                color: 'var(--forest-800)',
                cursor: 'pointer',
                outline: 'none'
              }}
              aria-label="Select Language"
            >
              <option value="en">EN</option>
              <option value="hi">HI (हिंदी)</option>
              <option value="mr">MR (मराठी)</option>
            </select>
          </div>

          <Link
            to="/book"
            className="btn btn-primary btn-sm"
            style={{ textDecoration: 'none' }}
          >
            <Wrench size={14} />
            <span>{t('common.bookNow', 'Book')}</span>
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
                  <InitialsAvatar
                    name={displayName}
                    avatarUrl={userProfile?.avatar || currentUser?.avatar}
                    size={36}
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
              />
            </div>
          ) : (
            <Link
              to="/login"
              className="btn btn-secondary btn-sm"
              style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <LogIn size={14} />
              <span>{t('nav.login', 'Log In')}</span>
            </Link>
          )}

        </div>

      </div>
    </header>
  );
}
