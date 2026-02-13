import React from "react";
import { BookOpen, Mail, Github, Twitter } from "lucide-react";
import Link from "next/link";

const Footer = () => {
    return (
        <footer className="relative bg-linear-to-br from-emerald-50 via-green-50 to-emerald-50 border-t border-emerald-200">
            {/* Subtle Square Pattern Overlay */}
            <div className="absolute inset-0 opacity-5">
                <div
                    className="absolute inset-0"
                    style={{
                        backgroundImage: `
                            linear-gradient(to right, #059669 1px, transparent 1px),
                            linear-gradient(to bottom, #059669 1px, transparent 1px)
                        `,
                        backgroundSize: "40px 40px",
                    }}
                />
            </div>

            {/* Main Footer Content */}
            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12">
                    {/* Brand Section */}
                    <div className="space-y-4">
                        <div className="flex items-center group">
                            <div className="bg-emerald-100 backdrop-blur-sm p-2 rounded-xl mr-3 group-hover:bg-emerald-200 transition-all border border-emerald-300/50 shadow-sm">
                                <BookOpen className="h-6 w-6 text-emerald-600" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                                    EduTest Pro
                                </h2>
                                <p className="text-xs text-slate-600 font-medium">
                                    Secure CBT Platform
                                </p>
                            </div>
                        </div>
                        <p className="text-sm text-slate-600 leading-relaxed">
                            Empowering students worldwide with AI-powered exam
                            preparation and secure testing environments.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div className="space-y-4">
                        <h3 className="text-base font-bold text-slate-900">
                            Quick Links
                        </h3>
                        <ul className="space-y-2">
                            {[
                                { name: "Home", href: "/" },
                                { name: "How It Works", href: "/instruction" },
                                { name: "Login", href: "/login" },
                                {
                                    name: "Privacy Policy",
                                    href: "/privacy-policy",
                                },
                            ].map((link) => (
                                <li key={link.name}>
                                    <Link
                                        href={link.href}
                                        className="text-sm text-slate-600 hover:text-emerald-600 transition-colors inline-flex items-center group"
                                    >
                                        <span className="group-hover:translate-x-1 transition-transform">
                                            {link.name}
                                        </span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact & Social */}
                    <div className="space-y-4">
                        <h3 className="text-base font-bold text-slate-900">
                            Connect With Us
                        </h3>
                        <div className="flex gap-3">
                            {[
                                {
                                    icon: Mail,
                                    href: "mailto:support@edutest.pro",
                                },
                                { icon: Twitter, href: "#" },
                                { icon: Github, href: "#" },
                            ].map((social, idx) => (
                                <a
                                    key={idx}
                                    href={social.href}
                                    className="w-10 h-10 bg-white/80 backdrop-blur-sm border border-emerald-200 rounded-xl flex items-center justify-center hover:bg-emerald-100 hover:border-emerald-300 transition-all hover:scale-110 group shadow-sm"
                                >
                                    <social.icon className="h-5 w-5 text-slate-600 group-hover:text-emerald-600 transition-colors" />
                                </a>
                            ))}
                        </div>
                        <p className="text-sm text-slate-600 leading-relaxed">
                            Have questions? We&apos;re here to help you succeed.
                        </p>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="mt-12 pt-8 border-t border-emerald-200">
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                        <p className="text-sm text-slate-600">
                            © 2026 EduTest Pro. All rights reserved.
                        </p>
                        <p className="text-sm text-slate-600 flex items-center gap-2">
                            Good luck with your examination
                            <span className="text-emerald-600">🎓</span>
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
