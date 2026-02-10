"use client";

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { UserProvider } from "./context/UserContext";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import { usePathname } from "next/navigation";
import { AuthProvider } from "./context/AuthContext";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export default function RootLayout({ children }) {
    const pathname = usePathname();

    // Static paths that should hide Navbar/Footer
    const hiddenPaths = [
        "/login",
        "/register",
        "/instruction",
        "/forgot-password",
        "/reset-password",

        // Student dashboard
        "/dashboard/student",
        "/dashboard/student/exams",
        "/dashboard/student/results",
        "/dashboard/student/certificates",
        "/dashboard/student/settings",

        // Admin dashboard
        "/dashboard/admin",
        "/dashboard/admin/create-exam",
        "/dashboard/admin/manage-students",
        "/dashboard/admin/reports",
        "/dashboard/admin/settings",
    ];

    // Dynamic exam pages → /exam/{examCode}
    const isExamPage = pathname.startsWith("/exam/");

    const hideNavbarFooter = hiddenPaths.includes(pathname) || isExamPage;

    return (
        <html lang="en">
            <body
                className={`${geistSans.variable} ${geistMono.variable} antialiased`}
            >
                <AuthProvider>
                    <UserProvider>
                        {!hideNavbarFooter && <Navbar />}
                        {children}
                        {!hideNavbarFooter && <Footer />}
                    </UserProvider>
                </AuthProvider>
            </body>
        </html>
    );
}
