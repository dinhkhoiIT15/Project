import React, { useState, useEffect } from 'react';
import Navbar from '../../components/layout/Navbar';
import ProductCard from '../../components/common/ProductCard';
import Pagination from '../../components/common/Pagination'; // MỚI IMPORT
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Loader2, Search } from 'lucide-react';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();
  
  // State phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  // Reset về trang 1 mỗi khi tìm kiếm hoặc lọc danh mục
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory]);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, currentPage]); // Gọi lại khi đổi trang

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      setCategories(res.data.categories || []);
    } catch (err) { console.error(err); }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      // Gửi tham số page và per_page=8 lên Backend
      const res = await api.get(`/products?search=${searchTerm}&category_id=${selectedCategory}&page=${currentPage}&per_page=8`);
      setProducts(res.data.products || []);
      setTotalPages(res.data.total_pages || 1);
    } catch (err) { addToast('Error loading products', 'error'); }
    finally { setLoading(false); }
  };

  const handleAddToCart = async (productId) => {
    if (!localStorage.getItem('token')) {
      addToast('Sign in to add to cart', 'info');
      return; 
    }
    try {
      await api.post('/cart', { product_id: productId, quantity: 1 });
      addToast('Product added to cart!', 'success');
    } catch (err) { addToast('Failed to add', 'error'); }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Banner Section */}
        <div className="mb-8 p-8 border border-[#d0d7de] rounded-lg bg-[#f6f8fa]">
          <h1 className="text-2xl font-bold text-[#1f2328] mb-2">Welcome to our online store</h1>
          <p className="text-[#6e7781] text-sm leading-relaxed">Browse and discover high-quality products curated for your needs.</p>
        </div>

        {/* Filter & Search Section */}
        <div className="flex flex-col md:flex-row gap-3 mb-8">
          <form onSubmit={(e) => {e.preventDefault(); setCurrentPage(1); fetchProducts();}} className="relative flex-grow">
            <Search className="absolute left-3 top-2.5 text-[#6e7781]" size={16} />
            <input 
              type="text" 
              placeholder="Search products..." 
              className="w-full pl-9 pr-4 py-1.5 bg-[#f6f8fa] border border-[#d0d7de] rounded-md text-sm focus:bg-white focus:border-[#0969da] focus:ring-3 focus:ring-[#0969da]/10 outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </form>
          <select
            className="bg-[#f6f8fa] border border-[#d0d7de] rounded-md px-3 py-1.5 text-sm font-semibold outline-none cursor-pointer hover:bg-[#eff1f3]"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map(cat => <option key={cat.category_id} value={cat.category_id}>{cat.name}</option>)}
          </select>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#0969da]" /></div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-[#d0d7de] rounded-lg text-[#6e7781]">No products found.</div>
        ) : (
          <>
            {/* Grid Sản phẩm hiển thị tối đa 8 item/trang */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {products.map(p => <ProductCard key={p.product_id} product={p} onAddToCart={handleAddToCart} />)}
            </div>

            {/* MỚI: Tích hợp Component phân trang */}
            <Pagination 
              currentPage={currentPage} 
              totalPages={totalPages} 
              onPageChange={(page) => {
                setCurrentPage(page);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }} 
            />
          </>
        )}
      </main>
    </div>
  );
};

export default Home;