import React from 'react';
import Button from './Button';
import { ShoppingCart } from 'lucide-react';

const ProductCard = ({ product, onAddToCart }) => {
  return (
    <div className="bg-surface rounded-xl shadow-sm hover:shadow-lg transition-shadow duration-300 border border-gray-100 overflow-hidden flex flex-col group animate-fade-in">
      {/* Product Image */}
      <div className="h-56 bg-gray-100 flex items-center justify-center overflow-hidden relative">
        {product.image_url ? (
          <img 
            src={product.image_url} 
            alt={product.name} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
          />
        ) : (
          <span className="text-gray-400 font-medium">No Image Available</span>
        )}
        {/* Stock Badge */}
        {product.stock_quantity <= 0 && (
          <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
            Out of Stock
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-5 flex flex-col flex-grow">
        <h3 className="text-lg font-bold text-gray-800 mb-1 truncate" title={product.name}>
          {product.name}
        </h3>
        <p className="text-2xl font-extrabold text-primary-600 mb-3">
          ${product.price.toFixed(2)}
        </p>
        <p className="text-sm text-gray-500 mb-6 line-clamp-2 flex-grow" title={product.description}>
          {product.description}
        </p>
        
        {/* Add to Cart Button */}
        <Button 
          onClick={() => onAddToCart(product.product_id)} 
          fullWidth 
          disabled={product.stock_quantity <= 0}
          className="mt-auto flex justify-center items-center"
        >
          <ShoppingCart className="w-4 h-4 mr-2" /> 
          Add to Cart
        </Button>
      </div>
    </div>
  );
};

export default ProductCard;