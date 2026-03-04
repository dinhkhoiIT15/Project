import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
import Navbar from "../../components/layout/Navbar";
import Button from "../../components/common/Button";
import api from "../../services/api";
import { useToast } from "../../context/ToastContext";
import { useCart } from "../../context/CartContext";
import { io } from "socket.io-client";
import { useAuth } from "../../context/AuthContext";
import {
  Loader2,
  Star,
  Truck,
  Heart,
  Minus,
  Plus,
  Store,
  ShieldCheck,
  ChevronRight,
  Edit2,
  Trash2,
  X,
  Check,
} from "lucide-react";
import Breadcrumbs from "../../components/common/Breadcrumbs";
import ConfirmDialog from "../../components/common/ConfirmDialog";

const ProductDetail = () => {
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
  }, [id]);

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
      // Sửa lỗi: Định nghĩa dữ liệu cần gửi
      const reviewData = {
        product_id: id,
        content: newReviewContent,
        rating: newReviewRating,
      };

      const res = await api.post("/reviews", reviewData);

      // MỚI: Xử lý thông báo dựa trên kết quả kiểm duyệt của AI SVM
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
      await api.put(`/reviews/${reviewId}`, {
        content: editContent,
        rating: editRating,
      });
      addToast("Review updated!", "success");
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

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center bg-white">
        <Loader2 className="animate-spin text-[#0969da]" size={40} />
      </div>
    );

  return (
    <div className="min-h-screen bg-white font-sans">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Breadcrumbs>
          <Breadcrumbs.Item to="/">Home</Breadcrumbs.Item>
          <Breadcrumbs.Divider />
          <Breadcrumbs.Item to={`/?category_id=${product?.category_id}`}>
            {product?.category_name}
          </Breadcrumbs.Item>
          <Breadcrumbs.Divider />
          <Breadcrumbs.Item active>{product?.name}</Breadcrumbs.Item>
        </Breadcrumbs>

        <div className="flex flex-col lg:flex-row gap-12 items-start">
          <div className="flex-1 flex flex-col gap-12 w-full">
            <div className="w-full bg-[#f6f8fa] border border-[#d0d7de] rounded-xl overflow-hidden p-8 flex items-center justify-center h-[500px]">
              <img
                className="max-h-full max-w-full object-contain mix-blend-multiply hover:scale-105 transition-transform duration-500"
                src={product?.image_url}
                alt={product?.name}
              />
            </div>

            <div className="flex flex-col gap-8">
              <div className="flex items-center gap-4 border-b border-[#d0d7de] pb-4">
                <h2 className="text-2xl font-bold text-[#1f2328]">Reviews</h2>
                <div className="flex items-center gap-2 bg-[#f6f8fa] px-3 py-1 rounded-full border border-[#d0d7de]">
                  <div className="flex text-[#0969da]">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={16}
                        fill={
                          i < Math.round(product?.avg_rating || 0)
                            ? "currentColor"
                            : "none"
                        }
                        strokeWidth={
                          i < Math.round(product?.avg_rating || 0) ? 0 : 2
                        }
                        className={
                          i >= Math.round(product?.avg_rating || 0)
                            ? "text-[#d0d7de]"
                            : ""
                        }
                      />
                    ))}
                  </div>
                  <span className="font-bold text-sm">
                    {product?.avg_rating || 0}
                  </span>
                  <span className="text-[#6e7781] text-sm">
                    ({product?.review_count || 0} reviews)
                  </span>
                </div>
              </div>

              <div className="bg-[#f6f8fa] p-5 rounded-lg border border-[#d0d7de] flex flex-col gap-4">
                <h3 className="font-bold text-[#1f2328]">Write a Review</h3>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-[#6e7781]">
                    Rating:
                  </span>
                  <div className="flex cursor-pointer text-[#0969da]">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={20}
                        onClick={() => setNewReviewRating(star)}
                        fill={star <= newReviewRating ? "currentColor" : "none"}
                        strokeWidth={star <= newReviewRating ? 0 : 2}
                        className={`transition-colors hover:text-blue-700 ${star > newReviewRating ? "text-[#d0d7de]" : ""}`}
                      />
                    ))}
                  </div>
                </div>
                <textarea
                  className="w-full p-3 border border-[#d0d7de] rounded-md text-sm outline-none focus:border-[#0969da] resize-none shadow-sm"
                  rows="3"
                  placeholder="Share your experience with this product..."
                  value={newReviewContent}
                  onChange={(e) => setNewReviewContent(e.target.value)}
                ></textarea>
                <div className="flex justify-end">
                  <Button
                    onClick={handleSubmitReview}
                    isLoading={submittingReview}
                    className="px-6 py-2 text-sm shadow-sm"
                  >
                    Submit Review
                  </Button>
                </div>
              </div>

              {reviews.length === 0 ? (
                <p className="text-[#6e7781] italic font-medium p-4 border border-dashed border-[#d0d7de] rounded-lg text-center bg-[#f6f8fa]">
                  No reviews yet. Be the first to review this product!
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {reviews.map((review) => {
                    const isOwner = user?.username === review.username;

                    return (
                      <div
                        key={review.review_id}
                        className="flex flex-col gap-2 p-5 border border-[#d0d7de] rounded-lg bg-white shadow-sm hover:border-[#0969da] transition-colors relative group"
                      >
                        {editingReviewId === review.review_id ? (
                          <div className="flex flex-col gap-3">
                            <div className="flex text-[#0969da] cursor-pointer">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  size={16}
                                  onClick={() => setEditRating(star)}
                                  fill={
                                    star <= editRating ? "currentColor" : "none"
                                  }
                                  strokeWidth={star <= editRating ? 0 : 2}
                                  className={
                                    star > editRating ? "text-[#d0d7de]" : ""
                                  }
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
                                onClick={() => setEditingReviewId(null)}
                                className="text-xs font-bold text-[#6e7781] hover:underline"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() =>
                                  handleUpdateReview(review.review_id)
                                }
                                className="text-xs font-bold text-[#0969da] hover:underline"
                              >
                                Save
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            {isOwner && (
                              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2 bg-white pl-2">
                                <button
                                  onClick={() => {
                                    setEditingReviewId(review.review_id);
                                    setEditContent(review.content);
                                    setEditRating(review.rating);
                                  }}
                                  className="text-[#6e7781] hover:text-[#0969da]"
                                  title="Edit"
                                >
                                  <Edit2 size={14} />
                                </button>
                                <button
                                  onClick={() =>
                                    handleDeleteClick(review.review_id)
                                  }
                                  className="text-[#6e7781] hover:text-[#cf222e]"
                                  title="Delete"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            )}

                            <span className="font-bold text-[#1f2328]">
                              {review.username}
                            </span>
                            <div className="flex items-center gap-2">
                              <div className="flex text-[#0969da]">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    size={14}
                                    fill={
                                      i < review.rating
                                        ? "currentColor"
                                        : "none"
                                    }
                                    strokeWidth={i < review.rating ? 0 : 2}
                                    className={
                                      i >= review.rating ? "text-[#d0d7de]" : ""
                                    }
                                  />
                                ))}
                              </div>
                              <span className="text-xs font-medium text-[#6e7781]">
                                {review.date}
                              </span>
                            </div>
                            <p className="text-[15px] text-[#1f2328] leading-relaxed line-clamp-3">
                              "{review.content}"
                            </p>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              <Button variant="outline" className="w-full py-2.5">
                Read more reviews
              </Button>
            </div>
          </div>

          <div className="w-full lg:w-96 flex flex-col gap-8 lg:sticky lg:top-24">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-[#1f2328] rounded-md flex items-center justify-center text-white font-bold text-xs">
                  DK
                </div>
                <span className="font-bold text-sm text-[#1f2328] uppercase tracking-tight">
                  DK-ECOM Store
                </span>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-start justify-between">
                  <div className="flex flex-col gap-1">
                    <h1 className="text-2xl font-black text-[#1f2328] leading-tight">
                      {product?.name}
                    </h1>
                    <div className="flex items-center gap-1 text-[#0969da]">
                      <span className="text-xs font-bold uppercase">
                        {product?.category_name}
                      </span>
                    </div>
                  </div>
                  <button className="p-2 border border-[#d0d7de] rounded-md hover:bg-red-50 hover:text-red-500 transition-colors">
                    <Heart size={20} />
                  </button>
                </div>
                <span className="text-3xl font-black text-[#1f2328] mt-2">
                  ${product?.price.toFixed(2)}
                </span>
              </div>

              <div className="flex flex-col gap-1 py-4 border-y border-[#d0d7de]">
                <div className="flex items-center gap-2 text-sm text-[#1f2328]">
                  <Truck size={18} className="text-[#6e7781]" />
                  <span>Free shipping on orders over $100</span>
                </div>
                <Link
                  to="/profile"
                  className="text-xs font-bold text-[#0969da] hover:underline ml-7"
                >
                  Add delivery address
                </Link>
              </div>
            </div>

            <div className="flex flex-col gap-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm">Quantity</span>
                  <div className="flex items-center border border-[#d0d7de] rounded-md bg-white overflow-hidden shadow-sm">
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="p-2 hover:bg-[#f6f8fa] text-[#6e7781]"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="px-4 font-bold text-[#1f2328] min-w-[40px] text-center">
                      {quantity}
                    </span>
                    <button
                      onClick={() =>
                        setQuantity((q) =>
                          Math.min(product?.stock_quantity, q + 1),
                        )
                      }
                      className={`p-2 transition-colors ${quantity >= product?.stock_quantity ? "bg-gray-100 text-gray-300 cursor-not-allowed" : "hover:bg-[#f6f8fa] text-[#6e7781]"}`}
                      disabled={quantity >= product?.stock_quantity}
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
                <div className="h-px bg-[#d0d7de] w-full" />
                <div className="flex items-center justify-between text-sm">
                  <span className="font-bold">Stock Status</span>
                  <span
                    className={`font-bold ${product?.stock_quantity > 0 ? "text-green-600" : "text-red-500"}`}
                  >
                    {product?.stock_quantity > 0
                      ? `${product.stock_quantity} available`
                      : "Out of Stock"}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Button
                  fullWidth
                  onClick={handleAddToCart}
                  isLoading={addingToCart}
                  disabled={product?.stock_quantity <= 0}
                  className="py-3 text-base font-black shadow-sm"
                >
                  Add to cart
                </Button>
                <Button
                  fullWidth
                  variant="outline"
                  className="py-3 text-base font-bold bg-[#f6f8fa]"
                  onClick={() => {
                    handleAddToCart();
                    setTimeout(() => navigate("/cart"), 500);
                  }}
                >
                  Buy it now
                </Button>
                <p className="text-[10px] text-center text-[#6e7781] uppercase tracking-widest mt-2">
                  Secure checkout powered by DK-ECOM
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <h3 className="text-lg font-bold text-[#1f2328] border-b border-[#d0d7de] pb-2">
                Description
              </h3>
              <p className="text-sm text-[#6e7781] leading-relaxed">
                {product?.description}
              </p>
              <div className="flex flex-col gap-2 mt-4">
                <Button
                  variant="outline"
                  className="justify-start text-xs h-9"
                  onClick={() => navigate("/")}
                >
                  <Store size={14} className="mr-2" /> View more from this store
                </Button>
                <Button variant="outline" className="justify-start text-xs h-9">
                  <ShieldCheck size={14} className="mr-2" /> Refund policy
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-20 pt-10 border-t border-[#d0d7de]">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-black text-[#1f2328]">
              Similar Products
            </h2>
            <Link
              to="/"
              className="flex items-center text-sm font-bold text-[#0969da] hover:underline"
            >
              View all <ChevronRight size={16} />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <p className="col-span-full text-center text-[#6e7781] italic py-10 bg-[#f6f8fa] border border-dashed border-[#d0d7de] rounded-xl">
              Stay tuned! More similar products are coming soon.
            </p>
          </div>
        </div>
      </main>
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={confirmDeleteReview}
        title="Delete Review"
        message="Are you sure you want to delete your review? This action cannot be undone."
        confirmText="Delete"
        type="danger"
        isLoading={isDeleting}
      />
    </div>
  );
};

export default ProductDetail;
