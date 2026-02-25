import React, { useState, useEffect } from "react";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import ConfirmDialog from "../../components/common/ConfirmDialog"; // MỚI
import api from "../../services/api";
import { useToast } from "../../context/ToastContext";
import { Tags, PlusCircle, List, Edit, Trash2, X } from "lucide-react";

const ManageCategories = () => {
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({ name: "", description: "" });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);

  // State cho Confirm Dialog
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);

  const { addToast } = useToast();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await api.get("/categories");
      setCategories(res.data.categories || []);
    } catch (err) {
      addToast("Error loading categories", "error");
    } finally {
      setFetchLoading(false);
    }
  };

  const handleEdit = (cat) => {
    setEditingId(cat.category_id);
    setFormData({ name: cat.name, description: cat.description || "" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Mở Dialog thay vì gọi window.confirm
  const initiateDelete = (id) => {
    setCategoryToDelete(id);
    setIsConfirmOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/categories/${categoryToDelete}`);
      addToast("Category deleted", "success");
      fetchCategories();
    } catch (err) {
      addToast(err.response?.data?.message || "Delete failed", "error");
    } finally {
      setIsConfirmOpen(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingId) {
        await api.put(`/categories/${editingId}`, formData);
        addToast("Category updated successfully!", "success");
      } else {
        await api.post("/categories", formData);
        addToast("Category created successfully!", "success");
      }
      resetForm();
      fetchCategories();
    } catch (err) {
      addToast(err.response?.data?.message || "Action failed", "error");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ name: "", description: "" });
    setEditingId(null);
  };

  return (
    <div className="animate-fade-in">
      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Category?"
        message="Are you sure you want to permanently remove this category? All linked data might be affected."
      />

      <div className="flex items-center mb-8 pb-4 border-b border-[#d0d7de]">
        <Tags className="w-6 h-6 text-[#6e7781] mr-3" />
        <h1 className="text-2xl font-bold text-[#1f2328]">Manage Categories</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-lg border border-[#d0d7de] shadow-sm sticky top-4">
            <h2 className="text-sm font-bold text-[#1f2328] mb-4 uppercase tracking-wider flex items-center">
              {editingId ? (
                <Edit className="w-4 h-4 mr-2 text-[#0969da]" />
              ) : (
                <PlusCircle className="w-4 h-4 mr-2 text-[#1a7f37]" />
              )}
              {editingId ? "Edit Category" : "Add New Category"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
              <div className="flex flex-col">
                <label className="mb-1.5 text-xs font-bold text-[#1f2328] uppercase">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="px-3 py-2 border border-[#d0d7de] rounded-md text-sm focus:border-[#0969da] outline-none h-32 transition-all"
                  placeholder="Details..."
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" fullWidth isLoading={loading}>
                  {editingId ? "Save Changes" : "Create"}
                </Button>
                {editingId && (
                  <Button variant="outline" onClick={resetForm}>
                    <X size={16} />
                  </Button>
                )}
              </div>
            </form>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg border border-[#d0d7de] overflow-hidden shadow-sm">
            <div className="bg-[#f6f8fa] p-4 border-b border-[#d0d7de] flex items-center">
              <List className="w-4 h-4 mr-2 text-[#6e7781]" />
              <span className="text-sm font-bold text-[#1f2328]">
                Category List
              </span>
            </div>
            <div className="overflow-x-auto text-sm">
              <table className="w-full text-left">
                <thead className="bg-[#f6f8fa] text-[#6e7781] text-[10px] uppercase font-bold border-b border-[#d0d7de]">
                  <tr>
                    <th className="py-3 px-4">ID</th>
                    <th className="py-3 px-4">Name</th>
                    <th className="py-3 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#d0d7de]">
                  {categories.map((cat) => (
                    <tr
                      key={cat.category_id}
                      className="hover:bg-[#f6f8fa] transition-colors"
                    >
                      <td className="py-3 px-4 font-mono text-[#6e7781]">
                        #{cat.category_id}
                      </td>
                      <td className="py-3 px-4 font-bold text-[#0969da]">
                        {cat.name}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex justify-center gap-1">
                          <button
                            onClick={() => handleEdit(cat)}
                            className="p-1.5 text-[#6e7781] hover:text-[#0969da] hover:bg-white rounded border border-transparent hover:border-[#d0d7de]"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            onClick={() => initiateDelete(cat.category_id)}
                            className="p-1.5 text-[#6e7781] hover:text-[#cf222e] hover:bg-white rounded border border-transparent hover:border-[#d0d7de]"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
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
