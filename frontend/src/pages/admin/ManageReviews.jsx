import React, { useState, useEffect } from "react";
import api from "../../services/api";
import { useToast } from "../../context/ToastContext";
import {
  MessageSquare,
  Trash2,
  Search,
  AlertTriangle,
  Star,
} from "lucide-react";

const ManageReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterProductId, setFilterProductId] = useState("");
  const { addToast } = useToast();

  useEffect(() => {
    fetchReviews();
  }, [filterProductId]);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const url = filterProductId
        ? `/reviews/admin/all?product_id=${filterProductId}`
        : "/reviews/admin/all";
      const res = await api.get(url);
      setReviews(res.data.reviews || []);
    } catch (err) {
      addToast("Failed to load reviews", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this review?")) return;
    try {
      await api.delete(`/reviews/${id}`);
      addToast("Review deleted successfully", "success");
      fetchReviews();
    } catch (err) {
      addToast("Failed to delete review", "error");
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2 text-[#1f2328]">
          <MessageSquare className="text-[#0969da]" /> Manage Reviews
        </h1>

        {/* Bộ lọc theo Product ID */}
        <div className="relative">
          <Search
            className="absolute left-3 top-2.5 text-[#6e7781]"
            size={16}
          />
          <input
            type="number"
            placeholder="Filter by Product ID..."
            className="pl-9 pr-4 py-2 bg-white border border-[#d0d7de] rounded-md text-sm focus:border-[#0969da] outline-none w-64 shadow-sm"
            value={filterProductId}
            onChange={(e) => setFilterProductId(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white border border-[#d0d7de] rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f6f8fa] border-b border-[#d0d7de] text-[#6e7781] text-xs uppercase tracking-wider">
                <th className="p-4 font-bold">User</th>
                <th className="p-4 font-bold">Product ID</th>
                <th className="p-4 font-bold">Rating</th>
                <th className="p-4 font-bold">Comment</th>
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
                    className="border-b border-[#d0d7de] hover:bg-[#f6f8fa]/50"
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
                      className="p-4 max-w-xs truncate"
                      title={review.content}
                    >
                      "{review.content}"
                    </td>
                    <td className="p-4">
                      {review.is_fake ? (
                        <span className="flex items-center gap-1 text-xs font-bold text-[#cf222e] bg-[#ffebe9] px-2 py-1 rounded w-fit">
                          <AlertTriangle size={12} /> Fake Detected
                        </span>
                      ) : (
                        <span className="text-xs font-bold text-green-700 bg-green-100 px-2 py-1 rounded">
                          Normal
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => handleDelete(review.review_id)}
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
    </div>
  );
};

export default ManageReviews;
