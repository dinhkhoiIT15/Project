import React from "react";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import {
  Users,
  Search,
  Lock,
  Unlock,
  ShieldCheck,
  ShieldAlert,
  Edit,
  X,
} from "lucide-react";
import Pagination from "../../components/common/Pagination";
import useManageUsers from "../../hooks/admin/useManageUsers";

const ManageUsers = () => {
  const {
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
  } = useManageUsers();

  return (
    <div className="p-6">
      <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold flex items-center gap-2 text-[#1f2328]">
          <Users className="text-[#0969da]" /> Manage Users
        </h1>

        <div className="relative">
          <Search
            className="absolute left-3 top-2.5 text-[#6e7781]"
            size={16}
          />
          <input
            type="text"
            placeholder="Search username..."
            className="pl-9 pr-4 py-2 bg-white border border-[#d0d7de] rounded-md text-sm outline-none w-64 shadow-sm focus:border-[#0969da]"
            value={searchUsername}
            onChange={(e) => {
              setSearchUsername(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
      </div>

      <div className="bg-white border border-[#d0d7de] rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f6f8fa] border-b border-[#d0d7de] text-[#6e7781] text-xs uppercase tracking-wider">
                <th className="p-4 font-bold">ID</th>
                <th className="p-4 font-bold">Username</th>
                <th className="p-4 font-bold">Phone</th>
                <th className="p-4 font-bold">Role</th>
                <th className="p-4 font-bold">Status</th>
                <th className="p-4 font-bold text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {loading ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-[#6e7781]">
                    Loading users...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-[#6e7781]">
                    No users found.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr
                    key={u.id}
                    className={`border-b border-[#d0d7de] transition-colors ${
                      u.account_status === "locked"
                        ? "bg-[#fff8f7] opacity-80"
                        : "hover:bg-[#f6f8fa]/50"
                    }`}
                  >
                    <td className="p-4 font-mono text-xs text-[#6e7781]">
                      #{u.id}
                    </td>
                    <td className="p-4 font-bold text-[#1f2328] flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-[#0969da] text-white flex items-center justify-center font-bold text-xs uppercase">
                        {u.username[0]}
                      </div>
                      {u.username}
                    </td>
                    <td className="p-4 text-[#6e7781]">
                      {u.phone_number || "N/A"}
                    </td>
                    <td className="p-4">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                          u.role === "Admin"
                            ? "bg-[#ddf4ff] text-[#0969da] border-[#0969da]/20"
                            : "bg-[#f6f8fa] text-[#1f2328] border-[#d0d7de]"
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="p-4">
                      {u.account_status === "activated" ? (
                        <span className="flex items-center gap-1 text-[11px] font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded w-fit">
                          <ShieldCheck size={12} /> Active
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[11px] font-bold text-[#cf222e] bg-[#ffebe9] px-2 py-0.5 rounded w-fit">
                          <ShieldAlert size={12} /> Locked
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-center flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleEditClick(u)}
                        className="p-2 rounded transition-colors text-[#6e7781] hover:text-[#0969da] hover:bg-[#ddf4ff]"
                        title="Edit User Info"
                      >
                        <Edit size={18} />
                      </button>

                      <button
                        onClick={() => handleToggleClick(u)}
                        className={`p-2 rounded transition-colors ${
                          u.account_status === "activated"
                            ? "text-[#6e7781] hover:text-[#cf222e] hover:bg-[#ffebe9]"
                            : "text-[#cf222e] hover:text-green-700 hover:bg-green-100"
                        }`}
                        title={
                          u.account_status === "activated"
                            ? "Lock User"
                            : "Unlock User"
                        }
                      >
                        {u.account_status === "activated" ? (
                          <Lock size={18} />
                        ) : (
                          <Unlock size={18} />
                        )}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />

      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={confirmToggleStatus}
        title={
          userToToggle?.account_status === "activated"
            ? "Lock User Account"
            : "Unlock User Account"
        }
        message={
          userToToggle?.account_status === "activated"
            ? `Are you sure you want to lock the account of "${userToToggle?.username}"? They will be forcefully logged out and unable to log back in.`
            : `Are you sure you want to unlock the account of "${userToToggle?.username}"? They will regain access to the system.`
        }
        confirmText={
          userToToggle?.account_status === "activated"
            ? "Lock Account"
            : "Unlock Account"
        }
        type={
          userToToggle?.account_status === "activated" ? "danger" : "primary"
        }
        isLoading={isProcessing}
      />

      {isEditModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setIsEditModalOpen(false)}
          />
          <div className="relative bg-white w-full max-w-md rounded-xl border border-[#d0d7de] shadow-2xl overflow-hidden animate-slide-up">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#d0d7de] bg-[#f6f8fa]">
              <h3 className="text-lg font-black text-[#1f2328]">
                Edit User Profile
              </h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-[#6e7781] hover:text-[#1f2328]"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUpdateUserInfo} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#1f2328] mb-1">
                  Username (Read-only)
                </label>
                <input
                  type="text"
                  disabled
                  value={editingUser?.username}
                  className="w-full px-3 py-2 bg-[#f6f8fa] border border-[#d0d7de] rounded-md text-sm text-[#6e7781] cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1f2328] mb-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={editForm.phone_number}
                  onChange={(e) =>
                    setEditForm({ ...editForm, phone_number: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-white border border-[#d0d7de] rounded-md text-sm outline-none focus:border-[#0969da]"
                  placeholder="Enter phone number"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1f2328] mb-1">
                  Address
                </label>
                <textarea
                  rows="2"
                  value={editForm.address}
                  onChange={(e) =>
                    setEditForm({ ...editForm, address: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-white border border-[#d0d7de] rounded-md text-sm outline-none focus:border-[#0969da]"
                  placeholder="Enter shipping address"
                ></textarea>
              </div>

              <div className="pt-4 border-t border-[#d0d7de]">
                <label className="block text-xs font-bold text-[#cf222e] mb-1">
                  Reset Password (Optional)
                </label>
                <input
                  type="password"
                  value={editForm.password}
                  onChange={(e) =>
                    setEditForm({ ...editForm, password: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-white border border-[#cf222e]/40 rounded-md text-sm outline-none focus:border-[#cf222e] placeholder:text-red-300"
                  placeholder="Leave blank to keep current password"
                />
                <p className="text-[10px] text-[#6e7781] mt-1">
                  If changed, the user will be logged out immediately.
                </p>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 text-sm font-bold text-[#6e7781] hover:bg-[#f6f8fa] rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingInfo}
                  className="px-4 py-2 text-sm font-bold text-white bg-[#0969da] hover:bg-blue-700 rounded-md transition-colors disabled:opacity-50 flex items-center"
                >
                  {isUpdatingInfo ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageUsers;
