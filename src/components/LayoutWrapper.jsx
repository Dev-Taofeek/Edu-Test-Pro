"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";

export default function LayoutWrapper({ children }) {
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
        <>
            {!hideNavbarFooter && <Navbar />}
            {children}
            {!hideNavbarFooter && <Footer />}
        </>
    );
}
