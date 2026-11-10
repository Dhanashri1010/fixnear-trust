// ===================================================================
// FixNear Trust - Main Application Entrypoint
// React Router DOM v6 + Lazy Code Splitting per Portal
// ===================================================================

import React, { Suspense, lazy, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { LanguageProvider } from './context/LanguageContext';
import { t } from './i18n/translations';

// Common Components (Eager loaded for immediate structure)
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import UserActionModal from './components/common/UserActionModal';
import BookingDrawerModal from './components/customer/BookingDrawerModal';
import ProtectedRoute from './components/common/ProtectedRoute';

// Loading Fallback Component
const PageLoadingFallback = () => (
  <div style={{
    minHeight: '60vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    color: 'var(--forest-800)'
  }}>
    <div className="spinner" />
    <span style={{ fontSize: '14px', fontWeight: 600 }}>{t('common.loading', 'Loading...')}</span>
  </div>
);

// Customer Portal Pages (Lazy loaded)
const HomePage = lazy(() => import('./pages/customer/HomePage'));
const CatalogPage = lazy(() => import('./pages/customer/CatalogPage'));
const SearchPage = lazy(() => import('./pages/customer/SearchPage'));
const TechnicianProfilePageWrapper = lazy(() => import('./pages/customer/TechnicianProfilePageWrapper'));
const BookingPage = lazy(() => import('./pages/customer/BookingPage'));
const TrackingPage = lazy(() => import('./pages/customer/TrackingPage'));
const QuotationPage = lazy(() => import('./pages/customer/QuotationPage'));
const InvoicePage = lazy(() => import('./pages/customer/InvoicePage'));
const MyBookingsPage = lazy(() => import('./pages/customer/MyBookingsPage'));
const SupportPage = lazy(() => import('./pages/customer/SupportPage'));
const TermsPage = lazy(() => import('./pages/customer/TermsPage'));
const PrivacyPage = lazy(() => import('./pages/customer/PrivacyPage'));
const RefundPolicyPage = lazy(() => import('./pages/customer/RefundPolicyPage'));

// Auth Pages (Lazy loaded)
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const SignUpPage = lazy(() => import('./pages/auth/SignUpPage'));
const ResetPasswordPage = lazy(() => import('./pages/auth/ResetPasswordPage'));
const ChangePasswordPage = lazy(() => import('./pages/auth/ChangePasswordPage'));

// Provider Portal Pages (Lazy loaded)
const ProviderDashboardPage = lazy(() => import('./pages/provider/ProviderDashboardPage'));
const ProviderRegisterPage = lazy(() => import('./pages/provider/ProviderRegisterPage'));
const ProviderSkillTestPage = lazy(() => import('./pages/provider/ProviderSkillTestPage'));

// Admin Portal Pages (Lazy loaded)
const AdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboardPage'));
const AdminLoginPage = lazy(() => import('./pages/admin/AdminLoginPage'));

// Fallback Page
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

function AppLayout() {
  const location = useLocation();
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookingModalService, setBookingModalService] = useState(null);
  const [activeUserAction, setActiveUserAction] = useState(null);

  const isAdminLogin = location.pathname === '/admin/login';
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup' || location.pathname === '/reset-password' || isAdminLogin;
  const isDashboard = location.pathname.startsWith('/admin') || location.pathname.startsWith('/provider');

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-warm)' }}>
      
      {/* Universal Top Navigation - hidden on admin login */}
      {!isAdminLogin && <Navbar />}

      {/* Main View Router with Suspense */}
      <main style={{ flex: 1, paddingBottom: '80px' }}>
        <Suspense fallback={<PageLoadingFallback />}>
          <Routes>
            {/* Customer Public & In-Service Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/services" element={<CatalogPage />} />
            <Route path="/catalog" element={<Navigate to="/services" replace />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/technician/:id" element={<TechnicianProfilePageWrapper />} />
            <Route path="/book" element={<BookingPage />} />
            <Route path="/track" element={<TrackingPage />} />
            <Route path="/track/:id" element={<TrackingPage />} />
            <Route path="/quote" element={<QuotationPage />} />
            <Route path="/quote/:id" element={<QuotationPage />} />
            <Route path="/invoice" element={<InvoicePage />} />
            <Route path="/invoice/:id" element={<InvoicePage />} />
            <Route path="/bookings" element={<MyBookingsPage />} />
            <Route path="/my-bookings" element={<MyBookingsPage />} />
            <Route path="/support" element={<SupportPage />} />
            
            {/* Legal and Policy Routes */}
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/refund-policy" element={<RefundPolicyPage />} />

            {/* Authentication Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route 
              path="/change-password" 
              element={
                <ProtectedRoute allowedRoles={['customer', 'provider', 'admin']}>
                  <ChangePasswordPage />
                </ProtectedRoute>
              } 
            />

            {/* Service Provider Portal Routes */}
            <Route path="/provider/register" element={<ProviderRegisterPage />} />
            <Route path="/provider/test" element={<ProviderSkillTestPage />} />
            <Route path="/provider/test/:categoryId" element={<ProviderSkillTestPage />} />
            <Route 
              path="/provider" 
              element={
                <ProtectedRoute allowedRoles={['provider']}>
                  <ProviderDashboardPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/provider/dashboard" 
              element={
                <ProtectedRoute allowedRoles={['provider']}>
                  <ProviderDashboardPage />
                </ProtectedRoute>
              } 
            />

            {/* Admin Portal Routes (Guarded for Admin) */}
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route 
              path="/admin/*" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboardPage />
                </ProtectedRoute>
              } 
            />

            {/* 404 Fallback */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </main>

      {/* Public Customer Footer (hidden on standalone auth screens) */}
      {!isAuthPage && !isDashboard && <Footer />}

      {/* Interactive Booking Drawer / Modal */}
      <BookingDrawerModal 
        isOpen={isBookingModalOpen}
        service={bookingModalService}
        onClose={() => setIsBookingModalOpen(false)}
      />

      {/* Account Menu Views Modal */}
      <UserActionModal 
        activeAction={activeUserAction}
        onClose={() => setActiveUserAction(null)}
      />

    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <LanguageProvider>
        <ToastProvider>
          <AuthProvider>
            <AppLayout />
          </AuthProvider>
        </ToastProvider>
      </LanguageProvider>
    </BrowserRouter>
  );
}
