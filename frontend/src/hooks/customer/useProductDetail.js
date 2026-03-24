import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { io } from "socket.io-client";
import api from "../../services/api";
import { useToast } from "../../context/ToastContext";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";

const useProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { addToast } = useToast();
  const { fetchCartCount } = useCart();
  const { user } = useAuth();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);

  const [reviews, setReviews] = useState([]);

  const [newReviewContent, setNewReviewContent] = useState("");
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [editContent, setEditContent] = useState("");
  const [editRating, setEditRating] = useState(5);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchReviews = async () => {
    try {
      const res = await api.get(`/reviews/product/${id}`);
      setReviews(res.data.reviews || []);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchReviews();

    const socket = io("http://localhost:5000");

    socket.on("connect", () => {
      socket.emit("join", { room: `product_${id}` });
    });

    socket.on("new_review", (newReview) => {
      setReviews((prev) => [newReview, ...prev]);

      setProduct((prevProduct) => {
        if (!prevProduct) return prevProduct;
        const newCount = prevProduct.review_count + 1;
        const newTotalStars =
          prevProduct.avg_rating * prevProduct.review_count + newReview.rating;
        return {
          ...prevProduct,
          review_count: newCount,
          avg_rating: newTotalStars / newCount,
        };
      });
    });

    socket.on("review_updated", (data) => {
      setReviews((prev) =>
        prev.map((r) =>
          r.review_id === data.review_id
            ? { ...r, content: data.content, rating: data.rating }
            : r,
        ),
      );
      api.get(`/products/${id}`).then((res) => setProduct(res.data.product));
    });

    socket.on("review_deleted", (data) => {
      setReviews((prev) => prev.filter((r) => r.review_id !== data.review_id));
      api.get(`/products/${id}`).then((res) => setProduct(res.data.product));
    });

    socket.on("review_unhidden", () => {
      fetchReviews();
      api.get(`/products/${id}`).then((res) => setProduct(res.data.product));
    });

    return () => {
      socket.emit("leave", { room: `product_${id}` });
      socket.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await api.get(`/products/${id}`);
        setProduct(response.data.product);
      } catch (err) {
        addToast("Product not found", "error");
        navigate("/");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id, navigate, addToast]);

  const handleSubmitReview = async () => {
    if (!localStorage.getItem("token") && !sessionStorage.getItem("token")) {
      addToast("Please sign in to write a review", "info");
      return;
    }
    if (!newReviewContent.trim()) {
      addToast("Please write a comment", "error");
      return;
    }
    setSubmittingReview(true);
    try {
      const reviewData = {
        product_id: id,
        content: newReviewContent,
        rating: newReviewRating,
      };

      const res = await api.post("/reviews", reviewData);

      if (res.data.review && res.data.review.is_fake) {
        addToast(
          "Your review has been submitted and is pending moderation.",
          "info",
        );
      } else {
        addToast("Review submitted successfully!", "success");
      }

      setNewReviewContent("");
      setNewReviewRating(5);
    } catch (err) {
      addToast(
        err.response?.data?.message || "Failed to submit review",
        "error",
      );
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleUpdateReview = async (reviewId) => {
    try {
      const res = await api.put(`/reviews/${reviewId}`, {
        content: editContent,
        rating: editRating,
      });
      if (res.data.is_hidden) {
        addToast("Your review has been updated and is pending moderation.", "info");
        setReviews((prev) => prev.filter((r) => r.review_id !== reviewId));
      } else {
        addToast("Review updated!", "success");
      }
      setEditingReviewId(null);
    } catch (err) {
      addToast("Failed to update", "error");
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
      addToast("Review deleted!", "success");
    } catch (err) {
      addToast("Failed to delete", "error");
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
      setReviewToDelete(null);
    }
  };

  const handleAddToCart = async () => {
    if (!localStorage.getItem("token")) {
      addToast("Please login first!", "info");
      navigate(location.pathname, {
        state: { openLogin: true },
        replace: true,
      });
      return;
    }
    setAddingToCart(true);
    try {
      await api.post("/cart", { product_id: product.product_id, quantity });
      addToast("Added to cart successfully!", "success");
      fetchCartCount();
    } catch (err) {
      addToast("Error adding to cart", "error");
    } finally {
      setAddingToCart(false);
    }
  };

  return {
    product,
    loading,
    quantity,
    setQuantity,
    addingToCart,
    reviews,
    newReviewContent,
    setNewReviewContent,
    newReviewRating,
    setNewReviewRating,
    submittingReview,
    editingReviewId,
    setEditingReviewId,
    editContent,
    setEditContent,
    editRating,
    setEditRating,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    isDeleting,
    user,
    navigate,
    handleSubmitReview,
    handleUpdateReview,
    handleDeleteClick,
    confirmDeleteReview,
    handleAddToCart,
  };
};

export default useProductDetail;