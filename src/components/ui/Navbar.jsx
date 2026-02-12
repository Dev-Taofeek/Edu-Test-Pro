"use client";

import { BookOpen, LogOut, UserIcon } from "lucide-react";
import Link from "next/link";
import React from "react";

const Navbar = ({ user, onLogout, onNavigate, currentPage }) => {
    return (
        <>
            {/* Navigation - Glassmorphic Dark Theme */}
            <header className="bg-slate-950/80 backdrop-blur-xl border-b border-white/10 sticky top-0 z-50 shadow-2xl shadow-black/20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16 sm:h-18">
                        <Link href={"/"}>
                            <div
                                className="flex items-center cursor-pointer group"
                                onClick={() => onNavigate?.("landing")}
                            >
                                <div className="bg-emerald-500/20 backdrop-blur-sm p-2 rounded-xl mr-3 group-hover:bg-emerald-500/30 transition-all group-hover:scale-105 border border-emerald-500/30">
                                    <BookOpen className="h-6 w-6 text-emerald-400" />
                                </div>
                                <div>
                                    <h1 className="text-xl font-bold text-white tracking-tight">
                                        EduTest Pro
                                    </h1>
                                    <p className="text-xs text-gray-400 font-medium">
                                        Secure CBT Platform
                                    </p>
                                </div>
                            </div>
                        </Link>

                        <div className="flex items-center space-x-3 sm:space-x-4">
                            {user ? (
                                <>
                                    <div className="hidden md:flex items-center px-4 py-2 bg-emerald-500/10 backdrop-blur-sm border border-emerald-500/30 rounded-xl shadow-sm">
                                        <UserIcon className="h-4 w-4 text-emerald-400 mr-2" />
                                        <span className="text-sm font-semibold text-white">
                                            {user.name}
                                        </span>
                                    </div>
                                    <button
                                        onClick={onLogout}
                                        className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 backdrop-blur-sm rounded-xl transition-all cursor-pointer hover:scale-105 border border-transparent hover:border-red-500/30"
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
                                            className="px-4 py-2 sm:px-5 sm:py-2.5 text-sm font-semibold text-white bg-emerald-500 backdrop-blur-sm hover:bg-emerald-600 rounded-xl transition-all cursor-pointer hover:scale-105 shadow-lg shadow-emerald-500/20"
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
