import React from "react";
import Button from "./Button";
import { AlertTriangle, X } from "lucide-react";

const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Action",
  message = "Are you sure you want to perform this action? This cannot be undone.",
  confirmText = "Delete",
  type = "danger",
  isLoading = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in">
      <div
        className="absolute inset-0 bg-[#00000099] backdrop-blur-[2px]"
        onClick={onClose}
      />

      <div className="relative bg-white w-full max-w-md rounded-lg border border-[#d0d7de] shadow-2xl overflow-hidden animate-slide-up">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#d0d7de] bg-[#f6f8fa]">
          <h3 className="text-sm font-bold text-[#1f2328] flex items-center gap-2">
            <AlertTriangle
              size={16}
              className={
                type === "danger" ? "text-[#cf222e]" : "text-[#9a6700]"
              }
            />
            {title}
          </h3>
          <button
            onClick={onClose}
            className="text-[#6e7781] hover:text-[#1f2328] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6">
          <p className="text-sm text-[#1f2328] leading-relaxed">{message}</p>
        </div>

        <div className="px-4 py-3 bg-[#f6f8fa] border-t border-[#d0d7de] flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            variant={type === "danger" ? "danger" : "primary"}
            onClick={onConfirm}
            isLoading={isLoading}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
