import React from "react";
import Input from "./Input";
import Button from "./Button";
import { X, Sparkles, PlusCircle, Trash2, Search } from "lucide-react";

const AddProductDialog = ({
  isOpen,
  onClose,
  formData,
  setFormData,
  onSubmit,
  loading,
  editingId,
  categories,
  handleGenerateDescription,
  isGenerating,
  availableContext,
  handleAddSpec,
  handleUpdateSpec,
  handleRemoveSpec,
  specSearch,
  setSpecSearch,
  filteredSpecs,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1f2328]/50 backdrop-blur-sm overflow-y-auto">
      {/* Mở rộng cực đại để các cột được dàn ngang, tránh bị cuộn */}
      <div className="relative w-full max-w-[1300px] bg-white rounded-xl shadow-2xl flex flex-col my-auto max-h-[95vh] animate-fade-in-up">
        {/* Header */}
        <div className="flex w-full items-center justify-between px-6 py-4 border-b border-[#d0d7de] shrink-0">
          <h2 className="text-xl font-black text-[#1f2328]">
            {editingId ? "Edit Product" : "Add New Product"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-[#6e7781] hover:text-[#1f2328] hover:bg-[#f6f8fa] rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form id="product-form" onSubmit={onSubmit} className="flex flex-col flex-1 overflow-hidden">
          {/* Scrollable Content Area */}
          {/* Giảm padding p-8 xuống p-6 để tiết kiệm không gian */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="flex flex-col md:flex-row w-full gap-8 items-start">
              
              {/* COLUMN 1: Basic Information */}
              <div className="flex w-full md:w-1/2 flex-col gap-5">
                
                <Input
                  label="Product Name"
                  placeholder="e.g. iPhone 15 Pro Max"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-[#1f2328] uppercase">Category</label>
                  <select
                    className="w-full px-3 py-2 border border-[#d0d7de] rounded-md text-sm bg-white outline-none focus:border-[#0969da] h-[38px]"
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                    required
                  >
                    <option value="">Select Category...</option>
                    {categories.map((cat) => (
                      <option key={cat.category_id} value={cat.category_id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="SKU (Auto Generated)"
                    value={formData.sku}
                    readOnly
                    disabled
                    tabIndex={-1}
                    className="bg-[#f6f8fa] text-[#0969da] font-mono font-black tracking-widest cursor-not-allowed border-dashed pointer-events-none select-none opacity-80"
                    title="SKU is automatically generated to ensure uniqueness"
                  />
                  <div className="flex flex-col w-full gap-1.5">
                    <label className="text-xs font-bold text-[#1f2328] uppercase">Brand</label>
                    <select
                      className="w-full px-3 py-2 border border-[#d0d7de] rounded-md text-sm bg-white outline-none focus:border-[#0969da] h-[38px]"
                      value={formData.brand}
                      onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    >
                      <option value="">Select Brand...</option>
                      {availableContext.brands.map((b) => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Price ($)"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                  />
                  <Input
                    label="Discount Price ($)"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="Optional"
                    value={formData.discount_price}
                    onChange={(e) => setFormData({ ...formData, discount_price: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Stock Quantity"
                    type="number"
                    min="0"
                    value={formData.stock_quantity}
                    onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                    required
                  />
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-[#1f2328] uppercase">Status</label>
                    <div className="flex items-center h-[38px] px-3 border border-[#d0d7de] rounded-md bg-white">
                      <label className="flex items-center cursor-pointer gap-2 w-full">
                        <input
                          type="checkbox"
                          className="w-4 h-4 text-[#0969da] rounded border-[#d0d7de] focus:ring-[#0969da]"
                          checked={formData.is_active}
                          onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                        />
                        <span className="text-sm text-[#1f2328] font-medium">Visible in store</span>
                      </label>
                    </div>
                  </div>
                </div>

                <Input
                  label="Image URL"
                  placeholder="https://example.com/image.png"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                />
              </div>

              {/* COLUMN 2: Media, Content & Specs */}
              <div className="flex w-full md:w-1/2 flex-col gap-5">
                
                {/* Khối AI Keywords - Sử dụng items-end để nút Button bám sát đáy của Input */}
                <div className="flex items-end gap-2 w-full">
                  <div className="flex-1">
                    <Input
                      label="AI Keywords (Optional)"
                      placeholder="e.g. powerful, sleek design, long battery..."
                      value={formData.keywords}
                      onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleGenerateDescription}
                    isLoading={isGenerating}
                    className="h-[38px] flex items-center justify-center whitespace-nowrap px-4 shadow-sm"
                  >
                    {!isGenerating && <Sparkles size={16} className="mr-2" />}
                    Auto Generate
                  </Button>
                </div>

                {/* Khối Description */}
                {/* Thêm flex-1 để khối này giãn ra lấp đầy khoảng trống dọc */}
                <div className="flex flex-col gap-1.5 flex-1">
                  <label className="text-xs font-bold text-[#1f2328] uppercase">Description</label>
                  <textarea
                    // Thay đổi min-h-[160px] thành h-full và thay đổi resize-y thành resize-none nếu bạn không muốn người dùng thay đổi kích thước thủ công, 
                    // hoặc sử dụng min-h-[140px] nếu bạn muốn một giá trị cố định gần đúng.
                    className="w-full h-full min-h-[120px] px-3 py-2 border border-[#d0d7de] rounded-md text-sm outline-none focus:border-[#0969da] resize-none"
                    placeholder="Product description will appear here..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                {/* Khối Specifications */}
                <div className="flex flex-col gap-3 mt-2">
                  <div className="flex flex-col gap-1 border-b border-[#d0d7de] pb-2">
                    <span className="text-lg font-bold text-[#1f2328]">Specifications</span>
                  </div>

                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6e7781]" size={14} />
                    <input
                      type="text"
                      placeholder="Search specifications to add..."
                      className="w-full pl-8 pr-3 py-2 border border-[#d0d7de] rounded-md text-sm outline-none focus:border-[#0969da] bg-[#f6f8fa] h-[38px]"
                      value={specSearch}
                      onChange={(e) => setSpecSearch(e.target.value)}
                    />
                  </div>

                  <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto">
                    {filteredSpecs.map(spec => (
                      <button
                        key={spec}
                        type="button"
                        onClick={() => {
                          handleAddSpec(spec);
                          setSpecSearch("");
                        }}
                        className="flex items-center gap-1 px-2 py-1 bg-white border border-[#d0d7de] rounded-md text-xs font-bold text-[#1f2328] hover:border-[#0969da] hover:text-[#0969da] transition-colors"
                      >
                        <PlusCircle size={12} />
                        {spec}
                      </button>
                    ))}
                    {filteredSpecs.length === 0 && specSearch && (
                      <button
                        type="button"
                        onClick={() => {
                          handleAddSpec(specSearch);
                          setSpecSearch("");
                        }}
                        className="flex items-center gap-1 px-2 py-1 bg-[#ddf4ff] border border-[#0969da] rounded-md text-xs font-bold text-[#0969da]"
                      >
                        <PlusCircle size={12} />
                        Add custom "{specSearch}"
                      </button>
                    )}
                  </div>

                  {Object.keys(formData.specifications || {}).length > 0 && (
                    // 1. Loại bỏ bg, border, padding thừa.
                    // 2. Chuyển sang grid 2 cột (grid-cols-2).
                    // 3. Sử dụng gap-[1.5px] theo yêu cầu của bạn (mặc dù thực tế gap-1 (4px) hoặc gap-[2px] thường được dùng hơn trong Tailwind, tôi sẽ thiết lập chính xác như bạn yêu cầu).
                    <div className="grid grid-cols-2 gap-[1.5px] max-h-[200px] overflow-y-auto mt-2">
                      {Object.entries(formData.specifications).map(([key, value]) => (
                        <div key={key} className="flex items-center gap-1.5 p-1">
                          {/* Ô Label: Cố định độ rộng để gọn hơn */}
                          <div className="w-[100px] p-2 bg-white border border-[#d0d7de] rounded-md text-xs font-bold text-[#1f2328] truncate h-[34px] flex items-center shadow-sm" title={key}>
                            {key}
                          </div>
                          
                          {/* Ô Value: Chiếm phần còn lại (flex-1) nhưng vì nằm trong cột grid nên nó sẽ hẹp lại */}
                          {Array.isArray(availableContext.specs[key]) ? (
                            <select
                              className="flex-1 min-w-0 px-2 py-1 border border-[#d0d7de] rounded-md text-xs outline-none focus:border-[#0969da] bg-white h-[34px] shadow-sm"
                              value={value}
                              onChange={(e) => handleUpdateSpec(key, e.target.value)}
                            >
                              <option value="">Select...</option>
                              {availableContext.specs[key].map(opt => (
                                <option key={opt} value={opt}>{opt}</option>
                              ))}
                            </select>
                          ) : (
                            <input
                              type="text"
                              placeholder="Value..."
                              className="flex-1 min-w-0 px-2 py-1 border border-[#d0d7de] rounded-md text-xs outline-none focus:border-[#0969da] bg-white h-[34px] shadow-sm"
                              value={value}
                              onChange={(e) => handleUpdateSpec(key, e.target.value)}
                            />
                          )}

                          {/* Nút xóa */}
                          <button
                            type="button"
                            onClick={() => handleRemoveSpec(key)}
                            className="text-[#cf222e] hover:bg-[#ffebe9] rounded-md transition-colors flex items-center justify-center h-[34px] w-[28px] shrink-0"
                            title="Remove"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#d0d7de] bg-[#f6f8fa] rounded-b-xl shrink-0">
            <Button type="button" variant="outline" onClick={onClose} className="px-6 h-[38px]">
              Cancel
            </Button>
            <Button type="submit" isLoading={loading} className="px-8 shadow-sm h-[38px]">
              {editingId ? "Save Changes" : "Create Product"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProductDialog;