import React from "react";
import { LogOut, User as UserIcon, BookOpen } from "lucide-react";
import Navbar from "./ui/Navbar";
import Footer from "./ui/Footer";
export function Header({ children }) {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            {/* Header */}
            <Navbar />
            {/* Main Content */}
            <main className="grow">{children}</main>

            {/* Footer */}
            <Footer />
        </div>
    );
}
