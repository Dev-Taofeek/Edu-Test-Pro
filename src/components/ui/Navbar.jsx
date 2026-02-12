"use client";

import { BookOpen, LogOut, UserIcon } from "lucide-react";
import Link from "next/link";
import React from "react";

const Navbar = ({ user, onLogout, onNavigate, currentPage }) => {
    return (
        <>
            {/* Navigation - Matching Homepage Theme */}
            <header className="bg-white/80 backdrop-blur-xl border-b border-emerald-200/50 sticky top-0 z-50 shadow-lg shadow-emerald-500/10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16 sm:h-18">
                        <Link href={"/"}>
                            <div
                                className="flex items-center cursor-pointer group"
                                onClick={() => onNavigate?.("landing")}
                            >
                                <div className="bg-emerald-100 backdrop-blur-sm p-2 rounded-xl mr-3 group-hover:bg-emerald-200 transition-all group-hover:scale-105 border border-emerald-300/50 shadow-sm">
                                    <BookOpen className="h-6 w-6 text-emerald-600" />
                                </div>
                                <div>
                                    <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                                        EduTest Pro
                                    </h1>
                                    <p className="text-xs text-slate-600 font-medium">
                                        Secure CBT Platform
                                    </p>
                                </div>
                            </div>
                        </Link>

                        <div className="flex items-center space-x-3 sm:space-x-4">
                            {user ? (
                                <>
                                    <div className="hidden md:flex items-center px-4 py-2 bg-emerald-50 backdrop-blur-sm border border-emerald-200 rounded-xl shadow-sm">
                                        <UserIcon className="h-4 w-4 text-emerald-600 mr-2" />
                                        <span className="text-sm font-semibold text-slate-900">
                                            {user.name}
                                        </span>
                                    </div>
                                    <button
                                        onClick={onLogout}
                                        className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 backdrop-blur-sm rounded-xl transition-all cursor-pointer hover:scale-105 border border-transparent hover:border-red-200"
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
                                            className="px-4 py-2 sm:px-5 sm:py-2.5 text-sm font-semibold text-white bg-emerald-600 backdrop-blur-sm hover:bg-emerald-700 rounded-xl transition-all cursor-pointer hover:scale-105 shadow-lg shadow-emerald-500/30"
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
