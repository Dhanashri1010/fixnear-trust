import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';
import SearchResultsPage from '../../components/customer/SearchResultsPage';

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const { setSearchQuery } = useStore();

  useEffect(() => {
    const q = searchParams.get('q');
    if (q) {
      setSearchQuery(q);
    }
  }, [searchParams, setSearchQuery]);

  return <SearchResultsPage />;
}
