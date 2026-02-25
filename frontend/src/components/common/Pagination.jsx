import React from "react";
import { 
  ChevronFirst, 
  ChevronLeft, 
  ChevronRight, 
  ChevronLast 
} from "lucide-react";

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  // Logic tạo danh sách số trang hiển thị
  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    pages.push(i);
  }

  const btnBase = "flex items-center justify-center w-9 h-9 rounded-md border text-sm font-bold transition-all";
  const activeClass = "bg-[#ddf4ff] border-[#0969da] text-[#0969da] shadow-sm";
  const inactiveClass = "bg-white border-[#d0d7de] text-[#1f2328] hover:bg-[#f6f8fa]";
  const disabledClass = "opacity-40 cursor-not-allowed bg-[#f6f8fa] border-[#d0d7de]";

  return (
    <div className="flex w-full items-center justify-center gap-2 mt-12 py-4 border-t border-[#d0d7de]">
      {/* Nhóm điều hướng đầu/trước */}
      <div className="flex items-center gap-1">
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

      {/* Nhóm số trang */}
      <div className="flex items-center gap-1">
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

      {/* Nhóm điều hướng sau/cuối */}
      <div className="flex items-center gap-1">
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