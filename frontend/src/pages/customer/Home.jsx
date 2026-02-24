import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import ProductCard from '../../components/common/ProductCard';
import api from '../../services/api';
import { Loader2, AlertCircle, Search, Filter } from 'lucide-react';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // State lưu trữ dữ liệu tìm kiếm và bộ lọc
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    fetchCategories();
    fetchProducts();
    // eslint-disable-next-line
  }, []);

  // Gọi lại API lấy sản phẩm mỗi khi đổi danh mục
  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line
  }, [selectedCategory]);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      setCategories(res.data.categories || []);
    } catch (err) {
      console.error("Failed to load categories", err);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      // Nối thêm Query Parameters vào URL
      let url = '/products?';
      if (searchTerm) url += `search=${searchTerm}&`;
      if (selectedCategory) url += `category_id=${selectedCategory}`;
      
      const response = await api.get(url);
      setProducts(response.data.products || []);
      setError('');
    } catch (err) {
      setError('Failed to load products. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Submit form tìm kiếm (ấn Enter hoặc nút Search)
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchProducts();
  };

  const handleAddToCart = async (productId) => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return; 
    }
    try {
      await api.post('/cart', { product_id: productId, quantity: 1 });
      alert('Product added to cart successfully!'); 
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add product to cart');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8 text-center bg-gradient-to-r from-primary-900 to-primary-600 rounded-2xl p-10 shadow-lg text-white">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 animate-fade-in">
            Discover AI-Powered Products
          </h1>
          <p className="text-lg md:text-xl text-primary-100 max-w-2xl mx-auto">
            Explore the best curated items tailored specifically for you.
          </p>
        </div>

        {/* --- THANH TÌM KIẾM VÀ LỌC SẢN PHẨM --- */}
        <div className="bg-surface p-4 rounded-xl shadow-sm border border-gray-100 mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
          
          <form onSubmit={handleSearchSubmit} className="relative w-full md:w-1/2">
            <input 
              type="text" 
              placeholder="Search products by name..." 
              className="w-full pl-11 pr-24 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 bg-gray-50 transition-all text-gray-700 font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-4 top-3.5 text-gray-400 w-5 h-5" />
            <button type="submit" className="absolute right-2 top-2 bg-primary-600 text-white px-5 py-1.5 rounded-lg text-sm font-bold hover:bg-primary-700 transition-colors shadow-sm">
              Search
            </button>
          </form>

          <div className="relative w-full md:w-1/3">
            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
              <Filter className="w-5 h-5 text-gray-400" />
            </div>
            <select
              className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 bg-gray-50 appearance-none text-gray-700 font-medium cursor-pointer"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat.category_id} value={cat.category_id}>{cat.name}</option>
              ))}
            </select>
          </div>

        </div>
        {/* --- KẾT THÚC THANH TÌM KIẾM --- */}

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
            <p className="text-xl text-gray-500 font-medium">No products found.</p>
            <p className="text-gray-400 mt-2">Try adjusting your search or filters!</p>
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