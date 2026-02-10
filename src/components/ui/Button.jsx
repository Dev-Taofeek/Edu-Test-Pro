import React from "react";
export function Button({
    children,
    variant = "primary",
    size = "md",
    fullWidth = false,
    className = "",
    disabled,
    ...props
}) {
    const baseStyles =
        "inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
    const variants = {
        primary: "bg-blue-900 text-white hover:bg-blue-800 focus:ring-blue-900",
        secondary:
            "bg-emerald-500 text-white hover:bg-emerald-600 focus:ring-emerald-500",
        outline:
            "border-2 border-slate-200 text-slate-700 hover:border-blue-900 hover:text-blue-900 bg-transparent",
        danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-600",
        ghost: "bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900",
    };
    const sizes = {
        sm: "px-3 py-1.5 text-sm",
        md: "px-4 py-2 text-base",
        lg: "px-6 py-3 text-lg",
    };
    const width = fullWidth ? "w-full" : "";
    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${width} ${className}`}
            disabled={disabled}
            {...props}
        >
            {children}
        </button>
    );
}
