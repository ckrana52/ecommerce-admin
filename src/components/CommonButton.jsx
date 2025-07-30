import React from "react";

export default function CommonButton({ type = "button", color = "primary", icon, children, className = "", ...props }) {
  const colorClass = {
    primary: "bg-blue-600 hover:bg-blue-700",
    danger: "bg-red-500 hover:bg-red-600",
    success: "bg-green-500 hover:bg-green-600",
    warning: "bg-yellow-400 hover:bg-yellow-500 text-gray-900",
    gray: "bg-gray-500 hover:bg-gray-600",
    white: "bg-white text-gray-800 border border-gray-300 hover:bg-gray-100",
  }[color] || "bg-blue-600 hover:bg-blue-700";

  return (
    <button
      type={type}
      className={`action-button flex items-center gap-2 px-4 py-2 rounded-md text-white font-medium shadow transition-all ${colorClass} ${className}`}
      {...props}
    >
      {icon && <span className="text-lg flex items-center">{icon}</span>}
      <span>{children}</span>
    </button>
  );
} 