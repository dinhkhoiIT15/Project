import { useState, useEffect } from "react";
import { io } from "socket.io-client";
import api from "../../services/api";
import { useToast } from "../../context/ToastContext";

const useManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchUsername, setSearchUsername] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const { addToast } = useToast();

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [userToToggle, setUserToToggle] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({
    phone_number: "",
    address: "",
    password: "",
  });
  const [isUpdatingInfo, setIsUpdatingInfo] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/users`, {
        params: {
          search: searchUsername || undefined,
          page: currentPage,
        },
      });
      setUsers(res.data.users || []);
      setTotalPages(res.data.total_pages || 1);
    } catch (err) {
      addToast("Failed to load users", "error");
    } finally {
      setLoading(false);
    }
  };

  // Đã thêm refreshKey vào dependencies để socket tự động cập nhật danh sách
  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchUsername, currentPage, refreshKey]);

  useEffect(() => {
    const socket = io("http://localhost:5000");

    socket.on("user_list_updated", () => {
      setRefreshKey((prev) => prev + 1);
    });

    return () => socket.disconnect();
  }, []);

  const handleEditClick = (user) => {
    setEditingUser(user);
    setEditForm({
      phone_number: user.phone_number || "",
      address: user.address || "",
      password: "",
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateUserInfo = async (e) => {
    e.preventDefault();
    setIsUpdatingInfo(true);
    try {
      await api.put(`/admin/users/${editingUser.id}/info`, editForm);
      addToast("User information updated successfully", "success");
      setIsEditModalOpen(false);
      fetchUsers();
    } catch (err) {
      addToast(err.response?.data?.message || "Failed to update info", "error");
    } finally {
      setIsUpdatingInfo(false);
    }
  };

  const handleToggleClick = (user) => {
    setUserToToggle(user);
    setIsConfirmOpen(true);
  };

  const confirmToggleStatus = async () => {
    if (!userToToggle) return;
    setIsProcessing(true);
    try {
      await api.put(`/admin/users/${userToToggle.id}/status`);
      addToast(
        `User account ${
          userToToggle.account_status === "activated" ? "locked" : "unlocked"
        } successfully`,
        "success",
      );
      fetchUsers();
    } catch (err) {
      addToast(
        err.response?.data?.message || "Failed to update status",
        "error",
      );
    } finally {
      setIsProcessing(false);
      setIsConfirmOpen(false);
      setUserToToggle(null);
    }
  };

  return {
    users,
    loading,
    searchUsername,
    setSearchUsername,
    currentPage,
    setCurrentPage,
    totalPages,
    isConfirmOpen,
    setIsConfirmOpen,
    userToToggle,
    isProcessing,
    isEditModalOpen,
    setIsEditModalOpen,
    editingUser,
    editForm,
    setEditForm,
    isUpdatingInfo,
    handleEditClick,
    handleUpdateUserInfo,
    handleToggleClick,
    confirmToggleStatus,
  };
};

export default useManageUsers;