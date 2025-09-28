'use client';

import { useEffect, useState } from 'react';
import Typography from './Typography';

export default function Pagination({
  totalPages,
  currentPage,
  onChange,
}: {
  totalPages: number;
  currentPage: number;
  onChange: (page: number) => void;
}) {
  const [page, setPage] = useState(currentPage);

  useEffect(() => {
    setPage(currentPage);
  }, [currentPage]);

  const handlePrev = () => {
    if (page > 1) {
      setPage(page - 1);
      onChange(page - 1);
    }
  };

  const handleNext = () => {
    if (page < totalPages) {
      setPage(page + 1);
      onChange(page + 1);
    }
  };

  return (
    <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
      <button
        onClick={handlePrev}
        disabled={page === 1}
        className={`cursor-pointer px-3 py-1 rounded-lg border transition-colors
                    ${page === 1 ? 'bg-muted text-surface border-border' : 'bg-surface text-primary border-border hover:bg-primary hover:text-surface'}`}
      >
        Попередня
      </button>
      <Typography type="text">{currentPage}</Typography>
      <button
        onClick={handleNext}
        disabled={page === totalPages}
        className={`cursor-pointer px-3 py-1 rounded-lg border transition-colors
                    ${page === totalPages ? 'bg-muted text-surface border-border' : 'bg-surface text-primary border-border hover:bg-primary hover:text-surface'}`}
      >
        Наступна
      </button>
    </div>
  );
}
