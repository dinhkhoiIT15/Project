import { useState, useEffect } from "react";
import api from "../../services/api";
import { useToast } from "../../context/ToastContext";

const useManageCategories = () => {
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({ name: "", description: "" });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);

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

  return {
    categories,
    formData,
    setFormData,
    editingId,
    loading,
    fetchLoading,
    isConfirmOpen,
    setIsConfirmOpen,
    handleEdit,
    initiateDelete,
    confirmDelete,
    handleSubmit,
    resetForm,
  };
};

export default useManageCategories;