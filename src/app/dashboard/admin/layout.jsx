"use client";

import React, { useState, useEffect } from "react";
import {
    LayoutDashboard,
    FileText,
    Users,
    BarChart,
    Settings,
    LogOut,
    Menu,
    X,
    Shield,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ProtectedDashboardLayout from "@/app/context/protectedDashboardLayout";
import { useAuth } from "@/app/context/AuthContext";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function AdminDashboardLayout({ children }) {
    const { user, logout } = useAuth();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [userData, setUserData] = useState(null);
    const [isLoadingUserData, setIsLoadingUserData] = useState(true);
    const pathname = usePathname();

    // Close sidebar on route change
    useEffect(() => {
        setIsSidebarOpen(false);
    }, [pathname]);

    const navigation = [
        { name: "Dashboard", href: "/dashboard/admin", icon: LayoutDashboard },
        {
            name: "Create Exam",
            href: "/dashboard/admin/create-exam",
            icon: FileText,
        },
        {
            name: "Manage Students",
            href: "/dashboard/admin/manage-students",
            icon: Users,
        },
        {
            name: "View Reports",
            href: "/dashboard/admin/reports",
            icon: BarChart,
        },
        { name: "Settings", href: "/dashboard/admin/settings", icon: Settings },
    ];

    useEffect(() => {
        const fetchUserData = async () => {
            if (!user?.uid) return;
            try {
                setIsLoadingUserData(true);
                const userDoc = await getDoc(doc(db, "users", user.uid));
                if (userDoc.exists()) setUserData(userDoc.data());
            } catch (error) {
                console.error("Error fetching user data:", error);
            } finally {
                setIsLoadingUserData(false);
            }
        };
        fetchUserData();
    }, [user?.uid]);

    if (!user || isLoadingUserData) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-green-50">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-green-900 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-700 font-semibold">
                        Loading dashboard...
                    </p>
                </div>
            </div>
        );
    }

    const firstName = userData?.firstName || user?.firstName || "Admin";
    const lastName = userData?.lastName || user?.lastName || "User";
    const email = userData?.email || user?.email || "No email provided";
    const schoolName = userData?.schoolName || "School Name Not Set";

    return (
        <ProtectedDashboardLayout allowedRoles={["admin"]}>
            <div className="min-h-screen bg-gray-100">
                {/* Mobile overlay */}
                {isSidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                        onClick={() => setIsSidebarOpen(false)}
                    />
                )}

                {/* ── Sidebar ── */}
                <aside
                    className={`fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-gray-200 flex flex-col transform transition-transform duration-300 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
                >
                    {/* Logo */}
                    <div className="flex items-center justify-between p-6 border-b border-[#aeaeae] shrink-0">
                        <Link href="/dashboard/admin" className="flex gap-3">
                            <div className="bg-green-900 p-2 rounded-xl">
                                <Shield className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h1 className="font-bold">EduTest Pro</h1>
                                <p className="text-xs text-gray-500">
                                    Admin Portal
                                </p>
                            </div>
                        </Link>
                        <button
                            onClick={() => setIsSidebarOpen(false)}
                            className="lg:hidden cursor-pointer text-gray-500 hover:text-gray-700"
                        >
                            <X className="h-6 w-6" />
                        </button>
                    </div>

                    {/* Admin info */}
                    <div className="p-4 border-b border-[#aeaeae] shrink-0">
                        <div className="flex gap-3 p-3 bg-green-50 rounded-xl">
                            <div className="w-10 h-10 bg-green-900 rounded-full flex items-center justify-center shrink-0">
                                <Shield className="text-white h-5 w-5" />
                            </div>
                            <div className="min-w-0">
                                <p className="font-semibold text-sm truncate">
                                    {firstName} {lastName}
                                </p>
                                <p className="text-xs text-gray-600 truncate">
                                    {schoolName}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Navigation — grows to push logout down */}
                    <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                        {navigation.map((item) => {
                            const isActive =
                                item.href === "/dashboard/admin"
                                    ? pathname === item.href
                                    : pathname.startsWith(item.href);
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition ${isActive ? "bg-green-900 text-white" : "text-gray-700 hover:bg-gray-100"}`}
                                >
                                    <item.icon className="h-5 w-5 shrink-0" />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Logout — pinned to bottom */}
                    <div className="p-4 border-t border-[#aeaeae] shrink-0">
                        <button
                            onClick={logout}
                            className="flex items-center gap-3 w-full px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl font-medium transition-colors cursor-pointer"
                        >
                            <LogOut className="h-5 w-5 shrink-0" />
                            <span>Logout</span>
                        </button>
                    </div>
                </aside>

                {/* ── Main content ── */}
                <div className="lg:pl-64">
                    {/* Top bar */}
                    <header className="sticky top-0 bg-white border-b border-[#aeaeae] z-30 h-16 flex items-center px-6">
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="lg:hidden cursor-pointer text-gray-500 hover:text-gray-700"
                        >
                            <Menu className="h-6 w-6" />
                        </button>

                        <div className="ml-auto text-right">
                            <p className="text-sm font-semibold">
                                {firstName} {lastName}
                            </p>
                            <p className="text-xs text-gray-500">{email}</p>
                        </div>
                    </header>

                    <main className="p-6 bg-green-50 min-h-[calc(100vh-4rem)]">
                        {children}
                    </main>
                </div>
            </div>
        </ProtectedDashboardLayout>
    );
}
