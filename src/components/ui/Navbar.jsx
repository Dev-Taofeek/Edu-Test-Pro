"use client";

import { BookOpen, LogOut, UserIcon } from "lucide-react";
import Link from "next/link";
import React from "react";

const Navbar = ({ user, onLogout, onNavigate, currentPage }) => {
    return (
        <>
            {/* Navigation */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16 sm:h-18">
                        <Link href={"/"}>
                            <div
                                className="flex items-center cursor-pointer group"
                                onClick={() => onNavigate?.("landing")}
                            >
                                <div className="bg-green-900 p-2 rounded-xl mr-3 group-hover:bg-green-800 transition-colors">
                                    <BookOpen className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-xl font-bold text-gray-900 tracking-tight">
                                        EduTest Pro
                                    </h1>
                                    <p className="text-xs text-gray-500 font-medium">
                                        Secure CBT Platform
                                    </p>
                                </div>
                            </div>
                        </Link>

                        <div className="flex items-center space-x-3 sm:space-x-4">
                            {user ? (
                                <>
                                    <div className="hidden md:flex items-center px-4 py-2 bg-green-50 border border-green-200 rounded-xl">
                                        <UserIcon className="h-4 w-4 text-green-700 mr-2" />
                                        <span className="text-sm font-semibold text-green-900">
                                            {user.name}
                                        </span>
                                    </div>
                                    <button
                                        onClick={onLogout}
                                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                                        title="Logout"
                                    >
                                        <LogOut className="h-5 w-5" />
                                    </button>
                                </>
                            ) : (
                                currentPage !== "login" && (
                                    <Link href={"/login"}>
                                        <button
                                            onClick={() =>
                                                onNavigate?.("login")
                                            }
                                            className="px-4 py-2 sm:px-5 sm:py-2.5 text-sm font-semibold text-white bg-green-900 hover:bg-green-800 rounded-xl transition-colors cursor-pointer"
                                        >
                                            Login
                                        </button>
                                    </Link>
                                )
                            )}
                        </div>
                    </div>
                </div>
            </header>
        </>
    );
};

export default Navbar;
