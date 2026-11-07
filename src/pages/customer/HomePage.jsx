// ===================================================================
// FixNear Trust - Customer Homepage
// High-conversion discovery with verified badges and category carousels
// ===================================================================

import React from 'react';
import { useNavigate } from 'react-router-dom';
import HeroSection from '../../components/customer/HeroSection';
import ServiceCategories from '../../components/customer/ServiceCategories';
import FeaturedServices from '../../components/customer/FeaturedServices';
import TrustBanner from '../../components/customer/TrustBanner';
import TechnicianSpotlight from '../../components/customer/TechnicianSpotlight';
import HowItWorks from '../../components/customer/HowItWorks';
import CustomerReviews from '../../components/customer/CustomerReviews';

export default function HomePage() {
  const navigate = useNavigate();

  const handleOpenBookingModal = (service = null) => {
    if (service) {
      navigate(`/book?serviceId=${service.serviceId || service._id}`);
    } else {
      navigate('/book');
    }
  };

  const handleSelectCategory = (catId) => {
    navigate(`/services?category=${encodeURIComponent(catId)}`);
  };

  const handleSelectTechnician = (techId) => {
    navigate(`/technician/${encodeURIComponent(techId)}`);
  };

  const handleSearch = (term) => {
    navigate(`/search?q=${encodeURIComponent(term)}`);
  };

  return (
    <>
      <HeroSection 
        onSearch={handleSearch}
        onSelectCategory={handleSelectCategory}
        onOpenBookingModal={handleOpenBookingModal}
      />

      <ServiceCategories 
        selectedCategoryId={null}
        onSelectCategory={handleSelectCategory}
      />

      <FeaturedServices 
        selectedCategoryId={null}
        onOpenBookingModal={handleOpenBookingModal}
      />

      <TrustBanner />

      <TechnicianSpotlight 
        onSelectTechnician={handleSelectTechnician}
      />

      <HowItWorks />

      <CustomerReviews />
    </>
  );
}
