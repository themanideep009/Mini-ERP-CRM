import React from 'react';
import { PaginationMeta } from '../types/index.js';

interface PaginationProps {
  meta: PaginationMeta;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ meta, onPageChange }) => {
  const { currentPage, totalPages, totalItems, limit } = meta;

  if (totalPages <= 1) return null;

  const startItem = (currentPage - 1) * limit + 1;
  const endItem = Math.min(currentPage * limit, totalItems);

  return (
    <div className="pagination-container">
      <span className="pagination-info">
        Showing <strong>{startItem}</strong> - <strong>{endItem}</strong> of <strong>{totalItems}</strong> entries
      </span>
      <div className="pagination-controls">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="btn btn-sm btn-secondary"
        >
          Previous
        </button>

        {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
          <button
            key={pageNum}
            onClick={() => onPageChange(pageNum)}
            className={`btn btn-sm ${pageNum === currentPage ? 'btn-primary' : 'btn-secondary'}`}
          >
            {pageNum}
          </button>
        ))}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="btn btn-sm btn-secondary"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Pagination;
