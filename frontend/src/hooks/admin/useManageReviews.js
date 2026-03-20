import { useState, useEffect } from "react";
import { io } from "socket.io-client";
import api from "../../services/api";
import { useToast } from "../../context/ToastContext";

const useManageReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("real");

  const [filterProductId, setFilterProductId] = useState("");
  const [filterUsername, setFilterUsername] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { addToast } = useToast();

  const [testContent, setTestContent] = useState("");
  const [testResult, setTestResult] = useState(null);
  const [testLoading, setTestLoading] = useState(false);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [isContextModalOpen, setIsContextModalOpen] = useState(false);
  const [contextData, setContextData] = useState(null);
  const [contextLoading, setContextLoading] = useState(false);

  const handleOpenContext = async (productId) => {
    setIsContextModalOpen(true);
    setContextLoading(true);
    try {
      const res = await api.get(`/reviews/admin/product-context/${productId}`);
      setContextData(res.data);
    } catch (err) {
      addToast("Failed to load product context", "error");
      setIsContextModalOpen(false);
    } finally {
      setContextLoading(false);
    }
  };

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
          tab: activeTab,
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

  useEffect(() => {
    fetchReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterProductId, filterUsername, currentPage, activeTab]);

  useEffect(() => {
    const socket = io("http://localhost:5000"); 
    socket.on("review_list_updated", () => {
      fetchReviews();
    });
    return () => socket.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, activeTab, filterProductId, filterUsername]);

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

  const handleAccept = async (id) => {
    try {
      await api.put(`/reviews/${id}/accept`);
      addToast("Review accepted as real", "success");
      fetchReviews();
    } catch (err) {
      addToast("Accept failed", "error");
    }
  };

  return {
    reviews,
    loading,
    activeTab,
    setActiveTab,
    filterProductId,
    setFilterProductId,
    filterUsername,
    setFilterUsername,
    currentPage,
    setCurrentPage,
    totalPages,
    testContent,
    setTestContent,
    testResult,
    testLoading,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    isDeleting,
    isContextModalOpen,
    setIsContextModalOpen,
    contextData,
    contextLoading,
    handleOpenContext,
    handleTestAI,
    handleDeleteClick,
    confirmDelete,
    toggleHide,
    handleAccept,
  };
};

export default useManageReviews;