import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/layout/Navbar";
import api from "../../services/api";
// MỚI: Thêm các Icon và useToast
import {
  MessageSquare,
  Star,
  Package,
  Edit2,
  Trash2,
  X,
  Check,
} from "lucide-react";
import Breadcrumbs from "../../components/common/Breadcrumbs";
import { useToast } from "../../context/ToastContext";
import ConfirmDialog from "../../components/common/ConfirmDialog"; // MỚI IMPORT

const MyReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  // MỚI: Các State dùng cho việc chỉnh sửa
  const [editingId, setEditingId] = useState(null);
  const [editContent, setEditContent] = useState("");
  const [editRating, setEditRating] = useState(5);

  // MỚI: Các State dùng cho hộp thoại xác nhận xóa
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchMyReviews();
  }, []);

  const fetchMyReviews = async () => {
    try {
      const res = await api.get("/reviews/my-reviews");
      setReviews(res.data.reviews || []);
    } catch (err) {
      console.error("Failed to fetch reviews", err);
    } finally {
      setLoading(false);
    }
  };

  // MỚI: Xử lý lưu chỉnh sửa
  const handleUpdateReview = async (reviewId) => {
    try {
      await api.put(`/reviews/${reviewId}`, {
        content: editContent,
        rating: editRating,
      });
      addToast("Review updated successfully", "success");
      setEditingId(null);
      fetchMyReviews(); // Load lại danh sách
    } catch (err) {
      addToast("Failed to update review", "error");
    }
  };

  // MỚI: Xử lý khi bấm nút Thùng rác (Mở Dialog)
  const handleDeleteClick = (reviewId) => {
    setReviewToDelete(reviewId);
    setIsDeleteDialogOpen(true);
  };

  // MỚI: Xử lý khi bấm nút "Delete" TRONG Dialog
  const confirmDeleteReview = async () => {
    if (!reviewToDelete) return;
    setIsDeleting(true);
    try {
      await api.delete(`/reviews/user/${reviewToDelete}`);
      addToast("Review deleted", "success");
      fetchMyReviews();
    } catch (err) {
      addToast("Failed to delete review", "error");
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
      setReviewToDelete(null);
    }
  };

  return (
    <div className="min-h-screen bg-white text-[#1f2328] font-sans">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-8">
        <Breadcrumbs>
          <Breadcrumbs.Item to="/">Home</Breadcrumbs.Item>
          <Breadcrumbs.Divider />
          <Breadcrumbs.Item active>My Reviews</Breadcrumbs.Item>
        </Breadcrumbs>

        <h1 className="text-2xl font-black mb-8 flex items-center gap-3 text-[#1f2328] mt-4">
          <MessageSquare className="text-[#0969da]" size={28} /> My Reviews
        </h1>

        {loading ? (
          <p className="text-[#6e7781] text-sm font-medium py-10">
            Loading your reviews...
          </p>
        ) : reviews.length === 0 ? (
          <div className="text-center py-20 bg-[#f6f8fa] rounded-xl border border-dashed border-[#d0d7de]">
            <MessageSquare size={48} className="mx-auto text-[#afb8c1] mb-4" />
            <p className="text-[#6e7781] font-medium">
              You haven't written any reviews yet.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {reviews.map((review) => (
              <div
                key={review.review_id}
                className="bg-white p-6 rounded-lg shadow-sm border border-[#d0d7de]"
              >
                <div className="flex items-start gap-4 mb-4 pb-4 border-b border-[#f0f2f4]">
                  <div className="w-16 h-16 bg-[#f6f8fa] border border-[#d0d7de] rounded overflow-hidden shrink-0 flex items-center justify-center">
                    {review.product_image ? (
                      <img
                        src={review.product_image}
                        alt={review.product_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Package size={24} className="text-[#afb8c1]" />
                    )}
                  </div>
                  <div>
                    <Link
                      to={`/product/${review.product_id}`}
                      className="font-bold text-base hover:text-[#0969da] hover:underline"
                    >
                      {review.product_name}
                    </Link>
                    <p className="text-xs text-[#6e7781] mt-1">
                      Reviewed on {review.created_at}
                    </p>
                  </div>
                </div>

                {/* MỚI: KHU VỰC HIỂN THỊ HOẶC CHỈNH SỬA */}
                {editingId === review.review_id ? (
                  <div className="flex flex-col gap-3 bg-[#f6f8fa] p-4 rounded-lg border border-[#d0d7de]">
                    <div className="flex text-[#0969da] cursor-pointer">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={20}
                          onClick={() => setEditRating(star)}
                          fill={star <= editRating ? "currentColor" : "none"}
                          strokeWidth={star <= editRating ? 0 : 2}
                          className={star > editRating ? "text-[#d0d7de]" : ""}
                        />
                      ))}
                    </div>
                    <textarea
                      className="w-full p-2 border border-[#d0d7de] rounded text-sm outline-none focus:border-[#0969da]"
                      rows="3"
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                    ></textarea>
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => setEditingId(null)}
                        className="flex items-center text-xs font-bold text-[#6e7781] hover:bg-gray-200 px-3 py-1.5 rounded transition-colors"
                      >
                        <X size={14} className="mr-1" /> Cancel
                      </button>
                      <button
                        onClick={() => handleUpdateReview(review.review_id)}
                        className="flex items-center text-xs font-bold text-white bg-[#0969da] hover:bg-blue-700 px-3 py-1.5 rounded transition-colors"
                      >
                        <Check size={14} className="mr-1" /> Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2 relative group">
                    {/* Cụm Nút Edit / Delete ẩn hiện khi Hover */}
                    <div className="absolute -top-14 right-0 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                      <button
                        onClick={() => {
                          setEditingId(review.review_id);
                          setEditContent(review.content);
                          setEditRating(review.rating);
                        }}
                        className="p-1.5 text-[#6e7781] hover:text-[#0969da] bg-white border border-[#d0d7de] rounded shadow-sm transition-colors"
                        title="Edit Review"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(review.review_id)} // MỚI: Đổi thành handleDeleteClick
                        className="p-1.5 text-[#6e7781] hover:text-[#cf222e] bg-white border border-[#d0d7de] rounded shadow-sm transition-colors"
                        title="Delete Review"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    <div className="flex text-[#0969da]">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={16}
                          fill={i < review.rating ? "currentColor" : "none"}
                          strokeWidth={i < review.rating ? 0 : 2}
                          className={i >= review.rating ? "text-[#d0d7de]" : ""}
                        />
                      ))}
                    </div>
                    <p className="text-sm text-[#1f2328] leading-relaxed">
                      "{review.content}"
                    </p>
                    {review.is_fake && (
                      <span className="inline-block mt-2 px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded w-fit">
                        Flagged as inappropriate
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      {/* MỚI: Hộp thoại xác nhận xóa */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={confirmDeleteReview}
        title="Delete Review"
        message="Are you sure you want to delete this review? This action cannot be undone."
        confirmText="Delete"
        type="danger"
        isLoading={isDeleting}
      />
    </div>
  );
};

export default MyReviews;
