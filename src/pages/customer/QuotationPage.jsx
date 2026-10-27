import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';
import QuotationReviewPage from '../../components/customer/QuotationReviewPage';

export default function QuotationPage() {
  const { id } = useParams();
  const { setActiveBookingId } = useStore();

  useEffect(() => {
    if (id) {
      setActiveBookingId(id);
    }
  }, [id, setActiveBookingId]);

  return <QuotationReviewPage />;
}
