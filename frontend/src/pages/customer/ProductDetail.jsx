import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
import Navbar from "../../components/layout/Navbar";
import Button from "../../components/common/Button";
import api from "../../services/api";
import { useToast } from "../../context/ToastContext";
import { useCart } from "../../context/CartContext"; // MỚI IMPORT
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
} from "lucide-react";
import Breadcrumbs from "../../components/common/Breadcrumbs";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { addToast } = useToast();
  const { fetchCartCount } = useCart(); // MỚI

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);

  const mockReviews = [
    {
      id: 1,
      author: "Janice",
      date: "Nov 24, 2025",
      rating: 5,
      content:
        "I started using this product when my son gave me a gift package. I love the quality and the packaging is unique!",
    },
    {
      id: 2,
      author: "David",
      date: "Nov 7, 2025",
      rating: 5,
      content:
        "My wife and I love this. We use it every morning. Highly recommended for everyone!",
    },
    {
      id: 3,
      author: "Anonymous",
      date: "Nov 4, 2025",
      rating: 4,
      content: "Simple and smooth experience. Great value for the price. ☕️",
    },
  ];

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
      fetchCartCount(); // MỚI: Gọi lệnh cập nhật chấm đỏ
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
                      <Star key={i} size={16} fill="currentColor" />
                    ))}
                  </div>
                  <span className="font-bold text-sm">4.9</span>
                  <span className="text-[#6e7781] text-sm">(146 reviews)</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {mockReviews.map((review) => (
                  <div
                    key={review.id}
                    className="flex flex-col gap-2 p-4 border border-[#d0d7de] rounded-lg bg-white shadow-sm"
                  >
                    <span className="font-bold text-[#1f2328]">
                      {review.author}
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="flex text-[#0969da]">
                        {[...Array(review.rating)].map((_, i) => (
                          <Star key={i} size={14} fill="currentColor" />
                        ))}
                      </div>
                      <span className="text-xs text-[#6e7781]">
                        {review.date}
                      </span>
                    </div>
                    <p className="text-sm text-[#1f2328] leading-relaxed line-clamp-3 italic">
                      "{review.content}"
                    </p>
                  </div>
                ))}
              </div>

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
    </div>
  );
};

export default ProductDetail;
