import React, { useState, useEffect } from "react";
import { useSearchParams, useLocation, useNavigate } from "react-router-dom";
import Navbar from "../../components/layout/Navbar";
import ProductCard from "../../components/common/ProductCard";
import Pagination from "../../components/common/Pagination";
import Breadcrumbs from "../../components/common/Breadcrumbs";
import api from "../../services/api";
import { useToast } from "../../context/ToastContext";
import { useCart } from "../../context/CartContext";
import { Loader2 } from "lucide-react";
import { io } from "socket.io-client"; // MỚI IMPORT

const Home = () => {
  const [products, setProducts] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0); // MỚI: State an toàn để trigger API
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();
  const { fetchCartCount } = useCart(); // MỚI: Lấy hàm cập nhật số lượng
  const navigate = useNavigate(); // <-- THÊM DÒNG NÀY

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Dời việc lấy URL lên trên để sử dụng ngay cho State
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const searchTerm = searchParams.get("search") || "";
  const categoryParam = searchParams.get("category_id") || "";

  // CẬP NHẬT: Khởi tạo State trực tiếp bằng dữ liệu từ URL thay vì chuỗi rỗng ""
  // Việc này chặn đứng hoàn toàn lỗi gọi sai API ở lần tải trang đầu tiên.
  const [selectedCategory, setSelectedCategory] = useState(categoryParam);

  // CẬP NHẬT: Thay vì luôn xóa trắng (reset về All Categories), ta gán giá trị
  // bằng với ID của danh mục đang có trên URL (nếu có)
  useEffect(() => {
    setSelectedCategory(categoryParam);
  }, [location.key, categoryParam]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory]);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, currentPage, searchTerm, refreshKey]); // MỚI: Thêm refreshKey

  // MỚI: Lắng nghe tín hiệu từ Admin để tự load lại danh sách sản phẩm
  useEffect(() => {
    const socket = io("http://localhost:5000");

    socket.on("product_list_updated", () => {
      setRefreshKey((prev) => prev + 1); // An toàn cập nhật mà không làm loạn trạng thái filter hiện tại
    });

    return () => socket.disconnect();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await api.get("/categories");
      setCategories(res.data.categories || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      // Dùng selectedCategory làm nguồn duy nhất vì URL và Dropdown đã được đồng bộ
      const res = await api.get(
        `/products?search=${searchTerm}&category_id=${selectedCategory}&page=${currentPage}&per_page=8`,
      );

      // Chỉ cập nhật state nếu kết quả trả về thành công
      if (res.data.status === "success") {
        setProducts(res.data.products || []);
        setTotalPages(res.data.total_pages || 1);
      }
    } catch (err) {
      addToast("Error loading products", "error");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (productId) => {
    if (!localStorage.getItem("token") && !sessionStorage.getItem("token")) {
      addToast("Sign in to add to cart", "info");
      return;
    }
    try {
      await api.post("/cart", { product_id: productId, quantity: 1 });
      addToast("Product added to cart!", "success");
      fetchCartCount(); // MỚI: Gọi lệnh cập nhật chấm đỏ trên Navbar
    } catch (err) {
      addToast("Failed to add", "error");
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8 p-8 border border-[#d0d7de] rounded-lg bg-[#f6f8fa]">
          <h1 className="text-2xl font-bold text-[#1f2328] mb-2">
            Welcome to our online store
          </h1>
          <p className="text-[#6e7781] text-sm leading-relaxed">
            Browse and discover high-quality products curated for your needs.
          </p>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center gap-3 mb-8">
          <Breadcrumbs className="!mb-0">
            <Breadcrumbs.Item to="/">Home</Breadcrumbs.Item>
            <Breadcrumbs.Divider />
            {searchTerm ? (
              <Breadcrumbs.Item active>
                Search results for "{searchTerm}"
              </Breadcrumbs.Item>
            ) : selectedCategory ? (
              <Breadcrumbs.Item active>
                {categories.find(
                  (c) => c.category_id.toString() === selectedCategory,
                )?.name || "Category"}
              </Breadcrumbs.Item>
            ) : (
              <Breadcrumbs.Item active>All Products</Breadcrumbs.Item>
            )}
          </Breadcrumbs>

          <select
            className="bg-[#f6f8fa] border border-[#d0d7de] rounded-md px-3 py-1.5 text-sm font-semibold outline-none cursor-pointer hover:bg-[#eff1f3] min-w-[200px]"
            value={selectedCategory}
            onChange={(e) => {
              const val = e.target.value;
              // Thay đổi URL thay vì đổi State. URL đổi sẽ kéo theo Breadcrumbs thay đổi!
              if (val) {
                navigate(`/?category_id=${val}`);
              } else {
                navigate("/");
              }
            }}
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.category_id} value={cat.category_id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-[#0969da]" />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-[#d0d7de] rounded-lg text-[#6e7781]">
            No products match your criteria.
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {products.map((p) => (
                <ProductCard
                  key={p.product_id}
                  product={p}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(page) => {
                setCurrentPage(page);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            />
          </>
        )}
      </main>
    </div>
  );
};

export default Home;
