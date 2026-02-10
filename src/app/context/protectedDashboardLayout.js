"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";

export default function ProtectedDashboardLayout({
    children,
    allowedRoles = [],
}) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading) {
            // Not logged in → redirect to login
            if (!user) {
                router.push("/login");
            }
            // Logged in but role not allowed → redirect to their own dashboard
            else if (
                allowedRoles.length > 0 &&
                !allowedRoles.includes(user.role)
            ) {
                router.push(
                    user.role === "admin"
                        ? "/dashboard/admin"
                        : "/dashboard/student",
                );
            }
        }
    }, [user, loading, allowedRoles, router]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-green-50">
                <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-green-900 border-b-4 mb-4"></div>
                <p className="text-green-900 font-semibold text-lg">
                    Loading your dashboard...
                </p>
            </div>
        );
    }

    if (!user) return null;

    return children;
}
