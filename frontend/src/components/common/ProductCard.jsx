import React from "react";
import { Link } from "react-router-dom";
import Button from "./Button";
import { ShoppingCart, BadgeCheck } from "lucide-react";

const ProductCard = ({ product, onAddToCart }) => {
  return (
    <div className="flex grow shrink-0 basis-0 flex-col items-start overflow-hidden rounded-md border border-solid border-[#d0d7de] bg-white shadow-sm hover:border-[#0969da] transition-all duration-200 group h-full">
      <Link
        to={`/product/${product.product_id}`}
        className="w-full h-52 relative shrink-0 p-2 border-b border-[#d0d7de] bg-[#f6f8fa] flex items-center justify-center overflow-hidden"
      >
        <img
          className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-500"
          src={
            product.image_url ||
            "https://res.cloudinary.com/subframe/image/upload/v1723780577/uploads/302/hhmv6ey0yajkadnmcp0a.png"
          }
          alt={product.name}
        />

        {product.stock_quantity <= 0 && (
          <div className="absolute top-2 right-2 bg-[#cf222e] text-white text-[10px] px-2 py-0.5 rounded-full font-bold uppercase z-10">
            Out of Stock
          </div>
        )}
      </Link>

      <div className="flex w-full flex-col items-start gap-4 px-4 py-5 flex-grow">
        <div className="flex w-full items-start gap-1 min-h-[40px]">
          <Link
            to={`/product/${product.product_id}`}
            className="grow shrink-0 basis-0"
          >
            <span
              className="text-sm font-bold text-[#1f2328] line-clamp-2 group-hover:text-[#0969da] transition-colors leading-snug"
              title={product.name}
            >
              {product.name}
            </span>
          </Link>
        </div>

        <div className="flex w-full items-start gap-2 pb-1">
          <div className="flex grow shrink-0 basis-0 flex-col items-start gap-1">
            <span className="line-clamp-1 w-full text-[10px] font-bold text-[#6e7781] uppercase tracking-wider">
              Price
            </span>
            <span className="line-clamp-1 w-full text-sm font-black text-[#1f2328]">
              ${product.price.toFixed(2)}
            </span>
          </div>
          <div className="flex grow shrink-0 basis-0 flex-col items-start gap-1">
            <span className="line-clamp-1 w-full text-[10px] font-bold text-[#6e7781] uppercase tracking-wider">
              Category
            </span>
            <span className="line-clamp-1 w-full text-[11px] font-semibold text-[#0969da] bg-[#ddf4ff] px-2 py-0.5 rounded-sm">
              {product.category_name || "General"}
            </span>
          </div>
        </div>

        <div className="w-full mt-auto pt-2">
          <Button
            onClick={() => onAddToCart(product.product_id)}
            fullWidth
            variant="outline"
            disabled={product.stock_quantity <= 0}
            className="py-2 text-[11px] font-bold border-[#d0d7de] hover:bg-[#f6f8fa] h-9"
          >
            <ShoppingCart className="w-3.5 h-3.5 mr-2" />
            Add to Cart
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
