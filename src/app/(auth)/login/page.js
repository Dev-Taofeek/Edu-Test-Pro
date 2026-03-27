"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
    GraduationCap,
    Shield,
    CheckCircle,
    AlertCircle,
    Eye,
    EyeOff,
    X,
    Info,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useAuth } from "@/app/context/AuthContext";

// ─── Toast ────────────────────────────────────────────────────────────────────

function Toast({ id, type, title, message, onDismiss }) {
    const [visible, setVisible] = useState(false);
    const [leaving, setLeaving] = useState(false);

    useEffect(() => {
        requestAnimationFrame(() => setVisible(true));
    }, []);

    const dismiss = useCallback(() => {
        setLeaving(true);
        setTimeout(() => onDismiss(id), 300);
    }, [id, onDismiss]);

    useEffect(() => {
        const t = setTimeout(dismiss, 5000);
        return () => clearTimeout(t);
    }, [dismiss]);

    const styles = {
        success: {
            bar: "bg-green-500",
            icon: (
                <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
            ),
        },
        error: {
            bar: "bg-red-500",
            icon: (
                <AlertCircle className="h-5 w-5 text-red-500   shrink-0 mt-0.5" />
            ),
        },
        info: {
            bar: "bg-blue-500",
            icon: <Info className="h-5 w-5 text-blue-500  shrink-0 mt-0.5" />,
        },
    };
    const s = styles[type] ?? styles.info;

    return (
        <div
            className={`flex items-start gap-3 bg-white rounded-xl shadow-2xl border border-gray-100 w-80 p-4 overflow-hidden relative transition-all duration-300 ease-out ${visible && !leaving ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"}`}
        >
            <span
                className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-xl ${s.bar}`}
            />
            {s.icon}
            <div className="flex-1 min-w-0 pl-1">
                {title && (
                    <p className="text-sm font-semibold text-gray-900">
                        {title}
                    </p>
                )}
                {message && (
                    <p className="text-sm text-gray-600 mt-0.5 leading-snug">
                        {message}
                    </p>
                )}
            </div>
            <button
                onClick={dismiss}
                className="text-gray-400 hover:text-gray-600 transition-colors shrink-0"
            >
                <X className="h-4 w-4" />
            </button>
        </div>
    );
}

function ToastContainer({ toasts, onDismiss }) {
    return (
        <div className="fixed bottom-4 right-4 z-9999 flex flex-col gap-3 pointer-events-none">
            {toasts.map((t) => (
                <div key={t.id} className="pointer-events-auto">
                    <Toast {...t} onDismiss={onDismiss} />
                </div>
            ))}
        </div>
    );
}

function useToast() {
    const [toasts, setToasts] = useState([]);
    const push = useCallback((type, title, message) => {
        setToasts((prev) => [
            ...prev,
            { id: Date.now() + Math.random(), type, title, message },
        ]);
    }, []);
    const dismiss = useCallback(
        (id) => setToasts((prev) => prev.filter((t) => t.id !== id)),
        [],
    );
    return {
        toasts,
        dismiss,
        toast: {
            success: (title, msg) => push("success", title, msg),
            error: (title, msg) => push("error", title, msg),
            info: (title, msg) => push("info", title, msg),
        },
    };
}

// ─── Validation ───────────────────────────────────────────────────────────────

const EMAIL_REGEX =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

const validateEmail = (email) => {
    if (!email.trim()) return "Email is required";
    if (email.length > 254) return "Email is too long";
    if (!EMAIL_REGEX.test(email)) return "Please enter a valid email address";
    return "";
};

const validatePassword = (password) => {
    if (!password) return "Password is required";
    if (password.length < 6) return "Password must be at least 6 characters";
    if (password.length > 128) return "Password is too long";
    return "";
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LoginPage() {
    const { login } = useAuth();
    const { toasts, dismiss, toast } = useToast();

    const [role, setRole] = useState("student");
    const [isLoading, setIsLoading] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [userName, setUserName] = useState("");
    const [showPassword, setShowPassword] = useState({
        student: false,
        admin: false,
    });

    const [studentEmail, setStudentEmail] = useState("");
    const [studentPassword, setStudentPassword] = useState("");
    const [adminEmail, setAdminEmail] = useState("");
    const [adminPassword, setAdminPassword] = useState("");

    const [touched, setTouched] = useState({
        studentEmail: false,
        studentPassword: false,
        adminEmail: false,
        adminPassword: false,
    });

    // Derived errors (only shown after field is touched)
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

    const isFormValid =
        role === "student"
            ? studentEmail.trim() &&
              studentPassword.trim() &&
              !validateEmail(studentEmail) &&
              !validatePassword(studentPassword)
            : adminEmail.trim() &&
              adminPassword.trim() &&
              !validateEmail(adminEmail) &&
              !validatePassword(adminPassword);

    const handleBlur = (field) => setTouched((p) => ({ ...p, [field]: true }));

    const handleEmailChange = (e, type) => {
        const value = e.target.value.trim();
        if (type === "student") {
            setStudentEmail(value);
            if (value && !touched.studentEmail)
                setTouched((p) => ({ ...p, studentEmail: true }));
        } else {
            setAdminEmail(value);
            if (value && !touched.adminEmail)
                setTouched((p) => ({ ...p, adminEmail: true }));
        }
    };

    const handlePasswordChange = (e, type) => {
        const value = e.target.value;
        if (type === "student") {
            setStudentPassword(value);
            if (value && !touched.studentPassword)
                setTouched((p) => ({ ...p, studentPassword: true }));
        } else {
            setAdminPassword(value);
            if (value && !touched.adminPassword)
                setTouched((p) => ({ ...p, adminPassword: true }));
        }
    };

    const handleRoleChange = (newRole) => {
        setRole(newRole);
        setTouched({
            studentEmail: false,
            studentPassword: false,
            adminEmail: false,
            adminPassword: false,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Touch all fields for this role
        if (role === "student") {
            setTouched((p) => ({
                ...p,
                studentEmail: true,
                studentPassword: true,
            }));
        } else {
            setTouched((p) => ({
                ...p,
                adminEmail: true,
                adminPassword: true,
            }));
        }

        const loginEmail = role === "student" ? studentEmail : adminEmail;
        const loginPassword =
            role === "student" ? studentPassword : adminPassword;

        const emailErr = validateEmail(loginEmail);
        const passErr = validatePassword(loginPassword);

        if (emailErr || passErr) {
            toast.error("Invalid input", emailErr || passErr);
            return;
        }

        setIsLoading(true);

        try {
            const userCredential = await signInWithEmailAndPassword(
                auth,
                loginEmail.toLowerCase(),
                loginPassword,
            );
            const firebaseUser = userCredential.user;

            const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));

            if (!userDoc.exists()) {
                // Orphan auth account — clean it up
                await firebaseUser.delete().catch(() => {});
                throw new Error(
                    "Account setup incomplete. Please register again.",
                );
            }

            const userData = userDoc.data();

            // Guard: block accounts that never completed email verification
            if (!userData.emailVerified) {
                await auth.signOut();
                throw new Error("email_not_verified");
            }

            // Guard: role mismatch
            if (userData.role !== role) {
                await auth.signOut();
                throw new Error(`role_mismatch:${userData.role}`);
            }

            const authUser = {
                uid: firebaseUser.uid,
                firstName: userData.firstName,
                lastName: userData.lastName,
                email: userData.email,
                role: userData.role,
                matricNo: userData.matricNo || "",
            };

            login(authUser);
            setUserName(userData.firstName || "User");
            setShowSuccessModal(true);
            toast.success(
                "Welcome back!",
                `Signed in as ${userData.firstName}.`,
            );
        } catch (err) {
            console.error("Login error:", err);

            const msg = err.message ?? "";

            if (msg === "email_not_verified") {
                toast.error(
                    "Email not verified",
                    "Please complete registration by clicking the link we sent to your inbox.",
                );
            } else if (msg.startsWith("role_mismatch:")) {
                const actual = msg.split(":")[1];
                toast.error(
                    "Wrong login tab",
                    `This account is registered as ${actual}. Please use the ${actual} login.`,
                );
            } else if (msg.includes("Account setup incomplete")) {
                toast.error("Account not found", "Please register again.");
            } else {
                const firebaseMsgs = {
                    "auth/user-not-found": "Email or password is incorrect.",
                    "auth/wrong-password": "Email or password is incorrect.",
                    "auth/invalid-email": "Please enter a valid email address.",
                    "auth/invalid-credential":
                        "Email or password is incorrect.",
                    "auth/too-many-requests":
                        "Too many failed attempts. Please wait a few minutes.",
                    "auth/network-request-failed":
                        "Network error. Check your internet connection.",
                    "auth/user-disabled":
                        "This account has been disabled. Contact support.",
                };
                toast.error(
                    "Sign in failed",
                    firebaseMsgs[err.code] ??
                        "An unexpected error occurred. Please try again.",
                );
            }
        } finally {
            setIsLoading(false);
        }
    };

    const errCls = (hasError) =>
        hasError
            ? "border-red-300 focus:border-red-500 focus:ring-red-500"
            : "";

    return (
        <>
            <ToastContainer toasts={toasts} onDismiss={dismiss} />

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
                                    Welcome back, {userName}! Redirecting to
                                    your dashboard...
                                </p>
                                <div className="flex items-center justify-center gap-2">
                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" />
                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce delay-100" />
                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce delay-200" />
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

                    {/* Role selector */}
                    <div className="flex gap-3 mb-6">
                        {[
                            {
                                value: "student",
                                label: "Student Login",
                                Icon: GraduationCap,
                            },
                            {
                                value: "admin",
                                label: "Admin Login",
                                Icon: Shield,
                            },
                        ].map(({ value, label, Icon }) => (
                            <button
                                key={value}
                                type="button"
                                onClick={() => handleRoleChange(value)}
                                disabled={isLoading}
                                className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${role === value ? "bg-green-900 text-white shadow-md" : "bg-white text-gray-700 border-2 border-gray-200 hover:border-green-700"}`}
                            >
                                <Icon className="inline-block w-5 h-5 mr-2" />
                                {label}
                            </button>
                        ))}
                    </div>

                    <Card className="p-8 shadow-lg border-t-4 border-t-green-900 bg-white rounded-2xl">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {role === "student" ? (
                                <>
                                    <div>
                                        <Input
                                            label="Email Address"
                                            type="email"
                                            placeholder="student@example.com"
                                            value={studentEmail}
                                            autoComplete="email"
                                            required
                                            onChange={(e) =>
                                                handleEmailChange(e, "student")
                                            }
                                            onBlur={() =>
                                                handleBlur("studentEmail")
                                            }
                                            className={errCls(
                                                studentEmailError,
                                            )}
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
                                            placeholder="••••••••"
                                            type={
                                                showPassword.student
                                                    ? "text"
                                                    : "password"
                                            }
                                            value={studentPassword}
                                            autoComplete="current-password"
                                            required
                                            onChange={(e) =>
                                                handlePasswordChange(
                                                    e,
                                                    "student",
                                                )
                                            }
                                            onBlur={() =>
                                                handleBlur("studentPassword")
                                            }
                                            className={errCls(
                                                studentPasswordError,
                                            )}
                                        />
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowPassword((p) => ({
                                                    ...p,
                                                    student: !p.student,
                                                }))
                                            }
                                            className="absolute right-3 top-9 text-gray-400 hover:text-gray-600 cursor-pointer"
                                        >
                                            {showPassword.student ? (
                                                <EyeOff className="h-5 w-5" />
                                            ) : (
                                                <Eye className="h-5 w-5" />
                                            )}
                                        </button>
                                        {studentPasswordError && (
                                            <p className="mt-2 text-sm text-red-600 flex items-start gap-1">
                                                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                                                <span>
                                                    {studentPasswordError}
                                                </span>
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
                                            autoComplete="email"
                                            required
                                            onChange={(e) =>
                                                handleEmailChange(e, "admin")
                                            }
                                            onBlur={() =>
                                                handleBlur("adminEmail")
                                            }
                                            className={errCls(adminEmailError)}
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
                                            placeholder="••••••••"
                                            type={
                                                showPassword.admin
                                                    ? "text"
                                                    : "password"
                                            }
                                            value={adminPassword}
                                            autoComplete="current-password"
                                            required
                                            onChange={(e) =>
                                                handlePasswordChange(e, "admin")
                                            }
                                            onBlur={() =>
                                                handleBlur("adminPassword")
                                            }
                                            className={errCls(
                                                adminPasswordError,
                                            )}
                                        />
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowPassword((p) => ({
                                                    ...p,
                                                    admin: !p.admin,
                                                }))
                                            }
                                            className="absolute right-3 top-9 text-gray-400 hover:text-gray-600 cursor-pointer"
                                        >
                                            {showPassword.admin ? (
                                                <EyeOff className="h-5 w-5" />
                                            ) : (
                                                <Eye className="h-5 w-5" />
                                            )}
                                        </button>
                                        {adminPasswordError && (
                                            <p className="mt-2 text-sm text-red-600 flex items-start gap-1">
                                                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                                                <span>
                                                    {adminPasswordError}
                                                </span>
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
                                {isLoading ? "Signing in…" : "Sign In"}
                            </Button>
                        </form>

                        <div className="mt-6 pt-6 border-t border-gray-200 text-center text-sm text-gray-600">
                            Don&apos;t have an account?{" "}
                            <Link
                                href="/register"
                                className="text-green-900 font-semibold hover:underline"
                            >
                                Register
                            </Link>
                        </div>
                    </Card>

                    <div className="mt-8 text-center">
                        <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                            <div className="w-2 h-2 bg-green-500 rounded-full" />
                            <p>
                                Secure Connection • Encrypted • Official Portal
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
}
