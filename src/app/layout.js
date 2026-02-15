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
    metadataBase: new URL("https://online-cbt-exam.vercel.app/"),

    title: {
        default: "EduTest Pro | Secure Online CBT Exam Platform",
        template: "%s | EduTest Pro",
    },

    description:
        "EduTest Pro is a secure online CBT exam platform for schools and institutions. Create, manage, and take computer-based tests with instant results and analytics.",

    keywords: [
        "Online CBT platform",
        "Computer based test system",
        "Online exam software Nigeria",
        "School exam platform",
        "Secure online testing",
        "AI exam platform",
        "CBT exam system",
    ],

    authors: [{ name: "EduTest Pro Team" }],
    creator: "EduTest Pro",
    publisher: "EduTest Pro",

    applicationName: "EduTest Pro",

    icons: {
        icon: "/favicon.ico",
        shortcut: "/favicon.ico",
    },

    themeColor: "#f0fdf4",

    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            "max-video-preview": -1,
            "max-image-preview": "large",
            "max-snippet": -1,
        },
    },

    openGraph: {
        type: "website",
        url: "https://online-cbt-exam.vercel.app/",
        title: "EduTest Pro | Secure Online CBT Exam Platform",
        description:
            "Create and manage secure online CBT exams with AI-powered analytics and instant results.",
        siteName: "EduTest Pro",
        images: [
            {
                url: "/og-image.png",
                width: 1200,
                height: 630,
                alt: "EduTest Pro Online CBT Platform",
            },
        ],
    },

    twitter: {
        card: "summary_large_image",
        title: "EduTest Pro | Secure Online CBT Exam Platform",
        description:
            "AI-powered secure online CBT platform for schools and institutions.",
        images: ["/og-image.png"],
    },

    alternates: {
        canonical: "https://online-cbt-exam.vercel.app/",
    },

    verification: {
        google: "your-google-verification-code",
    },
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
