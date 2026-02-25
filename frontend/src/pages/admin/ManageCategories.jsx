import React, { useState, useEffect } from 'react';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Tags, PlusCircle, List } from 'lucide-react';

const ManageCategories = () => {
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => { fetchCategories(); }, []);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      setCategories(res.data.categories || []);
    } catch (err) { addToast('Error loading categories', 'error'); }
    finally { setFetchLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/categories', formData);
      addToast('Category created successfully!', 'success');
      setFormData({ name: '', description: '' });
      fetchCategories();
    } catch (err) { addToast(err.response?.data?.message || 'Create failed', 'error'); }
    finally { setLoading(false); }
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center mb-8 pb-4 border-b border-[#d0d7de]">
        <Tags className="w-6 h-6 text-[#6e7781] mr-3" />
        <h1 className="text-2xl font-bold text-[#1f2328]">Manage Categories</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-lg border border-[#d0d7de] shadow-sm">
            <h2 className="text-sm font-bold text-[#1f2328] mb-4 uppercase tracking-wider flex items-center">
              <PlusCircle className="w-4 h-4 mr-2 text-[#1a7f37]" /> Add Category
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input label="Name" name="name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
              <div className="flex flex-col">
                <label className="mb-1.5 text-xs font-bold text-[#1f2328] uppercase">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className="px-3 py-2 border border-[#d0d7de] rounded-md text-sm focus:border-[#0969da] focus:ring-3 focus:ring-[#0969da]/10 outline-none h-32"
                />
              </div>
              <Button type="submit" fullWidth isLoading={loading}>Create</Button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg border border-[#d0d7de] overflow-hidden shadow-sm">
            <div className="bg-[#f6f8fa] p-4 border-b border-[#d0d7de] flex items-center">
              <List className="w-4 h-4 mr-2 text-[#6e7781]" />
              <span className="text-sm font-bold text-[#1f2328]">Existing Categories</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-[#f6f8fa] text-[#6e7781] text-[11px] uppercase font-bold border-b border-[#d0d7de]">
                  <tr><th className="py-3 px-4">ID</th><th className="py-3 px-4">Name</th><th className="py-3 px-4">Description</th></tr>
                </thead>
                <tbody className="divide-y divide-[#d0d7de]">
                  {categories.map((cat) => (
                    <tr key={cat.category_id} className="hover:bg-[#f6f8fa] transition-colors">
                      <td className="py-3 px-4 text-xs font-mono text-[#6e7781]">#{cat.category_id}</td>
                      <td className="py-3 px-4 text-sm font-bold text-[#0969da] hover:underline cursor-pointer">{cat.name}</td>
                      <td className="py-3 px-4 text-xs text-[#6e7781] italic">{cat.description || 'No description'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageCategories;