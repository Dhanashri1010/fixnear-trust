import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';
import TechnicianProfilePage from '../../components/customer/TechnicianProfilePage';

export default function TechnicianProfilePageWrapper() {
  const { id } = useParams();
  const { setSelectedTechnicianId } = useStore();

  useEffect(() => {
    if (id) {
      setSelectedTechnicianId(id);
    }
  }, [id, setSelectedTechnicianId]);

  return <TechnicianProfilePage />;
}
