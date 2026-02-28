import React from "react";
import { Loader2 } from "lucide-react";

const Button = ({
  children,
  onClick,
  type = "button",
  variant = "primary",
  isLoading = false,
  disabled = false,
  className = "",
  fullWidth = false,
}) => {
  const baseStyle =
    "flex justify-center items-center px-4 py-1.5 rounded-md font-semibold text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-60 disabled:cursor-not-allowed border";
  const widthStyle = fullWidth ? "w-full" : "";

  const variants = {
    primary:
      "bg-[#0969da] text-white border-[#0550ae] hover:bg-[#0861c5] focus:ring-[#0969da] shadow-sm",
    outline:
      "bg-[#f6f8fa] text-[#24292f] border-[#d0d7de] hover:bg-[#f3f4f6] focus:ring-gray-300",
    secondary:
      "bg-[#24292f] text-white border-[#1b1f24] hover:bg-[#2c333a] focus:ring-gray-500",
    danger:
      "bg-[#cf222e] text-white border-[#a40e26] hover:bg-[#a40e26] focus:ring-[#cf222e] shadow-sm",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`${baseStyle} ${widthStyle} ${variants[variant]} ${className}`}
    >
      {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
      {children}
    </button>
  );
};

export default Button;
