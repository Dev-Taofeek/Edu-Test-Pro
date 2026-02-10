"use client";

import React, { useState } from "react";
import { Mail, ArrowLeft, CheckCircle, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState("");

    const isFormValid = email.trim() !== "";

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            if (!email.includes("@")) {
                throw new Error("Please enter a valid email address");
            }

            await sendPasswordResetEmail(auth, email);

            setIsSuccess(true);
        } catch (err) {
            console.error(err);
            setError(
                err.message === "Firebase: Error (auth/user-not-found)."
                    ? "No account found with this email"
                    : "Failed to send reset email. Try again.",
            );
        } finally {
            setIsLoading(false);
        }
    };

    const handleResend = async () => {
        setIsLoading(true);
        setError("");

        try {
            await sendPasswordResetEmail(auth, email);
        } catch (err) {
            setError("Failed to resend email. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="grow flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8 bg-green-50">
            <div className="w-full max-w-md">
                {!isSuccess ? (
                    <>
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 bg-green-900 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <Mail className="h-8 w-8 text-white" />
                            </div>
                            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
                                Forgot Password?
                            </h2>
                            <p className="mt-2 text-lg text-gray-600">
                                No worries, we&apos;ll send you reset
                                instructions
                            </p>
                        </div>

                        <Card className="p-8 shadow-lg border-t-4 border-t-green-900 bg-white rounded-2xl">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <Input
                                        label="Email Address"
                                        type="email"
                                        placeholder="Enter your registered email"
                                        value={email}
                                        onChange={(e) =>
                                            setEmail(e.target.value)
                                        }
                                        required
                                    />
                                    <p className="mt-2 text-sm text-gray-500">
                                        We&apos;ll send a password reset link to
                                        this email
                                    </p>
                                </div>

                                {error && (
                                    <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
                                        <AlertCircle className="h-5 w-5 text-red-600 shrink-0" />
                                        <p className="text-sm text-red-700">
                                            {error}
                                        </p>
                                    </div>
                                )}

                                <Button
                                    type="submit"
                                    fullWidth
                                    size="lg"
                                    disabled={isLoading || !isFormValid}
                                    className="bg-green-900 hover:bg-green-800 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-white font-bold py-4"
                                >
                                    {isLoading
                                        ? "Sending..."
                                        : "Send Reset Link"}
                                </Button>
                            </form>

                            <div className="mt-6 pt-6 border-t border-gray-200">
                                <Link
                                    href="/login"
                                    className="flex items-center justify-center text-sm text-green-900 hover:text-green-700 font-semibold"
                                >
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Back to Login
                                </Link>
                            </div>
                        </Card>
                    </>
                ) : (
                    <>
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <CheckCircle className="h-8 w-8 text-green-700" />
                            </div>
                            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
                                Check Your Email
                            </h2>
                            <p className="mt-2 text-lg text-gray-600">
                                We&apos;ve sent password reset instructions to
                            </p>
                            <p className="mt-1 text-lg font-semibold text-green-900">
                                {email}
                            </p>
                        </div>

                        <Card className="p-8 shadow-lg border-t-4 border-t-green-900 bg-white rounded-2xl">
                            <div className="space-y-6">
                                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                                    <h3 className="font-bold text-gray-900 mb-2">
                                        What&apos;s Next?
                                    </h3>
                                    <ul className="space-y-2 text-sm text-gray-700">
                                        <li className="flex items-start">
                                            <div className="w-1.5 h-1.5 bg-green-700 rounded-full mt-2 mr-3 shrink-0" />
                                            <span>
                                                Check your inbox for an email
                                                from EduTest Pro
                                            </span>
                                        </li>
                                        <li className="flex items-start">
                                            <div className="w-1.5 h-1.5 bg-green-700 rounded-full mt-2 mr-3 shrink-0" />
                                            <span>
                                                Click the reset link in the
                                                email (valid for 1 hour)
                                            </span>
                                        </li>
                                        <li className="flex items-start">
                                            <div className="w-1.5 h-1.5 bg-green-700 rounded-full mt-2 mr-3 shrink-0" />
                                            <span>
                                                Create a new password for your
                                                account
                                            </span>
                                        </li>
                                    </ul>
                                </div>

                                <div className="text-center text-sm text-gray-600">
                                    Didn&apos;t receive the email?{" "}
                                    <button
                                        onClick={handleResend}
                                        disabled={isLoading}
                                        className="text-green-900 font-semibold hover:underline disabled:opacity-50 cursor-pointer"
                                    >
                                        {isLoading ? "Sending..." : "Resend"}
                                    </button>
                                </div>

                                <div className="pt-4 border-t border-gray-200">
                                    <Link
                                        href="/login"
                                        className="flex items-center justify-center text-sm text-green-900 hover:text-green-700 font-semibold"
                                    >
                                        <ArrowLeft className="h-4 w-4 mr-2" />
                                        Back to Login
                                    </Link>
                                </div>
                            </div>
                        </Card>
                    </>
                )}

                <div className="mt-8 text-center">
                    <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <p>
                            Secure Connection • Email Verified • Official Portal
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
