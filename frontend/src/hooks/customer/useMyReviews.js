import { useState, useEffect } from "react";
import api from "../../services/api";
import { useToast } from "../../context/ToastContext";

const useMyReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  const [editingId, setEditingId] = useState(null);
  const [editContent, setEditContent] = useState("");
  const [editRating, setEditRating] = useState(5);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchMyReviews = async () => {
    setLoading(true);
    try {
      const res = await api.get("/reviews/my-reviews");
      setReviews(res.data.reviews || []);
    } catch (err) {
      console.error("Failed to fetch reviews", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleUpdateReview = async (reviewId) => {
    try {
      await api.put(`/reviews/${reviewId}`, {
        content: editContent,
        rating: editRating,
      });
      addToast("Review updated successfully", "success");
      setEditingId(null);
      fetchMyReviews();
    } catch (err) {
      addToast("Failed to update review", "error");
    }
  };

  const handleDeleteClick = (reviewId) => {
    setReviewToDelete(reviewId);
    setIsDeleteDialogOpen(true);
  };

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

  return {
    reviews,
    loading,
    editingId,
    setEditingId,
    editContent,
    setEditContent,
    editRating,
    setEditRating,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    isDeleting,
    handleUpdateReview,
    handleDeleteClick,
    confirmDeleteReview,
  };
};

export default useMyReviews;