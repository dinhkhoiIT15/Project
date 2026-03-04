import React, { useState, useEffect } from "react";
import api from "../../services/api";
import { useToast } from "../../context/ToastContext";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import {
  MessageSquare,
  Trash2,
  Search,
  AlertTriangle,
  Star,
  EyeOff,
  Eye,
} from "lucide-react";
import Pagination from "../../components/common/Pagination";

const ManageReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filterProductId, setFilterProductId] = useState("");
  const [filterUsername, setFilterUsername] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { addToast } = useToast();

  // MỚI: Các biến State phục vụ cho Test AI
  const [testContent, setTestContent] = useState("");
  const [testResult, setTestResult] = useState(null);
  const [testLoading, setTestLoading] = useState(false);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, [filterProductId, filterUsername, currentPage]);

  const fetchReviews = async () => {
    const token = sessionStorage.getItem("token");
    if (!token) {
      addToast("Admin session expired. Please login again.", "error");
      return;
    }

    setLoading(true);
    try {
      const res = await api.get("/reviews/admin/all", {
        params: {
          product_id: filterProductId || undefined,
          username: filterUsername || undefined,
          page: currentPage,
        },
      });
      setReviews(res.data.reviews || []);
      setTotalPages(res.data.total_pages || 1);
    } catch (err) {
      if (
        err.response?.status === 401 ||
        err.response?.data?.msg?.includes("Authorization")
      ) {
        addToast("Your admin session is invalid. Please re-login.", "error");
      } else {
        addToast("Failed to load reviews list", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleTestAI = async () => {
    if (!testContent.trim()) {
      addToast("Please enter a review to test", "warning");
      return;
    }
    setTestLoading(true);
    setTestResult(null);
    try {
      const res = await api.post("/reviews/test-ai", { content: testContent });
      setTestResult(res.data);
    } catch (err) {
      // Ưu tiên hiển thị thông báo lỗi chi tiết từ Backend gửi về
      const errorMsg =
        err.response?.data?.message ||
        "Test failed. Check if AI model is loaded.";
      addToast(errorMsg, "error");
    } finally {
      setTestLoading(false);
    }
  };

  const handleDeleteClick = (id) => {
    setReviewToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      await api.delete(`/reviews/${reviewToDelete}`);
      addToast("Review deleted and user notified", "success");
      fetchReviews();
    } catch (err) {
      addToast("Failed to delete review", "error");
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  const toggleHide = async (id) => {
    try {
      await api.put(`/reviews/${id}/hide`);
      addToast("Visibility updated", "success");
      fetchReviews();
    } catch (err) {
      addToast("Update failed", "error");
    }
  };

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
                    <td className="p-4 truncate" title={review.content}>
                      "{review.content}"
                    </td>
                    <td className="p-4 flex flex-col gap-1.5">
                      {review.is_fake && (
                        <span className="flex items-center gap-1 text-[10px] font-black text-[#cf222e] bg-[#ffebe9] border border-[#cf222e]/20 px-2 py-1 rounded-md w-fit uppercase tracking-wider shadow-sm">
                          <AlertTriangle size={12} strokeWidth={2.5} /> AI
                          Flagged
                        </span>
                      )}
                      {review.is_hidden && (
                        <span className="flex items-center gap-1 text-[10px] font-black text-[#9a6700] bg-[#fff8c5] border border-[#9a6700]/20 px-2 py-1 rounded-md w-fit uppercase tracking-wider shadow-sm">
                          <EyeOff size={12} strokeWidth={2.5} /> Hidden
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-center space-x-2">
                      <button
                        onClick={() => toggleHide(review.review_id)}
                        className="text-[#6e7781] hover:text-[#9a6700] transition-colors p-2"
                        title={review.is_hidden ? "Show Review" : "Hide Review"}
                      >
                        {review.is_hidden ? (
                          <Eye size={18} />
                        ) : (
                          <EyeOff size={18} />
                        )}
                      </button>
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
