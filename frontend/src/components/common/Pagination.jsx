import React from "react";
import {
  ChevronFirst,
  ChevronLeft,
  ChevronRight,
  ChevronLast,
} from "lucide-react";

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    pages.push(i);
  }

  const btnBase =
    "flex items-center justify-center w-8 h-8 rounded-md text-sm font-medium transition-colors";
  
  const activeClass = "bg-[#ddf4ff] text-[#0969da]"; 
  
  const inactiveClass =
    "text-[#6e7781] bg-transparent hover:bg-[#f6f8fa] hover:text-[#1f2328]";
    
  const disabledClass =
    "opacity-40 cursor-not-allowed text-[#6e7781] bg-transparent";

  return (
    <div className="flex w-full items-center justify-end gap-1 mt-[5px] py-4 border-t border-[#d0d7de] pr-4">
      
      <div className="flex items-center justify-center gap-1">
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className={`${btnBase} ${currentPage === 1 ? disabledClass : inactiveClass}`}
        >
          <ChevronFirst size={16} />
        </button>
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`${btnBase} ${currentPage === 1 ? disabledClass : inactiveClass}`}
        >
          <ChevronLeft size={16} />
        </button>
      </div>

      <div className="flex items-center justify-center gap-1">
        {pages.map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`${btnBase} ${currentPage === page ? activeClass : inactiveClass}`}
          >
            {page}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-center gap-1">
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`${btnBase} ${currentPage === totalPages ? disabledClass : inactiveClass}`}
        >
          <ChevronRight size={16} />
        </button>
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className={`${btnBase} ${currentPage === totalPages ? disabledClass : inactiveClass}`}
        >
          <ChevronLast size={16} />
        </button>
      </div>
    </div>
  );
};

export default Pagination;