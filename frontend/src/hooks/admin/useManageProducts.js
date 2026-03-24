import { useState, useEffect } from "react";
import api from "../../services/api";
import { useToast } from "../../context/ToastContext";

const useManageProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    category_id: "",
    stock_quantity: "0",
    image_url: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  const { addToast } = useToast();

  useEffect(() => {
    fetchInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  const fetchInitialData = async () => {
    try {
      const [catRes, prodRes] = await Promise.all([
        api.get("/categories"),
        api.get("/products", { params: { page: currentPage } }),
      ]);
      setCategories(catRes.data.categories || []);
      setProducts(prodRes.data.products || []);
      setTotalPages(prodRes.data.total_pages || 1);
    } catch (err) {
      addToast("Fetch error", "error");
    }
  };

  const initiateDelete = (id) => {
    setProductToDelete(id);
    setIsConfirmOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/products/${productToDelete}`);
      setProducts(products.filter((p) => p.product_id !== productToDelete));
      addToast("Product deleted", "info");
    } catch (err) {
      addToast("Delete failed", "error");
    } finally {
      setIsConfirmOpen(false);
    }
  };

  const handleEdit = (p) => {
    setEditingId(p.product_id);
    setFormData({
      name: p.name,
      price: p.price.toString(),
      category_id: p.category_id.toString(),
      stock_quantity: p.stock_quantity.toString(),
      image_url: p.image_url || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const payload = {
      ...formData,
      price: parseFloat(formData.price),
      category_id: parseInt(formData.category_id),
      stock_quantity: parseInt(formData.stock_quantity),
    };

    try {
      if (editingId) {
        await api.put(`/products/${editingId}`, payload);
        addToast("Product updated!", "success");
      } else {
        await api.post("/products", payload);
        addToast("Product created!", "success");
      }
      resetForm();
      fetchInitialData();
    } catch (err) {
      addToast("Operation failed", "error");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      name: "",
      price: "",
      category_id: "",
      stock_quantity: "0",
      image_url: "",
    });
  };

  return {
    products,
    categories,
    formData,
    setFormData,
    editingId,
    loading,
    currentPage,
    setCurrentPage,
    totalPages,
    isConfirmOpen,
    setIsConfirmOpen,
    initiateDelete,
    confirmDelete,
    handleEdit,
    handleSubmit,
    resetForm,
  };
};

export default useManageProducts;