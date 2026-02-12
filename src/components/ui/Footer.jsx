import React from "react";
import { BookOpen, Mail, Github, Twitter } from "lucide-react";
import Link from "next/link";

const Footer = () => {
    return (
        <footer className="relative bg-slate-950 border-t border-white/10">
            {/* Main Footer Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12">
                    {/* Brand Section */}
                    <div className="space-y-4">
                        <div className="flex items-center group">
                            <div className="bg-emerald-500/20 backdrop-blur-sm p-2 rounded-xl mr-3 group-hover:bg-emerald-500/30 transition-all border border-emerald-500/30">
                                <BookOpen className="h-6 w-6 text-emerald-400" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white tracking-tight">
                                    EduTest Pro
                                </h2>
                                <p className="text-xs text-gray-400 font-medium">
                                    Secure CBT Platform
                                </p>
                            </div>
                        </div>
                        <p className="text-sm text-gray-400 leading-relaxed">
                            Empowering students worldwide with AI-powered exam
                            preparation and secure testing environments.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div className="space-y-4">
                        <h3 className="text-base font-bold text-white">
                            Quick Links
                        </h3>
                        <ul className="space-y-2">
                            {[
                                { name: "Home", href: "/" },
                                { name: "How It Works", href: "/instruction" },
                                { name: "Login", href: "/login" },
                                { name: "Privacy Policy", href: "#" },
                            ].map((link) => (
                                <li key={link.name}>
                                    <Link
                                        href={link.href}
                                        className="text-sm text-gray-400 hover:text-emerald-400 transition-colors inline-flex items-center group"
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
                        <h3 className="text-base font-bold text-white">
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
                                    className="w-10 h-10 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl flex items-center justify-center hover:bg-emerald-500/20 hover:border-emerald-500/30 transition-all hover:scale-110 group"
                                >
                                    <social.icon className="h-5 w-5 text-gray-400 group-hover:text-emerald-400 transition-colors" />
                                </a>
                            ))}
                        </div>
                        <p className="text-sm text-gray-400 leading-relaxed">
                            Have questions? We&apos;re here to help you succeed.
                        </p>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="mt-12 pt-8 border-t border-white/10">
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                        <p className="text-sm text-gray-500">
                            © 2026 EduTest Pro. All rights reserved.
                        </p>
                        <p className="text-sm text-gray-500 flex items-center gap-2">
                            Good luck with your examination
                            <span className="text-emerald-400">🎓</span>
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
