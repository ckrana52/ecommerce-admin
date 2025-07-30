import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, MoreHorizontal } from 'lucide-react';

export default function TablePagination({ page, pageSize, total, onPageChange, onPageSizeChange }) {
  const totalPages = Math.ceil(total / pageSize) || 1;
  const currentPage = page;
  const rowsPerPage = pageSize;
  const totalRecords = total;
  const startRecord = (currentPage - 1) * rowsPerPage + 1;
  const endRecord = Math.min(currentPage * rowsPerPage, totalRecords);
  const rowsPerPageOptions = [10, 20, 50, 100];

  const handlePageChange = (newPage) => {
    onPageChange(newPage);
  };

  const handleRowsPerPageChange = (newPageSize) => {
    onPageSizeChange(newPageSize);
  };

  const getVisiblePageNumbers = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    // Remove duplicates
    return [...new Set(rangeWithDots)];
  };

  return (
    <div className="border-t border-gray-200 bg-gradient-to-r from-gray-50 to-white px-8 py-6">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        
        {/* Enhanced Rows Per Page Select Wrapper */}
        <div className="rows_per_page_select_wrapper flex items-center space-x-4 bg-white rounded-xl px-4 py-3 border border-gray-200 shadow-sm">
          <label className="text-sm font-semibold text-gray-700 flex items-center">
            <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
            Rows per page:
          </label>
          <div className="relative">
            <select
              value={rowsPerPage}
              onChange={(e) => handleRowsPerPageChange(Number(e.target.value))}
              className="appearance-none bg-gradient-to-r from-blue-50 to-purple-50 border border-gray-300 rounded-lg px-4 py-2 pr-8 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            >
              {rowsPerPageOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Enhanced Pagination Wrapper */}
        <div className="pagination_wrapper flex items-center space-x-2">
          
          {/* First Page Button */}
          <button
            onClick={() => handlePageChange(1)}
            disabled={currentPage === 1}
            className="group inline-flex items-center justify-center w-10 h-10 text-sm border border-gray-300 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:border-blue-300 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white transition-all duration-200 shadow-sm"
            title="First page"
          >
            <ChevronsLeft className="w-4 h-4 group-hover:text-blue-600 transition-colors" />
          </button>

          {/* Previous Page Button */}
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="group inline-flex items-center justify-center w-10 h-10 text-sm border border-gray-300 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:border-blue-300 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white transition-all duration-200 shadow-sm"
            title="Previous page"
          >
            <ChevronLeft className="w-4 h-4 group-hover:text-blue-600 transition-colors" />
          </button>

          {/* Page Numbers */}
          <div className="flex items-center space-x-1">
            {getVisiblePageNumbers().map((pageNumber, index) => (
              <React.Fragment key={index}>
                {pageNumber === '...' ? (
                  <span className="inline-flex items-center justify-center w-10 h-10 text-sm text-gray-400">
                    <MoreHorizontal className="w-4 h-4" />
                  </span>
                ) : (
                  <button
                    onClick={() => handlePageChange(pageNumber)}
                    className={`inline-flex items-center justify-center w-10 h-10 text-sm font-medium rounded-xl transition-all duration-200 shadow-sm ${
                      currentPage === pageNumber
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white border border-blue-600 shadow-md transform scale-105'
                        : 'border border-gray-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:border-blue-300 text-gray-700 hover:text-blue-600'
                    }`}
                  >
                    {pageNumber}
                  </button>
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Next Page Button */}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="group inline-flex items-center justify-center w-10 h-10 text-sm border border-gray-300 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:border-blue-300 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white transition-all duration-200 shadow-sm"
            title="Next page"
          >
            <ChevronRight className="w-4 h-4 group-hover:text-blue-600 transition-colors" />
          </button>

          {/* Last Page Button */}
          <button
            onClick={() => handlePageChange(totalPages)}
            disabled={currentPage === totalPages}
            className="group inline-flex items-center justify-center w-10 h-10 text-sm border border-gray-300 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:border-blue-300 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white transition-all duration-200 shadow-sm"
            title="Last page"
          >
            <ChevronsRight className="w-4 h-4 group-hover:text-blue-600 transition-colors" />
          </button>
        </div>
      </div>

      {/* Mobile Responsive Pagination Info */}
      <div className="mt-4 lg:hidden">
        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">
              Page {currentPage} / {totalPages}
            </span>
            <div className="flex space-x-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm bg-gray-100 border border-gray-300 rounded-lg disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-sm bg-blue-600 text-white border border-blue-600 rounded-lg disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 