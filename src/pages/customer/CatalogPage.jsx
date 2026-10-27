import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';
import ServiceCatalogPage from '../../components/customer/ServiceCatalogPage';

export default function CatalogPage() {
  const [searchParams] = useSearchParams();
  const { setSelectedCategoryFilter } = useStore();

  useEffect(() => {
    const category = searchParams.get('category');
    if (category) {
      setSelectedCategoryFilter(category);
    }
  }, [searchParams, setSelectedCategoryFilter]);

  return <ServiceCatalogPage />;
}
