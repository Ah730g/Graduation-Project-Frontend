import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

function Pagination({ currentPage, lastPage, onPageChange, loading = false }) {
  const { language } = useLanguage();
  
  if (!lastPage || lastPage <= 1) {
    return null; // Don't show pagination if there's only one page or no pages
  }

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5; // Show max 5 page numbers at once
    
    if (lastPage <= maxVisible) {
      // Show all pages if total pages is less than maxVisible
      for (let i = 1; i <= lastPage; i++) {
        pages.push(i);
      }
    } else {
      // Show pages around current page
      if (currentPage <= 3) {
        // Near the start
        for (let i = 1; i <= 5; i++) {
          pages.push(i);
        }
      } else if (currentPage >= lastPage - 2) {
        // Near the end
        for (let i = lastPage - 4; i <= lastPage; i++) {
          pages.push(i);
        }
      } else {
        // In the middle
        for (let i = currentPage - 2; i <= currentPage + 2; i++) {
          pages.push(i);
        }
      }
    }
    
    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex items-center justify-center gap-2 mt-6 mb-4 flex-wrap">
      {/* Previous Button */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1 || loading}
        className={`px-4 py-2 rounded-md font-semibold transition-all duration-200 ${
          currentPage === 1 || loading
            ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
            : 'bg-yellow-300 dark:bg-yellow-500 text-[#444] dark:text-white hover:bg-yellow-400 dark:hover:bg-yellow-600 hover:scale-105'
        }`}
        aria-label="Previous page"
      >
        <span className="flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          {language === 'ar' ? 'السابق' : 'Previous'}
        </span>
      </button>

      {/* First Page */}
      {pageNumbers[0] > 1 && (
        <>
          <button
            onClick={() => onPageChange(1)}
            disabled={loading}
            className={`px-4 py-2 rounded-md font-semibold transition-all duration-200 ${
              loading
                ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            1
          </button>
          {pageNumbers[0] > 2 && (
            <span className="px-2 text-gray-500 dark:text-gray-400">...</span>
          )}
        </>
      )}

      {/* Page Numbers */}
      {pageNumbers.map((pageNum) => (
        <button
          key={pageNum}
          onClick={() => onPageChange(pageNum)}
          disabled={loading}
          className={`px-4 py-2 rounded-md font-semibold transition-all duration-200 min-w-[44px] ${
            currentPage === pageNum
              ? 'bg-yellow-400 dark:bg-yellow-500 text-[#444] dark:text-white scale-110 shadow-lg'
              : loading
              ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 hover:scale-105'
          }`}
        >
          {pageNum}
        </button>
      ))}

      {/* Last Page */}
      {pageNumbers[pageNumbers.length - 1] < lastPage && (
        <>
          {pageNumbers[pageNumbers.length - 1] < lastPage - 1 && (
            <span className="px-2 text-gray-500 dark:text-gray-400">...</span>
          )}
          <button
            onClick={() => onPageChange(lastPage)}
            disabled={loading}
            className={`px-4 py-2 rounded-md font-semibold transition-all duration-200 ${
              loading
                ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            {lastPage}
          </button>
        </>
      )}

      {/* Next Button */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === lastPage || loading}
        className={`px-4 py-2 rounded-md font-semibold transition-all duration-200 ${
          currentPage === lastPage || loading
            ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
            : 'bg-yellow-300 dark:bg-yellow-500 text-[#444] dark:text-white hover:bg-yellow-400 dark:hover:bg-yellow-600 hover:scale-105'
        }`}
        aria-label="Next page"
      >
        <span className="flex items-center gap-1">
          {language === 'ar' ? 'التالي' : 'Next'}
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </span>
      </button>
    </div>
  );
}

export default Pagination;
