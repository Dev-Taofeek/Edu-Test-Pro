import React from "react";
export function Badge({ children, variant = "neutral" }) {
    const variants = {
        success: "bg-emerald-100 text-emerald-800",
        warning: "bg-orange-100 text-orange-800",
        neutral: "bg-slate-100 text-slate-800",
        info: "bg-blue-100 text-blue-800",
    };
    return (
        <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]}`}
        >
            {children}
        </span>
    );
}
