import React, { useState } from "react";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import {
  Package,
  PlusCircle,
  List,
  Sparkles,
  Edit,
  Trash2,
  X,
  Search // Import thêm icon Search
} from "lucide-react";
import Pagination from "../../components/common/Pagination";
import useManageProducts from "../../hooks/admin/useManageProducts";

// MỚI: Danh sách thông số kỹ thuật gợi ý cho Shop Công Nghệ
const COMMON_SPECS = [
  "RAM", "Storage (ROM)", "CPU / Chipset", "GPU", "Screen Size", "Screen Resolution", 
  "Screen Panel (OLED/IPS)", "Refresh Rate (Hz)", "Battery Capacity", "Charging Speed", 
  "Operating System", "Main Camera", "Front Camera", "Keyboard Switch", "Keyboard Layout", 
  "Connection Type", "Bluetooth Version", "Weight", "Dimensions", "Material", "Color Options", "Warranty"
];

const ManageProducts = () => {
  const {
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
    handleGenerateDescription,
    isGenerating,
    handleAddSpec,
    handleUpdateSpec,
    handleRemoveSpec
  } = useManageProducts();

  // MỚI: State cho ô tìm kiếm Specs
  const [specSearch, setSpecSearch] = useState("");

  // Lọc ra các từ khóa gợi ý chưa được thêm
  const filteredSpecs = COMMON_SPECS.filter(s => 
    s.toLowerCase().includes(specSearch.toLowerCase()) &&
    !Object.keys(formData.specifications || {}).includes(s)
  );

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
              {/* MỚI: Thêm SKU và Brand */}
              <div className="grid grid-cols-2 gap-3">
                <Input label="SKU (Barcode)" value={formData.sku} onChange={(e) => setFormData({ ...formData, sku: e.target.value })} />
                <Input label="Brand" value={formData.brand} onChange={(e) => setFormData({ ...formData, brand: e.target.value })} />
              </div>

              {/* MỚI: Thêm Discount Price vào cạnh Price */}
              <div className="grid grid-cols-3 gap-3">
                <Input
                  label="Price ($)" type="number" step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })} required
                />
                <Input
                  label="Discount ($)" type="number" step="0.01"
                  value={formData.discount_price}
                  onChange={(e) => setFormData({ ...formData, discount_price: e.target.value })}
                />
                <Input
                  label="Stock" type="number"
                  value={formData.stock_quantity}
                  onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })} required
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

              {/* MỚI: Khung AI Auto Generate */}
              <div className="space-y-3 p-3 bg-[#f6f8fa] border border-[#d0d7de] rounded-md">
                <Input
                  label="Keywords / Features (Optional)"
                  placeholder="e.g. OLED screen, 12h battery..."
                  value={formData.keywords}
                  onChange={(e) =>
                    setFormData({ ...formData, keywords: e.target.value })
                  }
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  fullWidth 
                  onClick={handleGenerateDescription}
                  disabled={isGenerating}
                  className="flex justify-center items-center text-[#0969da] border-[#0969da] hover:bg-blue-50"
                >
                  {isGenerating ? (
                     <div className="w-4 h-4 border-2 border-[#0969da] border-t-transparent rounded-full animate-spin mr-2" />
                  ) : (
                     <Sparkles size={16} className="mr-2" />
                  )}
                  {isGenerating ? "AI is generating..." : "✨ Auto Generate Description"}
                </Button>
              </div>

              {/* MỚI: Textarea cho Description */}
              <div className="flex flex-col mb-4">
                <label className="mb-1.5 text-xs font-bold text-[#1f2328] uppercase">
                  Description (HTML Supported)
                </label>
                <textarea
                  className="px-3 py-2 border border-[#d0d7de] rounded-md text-sm bg-white outline-none focus:border-[#0969da] min-h-[140px] resize-y"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  required
                />
              </div>

              {/* MỚI: Quản lý Thông số Kỹ thuật linh hoạt */}
              <div className="flex flex-col mb-4 bg-[#f6f8fa] p-3 border border-[#d0d7de] rounded-md">
                <label className="mb-3 text-xs font-bold text-[#1f2328] uppercase flex items-center justify-between">
                  Product Specifications
                  <span className="text-[10px] text-[#6e7781] font-normal normal-case">Optional</span>
                </label>

                {/* 1. Hiển thị các thông số đã chọn */}
                <div className="space-y-2 mb-3">
                  {Object.entries(formData.specifications || {}).map(([key, value]) => (
                    <div key={key} className="flex gap-2 items-center">
                      <div className="w-1/3 p-2 bg-white border border-[#d0d7de] rounded-md text-xs font-bold text-[#1f2328] truncate" title={key}>
                        {key}
                      </div>
                      <input
                        type="text"
                        placeholder={`Value for ${key}...`}
                        className="flex-1 px-3 py-1.5 border border-[#d0d7de] rounded-md text-sm outline-none focus:border-[#0969da] bg-white"
                        value={value}
                        onChange={(e) => handleUpdateSpec(key, e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveSpec(key)}
                        className="p-2 text-[#6e7781] hover:text-[#cf222e] hover:bg-[#ffebe9] rounded-md transition-colors"
                        title="Remove spec"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>

                {/* 2. Ô tìm kiếm và Gợi ý */}
                <div className="relative border-t border-[#d0d7de] pt-3">
                  <div className="flex items-center gap-2 mb-2 bg-white border border-[#d0d7de] rounded-md px-3 py-1.5 focus-within:border-[#0969da]">
                    <Search size={14} className="text-[#6e7781]" />
                    <input
                      type="text"
                      placeholder="Search to add specification (e.g., RAM)..."
                      className="flex-1 text-sm outline-none bg-transparent"
                      value={specSearch}
                      onChange={(e) => setSpecSearch(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && specSearch.trim()) {
                          e.preventDefault();
                          handleAddSpec(specSearch.trim());
                          setSpecSearch("");
                        }
                      }}
                    />
                  </div>

                  {/* Hiển thị các Badge gợi ý */}
                  <div className="flex flex-wrap gap-1.5">
                    {filteredSpecs.slice(0, 10).map(spec => (
                      <button
                        key={spec} type="button"
                        onClick={() => { handleAddSpec(spec); setSpecSearch(""); }}
                        className="text-[11px] font-bold bg-white border border-[#d0d7de] text-[#6e7781] px-2 py-1 rounded-full hover:border-[#0969da] hover:text-[#0969da] transition-colors shadow-sm"
                      >
                        + {spec}
                      </button>
                    ))}
                    
                    {/* Cho phép add thông số tùy chỉnh nếu gõ không có trong danh sách */}
                    {!filteredSpecs.includes(specSearch.trim()) && specSearch.trim() && (
                      <button
                        type="button"
                        onClick={() => { handleAddSpec(specSearch.trim()); setSpecSearch(""); }}
                        className="text-[11px] font-bold bg-[#dafbe1] text-[#1a7f37] border border-[#1a7f37]/30 px-2 py-1 rounded-full hover:bg-[#1a7f37] hover:text-white transition-colors"
                      >
                        + Add Custom "{specSearch}"
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* MỚI: Nút gạt Ẩn / Hiện sản phẩm */}
              <div className="flex items-center gap-2 mb-4 bg-white border border-[#d0d7de] p-3 rounded-md">
                <input
                  type="checkbox" id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4 cursor-pointer accent-[#1a7f37]"
                />
                <label htmlFor="is_active" className="text-sm font-bold text-[#1f2328] cursor-pointer">
                  Product is Active (Visible to customers)
                </label>
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
                  <tr key={p.product_id} className={`hover:bg-[#f6f8fa] transition-colors ${!p.is_active ? 'opacity-60 bg-gray-50' : ''}`}>
                    <td className="p-4 flex items-center gap-3">
                      <div className="w-8 h-8 rounded border bg-[#f6f8fa] overflow-hidden flex-shrink-0">
                        <img
                          src={p.image_url || ""}
                          className="w-full h-full object-cover"
                          alt=""
                        />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-[#1f2328] line-clamp-1">{p.name}</span>
                        {/* MỚI: Hiển thị Brand và SKU dưới tên sản phẩm */}
                        {(p.sku || p.brand) && (
                          <span className="text-[10px] text-[#6e7781] mt-0.5 font-mono">
                            {p.brand && <b className="uppercase">{p.brand}</b>} {p.brand && p.sku && "|"} {p.sku}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      {/* MỚI: Hiển thị Giá giảm và Giá gốc bị gạch ngang */}
                      {p.discount_price ? (
                        <div className="flex flex-col">
                          <span className="font-black text-[#cf222e]">${p.discount_price}</span>
                          <span className="text-[11px] text-[#6e7781] line-through">${p.price}</span>
                        </div>
                      ) : (
                        <span className="font-black text-[#1f2328]">${p.price}</span>
                      )}
                    </td>
                    <td className="p-4">
                       <span className="font-mono">{p.stock_quantity}</span>
                       <br/>
                       {/* MỚI: Nhãn trạng thái */}
                       {p.is_active ? (
                         <span className="text-[9px] bg-[#dafbe1] text-[#1a7f37] px-1.5 py-0.5 rounded uppercase font-bold">Active</span>
                       ) : (
                         <span className="text-[9px] bg-[#f6f8fa] border border-[#d0d7de] text-[#6e7781] px-1.5 py-0.5 rounded uppercase font-bold">Hidden</span>
                       )}
                    </td>
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
