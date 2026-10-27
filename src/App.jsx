// ===================================================================
// FixNear Trust - Main Application Entrypoint
// React Router DOM v6 + Firebase Auth + Real-time Firestore Store
// ===================================================================

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { StoreProvider, useStore } from './context/StoreContext';
import { ToastProvider } from './context/ToastContext';

// Common Components
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import UserActionModal from './components/common/UserActionModal';
import BookingDrawerModal from './components/customer/BookingDrawerModal';
import ProtectedRoute from './components/common/ProtectedRoute';

// Pages
import HomePage from './pages/customer/HomePage';
import CatalogPage from './pages/customer/CatalogPage';
import SearchPage from './pages/customer/SearchPage';
import TechnicianProfilePageWrapper from './pages/customer/TechnicianProfilePageWrapper';
import BookingPage from './pages/customer/BookingPage';
import TrackingPage from './pages/customer/TrackingPage';
import QuotationPage from './pages/customer/QuotationPage';
import InvoicePage from './pages/customer/InvoicePage';
import MyBookingsPage from './pages/customer/MyBookingsPage';
import SupportPage from './pages/customer/SupportPage';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import SignUpPage from './pages/auth/SignUpPage';

// Portal Dashboards
import ProviderDashboardPage from './pages/provider/ProviderDashboardPage';
import ProviderRegisterPage from './pages/provider/ProviderRegisterPage';
import ProviderSkillTestPage from './pages/provider/ProviderSkillTestPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminLoginPage from './pages/admin/AdminLoginPage';
import NotFoundPage from './pages/NotFoundPage';

function AppLayout() {
  const location = useLocation();
  const { 
    isBookingModalOpen, 
    setIsBookingModalOpen, 
    bookingModalService,
    activeUserAction,
    setActiveUserAction 
  } = useStore();

  const isAdminLogin = location.pathname === '/admin/login';
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup' || isAdminLogin;
  const isDashboard = location.pathname.startsWith('/admin') || location.pathname.startsWith('/provider');

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-warm)' }}>
      
      {/* Universal Top Navigation - hidden on admin login */}
      {!isAdminLogin && <Navbar />}

      {/* Main View Router */}
      <main style={{ flex: 1, paddingBottom: '80px' }}>
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
          <Route path="/support" element={<SupportPage />} />

          {/* Authentication Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />

          {/* Service Provider Portal Routes */}
          <Route path="/provider/register" element={<ProviderRegisterPage />} />
          <Route path="/provider/test" element={<ProviderSkillTestPage />} />
          <Route path="/provider/test/:categoryId" element={<ProviderSkillTestPage />} />
          <Route 
            path="/provider" 
            element={
              <ProtectedRoute allowedRoles={['provider', 'admin']}>
                <ProviderDashboardPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/provider/dashboard" 
            element={
              <ProtectedRoute allowedRoles={['provider', 'admin']}>
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
      <ToastProvider>
        <AuthProvider>
          <StoreProvider>
            <AppLayout />
          </StoreProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
