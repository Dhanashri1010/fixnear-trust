import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';
import InvoiceComparisonPage from '../../components/customer/InvoiceComparisonPage';

export default function InvoicePage() {
  const { id } = useParams();
  const { setActiveBookingId } = useStore();

  useEffect(() => {
    if (id) {
      setActiveBookingId(id);
    }
  }, [id, setActiveBookingId]);

  return <InvoiceComparisonPage />;
}
