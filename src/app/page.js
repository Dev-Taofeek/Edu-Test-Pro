import React from "react";
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
} from "lucide-react";
import Link from "next/link";

export default function LandingPage({ onLoginClick }) {
    return (
        <div className="flex flex-col">
            {/* Hero Section */}
            <section className="relative bg-green-900 text-white py-16 sm:py-20 lg:py-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="max-w-4xl mx-auto text-center">
                        <div className="inline-flex items-center px-4 py-2 rounded-xl bg-white/10 border border-white/20 text-green-100 text-sm font-semibold mb-6">
                            <span className="flex h-2 w-2 rounded-full bg-emerald-400 mr-2"></span>
                            Official 2026 Exam Portal
                        </div>
                        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 leading-tight">
                            Secure, Reliable
                            <br />
                            <span className="text-emerald-400">
                                Computer Based Testing
                            </span>
                        </h1>
                        <p className="text-lg sm:text-xl text-green-100 mb-8 max-w-3xl mx-auto leading-relaxed">
                            Experience a stress-free examination environment
                            designed for success. Practice with real past
                            questions and get instant results with our advanced
                            CBT platform.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link href={"/login"}>
                                <Button
                                    size="lg"
                                    onClick={onLoginClick}
                                    className="bg-emerald-500 hover:bg-emerald-600 text-white border-0 cursor-pointer px-8 py-4 text-lg font-bold"
                                >
                                    Start Examination
                                    <ChevronRight className="ml-2 h-5 w-5" />
                                </Button>
                            </Link>
                            <Link href={"/instruction"}>
                                <Button
                                    variant="outline"
                                    size="lg"
                                    className="bg-white border-2 border-white text-green-900 hover:bg-green-50 cursor-pointer px-8 py-4 text-lg font-bold"
                                >
                                    View Instructions
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-12 bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {[
                            {
                                label: "Active Students",
                                value: "50,000+",
                                icon: Users,
                            },
                            {
                                label: "Questions Bank",
                                value: "10,000+",
                                icon: Book,
                            },
                            {
                                label: "Success Rate",
                                value: "94%",
                                icon: BarChart,
                            },
                            {
                                label: "Exams Taken",
                                value: "200,000+",
                                icon: Award,
                            },
                        ].map((stat, idx) => (
                            <div key={idx} className="text-center">
                                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                                    <stat.icon className="h-6 w-6 text-green-800" />
                                </div>
                                <p className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
                                    {stat.value}
                                </p>
                                <p className="text-sm text-gray-600">
                                    {stat.label}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="py-16 sm:py-20 bg-green-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12 sm:mb-16">
                        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                            Why Choose EduTest Pro?
                        </h2>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            Built with modern technology to ensure a seamless
                            and fair testing experience for every student.
                        </p>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow border border-gray-100">
                            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-6">
                                <ShieldCheck className="h-6 w-6 text-green-800" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">
                                Secure & Anti-Cheat
                            </h3>
                            <p className="text-gray-600 leading-relaxed">
                                Advanced browser locking and session monitoring
                                to ensure the integrity of every examination.
                            </p>
                        </div>

                        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow border border-gray-100">
                            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-6">
                                <Clock className="h-6 w-6 text-emerald-700" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">
                                Real-time Timing
                            </h3>
                            <p className="text-gray-600 leading-relaxed">
                                Precise server-synced timers that ensure every
                                student gets exactly the allotted time.
                            </p>
                        </div>

                        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow border border-gray-100">
                            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-6">
                                <Award className="h-6 w-6 text-orange-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">
                                Instant Results
                            </h3>
                            <p className="text-gray-600 leading-relaxed">
                                Get detailed performance breakdowns and scores
                                immediately after submission.
                            </p>
                        </div>

                        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow border border-gray-100">
                            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                                <Zap className="h-6 w-6 text-blue-700" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">
                                Lightning Fast
                            </h3>
                            <p className="text-gray-600 leading-relaxed">
                                Optimized performance ensures smooth navigation
                                and instant question loading without delays.
                            </p>
                        </div>

                        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow border border-gray-100">
                            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-6">
                                <Book className="h-6 w-6 text-purple-700" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">
                                Comprehensive Bank
                            </h3>
                            <p className="text-gray-600 leading-relaxed">
                                Access thousands of past questions across all
                                subjects with detailed explanations.
                            </p>
                        </div>

                        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow border border-gray-100">
                            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mb-6">
                                <Lock className="h-6 w-6 text-red-700" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">
                                Data Privacy
                            </h3>
                            <p className="text-gray-600 leading-relaxed">
                                Your personal information and exam records are
                                encrypted and stored securely.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="py-16 sm:py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12 sm:mb-16">
                        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                            How It Works
                        </h2>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            Get started in three simple steps and begin your
                            exam preparation journey today.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 sm:gap-12">
                        {[
                            {
                                step: "01",
                                title: "Create Account",
                                description:
                                    "Sign up with your email and verify your account to access the exam portal.",
                            },
                            {
                                step: "02",
                                title: "Choose Your Test",
                                description:
                                    "Select from 25, 30, or 50 questions and customize your examination settings.",
                            },
                            {
                                step: "03",
                                title: "Take & Review",
                                description:
                                    "Complete your exam and receive instant results with detailed performance analytics.",
                            },
                        ].map((item, idx) => (
                            <div key={idx} className="text-center">
                                <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                    <span className="text-2xl font-bold text-green-800">
                                        {item.step}
                                    </span>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">
                                    {item.title}
                                </h3>
                                <p className="text-gray-600 leading-relaxed">
                                    {item.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-16 sm:py-20 bg-green-900 text-white">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl sm:text-4xl font-bold mb-6">
                        Ready to Excel in Your Exams?
                    </h2>
                    <p className="text-lg sm:text-xl text-green-100 mb-8 max-w-2xl mx-auto">
                        Join thousands of successful students who have improved
                        their scores using our comprehensive CBT platform.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href={"/login"}>
                            <Button
                                size="lg"
                                onClick={onLoginClick}
                                className="bg-emerald-500 hover:bg-emerald-600 text-white border-0 cursor-pointer px-8 py-4 text-lg font-bold"
                            >
                                Get Started Now
                                <ChevronRight className="ml-2 h-5 w-5" />
                            </Button>
                        </Link>
                        <Link href={"/instruction"}>
                            <Button
                                variant="outline"
                                size="lg"
                                className="bg-white border-2 border-white text-green-900 hover:bg-green-50 cursor-pointer px-8 py-4 text-lg font-bold"
                            >
                                Learn More
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
