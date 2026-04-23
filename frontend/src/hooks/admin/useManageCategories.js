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

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const { addToast } = useToast();

  useEffect(() => {
    fetchCategories();
  }, [currentPage]); 

  const fetchCategories = async () => {
    try {
      const res = await api.get("/categories", {
        params: { page: currentPage }
      });
      setCategories(res.data.categories || []);
      setTotalPages(res.data.total_pages || 1);
    } catch (err) {
      addToast("Error loading categories", "error");
    } finally {
      setFetchLoading(false);
    }
  };

  const handleEdit = (cat) => {
    setEditingId(cat.category_id);
    setFormData({ name: cat.name, description: cat.description || "" });
    setIsModalOpen(true); 
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
        fetchCategories(); 
      } else {
        await api.post("/categories", formData);
        addToast("Category created successfully!", "success");
        setCurrentPage(1); 
        fetchCategories(); 
      }
      resetForm();
      setIsModalOpen(false); 
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
    isModalOpen,
    setIsModalOpen,
    currentPage,
    setCurrentPage,
    totalPages,
  };
};

export default useManageCategories;