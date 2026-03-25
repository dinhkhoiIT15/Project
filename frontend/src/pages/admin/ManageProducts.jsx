import React from "react";
import Button from "../../components/common/Button";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import ProductDialog from "../../components/common/ProductDialog";
import { PlusCircle, List, Edit, Trash2, Package } from "lucide-react";
import Pagination from "../../components/common/Pagination";
import useManageProducts from "../../hooks/admin/useManageProducts";

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
    handleRemoveSpec,
    availableContext,
    isModalOpen,
    setIsModalOpen,
    specSearch,
    setSpecSearch,
    filteredSpecs
  } = useManageProducts();

  return (
    <div className="animate-fade-in">
      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Product?"
        message="This will permanently remove the item from your inventory. Proceed?"
      />

      <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-black text-[#1f2328] tracking-tight">
          Manage Products
        </h1>
      </div>

      <div className="flex flex-col gap-8">
        {/* Danh sách Inventory MỚI HIỂN THỊ FULL WIDTH */}
        <div className="flex flex-col gap-6 w-full">
          <div className="bg-white rounded-xl shadow-sm border border-[#d0d7de] p-6 flex flex-col gap-6">
            <div className="flex items-center justify-between border-b border-[#d0d7de] pb-4">
              <div className="flex items-center gap-2">
                <List className="text-[#0969da]" size={24} />
                <h2 className="text-xl font-bold text-[#1f2328]">
                  Inventory List
                </h2>
              </div>
              <Button 
                onClick={() => { resetForm(); setIsModalOpen(true); }} 
                className="gap-2 shadow-sm"
              >
                <PlusCircle size={18} />
                Add New Product
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b-2 border-[#d0d7de] text-[#6e7781] text-xs uppercase tracking-wider">
                    <th className="p-4 font-bold">Product</th>
                    <th className="p-4 font-bold">Category</th>
                    <th className="p-4 font-bold">Price</th>
                    <th className="p-4 font-bold">Stock</th>
                    <th className="p-4 font-bold">Status</th>
                    <th className="p-4 font-bold text-center w-24">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#d0d7de]">
                  {products.map((p) => (
                    <tr
                      key={p.product_id}
                      className="hover:bg-[#f6f8fa] transition-colors"
                    >
                      <td className="p-4 flex items-center gap-3">
                        <div className="w-8 h-8 rounded border bg-[#f6f8fa] overflow-hidden flex-shrink-0">
                          <img
                            src={p.image_url || "https://res.cloudinary.com/subframe/image/upload/v1723780577/uploads/302/hhmv6ey0yajkadnmcp0a.png"}
                            className="w-full h-full object-cover"
                            alt={p.name}
                          />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span
                            className="font-bold text-sm text-[#1f2328] truncate max-w-[200px]"
                            title={p.name}
                          >
                            {p.name}
                          </span>
                          {p.sku && (
                             <span className="text-[10px] text-[#6e7781] font-mono">SKU: {p.sku}</span>
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-sm text-[#1f2328] font-medium">
                        {p.category_name}
                      </td>
                      <td className="p-4 text-sm font-black text-[#1f2328]">
                        ${p.price.toFixed(2)}
                      </td>
                      <td className="p-4 text-sm font-bold">
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            p.stock_quantity > 0
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {p.stock_quantity} in stock
                        </span>
                      </td>
                      <td className="p-4">
                         {p.is_active !== false ? (
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

      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Product"
        message="Are you sure you want to delete this product? This action cannot be undone."
      />

      {/* MỚI: Truyền dữ liệu sang Popup */}
      <ProductDialog
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); resetForm(); }}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleSubmit}
        loading={loading}
        editingId={editingId}
        categories={categories}
        handleGenerateDescription={handleGenerateDescription}
        isGenerating={isGenerating}
        availableContext={availableContext}
        handleAddSpec={handleAddSpec}
        handleUpdateSpec={handleUpdateSpec}
        handleRemoveSpec={handleRemoveSpec}
        specSearch={specSearch}
        setSpecSearch={setSpecSearch}
        filteredSpecs={filteredSpecs}
      />
    </div>
    </div>
  );
};

export default ManageProducts;
