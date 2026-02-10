"use client";

import React, { useState } from "react";
import {
    Lock,
    User,
    School,
    GraduationCap,
    Shield,
    CheckCircle,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useAuth } from "@/app/context/AuthContext";

export default function LoginPage() {
    const { login } = useAuth(); // Use AuthContext login
    const [role, setRole] = useState("student"); // 'student' or 'admin'
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [userName, setUserName] = useState("");

    // Student fields
    const [studentEmail, setStudentEmail] = useState("");
    const [studentPassword, setStudentPassword] = useState("");

    // Admin fields
    const [adminEmail, setAdminEmail] = useState("");
    const [adminPassword, setAdminPassword] = useState("");

    // Determine if form is valid
    const isFormValid =
        role === "student"
            ? studentEmail.trim() !== "" && studentPassword.trim() !== ""
            : adminEmail.trim() !== "" && adminPassword.trim() !== "";

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            const loginEmail = role === "student" ? studentEmail : adminEmail;
            const loginPassword =
                role === "student" ? studentPassword : adminPassword;

            // Firebase Auth login
            const userCredential = await signInWithEmailAndPassword(
                auth,
                loginEmail,
                loginPassword,
            );

            const firebaseUser = userCredential.user;

            // Fetch user data from Firestore
            const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));

            if (!userDoc.exists()) {
                throw new Error("User record not found");
            }

            const userData = userDoc.data();

            // Check role
            if (userData.role !== role) {
                throw new Error(
                    `This account is registered as ${userData.role}, not ${role}`,
                );
            }

            // Prepare AuthContext user object
            const authUser = {
                uid: firebaseUser.uid,
                firstName: userData.firstName,
                lastName: userData.lastName,
                email: userData.email,
                role: userData.role,
                matricNo: userData.matricNo || "",
            };

            // Save user to AuthContext (and localStorage)
            login(authUser);

            // Show success modal
            setUserName(userData.firstName || "User");
            setShowSuccessModal(true);
        } catch (err) {
            console.error("Login error:", err);
            let errorMessage = "An error occurred. Please try again.";

            if (err.code === "auth/user-not-found") {
                errorMessage = "Email or password is incorrect";
            } else if (err.code === "auth/wrong-password") {
                errorMessage = "Email or password is incorrect";
            } else if (err.code === "auth/invalid-email") {
                errorMessage = "Please enter a valid email address";
            } else if (err.code === "auth/invalid-credential") {
                errorMessage = "Email or password is incorrect";
            } else if (err.code === "auth/too-many-requests") {
                errorMessage =
                    "Too many failed login attempts. Please try again in a few minutes";
            } else if (err.code === "auth/network-request-failed") {
                errorMessage =
                    "Network error. Please check your internet connection";
            } else if (err.code === "auth/user-disabled") {
                errorMessage =
                    "This account has been disabled. Please contact support";
            } else if (err.message.includes("role")) {
                errorMessage = err.message; // Keep role mismatch message as is
            } else if (err.message.includes("User record not found")) {
                errorMessage = "Account not found. Please register first";
            }

            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="grow flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8 bg-green-50 min-h-screen">
            {/* Success Modal */}
            {showSuccessModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 transform transition-all animate-in fade-in zoom-in duration-300">
                        <div className="text-center">
                            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                                <CheckCircle className="h-10 w-10 text-green-600" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">
                                Login Successful!
                            </h3>
                            <p className="text-gray-600 mb-6">
                                Welcome back, {userName}! Redirecting to your
                                dashboard...
                            </p>
                            <div className="flex items-center justify-center gap-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce"></div>
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce delay-100"></div>
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce delay-200"></div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
                        Welcome Back
                    </h2>
                    <p className="mt-2 text-lg text-gray-600">
                        Please sign in to continue to your exam portal
                    </p>
                </div>

                {/* Role Selector */}
                <div className="flex gap-3 mb-6">
                    <button
                        type="button"
                        onClick={() => {
                            setRole("student");
                            setError("");
                        }}
                        disabled={isLoading}
                        className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                            role === "student"
                                ? "bg-green-900 text-white shadow-md"
                                : "bg-white text-gray-700 border-2 border-gray-200 hover:border-green-700"
                        }`}
                    >
                        <GraduationCap className="inline-block w-5 h-5 mr-2" />
                        Student Login
                    </button>

                    <button
                        type="button"
                        onClick={() => {
                            setRole("admin");
                            setError("");
                        }}
                        disabled={isLoading}
                        className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                            role === "admin"
                                ? "bg-green-900 text-white shadow-md"
                                : "bg-white text-gray-700 border-2 border-gray-200 hover:border-green-700"
                        }`}
                    >
                        <Shield className="inline-block w-5 h-5 mr-2" />
                        Admin Login
                    </button>
                </div>

                <Card className="p-8 shadow-lg border-t-4 border-t-green-900 bg-white rounded-2xl">
                    {/* Error Alert */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {role === "student" ? (
                            <>
                                <Input
                                    label="Email Address"
                                    type="email"
                                    placeholder="student@example.com"
                                    value={studentEmail}
                                    onChange={(e) => {
                                        setStudentEmail(e.target.value);
                                        setError("");
                                    }}
                                    required
                                />
                                <Input
                                    label="Password"
                                    type="password"
                                    placeholder="••••••••"
                                    value={studentPassword}
                                    onChange={(e) => {
                                        setStudentPassword(e.target.value);
                                        setError("");
                                    }}
                                    required
                                />
                            </>
                        ) : (
                            <>
                                <Input
                                    label="Admin Email Address"
                                    type="email"
                                    placeholder="admin@school.edu"
                                    value={adminEmail}
                                    onChange={(e) => {
                                        setAdminEmail(e.target.value);
                                        setError("");
                                    }}
                                    required
                                />
                                <Input
                                    label="Admin Password"
                                    type="password"
                                    placeholder="••••••••"
                                    value={adminPassword}
                                    onChange={(e) => {
                                        setAdminPassword(e.target.value);
                                        setError("");
                                    }}
                                    required
                                />
                            </>
                        )}

                        <Button
                            type="submit"
                            fullWidth
                            size="lg"
                            disabled={isLoading || !isFormValid}
                            className="bg-green-900 hover:bg-green-800 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-white font-bold py-4"
                        >
                            {isLoading ? "Signing in..." : "Sign In"}
                        </Button>
                    </form>

                    <div className="mt-6 pt-6 border-t border-gray-200 text-center text-sm text-gray-600">
                        Don&apos;t have an account?{" "}
                        <Link
                            href={"/register"}
                            className="text-green-900 font-semibold hover:underline"
                        >
                            Register
                        </Link>
                    </div>
                </Card>
            </div>
        </div>
    );
}
