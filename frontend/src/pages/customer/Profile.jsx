import React, { useState, useEffect } from "react";
import Navbar from "../../components/layout/Navbar";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import api from "../../services/api";
import { useToast } from "../../context/ToastContext";
import { User, Lock, Eye, EyeOff } from "lucide-react"; // MỚI: Import thêm Eye và EyeOff
import Breadcrumbs from "../../components/common/Breadcrumbs";

const Profile = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const [profileData, setProfileData] = useState({
    username: "",
    phone_number: "",
    address: "",
  });
  const [loading, setLoading] = useState(false);

  // MỚI: State cho form đổi mật khẩu (Mặc định trống trơn)
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

  // MỚI: Hàm xử lý Đổi mật khẩu
  const handlePasswordUpdate = async (e) => {
    e.preventDefault();

    // Kiểm tra mật khẩu mới và xác nhận có khớp nhau không ngay tại Frontend
    if (passwords.new !== passwords.confirm) {
      addToast("New passwords do not match!", "error");
      return;
    }

    setPassLoading(true);
    try {
      // Giả định bạn đã có endpoint này ở Backend (trong user_controller.py)
      await api.put("/user/change-password", {
        old_password: passwords.old,
        new_password: passwords.new,
      });
      addToast("Password updated successfully!", "success");

      // Xóa trắng các ô input sau khi đổi thành công
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

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <Breadcrumbs>
          <Breadcrumbs.Item to="/">Home</Breadcrumbs.Item>
          <Breadcrumbs.Divider />
          <Breadcrumbs.Item active>Account Settings</Breadcrumbs.Item>
        </Breadcrumbs>

        <div className="flex flex-col md:flex-row gap-8 mt-6">
          <div className="w-full md:w-64 space-y-1">
            <h3 className="px-3 text-xs font-bold text-[#6e7781] uppercase mb-2">
              User Settings
            </h3>
            <button
              onClick={() => setActiveTab("profile")}
              className={`w-full flex items-center px-3 py-2 text-sm rounded-md font-medium transition-colors ${activeTab === "profile" ? "bg-white border border-[#d0d7de] text-[#1f2328] border-l-4 border-l-[#0969da]" : "text-[#6e7781] hover:bg-[#f6f8fa]"}`}
            >
              <User className="w-4 h-4 mr-3" /> Public Profile
            </button>
            <button
              onClick={() => setActiveTab("password")}
              className={`w-full flex items-center px-3 py-2 text-sm rounded-md font-medium transition-colors ${activeTab === "password" ? "bg-white border border-[#d0d7de] text-[#1f2328] border-l-4 border-l-[#0969da]" : "text-[#6e7781] hover:bg-[#f6f8fa]"}`}
            >
              <Lock className="w-4 h-4 mr-3" /> Password & Security
            </button>
          </div>

          <div className="flex-1 max-w-2xl">
            <div className="border border-[#d0d7de] rounded-lg bg-white overflow-hidden shadow-sm">
              <div className="bg-[#f6f8fa] p-4 border-b border-[#d0d7de]">
                <h2 className="font-bold text-[#1f2328]">
                  {activeTab === "profile"
                    ? "Public Profile"
                    : "Change Password"}
                </h2>
              </div>
              <div className="p-6">
                {activeTab === "profile" ? (
                  <form onSubmit={handleProfileUpdate} className="space-y-4">
                    <Input
                      label="Username"
                      value={profileData.username}
                      disabled
                    />
                    <Input
                      label="Phone Number"
                      value={profileData.phone_number}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          phone_number: e.target.value,
                        })
                      }
                    />
                    <Input
                      label="Shipping Address"
                      value={profileData.address}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          address: e.target.value,
                        })
                      }
                    />
                    <Button type="submit" isLoading={loading}>
                      Update Profile
                    </Button>
                  </form>
                ) : (
                  <form onSubmit={handlePasswordUpdate} className="space-y-5">
                    {/* Ô Nhập Mật khẩu cũ */}
                    <div>
                      <label className="block text-sm font-bold text-[#1f2328] mb-1.5">
                        Old Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          // MỚI: Thêm pr-10 để chống lẹm chữ và [&::-ms-reveal]:hidden để ẩn mắt mặc định của Edge
                          className="w-full border border-[#d0d7de] rounded-md pl-3 pr-10 py-2 text-sm focus:outline-none focus:border-[#0969da] focus:ring-1 focus:ring-[#0969da] bg-[#f6f8fa] focus:bg-white transition-colors [&::-ms-reveal]:hidden"
                          value={passwords.old}
                          onChange={(e) =>
                            setPasswords({ ...passwords, old: e.target.value })
                          }
                          required
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-2.5 text-[#6e7781] hover:text-[#1f2328] transition-colors focus:outline-none"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff size={16} />
                          ) : (
                            <Eye size={16} />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Ô Nhập Mật khẩu mới */}
                    <div>
                      <label className="block text-sm font-bold text-[#1f2328] mb-1.5">
                        New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          className="w-full border border-[#d0d7de] rounded-md pl-3 pr-10 py-2 text-sm focus:outline-none focus:border-[#0969da] focus:ring-1 focus:ring-[#0969da] bg-[#f6f8fa] focus:bg-white transition-colors [&::-ms-reveal]:hidden"
                          value={passwords.new}
                          onChange={(e) =>
                            setPasswords({ ...passwords, new: e.target.value })
                          }
                          required
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-2.5 text-[#6e7781] hover:text-[#1f2328] transition-colors focus:outline-none"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff size={16} />
                          ) : (
                            <Eye size={16} />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Ô Xác nhận Mật khẩu mới */}
                    <div>
                      <label className="block text-sm font-bold text-[#1f2328] mb-1.5">
                        Confirm New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          className="w-full border border-[#d0d7de] rounded-md pl-3 pr-10 py-2 text-sm focus:outline-none focus:border-[#0969da] focus:ring-1 focus:ring-[#0969da] bg-[#f6f8fa] focus:bg-white transition-colors [&::-ms-reveal]:hidden"
                          value={passwords.confirm}
                          onChange={(e) =>
                            setPasswords({
                              ...passwords,
                              confirm: e.target.value,
                            })
                          }
                          required
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-2.5 text-[#6e7781] hover:text-[#1f2328] transition-colors focus:outline-none"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {/* MỚI: Đã mở comment ra để hiển thị bình thường */}
                          {showPassword ? (
                            <EyeOff size={16} />
                          ) : (
                            <Eye size={16} />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="pt-2">
                      <Button type="submit" isLoading={passLoading}>
                        Update Password
                      </Button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;
