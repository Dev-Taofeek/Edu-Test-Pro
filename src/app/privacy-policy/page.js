"use client";

import React from "react";
import Link from "next/link";
import { ShieldCheck, Lock, Users, Database, Mail, Globe } from "lucide-react";

export default function PrivacyPolicy() {
    return (
        <main className="min-h-screen bg-green-50 py-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto bg-white/90 backdrop-blur-sm border border-emerald-200 rounded-3xl shadow-2xl p-8 sm:p-12">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 text-emerald-700 font-semibold text-sm mb-4">
                        <ShieldCheck className="w-4 h-4" />
                        Privacy & Security
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-black text-slate-900 mb-4">
                        Privacy Policy
                    </h1>
                    <p className="text-slate-600 text-lg">
                        Your privacy matters to us at{" "}
                        <span className="font-bold text-emerald-600">
                            Edu Test Pro
                        </span>
                    </p>
                </div>

                {/* Content */}
                <div className="space-y-10 text-slate-700 leading-relaxed">
                    {/* Introduction */}
                    <section>
                        <h2 className="text-2xl font-bold text-slate-900 mb-3">
                            1. Introduction
                        </h2>
                        <p>
                            Edu Test Pro is committed to protecting your
                            personal information. This Privacy Policy explains
                            how we collect, use, and safeguard your data when
                            you use our online CBT platform.
                        </p>
                    </section>

                    {/* Information We Collect */}
                    <section>
                        <h2 className="text-2xl font-bold text-slate-900 mb-3 flex items-center gap-2">
                            <Database className="w-5 h-5 text-emerald-600" />
                            2. Information We Collect
                        </h2>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>
                                Personal details (name, email, school, exam
                                info)
                            </li>
                            <li>Login and authentication data</li>
                            <li>Exam results and performance analytics</li>
                            <li>Device and usage information for security</li>
                        </ul>
                    </section>

                    {/* How We Use Data */}
                    <section>
                        <h2 className="text-2xl font-bold text-slate-900 mb-3 flex items-center gap-2">
                            <Users className="w-5 h-5 text-emerald-600" />
                            3. How We Use Your Information
                        </h2>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>To provide and manage CBT exams</li>
                            <li>
                                To generate results and performance insights
                            </li>
                            <li>To prevent fraud and cheating</li>
                            <li>To improve platform functionality</li>
                        </ul>
                    </section>

                    {/* Data Protection */}
                    <section>
                        <h2 className="text-2xl font-bold text-slate-900 mb-3 flex items-center gap-2">
                            <Lock className="w-5 h-5 text-emerald-600" />
                            4. Data Security
                        </h2>
                        <p>
                            We use industry-standard security measures,
                            encryption, and access controls to protect your data
                            from unauthorized access, loss, or misuse.
                        </p>
                    </section>

                    {/* Third Parties */}
                    <section>
                        <h2 className="text-2xl font-bold text-slate-900 mb-3 flex items-center gap-2">
                            <Globe className="w-5 h-5 text-emerald-600" />
                            5. Third-Party Services
                        </h2>
                        <p>
                            We do not sell your data. Limited information may be
                            shared with trusted services (such as hosting or
                            analytics providers) strictly to operate Edu Test
                            Pro.
                        </p>
                    </section>
                </div>
            </div>
        </main>
    );
}
