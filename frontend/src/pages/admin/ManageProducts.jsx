import React from "react";
import Button from "../../components/common/Button";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import ProductDialog from "../../components/common/AddProductDialog";
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
          <div className="bg-white rounded-xl shadow-sm border border-[#d0d7de] p-6 flex flex-col gap-4">
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
                  <tr className="border-b border-neutral-200">
                    <th className="px-4 py-3 text-[11px] font-bold text-neutral-500 uppercase tracking-wider">Product Name</th>
                    <th className="px-4 py-3 text-[11px] font-bold text-neutral-500 uppercase tracking-wider">Price</th>
                    <th className="px-4 py-3 text-[11px] font-bold text-neutral-500 uppercase tracking-wider">Stock</th>
                    <th className="px-4 py-3 text-[11px] font-bold text-neutral-500 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-[11px] font-bold text-neutral-500 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {products.map((p) => (
                    <tr key={p.product_id} className="hover:bg-neutral-50 transition-colors h-16">
                      
                      {/* CỘT 1: Product Info (Kết hợp Tên, Danh mục và SKU giống UI mới) */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-4">
                          <img
                            className="h-10 w-14 flex-none rounded-md object-cover border border-neutral-200"
                            src={p.image_url || "https://res.cloudinary.com/subframe/image/upload/v1723780577/uploads/302/hhmv6ey0yajkadnmcp0a.png"}
                            alt={p.name}
                          />
                          <div className="flex flex-col items-start min-w-0">
                            <span className="whitespace-nowrap text-sm font-bold text-neutral-900 truncate max-w-[250px]">
                              {p.name}
                            </span>
                            <span className="text-[11px] font-medium text-neutral-500 flex items-center gap-1.5 mt-0.5">
                              {p.category_name} 
                              {p.sku && (
                                <>
                                  <span className="w-1 h-1 rounded-full bg-neutral-300"></span>
                                  <span className="font-mono">{p.sku}</span>
                                </>
                              )}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* CỘT 2: Price Details (Kết hợp Giá gốc và Giá giảm) */}
                      <td className="px-4 py-3">
                        <div className="flex flex-col items-start">
                          {p.discount_price ? (
                            <>
                              <span className="whitespace-nowrap text-sm font-black text-red-600">
                                ${p.discount_price.toFixed(2)}
                              </span>
                              <span className="text-[11px] font-medium text-neutral-400 line-through mt-0.5">
                                ${p.price.toFixed(2)}
                              </span>
                            </>
                          ) : (
                            <span className="whitespace-nowrap text-sm font-black text-neutral-900">
                              ${p.price.toFixed(2)}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* CỘT 3: Stock Quantity */}
                      <td className="px-4 py-3">
                         <span className={`whitespace-nowrap text-sm font-bold ${p.stock_quantity > 0 ? 'text-neutral-700' : 'text-red-500'}`}>
                          {p.stock_quantity}
                        </span>
                      </td>

                      {/* CỘT 4: Status */}
                      <td className="px-4 py-3">
                        {p.is_active !== false ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-green-100 text-green-700">
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-neutral-100 text-neutral-600 border border-neutral-200">
                            Hidden
                          </span>
                        )}
                      </td>

                      {/* CỘT 5: Actions */}
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleEdit(p)}
                            className="p-1.5 text-neutral-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => initiateDelete(p.product_id)}
                            className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
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

            {/* MỚI: Bọc Pagination trong một div để căn lề phải và giảm margin-top */}
            <div className="flex justify-end mt-2"> 
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
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
