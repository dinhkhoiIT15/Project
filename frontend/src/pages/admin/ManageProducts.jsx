import React, { useState, useEffect } from "react";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import api from "../../services/api";
import { useToast } from "../../context/ToastContext";
import {
  Package,
  PlusCircle,
  List,
  Sparkles,
  Edit,
  Trash2,
  X,
} from "lucide-react";
import Pagination from "../../components/common/Pagination";

const ManageProducts = () => {
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

  return (
    <div className="animate-fade-in">
      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Product?"
        message="This will permanently remove the item from your inventory. Proceed?"
      />

      <div className="flex items-center mb-8 pb-4 border-b border-[#d0d7de]">
        <Package className="w-6 h-6 text-[#6e7781] mr-3" />
        <h1 className="text-2xl font-bold text-[#1f2328]">Inventory</h1>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-lg border border-[#d0d7de] shadow-sm sticky top-4">
            <h2 className="text-sm font-bold text-[#1f2328] mb-4 uppercase flex items-center">
              {editingId ? (
                <Edit className="w-4 h-4 mr-2 text-[#0969da]" />
              ) : (
                <PlusCircle className="w-4 h-4 mr-2 text-[#1a7f37]" />
              )}
              {editingId ? "Edit" : "Add"}
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
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                  required
                />
                <Input
                  label="Stock"
                  type="number"
                  value={formData.stock_quantity}
                  onChange={(e) =>
                    setFormData({ ...formData, stock_quantity: e.target.value })
                  }
                  required
                />
              </div>
              <div className="flex flex-col mb-4">
                <label className="mb-1.5 text-xs font-bold text-[#1f2328] uppercase">
                  Category
                </label>
                <select
                  className="px-3 py-1.5 border border-[#d0d7de] rounded-md text-sm bg-white outline-none focus:border-[#0969da]"
                  value={formData.category_id}
                  onChange={(e) =>
                    setFormData({ ...formData, category_id: e.target.value })
                  }
                  required
                >
                  <option value="">Select...</option>
                  {categories.map((c) => (
                    <option key={c.category_id} value={c.category_id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <Input
                label="Image URL"
                value={formData.image_url}
                onChange={(e) =>
                  setFormData({ ...formData, image_url: e.target.value })
                }
              />
              <div className="flex gap-2 pt-2">
                <Button type="submit" fullWidth isLoading={loading}>
                  {editingId ? "Update" : "Save"}
                </Button>
                {editingId && (
                  <Button variant="outline" onClick={resetForm}>
                    <X size={18} />
                  </Button>
                )}
              </div>
            </form>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg border border-[#d0d7de] overflow-hidden shadow-sm text-sm">
            <table className="w-full text-left">
              <thead className="bg-[#f6f8fa] text-[#6e7781] text-[10px] uppercase font-bold border-b border-[#d0d7de]">
                <tr>
                  <th className="p-4">Item</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">Stock</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#d0d7de]">
                {products.map((p) => (
                  <tr key={p.product_id} className="hover:bg-[#f6f8fa]">
                    <td className="p-4 flex items-center gap-3">
                      <div className="w-8 h-8 rounded border bg-[#f6f8fa] overflow-hidden">
                        <img
                          src={p.image_url || ""}
                          className="w-full h-full object-cover"
                          alt=""
                        />
                      </div>
                      <span className="font-bold text-[#1f2328] line-clamp-1">
                        {p.name}
                      </span>
                    </td>
                    <td className="p-4 font-black">${p.price}</td>
                    <td className="p-4 font-mono">{p.stock_quantity}</td>
                    <td className="p-4 text-center">
                      <div className="flex justify-center gap-1">
                        <button
                          onClick={() => handleEdit(p)}
                          className="p-1.5 text-[#6e7781] hover:text-[#0969da]"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => initiateDelete(p.product_id)}
                          className="p-1.5 text-[#6e7781] hover:text-[#cf222e]"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>
    </div>
  );
};

export default ManageProducts;
