"use client";

import React, { useState } from "react";
import {
    Lock,
    User,
    School,
    GraduationCap,
    Shield,
    CheckCircle,
    AlertCircle,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useAuth } from "@/app/context/AuthContext";
import { EyeOff } from "lucide-react";
import { Eye } from "lucide-react";

// Email validation regex - RFC 5322 compliant
const EMAIL_REGEX =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

export default function LoginPage() {
    const { login } = useAuth(); // Use AuthContext login
    const [role, setRole] = useState("student"); // 'student' or 'admin'
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [userName, setUserName] = useState("");
    const [showStudentPassword, setShowStudentPassword] = useState(false);
    const [showAdminPassword, setShowAdminPassword] = useState(false);

    // Student fields
    const [studentEmail, setStudentEmail] = useState("");
    const [studentPassword, setStudentPassword] = useState("");

    // Admin fields
    const [adminEmail, setAdminEmail] = useState("");
    const [adminPassword, setAdminPassword] = useState("");

    // Validation states
    const [touched, setTouched] = useState({
        studentEmail: false,
        studentPassword: false,
        adminEmail: false,
        adminPassword: false,
    });

    // Validation functions
    const validateEmail = (email) => {
        if (!email.trim()) {
            return "Email is required";
        }

        if (email.length > 254) {
            return "Email is too long";
        }

        if (!EMAIL_REGEX.test(email)) {
            return "Please enter a valid email address";
        }

        return "";
    };

    const validatePassword = (password) => {
        if (!password) {
            return "Password is required";
        }

        if (password.length < 6) {
            return "Password must be at least 6 characters";
        }

        if (password.length > 128) {
            return "Password is too long";
        }

        return "";
    };

    // Get current validation errors
    const studentEmailError = touched.studentEmail
        ? validateEmail(studentEmail)
        : "";
    const studentPasswordError = touched.studentPassword
        ? validatePassword(studentPassword)
        : "";
    const adminEmailError = touched.adminEmail ? validateEmail(adminEmail) : "";
    const adminPasswordError = touched.adminPassword
        ? validatePassword(adminPassword)
        : "";

    // Determine if form is valid
    const isFormValid =
        role === "student"
            ? studentEmail.trim() !== "" &&
              studentPassword.trim() !== "" &&
              !validateEmail(studentEmail) &&
              !validatePassword(studentPassword)
            : adminEmail.trim() !== "" &&
              adminPassword.trim() !== "" &&
              !validateEmail(adminEmail) &&
              !validatePassword(adminPassword);

    const handleBlur = (field) => {
        setTouched((prev) => ({ ...prev, [field]: true }));
    };

    const handleEmailChange = (e, type) => {
        const value = e.target.value.trim();

        if (type === "student") {
            setStudentEmail(value);
            if (value && !touched.studentEmail) {
                setTouched((prev) => ({ ...prev, studentEmail: true }));
            }
        } else {
            setAdminEmail(value);
            if (value && !touched.adminEmail) {
                setTouched((prev) => ({ ...prev, adminEmail: true }));
            }
        }
        setError("");
    };

    const handlePasswordChange = (e, type) => {
        const value = e.target.value;

        if (type === "student") {
            setStudentPassword(value);
            if (value && !touched.studentPassword) {
                setTouched((prev) => ({ ...prev, studentPassword: true }));
            }
        } else {
            setAdminPassword(value);
            if (value && !touched.adminPassword) {
                setTouched((prev) => ({ ...prev, adminPassword: true }));
            }
        }
        setError("");
    };

    const handleRoleChange = (newRole) => {
        setRole(newRole);
        setError("");
        // Reset validation when switching roles
        setTouched({
            studentEmail: false,
            studentPassword: false,
            adminEmail: false,
            adminPassword: false,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Mark all fields as touched
        if (role === "student") {
            setTouched((prev) => ({
                ...prev,
                studentEmail: true,
                studentPassword: true,
            }));
        } else {
            setTouched((prev) => ({
                ...prev,
                adminEmail: true,
                adminPassword: true,
            }));
        }

        // Validate before submission
        const loginEmail = role === "student" ? studentEmail : adminEmail;
        const loginPassword =
            role === "student" ? studentPassword : adminPassword;

        const emailError = validateEmail(loginEmail);
        const passwordError = validatePassword(loginPassword);

        if (emailError || passwordError) {
            setError(emailError || passwordError);
            return;
        }

        setError("");
        setIsLoading(true);

        try {
            // Firebase Auth login
            const userCredential = await signInWithEmailAndPassword(
                auth,
                loginEmail.toLowerCase(),
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
        <main className="grow flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8 bg-green-50 min-h-screen">
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
                        onClick={() => handleRoleChange("student")}
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
                        onClick={() => handleRoleChange("admin")}
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
                        <div className="mb-6 flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
                            <AlertCircle className="h-5 w-5 text-red-600 shrink-0" />
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {role === "student" ? (
                            <>
                                <div>
                                    <Input
                                        label="Email Address"
                                        type="email"
                                        placeholder="student@example.com"
                                        value={studentEmail}
                                        onChange={(e) =>
                                            handleEmailChange(e, "student")
                                        }
                                        onBlur={() =>
                                            handleBlur("studentEmail")
                                        }
                                        required
                                        autoComplete="email"
                                        className={
                                            studentEmailError
                                                ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                                                : ""
                                        }
                                    />
                                    {studentEmailError && (
                                        <p className="mt-2 text-sm text-red-600 flex items-start gap-1">
                                            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                                            <span>{studentEmailError}</span>
                                        </p>
                                    )}
                                </div>

                                <div className="relative">
                                    <Input
                                        label="Password"
                                        type={
                                            showStudentPassword
                                                ? "text"
                                                : "password"
                                        }
                                        placeholder="••••••••"
                                        value={studentPassword}
                                        onChange={(e) =>
                                            handlePasswordChange(e, "student")
                                        }
                                        onBlur={() =>
                                            handleBlur("studentPassword")
                                        }
                                        required
                                        autoComplete="current-password"
                                        className={
                                            studentPasswordError
                                                ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                                                : ""
                                        }
                                    />
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowStudentPassword(
                                                !showStudentPassword,
                                            )
                                        }
                                        className="absolute right-3 top-9 text-gray-400 hover:text-gray-600 cursor-pointer"
                                    >
                                        {showStudentPassword ? (
                                            <EyeOff className="h-5 w-5" />
                                        ) : (
                                            <Eye className="h-5 w-5" />
                                        )}
                                    </button>
                                    {studentPasswordError && (
                                        <p className="mt-2 text-sm text-red-600 flex items-start gap-1">
                                            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                                            <span>{studentPasswordError}</span>
                                        </p>
                                    )}
                                </div>
                            </>
                        ) : (
                            <>
                                <div>
                                    <Input
                                        label="Admin Email Address"
                                        type="email"
                                        placeholder="admin@school.edu"
                                        value={adminEmail}
                                        onChange={(e) =>
                                            handleEmailChange(e, "admin")
                                        }
                                        onBlur={() => handleBlur("adminEmail")}
                                        required
                                        autoComplete="email"
                                        className={
                                            adminEmailError
                                                ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                                                : ""
                                        }
                                    />
                                    {adminEmailError && (
                                        <p className="mt-2 text-sm text-red-600 flex items-start gap-1">
                                            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                                            <span>{adminEmailError}</span>
                                        </p>
                                    )}
                                </div>

                                <div className="relative">
                                    <Input
                                        label="Admin Password"
                                        type={
                                            showAdminPassword
                                                ? "text"
                                                : "password"
                                        }
                                        placeholder="••••••••"
                                        value={adminPassword}
                                        onChange={(e) =>
                                            handlePasswordChange(e, "admin")
                                        }
                                        onBlur={() =>
                                            handleBlur("adminPassword")
                                        }
                                        required
                                        autoComplete="current-password"
                                        className={
                                            adminPasswordError
                                                ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                                                : ""
                                        }
                                    />
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowAdminPassword(
                                                !showAdminPassword,
                                            )
                                        }
                                        className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
                                    >
                                        {showAdminPassword ? (
                                            <EyeOff className="h-5 w-5" />
                                        ) : (
                                            <Eye className="h-5 w-5" />
                                        )}
                                    </button>
                                    {adminPasswordError && (
                                        <p className="mt-2 text-sm text-red-600 flex items-start gap-1">
                                            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                                            <span>{adminPasswordError}</span>
                                        </p>
                                    )}
                                </div>
                            </>
                        )}

                        <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center">
                                <input
                                    id="remember-me"
                                    name="remember-me"
                                    type="checkbox"
                                    className="h-4 w-4 text-green-900 focus:ring-green-900 border-gray-300 rounded cursor-pointer"
                                />
                                <label
                                    htmlFor="remember-me"
                                    className="ml-2 text-gray-600 cursor-pointer"
                                >
                                    Remember me
                                </label>
                            </div>
                            <Link
                                href="/forgot-password"
                                className="text-green-900 font-semibold hover:underline"
                            >
                                Forgot password?
                            </Link>
                        </div>

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

                <div className="mt-8 text-center">
                    <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <p>Secure Connection • Encrypted • Official Portal</p>
                    </div>
                </div>
            </div>
        </main>
    );
}
