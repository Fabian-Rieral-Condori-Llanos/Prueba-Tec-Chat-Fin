"use client";

import { ButtonHTMLAttributes, ReactNode } from "react";
import { Loader2 } from "lucide-react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  children: ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  isLoading = false,
  children,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  // Función para obtener las clases del variant
  const getVariantClasses = () => {
    switch (variant) {
      case "primary":
        return "bg-blue-600 text-white hover:bg-blue-700";
      case "secondary":
        return "bg-gray-600 text-white hover:bg-gray-700";
      case "outline":
        return "border-2 border-blue-600 text-blue-600 hover:bg-blue-50";
      case "ghost":
        return "text-blue-600 hover:bg-blue-50";
      default:
        return "bg-blue-600 text-white hover:bg-blue-700";
    }
  };

  // Función para obtener las clases del size
  const getSizeClasses = () => {
    switch (size) {
      case "sm":
        return "px-4 py-2 text-sm min-h-[40px]";
      case "md":
        return "px-6 py-3 text-base min-h-[48px]";
      case "lg":
        return "px-8 py-4 text-lg min-h-[56px]";
      default:
        return "px-6 py-3 text-base min-h-[48px]";
    }
  };

  return (
    <button
      className={`
        font-semibold rounded-lg transition 
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
        disabled:opacity-50 disabled:cursor-not-allowed 
        flex items-center justify-center
        ${getVariantClasses()}
        ${getSizeClasses()}
        ${className}
      `}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
}