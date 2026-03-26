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

  // Loại bỏ border, chỉnh kích thước (w-8 h-8) và đổi sang font-medium giống thiết kế mới
  const btnBase =
    "flex items-center justify-center w-8 h-8 rounded-md text-sm font-medium transition-colors";
  
  // activeClass tương đương với "brand-secondary"
  const activeClass = "bg-[#ddf4ff] text-[#0969da]"; 
  
  // inactiveClass tương đương với "neutral-tertiary" (nền trong suốt, hiện nền xám nhạt khi hover)
  const inactiveClass =
    "text-[#6e7781] bg-transparent hover:bg-[#f6f8fa] hover:text-[#1f2328]";
    
  const disabledClass =
    "opacity-40 cursor-not-allowed text-[#6e7781] bg-transparent";

  return (
    // Vẫn giữ thiết lập căn lề phải (justify-end) và khoảng cách lề trên (mt-[5px]) như chúng ta đã làm ở bước trước
    <div className="flex w-full items-center justify-end gap-1 mt-[5px] py-4 border-t border-[#d0d7de] pr-4">
      
      {/* Group 1: Nút First và Prev */}
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

      {/* Group 2: Các trang số */}
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

      {/* Group 3: Nút Next và Last */}
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