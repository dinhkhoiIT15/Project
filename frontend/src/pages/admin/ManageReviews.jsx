import React from "react";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import {
  MessageSquare,
  Trash2,
  Search,
  AlertTriangle,
  Star,
  EyeOff,
  Eye,
  CheckCircle,
  X
} from "lucide-react";
import Pagination from "../../components/common/Pagination";
import useManageReviews from "../../hooks/admin/useManageReviews";

const ManageReviews = () => {
  const {
    reviews,
    loading,
    activeTab,
    setActiveTab,
    filterProductId,
    setFilterProductId,
    filterUsername,
    setFilterUsername,
    currentPage,
    setCurrentPage,
    totalPages,
    testContent,
    setTestContent,
    testResult,
    testLoading,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    isDeleting,
    isContextModalOpen,
    setIsContextModalOpen,
    contextData,
    contextLoading,
    handleOpenContext,
    handleTestAI,
    handleDeleteClick,
    confirmDelete,
    toggleHide,
    handleAccept,
  } = useManageReviews();

  return (
    <div className="p-6">
      <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold flex items-center gap-2 text-[#1f2328]">
          <MessageSquare className="text-[#0969da]" /> Manage Reviews
        </h1>

        <div className="flex gap-2">
          <div className="relative">
            <Search
              className="absolute left-3 top-2.5 text-[#6e7781]"
              size={16}
            />
            <input
              type="number"
              placeholder="Product ID"
              className="pl-9 pr-4 py-2 bg-white border border-[#d0d7de] rounded-md text-sm outline-none w-36 shadow-sm focus:border-[#0969da]"
              value={filterProductId}
              onChange={(e) => {
                setFilterProductId(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
          <div className="relative">
            <Search
              className="absolute left-3 top-2.5 text-[#6e7781]"
              size={16}
            />
            <input
              type="text"
              placeholder="Username"
              className="pl-9 pr-4 py-2 bg-white border border-[#d0d7de] rounded-md text-sm outline-none w-48 shadow-sm focus:border-[#0969da]"
              value={filterUsername}
              onChange={(e) => {
                setFilterUsername(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
        </div>
      </div>

      {/* MỚI: KHỐI CHUYỂN TAB REAL / FAKE REVIEWS */}
      <div className="flex gap-4 mb-6 border-b border-[#d0d7de]">
        <button
          onClick={() => {
            setActiveTab("real");
            setCurrentPage(1);
          }}
          className={`flex items-center gap-2 pb-3 px-2 text-sm font-bold transition-colors ${
            activeTab === "real"
              ? "border-b-2 border-[#0969da] text-[#1f2328]"
              : "text-[#6e7781] hover:text-[#1f2328]"
          }`}
        >
          <CheckCircle
            size={18}
            className={activeTab === "real" ? "text-[#1a7f37]" : ""}
          />
          Real Reviews
        </button>
        <button
          onClick={() => {
            setActiveTab("fake");
            setCurrentPage(1);
          }}
          className={`flex items-center gap-2 pb-3 px-2 text-sm font-bold transition-colors ${
            activeTab === "fake"
              ? "border-b-2 border-[#cf222e] text-[#1f2328]"
              : "text-[#6e7781] hover:text-[#1f2328]"
          }`}
        >
          <AlertTriangle
            size={18}
            className={activeTab === "fake" ? "text-[#cf222e]" : ""}
          />
          AI Fake Reviews Alerts
        </button>
      </div>

      {/* KHỐI UI TEST AI TẠM THỜI */}
      <div className="bg-white border border-[#d0d7de] rounded-lg shadow-sm p-5 mb-6">
        <h2 className="text-sm font-black text-[#1f2328] mb-3 flex items-center gap-2">
          <AlertTriangle size={18} className="text-[#0969da]" /> AI Fake Review
          Tester
        </h2>
        <div className="flex gap-3 items-start">
          <textarea
            className="flex-1 border border-[#d0d7de] rounded-md p-3 text-sm outline-none focus:border-[#0969da] resize-none h-14 bg-[#f6f8fa] focus:bg-white transition-colors"
            placeholder="Paste any review content here to test AI prediction (e.g., 'Very nice set. Good quality...')"
            value={testContent}
            onChange={(e) => setTestContent(e.target.value)}
          ></textarea>
          <button
            onClick={handleTestAI}
            disabled={testLoading}
            className="bg-[#1f2328] text-white px-6 py-2 rounded-md text-sm font-bold hover:bg-[#24292f] transition-colors h-14 disabled:opacity-50 min-w-[120px] shadow-sm"
          >
            {testLoading ? "Testing..." : "Test AI"}
          </button>
        </div>

        {/* Khối hiển thị kết quả phần trăm */}
        {testResult && (
          <div
            className={`mt-4 p-4 rounded-md border flex justify-between items-center transition-all ${testResult.is_fake ? "bg-[#ffebe9] border-[#cf222e]/30" : "bg-[#dafbe1] border-[#1a7f37]/30"}`}
          >
            <div className="flex flex-col">
              <span className="text-xs text-[#6e7781] font-bold uppercase tracking-wider mb-1">
                AI Final Decision
              </span>
              <span
                className={`text-xl font-black ${testResult.is_fake ? "text-[#cf222e]" : "text-[#1a7f37]"}`}
              >
                {testResult.is_fake
                  ? "🚨 SPAM / FAKE (CG)"
                  : "✅ REAL / HUMAN (OR)"}
              </span>
            </div>
            <div className="flex flex-col items-end border-l border-white/50 pl-6">
              <span className="text-xs text-[#6e7781] font-bold uppercase tracking-wider mb-1">
                Confidence Score
              </span>
              <span
                className={`text-2xl font-black ${testResult.is_fake ? "text-[#cf222e]" : "text-[#1a7f37]"}`}
              >
                {testResult.confidence}%
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white border border-[#d0d7de] rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f6f8fa] border-b border-[#d0d7de] text-[#6e7781] text-xs uppercase tracking-wider">
                <th className="p-4 font-bold">User</th>
                <th className="p-4 font-bold">Prod ID</th>
                <th className="p-4 font-bold">Rating</th>
                <th className="p-4 font-bold w-1/3">Comment</th>
                <th className="p-4 font-bold">Status</th>
                <th className="p-4 font-bold text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {loading ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-[#6e7781]">
                    Loading...
                  </td>
                </tr>
              ) : reviews.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-[#6e7781]">
                    No reviews found.
                  </td>
                </tr>
              ) : (
                reviews.map((review) => (
                  <tr
                    key={review.review_id}
                    className={`border-b border-[#d0d7de] transition-colors ${review.is_hidden ? "bg-gray-50 opacity-60" : "hover:bg-[#f6f8fa]/50"}`}
                  >
                    <td className="p-4 font-bold text-[#1f2328]">
                      {review.username}
                    </td>
                    <td className="p-4 text-[#0969da] font-bold">
                      #{review.product_id}
                    </td>
                    <td className="p-4">
                      <div className="flex text-[#0969da]">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={14}
                            fill={i < review.rating ? "currentColor" : "none"}
                            strokeWidth={i < review.rating ? 0 : 2}
                            className={
                              i >= review.rating ? "text-[#d0d7de]" : ""
                            }
                          />
                        ))}
                      </div>
                    </td>
                    <td 
                      className="p-4 max-w-md whitespace-normal break-words max-h-24 overflow-y-auto cursor-pointer hover:bg-[#ddf4ff] hover:text-[#0969da] transition-colors rounded-md" 
                      title="Click to view product context"
                      onClick={() => handleOpenContext(review.product_id)}
                    >
                      "{review.content}"
                    </td>
                    <td className="p-4 flex flex-col gap-1.5">
                      {/* MỚI: Hiển thị cảnh báo Lạc đề / Sai chủ đề */}
                      {review.is_irrelevant && (
                        <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-md w-fit shadow-sm border bg-[#f5f0ff] text-[#8250df] border-[#8250df]/20">
                          <AlertTriangle size={12} strokeWidth={2.5} />
                          Irrelevant Content
                        </span>
                      )}

                      {review.is_fake && (
                        <span
                          className={`flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-md w-fit shadow-sm border ${
                            review.confidence_score >= 60
                              ? "bg-[#ffebe9] text-[#cf222e] border-[#cf222e]/20" // Nguy hiểm (Đỏ)
                              : "bg-[#fff8c5] text-[#9a6700] border-[#9a6700]/20" // Nghi ngờ (Vàng)
                          }`}
                        >
                          <AlertTriangle size={12} strokeWidth={2.5} />
                          {review.confidence_score >= 60
                            ? "AI Blocked"
                            : "AI Flagged"}{" "}
                          ({review.confidence_score.toFixed(2)}%)
                        </span>
                      )}

                      {review.is_hidden && (
                        <span className="flex items-center gap-1 text-[10px] font-black text-[#6e7781] bg-[#f6f8fa] border border-[#d0d7de] px-2 py-1 rounded-md w-fit uppercase tracking-wider shadow-sm">
                          <EyeOff size={12} strokeWidth={2.5} /> Hidden
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-center space-x-2">
                      {/* MỚI: Chỉ hiển thị nút ẩn/hiện nếu không phải Fake review chắc chắn (>= 60%) */}
                      {!(review.is_fake && review.confidence_score >= 60) && (
                        <button
                          onClick={() => toggleHide(review.review_id)}
                          className="text-[#6e7781] hover:text-[#9a6700] transition-colors p-2"
                          title={
                            review.is_hidden ? "Show Review" : "Hide Review"
                          }
                        >
                          {review.is_hidden ? (
                            <Eye size={18} />
                          ) : (
                            <EyeOff size={18} />
                          )}
                        </button>
                      )}
                      {/* MỚI: Nút Accept chỉ hiển thị cho Fake reviews */}
                      {review.is_fake && (
                        <button
                          onClick={() => handleAccept(review.review_id)}
                          className="text-[#6e7781] hover:text-[#1a7f37] transition-colors p-2"
                          title="Accept as Real Review"
                        >
                          <CheckCircle size={18} />
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteClick(review.review_id)}
                        className="text-[#6e7781] hover:text-[#cf222e] transition-colors p-2"
                        title="Delete Review"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isContextModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden animate-fade-in">
            <div className="flex justify-between items-center p-4 border-b border-[#d0d7de] bg-[#f6f8fa]">
              <h3 className="font-bold text-[#1f2328] flex items-center gap-2">
                <Search size={18} className="text-[#0969da]" /> Product Context Check
              </h3>
              <button onClick={() => setIsContextModalOpen(false)} className="text-[#6e7781] hover:text-[#cf222e]">
                <X size={20} />
              </button>
            </div>

            <div className="p-5 overflow-y-auto flex-1">
              {contextLoading ? (
                <div className="text-center py-10 text-[#6e7781] font-bold animate-pulse">Loading context...</div>
              ) : contextData ? (
                <>
                  <div className="flex gap-4 items-center bg-[#f6f8fa] p-3 rounded-lg border border-[#d0d7de] mb-5">
                    {contextData.product.image_url ? (
                      <img src={contextData.product.image_url} alt="product" className="w-16 h-16 object-cover rounded-md border" />
                    ) : (
                      <div className="w-16 h-16 bg-[#d0d7de] rounded-md flex items-center justify-center text-xs">No Img</div>
                    )}
                    <div>
                      <h4 className="font-bold text-[#1f2328]">{contextData.product.name}</h4>
                      <p className="text-[#0969da] font-black text-sm">${contextData.product.price}</p>
                      <p className="text-xs text-[#6e7781] mt-1">Product ID: #{contextData.product.product_id}</p>
                    </div>
                  </div>

                  <h4 className="font-bold text-sm text-[#1f2328] mb-3 border-b pb-2">All Reviews for this Product</h4>
                  <div className="space-y-3">
                    {contextData.reviews.length === 0 ? (
                      <p className="text-sm text-[#6e7781]">No reviews yet.</p>
                    ) : (
                      contextData.reviews.map((ctxRev) => (
                        <div key={ctxRev.review_id} className={`p-3 rounded-md border text-sm ${ctxRev.is_fake ? 'bg-[#ffebe9] border-[#cf222e]/30' : 'bg-white border-[#d0d7de]'}`}>
                          <div className="flex justify-between items-start mb-1">
                            <span className="font-bold text-[#1f2328]">{ctxRev.username} <span className="text-xs font-normal text-[#6e7781]">({ctxRev.date})</span></span>
                            {ctxRev.is_fake && (
                              <span className="text-[10px] bg-[#cf222e] text-white px-1.5 py-0.5 rounded uppercase font-bold">Fake Flagged</span>
                            )}
                          </div>
                          <p className="text-[#1f2328] italic">"{ctxRev.content}"</p>
                        </div>
                      ))
                    )}
                  </div>
                </>
              ) : (
                <div className="text-center py-10 text-[#cf222e]">Failed to load data.</div>
              )}
            </div>
          </div>
        </div>
      )}

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Review & Notify User"
        message="This will permanently delete the review and send an alert notification to the user. Proceed?"
        confirmText="Delete"
        type="danger"
        isLoading={isDeleting}
      />
    </div>
  );
};
export default ManageReviews;
