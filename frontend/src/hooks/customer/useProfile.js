import { useState, useEffect } from "react";
import api from "../../services/api";
import { useToast } from "../../context/ToastContext";

const useProfile = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const [profileData, setProfileData] = useState({
    username: "",
    phone_number: "",
    address: "",
  });
  const [loading, setLoading] = useState(false);

  const [passwords, setPasswords] = useState({ old: "", new: "", confirm: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [passLoading, setPassLoading] = useState(false);

  const { addToast } = useToast();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/user/profile");
        setProfileData({
          username: res.data.user.username,
          phone_number: res.data.user.phone_number || "",
          address: res.data.user.address || "",
        });
      } catch (err) {
        console.error(err);
      }
    };
    fetchProfile();
  }, []);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put("/user/profile", {
        phone_number: profileData.phone_number,
        address: profileData.address,
      });
      addToast("Profile updated!", "success");
    } catch (err) {
      addToast("Error updating profile", "error");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();

    if (passwords.new !== passwords.confirm) {
      addToast("New passwords do not match!", "error");
      return;
    }

    setPassLoading(true);
    try {
      await api.put("/user/change-password", {
        old_password: passwords.old,
        new_password: passwords.new,
      });
      addToast("Password updated successfully!", "success");

      setPasswords({ old: "", new: "", confirm: "" });
      setShowPassword(false);
    } catch (err) {
      addToast(
        err.response?.data?.message || "Error updating password",
        "error",
      );
    } finally {
      setPassLoading(false);
    }
  };

  return {
    activeTab,
    setActiveTab,
    profileData,
    setProfileData,
    loading,
    passwords,
    setPasswords,
    showPassword,
    setShowPassword,
    passLoading,
    handleProfileUpdate,
    handlePasswordUpdate,
  };
};

export default useProfile;