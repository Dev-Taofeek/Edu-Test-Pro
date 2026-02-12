"use client";

import React, { useEffect, useState } from "react";
import { Button } from "../components/ui/Button";
import {
    ShieldCheck,
    Clock,
    Award,
    ChevronRight,
    CheckCircle,
    Users,
    BarChart,
    Book,
    Zap,
    Lock,
    ArrowRight,
    Star,
    TrendingUp,
    Sparkles,
    Target,
} from "lucide-react";
import Link from "next/link";

export default function LandingPage({ onLoginClick }) {
    const [scrollY, setScrollY] = useState(0);

    useEffect(() => {
        const handleScroll = () => setScrollY(window.scrollY);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <main className="flex flex-col overflow-hidden bg-green-50">
            {/* Hero Section */}
            <section className="relative min-h-[95vh] flex items-center justify-center overflow-hidden bg-linear-to-br from-green-50 via-emerald-50 to-green-50">
                {/* Square Grid Background */}
                <div className="absolute inset-0 opacity-10">
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

                {/* Animated Floating Squares */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div
                        className="absolute top-20 left-10 w-32 h-32 border-2 border-emerald-300/30 rounded-lg animate-pulse"
                        style={{ animation: "float 6s ease-in-out infinite" }}
                    />
                    <div
                        className="absolute top-40 right-20 w-24 h-24 border-2 border-emerald-400/20 rounded-lg"
                        style={{
                            animation: "float 8s ease-in-out infinite reverse",
                        }}
                    />
                    <div
                        className="absolute bottom-32 left-1/4 w-20 h-20 border-2 border-emerald-300/25 rounded-lg"
                        style={{ animation: "float 3s ease-in-out infinite" }}
                    />
                    <div
                        className="absolute bottom-20 right-1/3 w-28 h-28 border-2 border-emerald-400/30 rounded-lg"
                        style={{
                            animation: "float 4s ease-in-out infinite reverse",
                        }}
                    />
                </div>

                {/* Floating Orbs */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-400/10 rounded-full blur-3xl" />
                    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
                </div>

                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="text-center space-y-6">
                        {/* Badge */}
                        <div
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full 
                                     bg-white/80 border border-emerald-300 backdrop-blur-sm shadow-lg"
                        >
                            <Sparkles className="w-4 h-4 text-emerald-600 animate-pulse" />
                            <span className="text-emerald-700 text-sm font-semibold tracking-wide">
                                2026 Official Exam Platform
                            </span>
                        </div>

                        {/* Main Headline */}
                        <h1
                            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black 
                                     text-slate-900 leading-tight tracking-tight"
                            style={{ fontFamily: "'Inter', sans-serif" }}
                        >
                            Your Success
                            <br />
                            <span className="text-emerald-600">
                                Starts Here
                            </span>
                        </h1>

                        {/* Subheadline */}
                        <p className="text-lg sm:text-xl md:text-xl text-slate-700 max-w-3xl mx-auto leading-relaxed font-light">
                            Join{" "}
                            <span className="text-emerald-600 font-bold">
                                50,000+
                            </span>{" "}
                            students who conquered their exams with our
                            AI-powered practice platform. Real questions. Real
                            results.
                        </p>

                        {/* CTA Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
                            <Link href="/login" className="w-full sm:w-auto">
                                <button
                                    onClick={onLoginClick}
                                    className="group relative w-full sm:w-auto px-8 sm:px-10 py-4 sm:py-5
                                             bg-emerald-600 hover:bg-emerald-700
                                             text-white text-base sm:text-lg font-bold rounded-2xl
                                             shadow-2xl shadow-emerald-500/50
                                             hover:shadow-emerald-500/70 hover:scale-105
                                             transition-all duration-300 cursor-pointer"
                                >
                                    <span className="flex items-center justify-center gap-2">
                                        Start Your Exam Journey
                                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </span>
                                </button>
                            </Link>

                            <Link
                                href="/instruction"
                                className="w-full sm:w-auto"
                            >
                                <button
                                    className="w-full sm:w-auto px-8 sm:px-10 py-4 sm:py-5
                                             bg-white backdrop-blur-md
                                             text-slate-900 text-base sm:text-lg font-bold rounded-2xl
                                             border-2 border-slate-200
                                             hover:bg-slate-50 hover:border-emerald-300
                                             transition-all duration-300 cursor-pointer"
                                >
                                    How It Works
                                </button>
                            </Link>
                        </div>

                        {/* Trust Indicators */}
                        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 pt-8 text-slate-600 text-sm">
                            <div className="flex items-center gap-2">
                                <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                                <span>4.9/5 Rating</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle className="w-5 h-5 text-emerald-600" />
                                <span>200K+ Exams Taken</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-emerald-600" />
                                <span>94% Pass Rate</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Live Stats Ticker */}
            <section className="hidden md:relative py-6 bg-emerald-600 border-y border-emerald-500">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-wrap justify-around items-center gap-6 sm:gap-8">
                        {[
                            {
                                label: "Active Students",
                                value: "50,000+",
                                icon: Users,
                            },
                            {
                                label: "Question Bank",
                                value: "10,000+",
                                icon: Book,
                            },
                            {
                                label: "Success Rate",
                                value: "94%",
                                icon: Target,
                            },
                            {
                                label: "Exams Completed",
                                value: "200K+",
                                icon: Award,
                            },
                        ].map((stat, idx) => (
                            <div
                                key={idx}
                                className="flex items-center gap-3 text-white"
                            >
                                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                                    <stat.icon className="w-5 h-5 sm:w-6 sm:h-6" />
                                </div>
                                <div>
                                    <p className="text-2xl sm:text-3xl font-black">
                                        {stat.value}
                                    </p>
                                    <p className="text-xs sm:text-sm text-white/90 font-medium">
                                        {stat.label}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features - Card Grid */}
            <section className="relative py-20 sm:py-32 bg-linear-to-b from-green-50 to-emerald-50">
                {/* Subtle Square Pattern Overlay */}
                <div className="absolute inset-0 opacity-5">
                    <div
                        className="absolute inset-0"
                        style={{
                            backgroundImage: `
                                linear-gradient(to right, #059669 1px, transparent 1px),
                                linear-gradient(to bottom, #059669 1px, transparent 1px)
                            `,
                            backgroundSize: "60px 60px",
                        }}
                    />
                </div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Section Header */}
                    <div className="text-center mb-16 sm:mb-20">
                        <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-slate-900 mb-6">
                            Why Students{" "}
                            <span className="text-emerald-600">Choose Us</span>
                        </h2>
                        <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto">
                            Everything you need to ace your exams, all in one
                            powerful platform
                        </p>
                    </div>

                    {/* Feature Cards */}
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                        {[
                            {
                                icon: ShieldCheck,
                                title: "Bank-Grade Security",
                                description:
                                    "Advanced anti-cheat technology and secure browser environment ensure fair testing for everyone.",
                                color: "emerald",
                                bg: "bg-emerald-50",
                                iconBg: "bg-emerald-100",
                                iconColor: "text-emerald-600",
                            },
                            {
                                icon: Clock,
                                title: "Smart Time Management",
                                description:
                                    "Real-time countdown with intelligent alerts to help you pace yourself perfectly.",
                                color: "blue",
                                bg: "bg-blue-50",
                                iconBg: "bg-blue-100",
                                iconColor: "text-blue-600",
                            },
                            {
                                icon: Award,
                                title: "Instant Feedback",
                                description:
                                    "Get detailed performance analytics and score breakdowns the moment you submit.",
                                color: "yellow",
                                bg: "bg-yellow-50",
                                iconBg: "bg-yellow-100",
                                iconColor: "text-yellow-600",
                            },
                            {
                                icon: Zap,
                                title: "Lightning Performance",
                                description:
                                    "Zero lag, instant loading. Optimized for speed so you focus on what matters.",
                                color: "purple",
                                bg: "bg-purple-50",
                                iconBg: "bg-purple-100",
                                iconColor: "text-purple-600",
                            },
                            {
                                icon: Book,
                                title: "10,000+ Real Questions",
                                description:
                                    "Comprehensive question bank covering all topics with detailed explanations.",
                                color: "pink",
                                bg: "bg-pink-50",
                                iconBg: "bg-pink-100",
                                iconColor: "text-pink-600",
                            },
                            {
                                icon: Lock,
                                title: "Your Data, Protected",
                                description:
                                    "Military-grade encryption keeps your personal information and results secure.",
                                color: "red",
                                bg: "bg-red-50",
                                iconBg: "bg-red-100",
                                iconColor: "text-red-600",
                            },
                        ].map((feature, idx) => (
                            <div
                                key={idx}
                                className={`group relative p-8 rounded-3xl 
                                         bg-white/80 backdrop-blur-sm border-2 border-slate-200
                                         hover:border-emerald-400 hover:shadow-2xl hover:shadow-emerald-500/20
                                         transition-all duration-500 cursor-pointer
                                         hover:scale-105 hover:bg-white`}
                            >
                                <div className="relative z-10">
                                    <div
                                        className={`w-14 h-14 ${feature.iconBg} rounded-2xl flex items-center justify-center mb-6
                                                   group-hover:scale-110 transition-transform duration-300 shadow-md`}
                                    >
                                        <feature.icon
                                            className={`w-7 h-7 ${feature.iconColor}`}
                                        />
                                    </div>
                                    <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-3 group-hover:text-emerald-600 transition-colors">
                                        {feature.title}
                                    </h3>
                                    <p className="text-slate-600 leading-relaxed">
                                        {feature.description}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works - Timeline */}
            <section className="relative py-20 sm:py-32 bg-linear-to-b from-white to-green-50">
                {/* Decorative Elements */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-200/30 rounded-full blur-3xl" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-300/30 rounded-full blur-3xl" />
                </div>
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16 sm:mb-20">
                        <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-slate-900 mb-6">
                            Get Started in{" "}
                            <span className="text-emerald-600">
                                3 Simple Steps
                            </span>
                        </h2>
                    </div>

                    <div className="space-y-12 sm:space-y-16">
                        {[
                            {
                                step: "01",
                                title: "Create Your Free Account",
                                description:
                                    "Sign up in 30 seconds. No credit card required. Verify your email and you're ready to go.",
                                icon: Users,
                            },
                            {
                                step: "02",
                                title: "Choose Your Exam",
                                description:
                                    "Browse our extensive catalog. Select your subject, difficulty, and number of questions. Customize everything.",
                                icon: Target,
                            },
                            {
                                step: "03",
                                title: "Ace & Improve",
                                description:
                                    "Take the exam, get instant results, review your mistakes, and watch your scores soar with each attempt.",
                                icon: TrendingUp,
                            },
                        ].map((item, idx) => (
                            <div
                                key={idx}
                                className="flex flex-col sm:flex-row gap-6 sm:gap-8 items-start group"
                            >
                                {/* Step Number */}
                                <div className="shrink-0">
                                    <div
                                        className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-emerald-600
                                                  flex items-center justify-center shadow-2xl shadow-emerald-500/50
                                                  group-hover:scale-110 group-hover:bg-emerald-700 transition-all duration-300"
                                    >
                                        <span className="text-3xl sm:text-4xl font-black text-white">
                                            {item.step}
                                        </span>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="flex-1 pt-2">
                                    <div className="flex items-start gap-4 mb-4">
                                        <div
                                            className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center
                                                      group-hover:bg-emerald-100 transition-colors"
                                        >
                                            <item.icon className="w-6 h-6 text-emerald-600" />
                                        </div>
                                        <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 group-hover:text-emerald-600 transition-colors flex-1">
                                            {item.title}
                                        </h3>
                                    </div>
                                    <p className="text-base sm:text-lg text-slate-600 leading-relaxed pl-16">
                                        {item.description}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="relative py-20 sm:py-32 bg-linear-to-br from-emerald-50 via-green-50 to-emerald-50">
                {/* Square Pattern Overlay */}
                <div className="absolute inset-0 opacity-5">
                    <div
                        className="absolute inset-0"
                        style={{
                            backgroundImage: `
                                linear-gradient(to right, #059669 1px, transparent 1px),
                                linear-gradient(to bottom, #059669 1px, transparent 1px)
                            `,
                            backgroundSize: "50px 50px",
                        }}
                    />
                </div>

                {/* Decorative Squares */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-10 right-10 w-40 h-40 border border-emerald-300/20 rounded-2xl rotate-12" />
                    <div className="absolute bottom-10 left-10 w-32 h-32 border border-emerald-300/20 rounded-2xl -rotate-12" />
                </div>
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
                    <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-slate-900 leading-tight">
                        Ready to{" "}
                        <span className="text-emerald-600">Dominate</span>
                        <br />
                        Your Next Exam?
                    </h2>

                    <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto">
                        Join thousands of successful students today. No setup
                        fees. No hidden costs. Just results.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-6">
                        <Link href="/login" className="w-full sm:w-auto">
                            <button
                                onClick={onLoginClick}
                                className="group w-full sm:w-auto px-10 sm:px-12 py-5 sm:py-6
                                         bg-emerald-600 hover:bg-emerald-700
                                         text-white text-lg sm:text-xl font-black rounded-2xl
                                         shadow-2xl shadow-emerald-500/50
                                         hover:shadow-emerald-500/80 hover:scale-105
                                         transition-all duration-300 cursor-pointer"
                            >
                                <span className="flex items-center justify-center gap-3">
                                    Start Free Today
                                    <ChevronRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                                </span>
                            </button>
                        </Link>
                    </div>

                    <p className="text-sm text-slate-500">
                        ✓ No credit card required • ✓ 10,000+ questions • ✓
                        Instant access
                    </p>
                </div>
            </section>
        </main>
    );
}
