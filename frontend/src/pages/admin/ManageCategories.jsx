import React, { useState, useEffect } from 'react';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import api from '../../services/api';
import { Tags, PlusCircle, List, AlertCircle } from 'lucide-react';

const ManageCategories = () => {
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Tự động tải danh sách Category khi mở trang
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories');
      setCategories(response.data.categories || []);
    } catch (error) {
      console.error("Failed to fetch categories", error);
    } finally {
      setFetchLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrorMsg('');
    setSuccessMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.post('/categories', formData);
      setSuccessMsg(response.data.message || 'Category created successfully!');
      setFormData({ name: '', description: '' }); // Xóa form sau khi thêm thành công
      fetchCategories(); // Tải lại danh sách
    } catch (error) {
      setErrorMsg(error.response?.data?.message || 'Failed to create category.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center mb-8">
        <Tags className="w-8 h-8 text-primary-600 mr-3" />
        <h1 className="text-3xl font-bold text-gray-800">Manage Categories</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cột trái: Form thêm Category */}
        <div className="lg:col-span-1">
          <div className="bg-surface p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <PlusCircle className="w-5 h-5 mr-2 text-primary-500" />
              Add New Category
            </h2>
            
            {errorMsg && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm flex items-start"><AlertCircle className="w-4 h-4 mr-2 mt-0.5" />{errorMsg}</div>}
            {successMsg && <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg text-sm">{successMsg}</div>}

            <form onSubmit={handleSubmit}>
              <Input 
                label="Category Name" 
                name="name" 
                value={formData.name} 
                onChange={handleChange} 
                placeholder="e.g. Laptops, Smartphones..." 
                required 
              />
              <div className="mb-4">
                <label className="mb-1 text-sm font-medium text-gray-700 block">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Short description about this category..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-500 transition-all bg-surface"
                  rows="4"
                ></textarea>
              </div>
              
              <Button type="submit" fullWidth isLoading={loading}>
                Create Category
              </Button>
            </form>
          </div>
        </div>

        {/* Cột phải: Danh sách Category */}
        <div className="lg:col-span-2">
          <div className="bg-surface p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <List className="w-5 h-5 mr-2 text-primary-500" />
              Existing Categories
            </h2>
            
            {fetchLoading ? (
              <div className="text-center py-8 text-gray-500">Loading categories...</div>
            ) : categories.length === 0 ? (
              <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
                No categories found. Please add your first category.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 text-sm">
                      <th className="py-3 px-4 font-semibold">ID</th>
                      <th className="py-3 px-4 font-semibold">Name</th>
                      <th className="py-3 px-4 font-semibold">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.map((cat) => (
                      <tr key={cat.category_id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-4 font-medium text-gray-500">#{cat.category_id}</td>
                        <td className="py-3 px-4 font-semibold text-gray-800">{cat.name}</td>
                        <td className="py-3 px-4 text-gray-600 text-sm">{cat.description || <span className="text-gray-400 italic">No description</span>}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageCategories;