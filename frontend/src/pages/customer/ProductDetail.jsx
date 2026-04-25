import React from "react";
import { Link, useLocation } from "react-router-dom";
import Navbar from "../../components/layout/Navbar";
import Button from "../../components/common/Button";
import ProductCard from "../../components/common/ProductCard";
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
import useProductDetail from "../../hooks/customer/useProductDetail";
import api from "../../services/api";
import { useToast } from "../../context/ToastContext";
import { useCart } from "../../context/CartContext";
import useDocumentTitle from "../../hooks/app/useDocumentTitle";

const ProductDetail = () => {
  const {
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
    similarProducts,
    loadingSimilar,
  } = useProductDetail();

  useDocumentTitle(product ? product.category_name || product.name : "Loading...");

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

            <div className="flex w-full flex-col items-center gap-6">
              <div className="flex w-full flex-col items-start justify-center gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-heading-2 font-heading-2 text-default-font">
                    Reviews
                  </span>
                  <div className="flex items-center gap-1">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={20}
                          fill={
                            i < Math.round(product?.avg_rating || 0)
                              ? "currentColor"
                              : "none"
                          }
                          strokeWidth={
                            i < Math.round(product?.avg_rating || 0) ? 0 : 2
                          }
                          className={`${i >= Math.round(product?.avg_rating || 0) ? "text-neutral-300" : "text-brand-600"}`}
                        />
                      ))}
                    </div>
                    <span className="text-body-bold font-body-bold text-default-font">
                      {product?.avg_rating || 0}
                    </span>
                    <span className="text-body font-body text-subtext-color">
                      ({product?.review_count || 0} reviews)
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-neutral-50 p-6 rounded-lg border border-neutral-200 flex flex-col gap-4 w-full">
                <h3 className="text-body-bold font-body-bold text-default-font">
                  Write a Review
                </h3>
                <div className="flex items-center gap-2">
                  <span className="text-caption-bold font-caption-bold text-subtext-color">
                    Rating:
                  </span>
                  <div className="flex cursor-pointer text-brand-600">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={20}
                        onClick={() => setNewReviewRating(star)}
                        fill={star <= newReviewRating ? "currentColor" : "none"}
                        strokeWidth={star <= newReviewRating ? 0 : 2}
                        className={`transition-colors hover:text-brand-700 ${star > newReviewRating ? "text-neutral-300" : ""}`}
                      />
                    ))}
                  </div>
                </div>
                <textarea
                  className="w-full p-3 border border-neutral-200 rounded-md text-body font-body outline-none focus:border-brand-600 resize-none bg-white"
                  rows="3"
                  placeholder="Share your experience with this product..."
                  value={newReviewContent}
                  onChange={(e) => setNewReviewContent(e.target.value)}
                />
                <div className="flex justify-end">
                  <Button
                    onClick={handleSubmitReview}
                    isLoading={submittingReview}
                  >
                    Submit Review
                  </Button>
                </div>
              </div>

              {reviews.length === 0 ? (
                <p className="text-body font-body text-subtext-color italic p-8 border border-dashed border-neutral-200 rounded-lg text-center bg-neutral-50 w-full">
                  No reviews yet. Be the first to review this product!
                </p>
              ) : (
                <div className="w-full items-start gap-6 grid grid-cols-1 md:grid-cols-2">
                  {reviews.map((review) => {
                    const isOwner = user?.username === review.username;

                    return (
                      <div
                        key={review.review_id}
                        className="flex grow shrink-0 basis-0 flex-col items-start gap-1 p-4 border border-neutral-200 rounded-lg bg-white hover:border-brand-600 transition-colors relative group"
                      >
                        {editingReviewId === review.review_id ? (
                          <div className="flex flex-col gap-3 w-full">
                            <div className="flex text-brand-600 cursor-pointer">
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
                                    star > editRating ? "text-neutral-300" : ""
                                  }
                                />
                              ))}
                            </div>
                            <textarea
                              className="w-full p-2 border border-neutral-200 rounded text-sm outline-none focus:border-brand-600"
                              rows="3"
                              value={editContent}
                              onChange={(e) => setEditContent(e.target.value)}
                            />
                            <div className="flex gap-2 justify-end">
                              <button
                                onClick={() => setEditingReviewId(null)}
                                className="text-xs font-bold text-subtext-color hover:underline"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() =>
                                  handleUpdateReview(review.review_id)
                                }
                                className="text-xs font-bold text-brand-600 hover:underline"
                              >
                                Save
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            {isOwner && (
                              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 bg-white pl-2">
                                <button
                                  onClick={() => {
                                    setEditingReviewId(review.review_id);
                                    setEditContent(review.content);
                                    setEditRating(review.rating);
                                  }}
                                  className="text-subtext-color hover:text-brand-600"
                                  title="Edit"
                                >
                                  <Edit2 size={14} />
                                </button>
                                <button
                                  onClick={() =>
                                    handleDeleteClick(review.review_id)
                                  }
                                  className="text-subtext-color hover:text-error-600"
                                  title="Delete"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            )}

                            <div className="flex w-full items-center justify-between">
                              <span className="text-body-bold font-body-bold text-default-font">
                                {review.username}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <div className="flex items-center">
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
                                      i >= review.rating
                                        ? "text-neutral-300"
                                        : "text-brand-600"
                                    }
                                  />
                                ))}
                              </div>
                              <span className="text-caption font-caption text-subtext-color">
                                {review.date}
                              </span>
                            </div>
                            <span className="line-clamp-3 text-body font-body text-default-font">
                              "{review.content}"
                            </span>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              <Button
                variant="neutral-primary"
                className="h-10 w-full"
                size="large"
              >
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
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <span className="text-xs font-bold uppercase text-[#0969da] bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-md">
                        {product?.category_name}
                      </span>
                      {product?.brand && (
                        <Link
                          to={`/?brand=${encodeURIComponent(product.brand)}`}
                          className="inline-block"
                        >
                          <span className="text-xs font-bold uppercase text-[#1f2328] border border-[#d0d7de] px-2 py-0.5 rounded-md transition-all duration-200 hover:text-[#0969da] hover:border-[#0969da] hover:shadow-[0_0_0_1px_#0969da]">
                            {product?.brand}
                          </span>
                        </Link>
                      )}
                      {product?.sku && (
                        <span className="text-[11px] font-mono text-[#6e7781] px-1">
                          SKU: {product?.sku}
                        </span>
                      )}
                    </div>
                  </div>
                  <button className="p-2 border border-[#d0d7de] rounded-md hover:bg-red-50 hover:text-red-500 transition-colors">
                    <Heart size={20} />
                  </button>
                </div>

                <div className="flex items-end gap-3 mt-2">
                  {product?.discount_price ? (
                    <>
                      <span className="text-3xl font-black text-[#cf222e]">
                        ${product?.discount_price.toFixed(2)}
                      </span>
                      <span className="text-lg font-bold text-[#6e7781] line-through mb-1">
                        ${product?.price.toFixed(2)}
                      </span>
                      <span className="text-xs font-bold text-[#cf222e] bg-[#ffebe9] px-2 py-1 rounded-md mb-2">
                        Save $
                        {(product?.price - product?.discount_price).toFixed(2)}
                      </span>
                    </>
                  ) : (
                    <span className="text-3xl font-black text-[#1f2328]">
                      ${product?.price?.toFixed(2)}
                    </span>
                  )}
                </div>
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
                    className={`font-bold ${!product?.is_active ? "text-[#cf222e]" : product?.stock_quantity > 0 ? "text-[#1a7f37]" : "text-[#cf222e]"}`}
                  >
                    {!product?.is_active
                      ? "Currently Unavailable"
                      : product?.stock_quantity > 0
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
                  disabled={product?.stock_quantity <= 0 || !product?.is_active}
                  className="py-3 text-base font-black shadow-sm"
                >
                  {product?.stock_quantity <= 0 || !product?.is_active
                    ? "Unavailable"
                    : "Add to cart"}
                </Button>
                <Button
                  fullWidth
                  variant="outline"
                  className="py-3 text-base font-bold bg-[#f6f8fa]"
                  disabled={product?.stock_quantity <= 0 || !product?.is_active}
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

            {product?.specifications &&
              Object.keys(product.specifications).length > 0 && (
                <div className="flex flex-col gap-3 mb-6">
                  <h3 className="text-lg font-bold text-[#1f2328] border-b border-[#d0d7de] pb-2">
                    Specifications
                  </h3>
                  <div className="flex flex-col border border-[#d0d7de] rounded-lg overflow-hidden text-sm">
                    {Object.entries(product.specifications).map(
                      ([key, value], index) => (
                        <div
                          key={key}
                          className={`flex ${index % 2 === 0 ? "bg-[#f6f8fa]" : "bg-white"} border-b border-[#d0d7de] last:border-0`}
                        >
                          <div className="w-1/3 p-3 font-bold text-[#1f2328] border-r border-[#d0d7de] break-words">
                            {key}
                          </div>
                          <div className="w-2/3 p-3 text-[#6e7781] break-words">
                            {value}
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                </div>
              )}

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
              to={`/?category_id=${product?.category_id}`}
              className="flex items-center text-sm font-bold text-[#0969da] hover:underline"
            >
              View all <ChevronRight size={16} />
            </Link>
          </div>

          {loadingSimilar ? (
            <div className="flex justify-center py-10">
              <Loader2 className="animate-spin text-[#0969da]" size={32} />
            </div>
          ) : similarProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {similarProducts.map((product) => (
                <ProductCard
                  key={product.product_id}
                  product={product}
                  onAddToCart={(productId) => {
                    const handleAddSimilarToCart = async () => {
                      if (!localStorage.getItem("token")) {
                        addToast("Please login first!", "info");
                        navigate(location.pathname, {
                          state: { openLogin: true },
                          replace: true,
                        });
                        return;
                      }
                      try {
                        await api.post("/cart", {
                          product_id: productId,
                          quantity: 1,
                        });
                        addToast("Added to cart successfully!", "success");
                        fetchCartCount();
                      } catch (err) {
                        addToast("Error adding to cart", "error");
                      }
                    };
                    handleAddSimilarToCart();
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <p className="col-span-full text-center text-[#6e7781] italic py-10 bg-[#f6f8fa] border border-dashed border-[#d0d7de] rounded-xl">
                No similar products found at the moment.
              </p>
            </div>
          )}
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
