"use client";

import React, { useState } from "react";
import {
    LayoutDashboard,
    BookOpen,
    ClipboardList,
    Award,
    Settings,
    LogOut,
    Menu,
    X,
    User,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ProtectedDashboardLayout from "@/app/context/protectedDashboardLayout";
import { useAuth } from "@/app/context/AuthContext";

export default function DashboardLayout({ children }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const pathname = usePathname();
    const { user, logout } = useAuth();

    // Helper function to get display name
    const getDisplayName = () => {
        if (user?.firstName && user?.lastName) {
            return `${user.firstName} ${user.lastName}`;
        } else if (user?.firstName) {
            return user.firstName;
        } else if (user?.lastName) {
            return user.lastName;
        } else if (user?.name) {
            return user.name;
        }
        return "Student";
    };

    // Helper function to get matric number or fallback
    const getMatricNo = () => {
        return user?.matricNo || "0";
    };

    // Helper function to get email or fallback
    const getEmail = () => {
        return user?.email || "student@example.com";
    };

    const navigation = [
        {
            name: "My Dashboard",
            href: "/dashboard/student",
            icon: LayoutDashboard,
            key: "dashboard",
        },
        {
            name: "My Exams",
            href: "/dashboard/student/exams",
            icon: BookOpen,
            key: "exams",
        },
        {
            name: "Results",
            href: "/dashboard/student/results",
            icon: ClipboardList,
            key: "results",
        },
        {
            name: "Settings",
            href: "/dashboard/student/settings",
            icon: Settings,
            key: "settings",
        },
    ];

    return (
        <ProtectedDashboardLayout allowedRoles={["student"]}>
            <div className="min-h-screen bg-green-50">
                {/* Mobile Overlay */}
                {isSidebarOpen && (
                    <div
                        className="fixed inset-0 bg-gray-900/50 z-40 lg:hidden"
                        onClick={() => setIsSidebarOpen(false)}
                    />
                )}

                {/* Sidebar */}
                <aside
                    className={`fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-[#aeaeae] transform transition-transform duration-300 ease-in-out
                ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
                lg:translate-x-0`}
                >
                    <div className="flex flex-col h-full">
                        {/* Logo */}
                        <div className="flex items-center justify-between p-6 border-b border-[#aeaeae]">
                            <Link
                                href="/dashboard/student"
                                className="flex items-center gap-3"
                            >
                                <div className="bg-green-900 p-2 rounded-xl">
                                    <BookOpen className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-lg font-bold text-gray-900">
                                        EduTest Pro
                                    </h1>
                                    <p className="text-xs text-gray-500">
                                        Student Portal
                                    </p>
                                </div>
                            </Link>

                            <button
                                onClick={() => setIsSidebarOpen(false)}
                                className="lg:hidden text-gray-500 hover:text-gray-700"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        {/* User Info */}
                        <div className="p-4 border-b border-[#aeaeae]">
                            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl">
                                <div className="w-10 h-10 bg-green-900 rounded-full flex items-center justify-center">
                                    <User className="h-5 w-5 text-white" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-semibold text-gray-900 truncate">
                                        {getDisplayName()}
                                    </p>
                                    <p className="text-xs text-gray-600 truncate">
                                        {getMatricNo()}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Navigation */}
                        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                            {navigation.map((item) => {
                                // Check if current path exactly matches or is a sub-path
                                const isActive = pathname === item.href;

                                return (
                                    <Link
                                        key={item.key}
                                        href={item.href}
                                        onClick={() => setIsSidebarOpen(false)}
                                        className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors
                                    ${
                                        isActive
                                            ? "bg-green-900 text-white"
                                            : "text-gray-700 hover:bg-gray-100"
                                    }`}
                                    >
                                        <item.icon className="h-5 w-5" />
                                        <span>{item.name}</span>
                                    </Link>
                                );
                            })}
                        </nav>

                        {/* Logout */}
                        <div className="p-4 border-t border-[#aeaeae]">
                            <button
                                onClick={logout}
                                className="flex items-center gap-3 w-full px-4 py-3 rounded-xl font-medium text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                            >
                                <LogOut className="h-5 w-5" />
                                <span>Logout</span>
                            </button>
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <div className="lg:pl-64">
                    {/* Top Bar */}
                    <header className="sticky top-0 z-30 bg-white border-b border-[#aeaeae]">
                        <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
                            <button
                                onClick={() => setIsSidebarOpen(true)}
                                className="lg:hidden text-gray-500 hover:text-gray-700"
                            >
                                <Menu className="h-6 w-6" />
                            </button>

                            <div className="flex items-center gap-4 ml-auto">
                                <div className="hidden sm:block text-right">
                                    <p className="text-sm font-semibold text-gray-900">
                                        {getDisplayName()}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {getEmail()}
                                    </p>
                                </div>

                                <div className="w-10 h-10 bg-green-900 rounded-full flex items-center justify-center">
                                    <User className="h-5 w-5 text-white" />
                                </div>
                            </div>
                        </div>
                    </header>

                    {/* Page Content */}
                    <main className="p-4 sm:p-6 lg:p-8">{children}</main>
                </div>
            </div>
        </ProtectedDashboardLayout>
    );
}
