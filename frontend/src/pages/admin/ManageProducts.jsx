import React, { useState, useEffect } from 'react';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import api from '../../services/api';
import { Package, PlusCircle, List, AlertCircle, Sparkles, Edit, Trash2, X, Image as ImageIcon } from 'lucide-react';

const ManageProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({ name: '', price: '', category_id: '', stock_quantity: '0', image_url: '' });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [aiText, setAiText] = useState('');

  useEffect(() => { fetchInitialData(); }, []);

  const fetchInitialData = async () => {
    try {
      const [catRes, prodRes] = await Promise.all([api.get('/categories'), api.get('/products')]);
      setCategories(catRes.data.categories || []);
      setProducts(prodRes.data.products || []);
    } catch (err) { console.error("Fetch error:", err); } finally { setFetchLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      // Gọi API DELETE với ID chính xác
      const res = await api.delete(`/products/${id}`);
      setProducts(products.filter(p => p.product_id !== id));
      setSuccessMsg(res.data.message);
      setErrorMsg('');
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Failed to delete product.");
    }
  };

  const handleEdit = (p) => {
    setEditingId(p.product_id);
    setFormData({
      name: p.name,
      price: p.price.toString(),
      category_id: p.category_id.toString(),
      stock_quantity: p.stock_quantity.toString(),
      image_url: p.image_url || ''
    });
    setSuccessMsg(''); setAiText('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setErrorMsg(''); setSuccessMsg('');

    // ÉP KIỂU DỮ LIỆU TRƯỚC KHI GỬI (QUAN TRỌNG)
    const payload = {
      name: formData.name,
      price: parseFloat(formData.price),
      category_id: parseInt(formData.category_id),
      stock_quantity: parseInt(formData.stock_quantity) || 0,
      image_url: formData.image_url
    };

    try {
      if (editingId) {
        // UPDATE (PUT)
        const res = await api.put(`/products/${editingId}`, payload);
        setSuccessMsg(res.data.message);
        setAiText(res.data.product?.description || '');
      } else {
        // CREATE (POST)
        const res = await api.post('/products', payload);
        setSuccessMsg(res.data.message);
        setAiText(res.data.product?.description || '');
      }
      
      // Reset form và load lại data
      setFormData({ name: '', price: '', category_id: '', stock_quantity: '0', image_url: '' });
      setEditingId(null);
      fetchInitialData();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Operation failed.");
    } finally { setLoading(false); }
  };

  return (
    <div className="p-4 animate-fade-in">
      <div className="flex items-center mb-6"><Package className="mr-2 text-primary-600" /> <h1 className="text-2xl font-bold">Products Management</h1></div>
      
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Form Section */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-fit sticky top-4">
          <h2 className="font-bold mb-4 flex items-center">{editingId ? <Edit className="mr-2" size={18}/> : <PlusCircle className="mr-2" size={18}/>} {editingId ? "Edit" : "Add"} Product</h2>
          
          {errorMsg && <div className="p-3 bg-red-50 text-red-600 rounded mb-4 text-sm font-medium">{errorMsg}</div>}
          {successMsg && <div className="p-3 bg-green-50 text-green-600 rounded mb-4 text-sm font-medium">{successMsg}</div>}
          {aiText && <div className="p-4 bg-primary-50 border border-primary-100 text-primary-800 rounded mb-4 text-xs italic"><Sparkles size={14} className="inline mr-1 text-primary-500"/> {aiText}</div>}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Product Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
            <div className="grid grid-cols-2 gap-4">
              <Input label="Price ($)" type="number" step="0.01" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} required />
              <Input label="Stock" type="number" value={formData.stock_quantity} onChange={e => setFormData({...formData, stock_quantity: e.target.value})} required />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Category</label>
              <select className="w-full p-2 border border-gray-300 rounded-lg bg-white mt-1 outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-500" value={formData.category_id} onChange={e => setFormData({...formData, category_id: e.target.value})} required>
                <option value="">Select Category...</option>
                {categories.map(c => <option key={c.category_id} value={c.category_id}>{c.name}</option>)}
              </select>
            </div>
            <Input label="Image URL" value={formData.image_url} onChange={e => setFormData({...formData, image_url: e.target.value})} placeholder="https://..." />
            <div className="flex gap-2 pt-2">
              <Button type="submit" fullWidth isLoading={loading}>{editingId ? "Update Product" : "Save Product"}</Button>
              {editingId && <Button variant="secondary" onClick={() => {setEditingId(null); setFormData({name:'',price:'',category_id:'',stock_quantity:'0',image_url:''})}}><X size={18}/></Button>}
            </div>
          </form>
        </div>

        {/* List Section */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="font-bold mb-4 flex items-center"><List className="mr-2" size={18}/> Inventory List</h2>
          {fetchLoading ? <p className="text-center py-10 text-gray-500 italic">Loading inventory data...</p> : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-500 uppercase text-[10px] tracking-wider font-bold">
                  <tr>
                    <th className="p-4">Preview</th>
                    <th className="p-4">Product Info</th>
                    <th className="p-4">Price</th>
                    <th className="p-4">Stock</th>
                    <th className="p-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {products.map(p => (
                    <tr key={p.product_id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="p-4">
                        <div className="w-12 h-12 rounded-lg border border-gray-100 overflow-hidden bg-gray-50 flex items-center justify-center shadow-sm">
                          {p.image_url ? <img src={p.image_url} alt="" className="w-full h-full object-cover" /> : <ImageIcon className="text-gray-300" size={18} />}
                        </div>
                      </td>
                      <td className="p-4 font-semibold text-gray-800">{p.name}</td>
                      <td className="p-4 text-primary-600 font-extrabold">${p.price}</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${p.stock_quantity > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {p.stock_quantity > 0 ? `In Stock (${p.stock_quantity})` : 'Out of Stock'}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex justify-center space-x-2">
                          <button onClick={() => handleEdit(p)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors" title="Edit"><Edit size={16}/></button>
                          <button onClick={() => handleDelete(p.product_id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Delete"><Trash2 size={16}/></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageProducts;