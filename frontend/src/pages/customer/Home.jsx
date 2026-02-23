import React, { useState, useEffect } from 'react';
import Navbar from '../../components/layout/Navbar';
import ProductCard from '../../components/common/ProductCard';
import api from '../../services/api';
import { Loader2, AlertCircle } from 'lucide-react';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await api.get('/products');
      setProducts(response.data.products || []);
    } catch (err) {
      setError('Failed to load products. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (productId) => {
    try {
      await api.post('/cart', { product_id: productId, quantity: 1 });
      alert('Product added to cart successfully!'); // Sau này ta sẽ đổi thành thông báo Toast đẹp hơn
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add product to cart');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Hero Banner Area */}
        <div className="mb-10 text-center bg-gradient-to-r from-primary-900 to-primary-600 rounded-2xl p-10 shadow-lg text-white">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 animate-fade-in">
            Discover AI-Powered Products
          </h1>
          <p className="text-lg md:text-xl text-primary-100 max-w-2xl mx-auto">
            Explore the best curated items tailored specifically for you by our intelligent system.
          </p>
        </div>

        {/* Content Area */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-10 h-10 animate-spin text-primary-500" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-64 text-red-500 bg-red-50 rounded-xl border border-red-100">
            <AlertCircle className="w-12 h-12 mb-3" />
            <p className="text-lg font-medium">{error}</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 bg-surface rounded-xl shadow-sm border border-gray-100">
            <p className="text-xl text-gray-500 font-medium">No products available yet.</p>
            <p className="text-gray-400 mt-2">Please check back later!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard 
                key={product.product_id} 
                product={product} 
                onAddToCart={handleAddToCart} 
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Home;