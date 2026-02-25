import React from 'react';
import { Trash2, Plus, Minus } from 'lucide-react';

const CartItem = ({ item, onUpdateQty, onRemove }) => {
  return (
    <div className="flex w-full items-center gap-4 mobile:flex-col mobile:flex-nowrap mobile:gap-4 p-4 hover:bg-[#f6f8fa] transition-colors border-b border-[#d0d7de] last:border-b-0">
      {/* Hình ảnh sản phẩm */}
      <img
        className="h-24 w-24 flex-none rounded-md object-cover mobile:h-24 mobile:w-full mobile:flex-none border border-[#d0d7de]"
        src={item.image_url}
        alt={item.product_name}
      />
      
      <div className="flex grow shrink-0 basis-0 flex-col items-start gap-4">
        {/* Thông tin tên và giá */}
        <div className="flex w-full items-start gap-4">
          <div className="flex grow shrink-0 basis-0 flex-col items-start gap-1">
            <span className="text-body-bold font-bold text-[#0969da] hover:underline cursor-pointer">
              {item.product_name}
            </span>
            <span className="text-caption text-sm text-[#6e7781]">
              Category: {item.category_name || 'General'}
            </span>
          </div>
          <span className="text-body-bold font-bold text-[#1f2328]">
            ${item.price.toFixed(2)}
          </span>
        </div>

        {/* Bộ điều khiển số lượng và nút xóa */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 border border-[#d0d7de] rounded-md bg-white overflow-hidden">
            <button
              onClick={() => onUpdateQty(item.cart_item_id, item.quantity - 1)}
              className="p-1.5 hover:bg-[#f3f4f6] text-[#6e7781] transition-colors"
              title="Decrease quantity"
            >
              <Minus size={14} />
            </button>
            <span className="min-w-[24px] text-center text-sm font-semibold text-[#1f2328]">
              {item.quantity}
            </span>
            <button
              onClick={() => onUpdateQty(item.cart_item_id, item.quantity + 1)}
              className="p-1.5 hover:bg-[#f3f4f6] text-[#6e7781] transition-colors"
              title="Increase quantity"
            >
              <Plus size={14} />
            </button>
          </div>

          <button
            onClick={() => onRemove(item.cart_item_id)}
            className="flex items-center gap-1 text-[#6e7781] hover:text-[#cf222e] transition-colors text-sm font-medium"
            title="Remove item"
          >
            <Trash2 size={16} />
            <span className="mobile:hidden">Remove</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartItem;