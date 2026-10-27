// ===================================================================
// FixNear Trust - Customer Homepage
// High-conversion discovery with verified badges and category carousels
// ===================================================================

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';
import HeroSection from '../../components/customer/HeroSection';
import ServiceCategories from '../../components/customer/ServiceCategories';
import FeaturedServices from '../../components/customer/FeaturedServices';
import TrustBanner from '../../components/customer/TrustBanner';
import TechnicianSpotlight from '../../components/customer/TechnicianSpotlight';
import HowItWorks from '../../components/customer/HowItWorks';
import CustomerReviews from '../../components/customer/CustomerReviews';

export default function HomePage() {
  const navigate = useNavigate();
  const { setBookingModalService, setIsBookingModalOpen, setSelectedCategoryFilter, setSelectedTechnicianId } = useStore();

  const handleOpenBookingModal = (service = null) => {
    setBookingModalService(service);
    setIsBookingModalOpen(true);
  };

  const handleSelectCategory = (catId) => {
    setSelectedCategoryFilter(catId);
    navigate(`/services?category=${catId}`);
  };

  const handleSelectTechnician = (techId) => {
    setSelectedTechnicianId(techId);
    navigate(`/technician/${techId}`);
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
