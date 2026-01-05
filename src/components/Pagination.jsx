import React from 'react';

const Pagination = ({ currentPage, perPage, totalItems, onPageChange }) => {
  const totalPages = Math.ceil(totalItems / perPage);

  if (totalPages <= 1) {
    return null;
  }

  const goToPage = (page) => {
    if (page < 1 || page > totalPages || page === currentPage) return;
    onPageChange(page);
  };

  const getVisiblePages = () => {
    const maxButtons = 5;
    let start = Math.max(1, currentPage - Math.floor(maxButtons / 2));
    let end = start + maxButtons - 1;

    if (end > totalPages) {
      end = totalPages;
      start = Math.max(1, end - maxButtons + 1);
    }

    const pages = [];
    for (let page = start; page <= end; page += 1) {
      pages.push(page);
    }
    return pages;
  };

  const startItem = (currentPage - 1) * perPage + 1;
  const endItem = Math.min(totalItems, currentPage * perPage);

  return (
    <div className="pagination">
      <div className="pagination-controls">
        <button type="button" className="pagination-btn" onClick={() => goToPage(1)} disabled={currentPage === 1}>
          «
        </button>
        <button type="button" className="pagination-btn" onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1}>
          ‹
        </button>
        {getVisiblePages().map((page) => (
          <button
            type="button"
            key={page}
            className={`pagination-btn ${page === currentPage ? 'active' : ''}`}
            onClick={() => goToPage(page)}
          >
            {page}
          </button>
        ))}
        <button type="button" className="pagination-btn" onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages}>
          ›
        </button>
        <button type="button" className="pagination-btn" onClick={() => goToPage(totalPages)} disabled={currentPage === totalPages}>
          »
        </button>
      </div>
      <div className="pagination-summary">
        Mostrando {startItem}-{endItem} de {totalItems}
      </div>
    </div>
  );
};

export default Pagination;
