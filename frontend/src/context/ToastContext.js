import React, { createContext, useContext, useState, useCallback } from "react";
import { X, CheckCircle, AlertCircle, Info } from "lucide-react";

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    // Tự động xóa sau 3 giây
    setTimeout(() => {
      removeToast(id);
    }, 3000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      {/* Container chứa thông báo ở góc trên bên phải */}
      <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-3 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between min-w-[320px] max-w-md p-4 rounded-xl shadow-2xl border bg-white transform transition-all duration-300 animate-slide-in-right ${
              toast.type === "success"
                ? "border-green-100 text-green-800"
                : toast.type === "error"
                  ? "border-red-100 text-red-800"
                  : "border-blue-100 text-blue-800"
            }`}
          >
            <div className="flex items-center">
              {toast.type === "success" && (
                <CheckCircle className="w-5 h-5 mr-3 text-green-500" />
              )}
              {toast.type === "error" && (
                <AlertCircle className="w-5 h-5 mr-3 text-red-500" />
              )}
              {toast.type === "info" && (
                <Info className="w-5 h-5 mr-3 text-blue-500" />
              )}
              <span className="font-semibold text-sm">{toast.message}</span>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="ml-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        ))}
      </div>
      <style>{`
        @keyframes slide-in-right {
          0% { transform: translateX(100%); opacity: 0; }
          100% { transform: translateX(0); opacity: 1; }
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }
      `}</style>
    </ToastContext.Provider>
  );
};
