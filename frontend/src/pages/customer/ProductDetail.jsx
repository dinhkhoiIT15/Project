import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import Button from '../../components/common/Button';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Loader2, AlertCircle, ShoppingCart, ArrowLeft, CheckCircle, Package } from 'lucide-react';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { addToast } = useToast();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await api.get(`/products/${id}`);
        setProduct(response.data.product);
      } catch (err) { addToast('Product not found', 'error'); }
      finally { setLoading(false); }
    };
    fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    if (!localStorage.getItem('token')) {
      addToast('Please login first!', 'info');
      navigate(location.pathname, { state: { openLogin: true }, replace: true });
      return; 
    }
    setAddingToCart(true);
    try {
      await api.post('/cart', { product_id: product.product_id, quantity });
      addToast('Added to cart successfully!', 'success');
    } catch (err) { addToast('Error adding to cart', 'error'); }
    finally { setAddingToCart(false); }
  };

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-primary-500" size={40} /></div>;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-10">
        <button onClick={() => navigate('/')} className="flex items-center text-gray-500 hover:text-primary-600 mb-8 font-bold transition-colors">
          <ArrowLeft className="mr-2" size={20} /> Back to Shopping
        </button>
        <div className="bg-surface rounded-2xl shadow-sm border overflow-hidden flex flex-col lg:flex-row">
          <div className="lg:w-1/2 p-10 bg-gray-50 flex items-center justify-center">
            <img src={product?.image_url} alt="" className="max-h-[400px] object-contain mix-blend-multiply" />
          </div>
          <div className="lg:w-1/2 p-10 flex flex-col">
            <span className="text-primary-600 font-bold uppercase text-sm mb-2">{product?.category_name}</span>
            <h1 className="text-4xl font-black text-gray-900 mb-4">{product?.name}</h1>
            <p className="text-3xl font-bold text-primary-600 mb-6">${product?.price.toFixed(2)}</p>
            <p className="text-gray-600 mb-8 leading-relaxed">{product?.description}</p>
            
            <div className="mt-auto pt-8 border-t">
              <div className="flex items-center gap-4 mb-6">
                <div className="flex border rounded-lg overflow-hidden">
                  <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="px-4 py-2 bg-gray-100 hover:bg-gray-200">-</button>
                  <span className="px-6 py-2 font-bold">{quantity}</span>
                  <button onClick={() => setQuantity(q => q + 1)} className="px-4 py-2 bg-gray-100 hover:bg-gray-200">+</button>
                </div>
                <span className="text-green-600 font-bold">{product?.stock_quantity} available</span>
              </div>
              <Button onClick={handleAddToCart} fullWidth isLoading={addingToCart} className="py-4 text-lg">
                <ShoppingCart className="mr-2" size={20} /> Add to Cart
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProductDetail;