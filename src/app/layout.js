import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { UserProvider } from "./context/UserContext";
import { AuthProvider } from "./context/AuthContext";
import LayoutWrapper from "@/components/LayoutWrapper";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata = {
    title: "EduTest Pro - Secure CBT Platform",
    description: "AI-powered exam preparation and secure testing platform",
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body
                className={`${geistSans.variable} ${geistMono.variable} antialiased`}
            >
                <AuthProvider>
                    <UserProvider>
                        <LayoutWrapper>{children}</LayoutWrapper>
                    </UserProvider>
                </AuthProvider>
            </body>
        </html>
    );
}
