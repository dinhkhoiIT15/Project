import { useState, useEffect } from "react";
import { useSearchParams, useLocation, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import api from "../../services/api";
import { useToast } from "../../context/ToastContext";
import { useCart } from "../../context/CartContext";

const useHome = () => {
  const [products, setProducts] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();
  const { fetchCartCount } = useCart();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const searchTerm = searchParams.get("search") || "";
  const categoryParam = searchParams.get("category_id") || "";
  const brandParam = searchParams.get("brand") || "";
  const [selectedCategory, setSelectedCategory] = useState(categoryParam);
  const [selectedBrand, setSelectedBrand] = useState(brandParam);

  // Sync state với URL parameters
  useEffect(() => {
    setSelectedCategory(categoryParam);
    setSelectedBrand(brandParam);
  }, [location.key, categoryParam, brandParam]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, selectedBrand]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get("/categories");
        setCategories(res.data.categories || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const res = await api.get(
  `/products?search=${searchTerm}&category_id=${selectedCategory}&brand=${selectedBrand}&page=${currentPage}&per_page=8`,
);

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
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory, selectedBrand, currentPage, searchTerm, refreshKey]);

  useEffect(() => {
    const socket = io("http://localhost:5000");

    socket.on("product_list_updated", () => {
      setRefreshKey((prev) => prev + 1);
    });

    return () => socket.disconnect();
  }, []);

  const handleAddToCart = async (productId) => {
    if (!localStorage.getItem("token") && !sessionStorage.getItem("token")) {
      addToast("Sign in to add to cart", "info");
      return;
    }
    try {
      await api.post("/cart", { product_id: productId, quantity: 1 });
      addToast("Product added to cart!", "success");
      fetchCartCount();
    } catch (err) {
      addToast("Failed to add", "error");
    }
  };

  return {
    products,
    categories,
    loading,
    currentPage,
    setCurrentPage,
    totalPages,
    searchTerm,
    selectedCategory,
    selectedBrand,
    navigate,
    handleAddToCart,
  };
};

export default useHome;