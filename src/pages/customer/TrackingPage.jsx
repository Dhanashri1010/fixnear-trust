import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';
import BookingTrackingPage from '../../components/customer/BookingTrackingPage';

export default function TrackingPage() {
  const { id } = useParams();
  const { setActiveBookingId } = useStore();

  useEffect(() => {
    if (id) {
      setActiveBookingId(id);
    }
  }, [id, setActiveBookingId]);

  return <BookingTrackingPage />;
}
