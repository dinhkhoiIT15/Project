import React from "react";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import Pagination from "../../components/common/Pagination";
import { Tags, PlusCircle, Edit, Trash2, X } from "lucide-react";
import useManageCategories from "../../hooks/admin/useManageCategories";
import useDocumentTitle from "../../hooks/app/useDocumentTitle";

const ManageCategories = () => {
  const {
    categories,
    formData,
    setFormData,
    editingId,
    loading,
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
    totalPages
  } = useManageCategories();

  useDocumentTitle("Categories");

  return (
    <div className="animate-fade-in">
      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Category?"
        message="Are you sure you want to permanently remove this category? All linked data might be affected."
      />

      <div className="flex items-center justify-between mb-8 pb-4 border-b border-[#d0d7de]">
        <div className="flex items-center">
          <Tags className="w-6 h-6 text-[#6e7781] mr-3" />
          <h1 className="text-2xl font-bold text-[#1f2328]">Manage Categories</h1>
        </div>
        <Button onClick={() => { resetForm(); setIsModalOpen(true); }} className="px-4 py-2">
          <PlusCircle size={18} className="mr-2" /> Add Category
        </Button>
      </div>

      <div className="bg-white rounded-lg border border-[#d0d7de] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#f6f8fa] text-[#6e7781] text-[11px] uppercase font-bold border-b border-[#d0d7de]">
              <tr>
                <th className="p-4">ID</th>
                <th className="p-4">Category Name</th>
                <th className="p-4">Description</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#d0d7de]">
              {categories.map((cat) => (
                <tr key={cat.category_id} className="hover:bg-[#f6f8fa] transition-colors">
                  <td className="p-4 font-mono text-xs">#{cat.category_id}</td>
                  <td className="p-4 font-bold text-[#0969da]">{cat.name}</td>
                  <td className="p-4 text-sm text-[#6e7781] truncate max-w-md">{cat.description || "N/A"}</td>
                  <td className="p-4 text-center">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => handleEdit(cat)}
                        className="p-1.5 text-[#6e7781] hover:text-[#0969da] hover:bg-white rounded border border-transparent hover:border-[#d0d7de] transition-all"
                        title="Edit"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => initiateDelete(cat.category_id)}
                        className="p-1.5 text-[#6e7781] hover:text-[#cf222e] hover:bg-white rounded border border-transparent hover:border-[#d0d7de] transition-all"
                        title="Delete"
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
        
        <div className="flex justify-end mt-2 p-4"> 
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1f2328]/50 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-xl bg-white rounded-xl shadow-2xl flex flex-col my-auto animate-fade-in-up">
            <div className="flex w-full items-center justify-between px-6 py-4 border-b border-[#d0d7de] shrink-0">
              <h2 className="text-xl font-black text-[#1f2328]">
                {editingId ? "Edit Category" : "Add New Category"}
              </h2>
              <button
                type="button"
                onClick={() => { setIsModalOpen(false); resetForm(); }}
                className="p-2 text-[#6e7781] hover:text-[#cf222e] hover:bg-[#ffebe9] rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col">
              <div className="p-6 flex flex-col gap-4">
                <Input
                  label="Category Name"
                  name="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
                <div className="flex flex-col w-full">
                  <label className="mb-1.5 text-xs font-bold text-[#1f2328] uppercase tracking-wide">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="px-3 py-2 w-full border border-[#d0d7de] rounded-md text-sm transition-all duration-200 outline-none focus:border-[#0969da] focus:ring-3 focus:ring-[#0969da]/20 min-h-[120px] resize-y"
                    placeholder="Category description..."
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#d0d7de] bg-[#f6f8fa] rounded-b-xl shrink-0">
                <Button type="button" variant="outline" onClick={() => { setIsModalOpen(false); resetForm(); }} className="px-6 h-[38px]">
                  Cancel
                </Button>
                <Button type="submit" isLoading={loading} className="px-8 shadow-sm h-[38px]">
                  {editingId ? "Save Changes" : "Create Category"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageCategories;