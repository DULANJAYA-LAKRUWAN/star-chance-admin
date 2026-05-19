import { useState, useMemo } from 'react';

export const usePagination = (initialData = [], itemsPerPage = 10) => {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(initialData.length / itemsPerPage));
  }, [initialData.length, itemsPerPage]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return initialData.slice(startIndex, startIndex + itemsPerPage);
  }, [initialData, currentPage, itemsPerPage]);

  const nextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));
  const setPage = (page) => setCurrentPage(Math.max(1, Math.min(page, totalPages)));

  return {
    currentPage,
    totalPages,
    paginatedData,
    nextPage,
    prevPage,
    setPage,
  };
};
