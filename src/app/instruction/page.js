import React from "react";
import {
    BookOpen,
    Clock,
    CheckCircle,
    AlertCircle,
    Monitor,
    Shield,
    Zap,
    BarChart,
    Award,
    FileText,
    Users,
    Lock,
    ChevronRight,
    Play,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function InstructionsPage({ onLoginClick }) {
    return (
        <main className="flex flex-col min-h-screen bg-green-50">
            {/* Hero Section */}
            <section className="relative bg-linear-to-br from-green-50 via-emerald-50 to-green-50 text-slate-900 py-12 sm:py-16 border-b border-emerald-200">
                {/* Background Effect */}
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

                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="max-w-3xl mx-auto text-center">
                        <div className="w-16 h-16 bg-emerald-100 border-2 border-emerald-300 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                            <BookOpen className="h-8 w-8 text-emerald-600" />
                        </div>
                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4 leading-tight text-slate-900">
                            Complete Examination Guide
                        </h1>
                        <p className="text-lg sm:text-xl text-slate-600 leading-relaxed">
                            Everything you need to know about using the EduTest
                            Pro CBT platform for a successful examination
                            experience.
                        </p>
                    </div>
                </div>
            </section>

            {/* Quick Stats */}
            <section className="py-8 bg-white border-b border-emerald-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {[
                            {
                                label: "Per Question",
                                value: "30s",
                                icon: Clock,
                            },
                            {
                                label: "Question Options",
                                value: "25-50",
                                icon: FileText,
                            },
                            {
                                label: "Success Rate",
                                value: "94%",
                                icon: Award,
                            },
                            {
                                label: "Auto-Save",
                                value: "Enabled",
                                icon: CheckCircle,
                            },
                        ].map((stat, idx) => (
                            <div key={idx} className="text-center">
                                <div className="w-10 h-10 bg-emerald-100 border border-emerald-300 rounded-xl flex items-center justify-center mx-auto mb-2 shadow-sm">
                                    <stat.icon className="h-5 w-5 text-emerald-600" />
                                </div>
                                <p className="text-xl sm:text-2xl font-bold text-slate-900 mb-1">
                                    {stat.value}
                                </p>
                                <p className="text-xs sm:text-sm text-slate-600">
                                    {stat.label}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <section className="py-12 sm:py-16 bg-green-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Left Column - Main Instructions */}
                        <div className="lg:col-span-2 space-y-8">
                            {/* Before You Start */}
                            <div className="bg-white/80 backdrop-blur-sm border-2 border-slate-200 rounded-2xl p-6 sm:p-8 hover:border-emerald-400 hover:shadow-xl transition-all">
                                <div className="flex items-center mb-6">
                                    <div className="w-10 h-10 bg-blue-100 border border-blue-300 rounded-xl flex items-center justify-center mr-4 shadow-sm">
                                        <Monitor className="h-5 w-5 text-blue-600" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-slate-900">
                                        Before You Start
                                    </h2>
                                </div>

                                <div className="space-y-4">
                                    {[
                                        {
                                            title: "System Requirements",
                                            description:
                                                "Ensure you have a stable internet connection with minimum speed of 1 Mbps. Use updated versions of Chrome, Firefox, Safari, or Edge browsers.",
                                        },
                                        {
                                            title: "Environment Setup",
                                            description:
                                                "Find a quiet, well-lit space free from distractions. Have your login credentials ready and close all unnecessary browser tabs and applications.",
                                        },
                                        {
                                            title: "Identity Verification",
                                            description:
                                                "Keep your registration number and password handy. Ensure your registered name matches your identification documents.",
                                        },
                                        {
                                            title: "Time Management",
                                            description:
                                                "Plan to start with at least 5 minutes buffer before your scheduled exam time. Avoid starting during unstable network periods.",
                                        },
                                    ].map((item, idx) => (
                                        <div
                                            key={idx}
                                            className="border-l-4 border-emerald-500 pl-4 py-2 bg-emerald-50/50 rounded-r-lg"
                                        >
                                            <h3 className="font-bold text-slate-900 mb-1">
                                                {item.title}
                                            </h3>
                                            <p className="text-slate-600 text-sm leading-relaxed">
                                                {item.description}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* During Examination */}
                            <div className="bg-white/80 backdrop-blur-sm border-2 border-slate-200 rounded-2xl p-6 sm:p-8 hover:border-emerald-400 hover:shadow-xl transition-all">
                                <div className="flex items-center mb-6">
                                    <div className="w-10 h-10 bg-emerald-100 border border-emerald-300 rounded-xl flex items-center justify-center mr-4 shadow-sm">
                                        <Play className="h-5 w-5 text-emerald-600" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-slate-900">
                                        During the Examination
                                    </h2>
                                </div>

                                <div className="space-y-5">
                                    {[
                                        {
                                            icon: Clock,
                                            title: "Time Allocation",
                                            points: [
                                                "Each question has exactly 30 seconds",
                                                "Timer starts automatically when question loads",
                                                "Question auto-advances when time expires",
                                                "Total exam time depends on question count selected",
                                            ],
                                        },
                                        {
                                            icon: CheckCircle,
                                            title: "Answering Questions",
                                            points: [
                                                "Click on your chosen option (A, B, C, or D)",
                                                "Selected answer is highlighted immediately",
                                                "Answers save automatically - no save button needed",
                                                "You can change your answer before time runs out",
                                            ],
                                        },
                                        {
                                            icon: ChevronRight,
                                            title: "Navigation",
                                            points: [
                                                "Use question palette to jump to any question",
                                                "Answered questions show in green",
                                                "Skipped questions show in gray",
                                                "Current question is highlighted",
                                            ],
                                        },
                                        {
                                            icon: Zap,
                                            title: "Important Actions",
                                            points: [
                                                "Click 'Skip' to move to next question early",
                                                "Review your answers using the palette",
                                                "Submit only when you've reviewed all questions",
                                                "Submission is final and cannot be undone",
                                            ],
                                        },
                                    ].map((section, idx) => (
                                        <div
                                            key={idx}
                                            className="bg-emerald-50 border-2 border-emerald-200 rounded-xl p-5 hover:border-emerald-400 transition-all shadow-sm"
                                        >
                                            <div className="flex items-center mb-3">
                                                <section.icon className="h-5 w-5 text-emerald-600 mr-2" />
                                                <h3 className="font-bold text-slate-900">
                                                    {section.title}
                                                </h3>
                                            </div>
                                            <ul className="space-y-2">
                                                {section.points.map(
                                                    (point, i) => (
                                                        <li
                                                            key={i}
                                                            className="flex items-start"
                                                        >
                                                            <div className="w-1.5 h-1.5 bg-emerald-600 rounded-full mt-2 mr-3 shrink-0" />
                                                            <span className="text-sm text-slate-700">
                                                                {point}
                                                            </span>
                                                        </li>
                                                    ),
                                                )}
                                            </ul>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Security & Fair Play */}
                            <div className="bg-white/80 backdrop-blur-sm border-2 border-slate-200 rounded-2xl p-6 sm:p-8 hover:border-red-400 hover:shadow-xl transition-all">
                                <div className="flex items-center mb-6">
                                    <div className="w-10 h-10 bg-red-100 border border-red-300 rounded-xl flex items-center justify-center mr-4 shadow-sm">
                                        <Shield className="h-5 w-5 text-red-600" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-slate-900">
                                        Security & Fair Play
                                    </h2>
                                </div>

                                <div className="space-y-4">
                                    {[
                                        {
                                            title: "Anti-Cheat Measures",
                                            description:
                                                "The system monitors browser activity. Switching tabs or windows may flag your session and could result in automatic submission.",
                                            type: "warning",
                                        },
                                        {
                                            title: "Session Monitoring",
                                            description:
                                                "Your session is tracked for unusual patterns. Multiple suspicious activities will terminate your exam automatically.",
                                            type: "warning",
                                        },
                                        {
                                            title: "One Device Policy",
                                            description:
                                                "Login from only one device. Multiple simultaneous logins will invalidate your session.",
                                            type: "info",
                                        },
                                        {
                                            title: "No External Help",
                                            description:
                                                "Using external materials, calculators, notes, or consulting others is strictly prohibited and will result in disqualification.",
                                            type: "warning",
                                        },
                                    ].map((item, idx) => (
                                        <div
                                            key={idx}
                                            className={`flex gap-3 p-4 rounded-xl ${
                                                item.type === "warning"
                                                    ? "bg-red-50 border-2 border-red-200"
                                                    : "bg-blue-50 border-2 border-blue-200"
                                            }`}
                                        >
                                            <AlertCircle
                                                className={`h-5 w-5 mt-0.5 shrink-0 ${
                                                    item.type === "warning"
                                                        ? "text-red-600"
                                                        : "text-blue-600"
                                                }`}
                                            />
                                            <div>
                                                <h3 className="font-bold text-slate-900 mb-1">
                                                    {item.title}
                                                </h3>
                                                <p className="text-sm text-slate-700 leading-relaxed">
                                                    {item.description}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* After Submission */}
                            <div className="bg-white/80 backdrop-blur-sm border-2 border-slate-200 rounded-2xl p-6 sm:p-8 hover:border-purple-400 hover:shadow-xl transition-all">
                                <div className="flex items-center mb-6">
                                    <div className="w-10 h-10 bg-purple-100 border border-purple-300 rounded-xl flex items-center justify-center mr-4 shadow-sm">
                                        <BarChart className="h-5 w-5 text-purple-600" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-slate-900">
                                        After Submission
                                    </h2>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex gap-3">
                                        <div className="w-6 h-6 bg-emerald-100 border border-emerald-300 rounded-full flex items-center justify-center mt-1 shrink-0 shadow-sm">
                                            <CheckCircle className="w-4 h-4 text-emerald-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-900 mb-1">
                                                Instant Results
                                            </h3>
                                            <p className="text-slate-700 text-sm leading-relaxed">
                                                Your score is calculated
                                                immediately and displayed on
                                                screen. You&apos;ll see your
                                                total score, percentage, and
                                                performance breakdown.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex gap-3">
                                        <div className="w-6 h-6 bg-emerald-100 border border-emerald-300 rounded-full flex items-center justify-center mt-1 shrink-0 shadow-sm">
                                            <CheckCircle className="w-4 h-4 text-emerald-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-900 mb-1">
                                                Detailed Analytics
                                            </h3>
                                            <p className="text-slate-700 text-sm leading-relaxed">
                                                Review which questions you got
                                                right or wrong. Understand your
                                                strengths and areas needing
                                                improvement.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex gap-3">
                                        <div className="w-6 h-6 bg-emerald-100 border border-emerald-300 rounded-full flex items-center justify-center mt-1 shrink-0 shadow-sm">
                                            <CheckCircle className="w-4 h-4 text-emerald-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-900 mb-1">
                                                Performance History
                                            </h3>
                                            <p className="text-slate-700 text-sm leading-relaxed">
                                                All your exam attempts are
                                                saved. Track your progress over
                                                time and identify improvement
                                                trends.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Quick Reference */}
                        <div className="lg:col-span-1 space-y-6">
                            {/* Quick Tips */}
                            <div className="bg-white/80 backdrop-blur-sm border-2 border-slate-200 rounded-2xl p-6 sticky top-6 hover:border-yellow-400 hover:shadow-xl transition-all z-50">
                                <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center">
                                    <Zap className="h-5 w-5 text-yellow-600 mr-2" />
                                    Quick Tips
                                </h3>

                                <div className="space-y-3">
                                    {[
                                        "Read each question carefully before selecting",
                                        "Don't spend too long on difficult questions",
                                        "Use the skip feature strategically",
                                        "Review all answers before final submission",
                                        "Stay calm and manage your time wisely",
                                        "Trust your first instinct when unsure",
                                    ].map((tip, idx) => (
                                        <div
                                            key={idx}
                                            className="flex gap-2 items-start"
                                        >
                                            <div className="w-5 h-5 bg-yellow-100 border border-yellow-300 rounded flex items-center justify-center mt-0.5 shrink-0 shadow-sm">
                                                <span className="text-xs font-bold text-yellow-600">
                                                    {idx + 1}
                                                </span>
                                            </div>
                                            <p className="text-sm text-slate-700 leading-relaxed">
                                                {tip}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Platform Features */}
                            <div className="bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-6 shadow-sm">
                                <h3 className="text-lg font-bold text-slate-900 mb-4">
                                    Platform Features
                                </h3>
                                <div className="space-y-3">
                                    {[
                                        {
                                            icon: Lock,
                                            text: "Secure & Encrypted",
                                        },
                                        {
                                            icon: CheckCircle,
                                            text: "Auto-Save Enabled",
                                        },
                                        {
                                            icon: Users,
                                            text: "50,000+ Students",
                                        },
                                        {
                                            icon: Award,
                                            text: "Instant Results",
                                        },
                                        {
                                            icon: Shield,
                                            text: "Fair Play Guaranteed",
                                        },
                                    ].map((feature, idx) => (
                                        <div
                                            key={idx}
                                            className="flex items-center gap-3"
                                        >
                                            <feature.icon className="h-4 w-4 text-emerald-600 shrink-0" />
                                            <span className="text-sm text-slate-700">
                                                {feature.text}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Test Configuration */}
                            <div className="bg-white/80 backdrop-blur-sm border-2 border-slate-200 rounded-2xl p-6 hover:border-emerald-400 hover:shadow-xl transition-all">
                                <h3 className="text-lg font-bold text-slate-900 mb-4">
                                    Test Options
                                </h3>
                                <div className="space-y-3">
                                    <div className="bg-emerald-50 border-2 border-emerald-200 rounded-xl p-3 shadow-sm">
                                        <p className="text-sm text-slate-600 mb-1">
                                            25 Questions
                                        </p>
                                        <p className="text-lg font-bold text-emerald-600">
                                            12.5 minutes
                                        </p>
                                    </div>
                                    <div className="bg-emerald-50 border-2 border-emerald-200 rounded-xl p-3 shadow-sm">
                                        <p className="text-sm text-slate-600 mb-1">
                                            30 Questions
                                        </p>
                                        <p className="text-lg font-bold text-emerald-600">
                                            15 minutes
                                        </p>
                                    </div>
                                    <div className="bg-emerald-50 border-2 border-emerald-200 rounded-xl p-3 shadow-sm">
                                        <p className="text-sm text-slate-600 mb-1">
                                            50 Questions
                                        </p>
                                        <p className="text-lg font-bold text-emerald-600">
                                            25 minutes
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Support */}
                            <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6 shadow-sm">
                                <h3 className="text-lg font-bold text-slate-900 mb-2">
                                    Need Help?
                                </h3>
                                <p className="text-sm text-slate-700 mb-4 leading-relaxed">
                                    If you encounter any technical issues during
                                    your examination, contact our support team
                                    immediately.
                                </p>
                                <button className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm transition-all hover:scale-105 cursor-pointer shadow-md">
                                    Contact Support
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="relative py-12 sm:py-16 bg-linear-to-br from-emerald-50 to-green-50 border-t border-emerald-200">
                {/* Background Effect */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-5">
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

                {/* Decorative Elements */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-emerald-300/20 rounded-full blur-3xl" />
                    <div className="absolute bottom-1/2 right-1/4 w-96 h-96 bg-emerald-400/20 rounded-full blur-3xl" />
                </div>

                <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 mb-4">
                        Ready to Start Your Examination?
                    </h2>
                    <p className="text-lg text-slate-600 mb-8 max-w-2xl mx-auto">
                        You&apos;re all set! Log in to access your personalized
                        exam dashboard and begin testing.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href={"/login"}>
                            <button
                                onClick={onLoginClick}
                                className="group px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white text-lg font-bold rounded-xl shadow-2xl shadow-emerald-500/50 hover:shadow-emerald-500/70 hover:scale-105 transition-all cursor-pointer"
                            >
                                <span className="flex items-center justify-center gap-2">
                                    Go to Login
                                    <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                </span>
                            </button>
                        </Link>
                        <Link href={"/"}>
                            <button className="px-8 py-4 bg-white backdrop-blur-md text-slate-900 text-lg font-bold rounded-xl border-2 border-slate-200 hover:bg-slate-50 hover:border-emerald-300 transition-all cursor-pointer shadow-lg">
                                Back to Home
                            </button>
                        </Link>
                    </div>
                </div>
            </section>
        </main>
    );
}
