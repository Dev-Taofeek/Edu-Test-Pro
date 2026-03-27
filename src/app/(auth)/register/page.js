"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
    GraduationCap,
    Shield,
    Mail,
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
import {
    sendSignInLinkToEmail,
    isSignInWithEmailLink,
    signInWithEmailLink,
    createUserWithEmailAndPassword,
    updatePassword,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
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
const NAME_REGEX = /^[a-zA-Z\s'-]{2,50}$/;
const PHONE_REGEX =
    /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/;
const MATRIC_REGEX = /^[A-Z0-9\/-]{3,20}$/i;
const ADMIN_ID_REGEX = /^[A-Z0-9\/-]{3,30}$/i;
const PW_MIN = 8,
    PW_MAX = 128;

const vName = (v, f) =>
    !v.trim()
        ? `${f} is required`
        : v.length < 2
          ? `${f} must be at least 2 characters`
          : v.length > 50
            ? `${f} is too long`
            : !NAME_REGEX.test(v)
              ? `${f} can only contain letters, spaces, hyphens, and apostrophes`
              : "";
const vEmail = (v) =>
    !v.trim()
        ? "Email is required"
        : v.length > 254
          ? "Email is too long"
          : !EMAIL_REGEX.test(v)
            ? "Please enter a valid email address"
            : "";
const vPhone = (v) =>
    !v.trim()
        ? "Phone number is required"
        : !PHONE_REGEX.test(v.replace(/\s/g, ""))
          ? "Please enter a valid phone number"
          : "";
const vMatric = (v) =>
    !v.trim()
        ? "Matric number is required"
        : !MATRIC_REGEX.test(v)
          ? "Invalid matric number format"
          : "";
const vAdminId = (v) =>
    !v.trim()
        ? "Admin ID is required"
        : !ADMIN_ID_REGEX.test(v)
          ? "Invalid admin ID format"
          : "";
const vSchool = (v) =>
    !v.trim()
        ? "School name is required"
        : v.length < 3
          ? "School name must be at least 3 characters"
          : v.length > 100
            ? "School name is too long"
            : "";
const vDept = (v) =>
    !v.trim()
        ? "Department is required"
        : v.length < 2
          ? "Department must be at least 2 characters"
          : v.length > 100
            ? "Department is too long"
            : "";
const vDOB = (v) => {
    if (!v) return "Date of birth is required";
    const dob = new Date(v),
        today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
    return age < 13
        ? "You must be at least 13 years old"
        : age > 120
          ? "Please enter a valid date of birth"
          : "";
};
const vPassword = (v) =>
    !v
        ? "Password is required"
        : v.length < PW_MIN
          ? `Password must be at least ${PW_MIN} characters`
          : v.length > PW_MAX
            ? "Password is too long"
            : !/[A-Z]/.test(v) || !/[a-z]/.test(v) || !/[0-9]/.test(v)
              ? "Password must contain uppercase, lowercase, and numbers"
              : "";
const vConfirm = (p, c) =>
    !c
        ? "Please confirm your password"
        : p !== c
          ? "Passwords do not match"
          : "";

// localStorage key for pending registration data
const PENDING_KEY = "examPortal_pendingRegistration";

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SignupPage() {
    const { setAuthUser } = useAuth();
    const { toasts, dismiss, toast } = useToast();

    const [role, setRole] = useState("student");
    const [isLoading, setIsLoading] = useState(false);
    const [linkSent, setLinkSent] = useState(false); // waiting-for-click screen
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [isFinishing, setIsFinishing] = useState(false); // completing after link click
    const [showPassword, setShowPassword] = useState({
        password: false,
        confirmPassword: false,
    });

    const [studentData, setStudentData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        matricNo: "",
        phone: "",
        dateOfBirth: "",
        password: "",
        confirmPassword: "",
    });
    const [adminData, setAdminData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        schoolName: "",
        department: "",
        phone: "",
        adminId: "",
        password: "",
        confirmPassword: "",
    });
    const [touched, setTouched] = useState({ student: {}, admin: {} });

    // ── On mount: complete registration if returning from email link ──────────
    useEffect(() => {
        if (!isSignInWithEmailLink(auth, window.location.href)) return;

        const raw = localStorage.getItem(PENDING_KEY);
        if (!raw) {
            toast.error(
                "Session expired",
                "Please fill in the form again to register.",
            );
            return;
        }

        const pending = JSON.parse(raw);
        setIsFinishing(true);
        finishRegistration(pending);
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // ── Complete registration after email link click ───────────────────────────
    const finishRegistration = async (pending) => {
        try {
            // Use the magic link to get a Firebase credential, then immediately
            // upgrade to email+password so the user can log in normally.
            const { role, email, password, ...rest } = pending;

            // Step 1 — sign in via the email link (proves they own the inbox)
            const linkCredential = await signInWithEmailLink(
                auth,
                email,
                window.location.href,
            );
            const firebaseUser = linkCredential.user;

            // Step 2 — set a real password on the account
            await updatePassword(firebaseUser, password);

            // Step 3 — write Firestore documents
            const phoneNumber = parseInt(
                (rest.phone || "").replace(/\D/g, ""),
                10,
            );

            const userDocData = {
                role,
                email,
                firstName: rest.firstName.trim(),
                lastName: rest.lastName.trim(),
                emailVerified: true,
                ...(role === "student"
                    ? {
                          matricNo: rest.matricNo.toUpperCase(),
                          phoneNumber,
                          dateOfBirth: rest.dateOfBirth,
                      }
                    : {
                          schoolName: rest.schoolName.trim(),
                          department: rest.department.trim(),
                          adminId: rest.adminId.toUpperCase(),
                          phoneNumber,
                      }),
                createdAt: new Date(),
            };
            await setDoc(doc(db, "users", firebaseUser.uid), userDocData);

            if (role === "student") {
                await setDoc(doc(db, "students", firebaseUser.uid), {
                    email,
                    firstName: rest.firstName.trim(),
                    lastName: rest.lastName.trim(),
                    matricNo: rest.matricNo.toUpperCase(),
                    phoneNumber,
                    dateOfBirth: rest.dateOfBirth,
                    examsTaken: [],
                    createdAt: new Date(),
                    status: "active",
                    statusHistory: [],
                    lastUpdated: new Date(),
                });
            }

            localStorage.removeItem(PENDING_KEY);

            const authUser = {
                uid: firebaseUser.uid,
                firstName: rest.firstName.trim(),
                lastName: rest.lastName.trim(),
                email,
                role,
                ...(role === "student"
                    ? {
                          matricNo: rest.matricNo.toUpperCase(),
                          dateOfBirth: rest.dateOfBirth,
                      }
                    : {
                          schoolName: rest.schoolName.trim(),
                          department: rest.department.trim(),
                          adminId: rest.adminId.toUpperCase(),
                      }),
            };

            setShowSuccessModal(true);
            toast.success(
                "Account created!",
                `Welcome, ${rest.firstName}! Redirecting…`,
            );
            setTimeout(() => setAuthUser(authUser), 2000);
        } catch (err) {
            console.error("Finish registration error:", err);
            localStorage.removeItem(PENDING_KEY);
            toast.error(
                "Registration failed",
                err.message ?? "Please try registering again.",
            );
        } finally {
            setIsFinishing(false);
        }
    };

    // ── Validation helpers ────────────────────────────────────────────────────
    const getErrors = () => {
        const d = role === "student" ? studentData : adminData;
        const t = touched[role];
        const e = {};
        if (t.firstName) e.firstName = vName(d.firstName, "First name");
        if (t.lastName) e.lastName = vName(d.lastName, "Last name");
        if (t.email) e.email = vEmail(d.email);
        if (t.phone) e.phone = vPhone(d.phone);
        if (t.password) e.password = vPassword(d.password);
        if (t.confirmPassword)
            e.confirmPassword = vConfirm(d.password, d.confirmPassword);
        if (role === "student") {
            if (t.matricNo) e.matricNo = vMatric(d.matricNo);
            if (t.dateOfBirth) e.dateOfBirth = vDOB(d.dateOfBirth);
        } else {
            if (t.schoolName) e.schoolName = vSchool(d.schoolName);
            if (t.department) e.department = vDept(d.department);
            if (t.adminId) e.adminId = vAdminId(d.adminId);
        }
        return e;
    };

    const isFormValid = () => {
        const d = role === "student" ? studentData : adminData;
        if (!Object.values(d).every((v) => v.trim() !== "")) return false;
        if (role === "student")
            return (
                !vName(d.firstName, "First name") &&
                !vName(d.lastName, "Last name") &&
                !vEmail(d.email) &&
                !vMatric(d.matricNo) &&
                !vPhone(d.phone) &&
                !vDOB(d.dateOfBirth) &&
                !vPassword(d.password) &&
                !vConfirm(d.password, d.confirmPassword)
            );
        return (
            !vName(d.firstName, "First name") &&
            !vName(d.lastName, "Last name") &&
            !vEmail(d.email) &&
            !vSchool(d.schoolName) &&
            !vDept(d.department) &&
            !vPhone(d.phone) &&
            !vAdminId(d.adminId) &&
            !vPassword(d.password) &&
            !vConfirm(d.password, d.confirmPassword)
        );
    };

    const validationErrors = getErrors();

    const handleBlur = (f) =>
        setTouched((p) => ({ ...p, [role]: { ...p[role], [f]: true } }));
    const change = (setter, roleKey) => (field, value) => {
        setter((p) => ({ ...p, [field]: value }));
        if (value && !touched[roleKey][field])
            setTouched((p) => ({
                ...p,
                [roleKey]: { ...p[roleKey], [field]: true },
            }));
    };
    const handleStudentChange = change(setStudentData, "student");
    const handleAdminChange = change(setAdminData, "admin");

    // ── Submit: save to localStorage, send magic link ─────────────────────────
    const handleSubmit = async (e) => {
        e.preventDefault();
        const d = role === "student" ? studentData : adminData;
        const allTouched = Object.fromEntries(
            Object.keys(d).map((f) => [f, true]),
        );
        setTouched((p) => ({ ...p, [role]: allTouched }));

        if (!isFormValid()) {
            toast.error(
                "Form incomplete",
                "Please fix all errors before submitting.",
            );
            return;
        }

        setIsLoading(true);
        try {
            // Persist form data — we'll retrieve it when they return from the link
            localStorage.setItem(PENDING_KEY, JSON.stringify({ role, ...d }));

            const actionCodeSettings = {
                url: window.location.href, // return to this same page
                handleCodeInApp: true,
            };

            await sendSignInLinkToEmail(
                auth,
                d.email.toLowerCase(),
                actionCodeSettings,
            );
            setLinkSent(true);
            toast.info(
                "Check your inbox",
                `A sign-up link was sent to ${d.email}`,
            );
        } catch (err) {
            console.error("sendSignInLinkToEmail error:", err);
            localStorage.removeItem(PENDING_KEY);
            const msgs = {
                "auth/invalid-email": "Please enter a valid email address.",
                "auth/network-request-failed":
                    "Network error. Check your internet connection.",
                "auth/too-many-requests":
                    "Too many attempts. Please wait and try again.",
                "auth/email-already-in-use":
                    "This email is already registered. Please sign in.",
            };
            toast.error(
                "Failed to send link",
                msgs[err.code] ?? "Something went wrong. Please try again.",
            );
        } finally {
            setIsLoading(false);
        }
    };

    // ── Password strength ─────────────────────────────────────────────────────
    const pwStrength = (pw) => {
        if (!pw) return { label: "", color: "" };
        let s = 0;
        if (pw.length >= 8) s++;
        if (pw.length >= 12) s++;
        if (/[a-z]/.test(pw)) s++;
        if (/[A-Z]/.test(pw)) s++;
        if (/[0-9]/.test(pw)) s++;
        if (/[!@#$%^&*(),.?":{}|<>]/.test(pw)) s++;
        if (s <= 2) return { label: "Weak", color: "text-red-600" };
        if (s <= 4) return { label: "Medium", color: "text-yellow-600" };
        return { label: "Strong", color: "text-green-600" };
    };

    const currentData = role === "student" ? studentData : adminData;
    const strength = pwStrength(currentData.password);

    // ── Finishing-up overlay (shown while creating account post-link-click) ───
    if (isFinishing)
        return (
            <>
                <ToastContainer toasts={toasts} onDismiss={dismiss} />
                <main className="grow flex items-center justify-center min-h-screen bg-green-50">
                    <div className="text-center">
                        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4 animate-pulse">
                            <CheckCircle className="h-8 w-8 text-green-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                            Completing your registration…
                        </h3>
                        <p className="text-gray-500 text-sm">
                            Please wait a moment.
                        </p>
                    </div>
                </main>
            </>
        );

    // ── Waiting-for-click screen ──────────────────────────────────────────────
    if (linkSent)
        return (
            <>
                <ToastContainer toasts={toasts} onDismiss={dismiss} />
                <main className="grow flex items-center justify-center min-h-screen bg-green-50 px-4">
                    <div className="bg-white rounded-2xl shadow-2xl p-10 max-w-md w-full text-center">
                        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
                            <Mail className="h-8 w-8 text-green-600" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">
                            Check your inbox
                        </h3>
                        <p className="text-gray-500 text-sm mb-1">
                            We sent a sign-up link to
                        </p>
                        <p className="text-green-900 font-semibold mb-6">
                            {currentData.email}
                        </p>
                        <p className="text-gray-500 text-sm mb-8">
                            Click the link in that email to verify your address
                            and finish creating your account.
                            <br />
                            <span className="font-medium text-gray-700">
                                Your account will only be created after you
                                click the link.
                            </span>
                        </p>

                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-left mb-6">
                            <h4 className="text-sm font-semibold text-blue-900 mb-2">
                                Can&apos;t find the email?
                            </h4>
                            <ul className="text-xs text-blue-800 space-y-1">
                                <li>• Check your spam or junk folder</li>
                                <li>
                                    • Make sure you entered the correct email
                                </li>
                                <li>• Wait a few minutes and check again</li>
                            </ul>
                        </div>

                        <button
                            onClick={() => setLinkSent(false)}
                            className="text-sm text-green-900 font-semibold hover:underline"
                        >
                            ← Use a different email
                        </button>
                    </div>
                </main>
            </>
        );

    // ── Success modal ─────────────────────────────────────────────────────────
    const SuccessModal = () =>
        showSuccessModal ? (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
                <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4">
                    <div className="text-center">
                        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                            <CheckCircle className="h-10 w-10 text-green-600" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">
                            Account Created!
                        </h3>
                        <p className="text-gray-600 mb-6">
                            Welcome, {currentData.firstName}! Redirecting to
                            your dashboard…
                        </p>
                        <div className="flex items-center justify-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" />
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce delay-100" />
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce delay-200" />
                        </div>
                    </div>
                </div>
            </div>
        ) : null;

    // ── Field error helper ────────────────────────────────────────────────────
    const FieldError = ({ field }) =>
        validationErrors[field] ? (
            <p className="mt-2 text-sm text-red-600 flex items-start gap-1">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                <span>{validationErrors[field]}</span>
            </p>
        ) : null;

    const errCls = (f) =>
        validationErrors[f]
            ? "border-red-300 focus:border-red-500 focus:ring-red-500"
            : "";
    const EyeBtn = (key) => (
        <button
            type="button"
            onClick={() => setShowPassword((p) => ({ ...p, [key]: !p[key] }))}
            className="absolute right-3 top-9 text-gray-400 hover:text-gray-600 cursor-pointer"
        >
            {showPassword[key] ? (
                <EyeOff className="h-5 w-5" />
            ) : (
                <Eye className="h-5 w-5" />
            )}
        </button>
    );

    // ── Main form render ──────────────────────────────────────────────────────
    return (
        <>
            <ToastContainer toasts={toasts} onDismiss={dismiss} />
            <SuccessModal />

            <main className="grow flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8 bg-green-50">
                <div className="w-full max-w-2xl">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
                            Create Account
                        </h2>
                        <p className="mt-2 text-lg text-gray-600">
                            Register to access the exam portal
                        </p>
                    </div>

                    {/* Role selector */}
                    <div className="flex gap-3 mb-6">
                        {[
                            {
                                value: "student",
                                label: "Student Registration",
                                Icon: GraduationCap,
                            },
                            {
                                value: "admin",
                                label: "Admin Registration",
                                Icon: Shield,
                            },
                        ].map(({ value, label, Icon }) => (
                            <button
                                key={value}
                                type="button"
                                onClick={() => {
                                    setRole(value);
                                }}
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
                                    {/* Name row */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <Input
                                                label="First Name"
                                                type="text"
                                                placeholder="John"
                                                value={studentData.firstName}
                                                autoComplete="given-name"
                                                required
                                                onChange={(e) =>
                                                    handleStudentChange(
                                                        "firstName",
                                                        e.target.value.trimStart(),
                                                    )
                                                }
                                                onBlur={() =>
                                                    handleBlur("firstName")
                                                }
                                                className={errCls("firstName")}
                                            />
                                            <FieldError field="firstName" />
                                        </div>
                                        <div>
                                            <Input
                                                label="Last Name"
                                                type="text"
                                                placeholder="Doe"
                                                value={studentData.lastName}
                                                autoComplete="family-name"
                                                required
                                                onChange={(e) =>
                                                    handleStudentChange(
                                                        "lastName",
                                                        e.target.value.trimStart(),
                                                    )
                                                }
                                                onBlur={() =>
                                                    handleBlur("lastName")
                                                }
                                                className={errCls("lastName")}
                                            />
                                            <FieldError field="lastName" />
                                        </div>
                                    </div>

                                    {/* Email */}
                                    <div>
                                        <Input
                                            label="Email Address"
                                            type="email"
                                            placeholder="student@example.com"
                                            value={studentData.email}
                                            autoComplete="email"
                                            required
                                            onChange={(e) =>
                                                handleStudentChange(
                                                    "email",
                                                    e.target.value.trim(),
                                                )
                                            }
                                            onBlur={() => handleBlur("email")}
                                            className={errCls("email")}
                                        />
                                        <FieldError field="email" />
                                    </div>

                                    {/* Matric + Phone */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <Input
                                                label="Matric Number"
                                                type="text"
                                                placeholder="e.g., 2024/001"
                                                value={studentData.matricNo}
                                                required
                                                onChange={(e) =>
                                                    handleStudentChange(
                                                        "matricNo",
                                                        e.target.value.toUpperCase(),
                                                    )
                                                }
                                                onBlur={() =>
                                                    handleBlur("matricNo")
                                                }
                                                className={errCls("matricNo")}
                                            />
                                            <FieldError field="matricNo" />
                                        </div>
                                        <div>
                                            <Input
                                                label="Phone Number"
                                                type="tel"
                                                placeholder="+234 800 000 0000"
                                                value={studentData.phone}
                                                autoComplete="tel"
                                                required
                                                onChange={(e) =>
                                                    handleStudentChange(
                                                        "phone",
                                                        e.target.value,
                                                    )
                                                }
                                                onBlur={() =>
                                                    handleBlur("phone")
                                                }
                                                className={errCls("phone")}
                                            />
                                            <FieldError field="phone" />
                                        </div>
                                    </div>

                                    {/* DOB */}
                                    <div>
                                        <Input
                                            label="Date of Birth"
                                            type="date"
                                            value={studentData.dateOfBirth}
                                            autoComplete="bday"
                                            required
                                            max={
                                                new Date()
                                                    .toISOString()
                                                    .split("T")[0]
                                            }
                                            onChange={(e) =>
                                                handleStudentChange(
                                                    "dateOfBirth",
                                                    e.target.value,
                                                )
                                            }
                                            onBlur={() =>
                                                handleBlur("dateOfBirth")
                                            }
                                            className={errCls("dateOfBirth")}
                                        />
                                        <FieldError field="dateOfBirth" />
                                    </div>

                                    {/* Passwords */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <div className="relative">
                                                <Input
                                                    label="Password"
                                                    placeholder="••••••••"
                                                    type={
                                                        showPassword.password
                                                            ? "text"
                                                            : "password"
                                                    }
                                                    value={studentData.password}
                                                    autoComplete="new-password"
                                                    required
                                                    onChange={(e) =>
                                                        handleStudentChange(
                                                            "password",
                                                            e.target.value,
                                                        )
                                                    }
                                                    onBlur={() =>
                                                        handleBlur("password")
                                                    }
                                                    className={errCls(
                                                        "password",
                                                    )}
                                                />
                                                {EyeBtn("password")}
                                            </div>
                                            <FieldError field="password" />
                                            {studentData.password &&
                                                !validationErrors.password && (
                                                    <p
                                                        className={`mt-2 text-sm font-medium ${strength.color}`}
                                                    >
                                                        Password strength:{" "}
                                                        {strength.label}
                                                    </p>
                                                )}
                                        </div>
                                        <div>
                                            <div className="relative">
                                                <Input
                                                    label="Confirm Password"
                                                    placeholder="••••••••"
                                                    type={
                                                        showPassword.confirmPassword
                                                            ? "text"
                                                            : "password"
                                                    }
                                                    value={
                                                        studentData.confirmPassword
                                                    }
                                                    autoComplete="new-password"
                                                    required
                                                    onChange={(e) =>
                                                        handleStudentChange(
                                                            "confirmPassword",
                                                            e.target.value,
                                                        )
                                                    }
                                                    onBlur={() =>
                                                        handleBlur(
                                                            "confirmPassword",
                                                        )
                                                    }
                                                    className={errCls(
                                                        "confirmPassword",
                                                    )}
                                                />
                                                {EyeBtn("confirmPassword")}
                                            </div>
                                            <FieldError field="confirmPassword" />
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    {/* Admin name row */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <Input
                                                label="First Name"
                                                type="text"
                                                placeholder="Jane"
                                                value={adminData.firstName}
                                                autoComplete="given-name"
                                                required
                                                onChange={(e) =>
                                                    handleAdminChange(
                                                        "firstName",
                                                        e.target.value.trimStart(),
                                                    )
                                                }
                                                onBlur={() =>
                                                    handleBlur("firstName")
                                                }
                                                className={errCls("firstName")}
                                            />
                                            <FieldError field="firstName" />
                                        </div>
                                        <div>
                                            <Input
                                                label="Last Name"
                                                type="text"
                                                placeholder="Smith"
                                                value={adminData.lastName}
                                                autoComplete="family-name"
                                                required
                                                onChange={(e) =>
                                                    handleAdminChange(
                                                        "lastName",
                                                        e.target.value.trimStart(),
                                                    )
                                                }
                                                onBlur={() =>
                                                    handleBlur("lastName")
                                                }
                                                className={errCls("lastName")}
                                            />
                                            <FieldError field="lastName" />
                                        </div>
                                    </div>

                                    <div>
                                        <Input
                                            label="Official Email Address"
                                            type="email"
                                            placeholder="admin@school.edu"
                                            value={adminData.email}
                                            autoComplete="email"
                                            required
                                            onChange={(e) =>
                                                handleAdminChange(
                                                    "email",
                                                    e.target.value.trim(),
                                                )
                                            }
                                            onBlur={() => handleBlur("email")}
                                            className={errCls("email")}
                                        />
                                        <FieldError field="email" />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <Input
                                                label="School Name"
                                                type="text"
                                                placeholder="University of Lagos"
                                                value={adminData.schoolName}
                                                autoComplete="organization"
                                                required
                                                onChange={(e) =>
                                                    handleAdminChange(
                                                        "schoolName",
                                                        e.target.value,
                                                    )
                                                }
                                                onBlur={() =>
                                                    handleBlur("schoolName")
                                                }
                                                className={errCls("schoolName")}
                                            />
                                            <FieldError field="schoolName" />
                                        </div>
                                        <div>
                                            <Input
                                                label="Department/Faculty"
                                                type="text"
                                                placeholder="e.g., Computer Science"
                                                value={adminData.department}
                                                required
                                                onChange={(e) =>
                                                    handleAdminChange(
                                                        "department",
                                                        e.target.value,
                                                    )
                                                }
                                                onBlur={() =>
                                                    handleBlur("department")
                                                }
                                                className={errCls("department")}
                                            />
                                            <FieldError field="department" />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <Input
                                                label="Admin ID / Staff Number"
                                                type="text"
                                                placeholder="e.g., ADM-2024-001"
                                                value={adminData.adminId}
                                                required
                                                onChange={(e) =>
                                                    handleAdminChange(
                                                        "adminId",
                                                        e.target.value.toUpperCase(),
                                                    )
                                                }
                                                onBlur={() =>
                                                    handleBlur("adminId")
                                                }
                                                className={errCls("adminId")}
                                            />
                                            <FieldError field="adminId" />
                                        </div>
                                        <div>
                                            <Input
                                                label="Phone Number"
                                                type="tel"
                                                placeholder="+234 800 000 0000"
                                                value={adminData.phone}
                                                autoComplete="tel"
                                                required
                                                onChange={(e) =>
                                                    handleAdminChange(
                                                        "phone",
                                                        e.target.value,
                                                    )
                                                }
                                                onBlur={() =>
                                                    handleBlur("phone")
                                                }
                                                className={errCls("phone")}
                                            />
                                            <FieldError field="phone" />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <div className="relative">
                                                <Input
                                                    label="Password"
                                                    placeholder="••••••••"
                                                    type={
                                                        showPassword.password
                                                            ? "text"
                                                            : "password"
                                                    }
                                                    value={adminData.password}
                                                    autoComplete="new-password"
                                                    required
                                                    onChange={(e) =>
                                                        handleAdminChange(
                                                            "password",
                                                            e.target.value,
                                                        )
                                                    }
                                                    onBlur={() =>
                                                        handleBlur("password")
                                                    }
                                                    className={errCls(
                                                        "password",
                                                    )}
                                                />
                                                {EyeBtn("password")}
                                            </div>
                                            <FieldError field="password" />
                                            {adminData.password &&
                                                !validationErrors.password && (
                                                    <p
                                                        className={`mt-2 text-sm font-medium ${strength.color}`}
                                                    >
                                                        Password strength:{" "}
                                                        {strength.label}
                                                    </p>
                                                )}
                                        </div>
                                        <div>
                                            <div className="relative">
                                                <Input
                                                    label="Confirm Password"
                                                    placeholder="••••••••"
                                                    type={
                                                        showPassword.confirmPassword
                                                            ? "text"
                                                            : "password"
                                                    }
                                                    value={
                                                        adminData.confirmPassword
                                                    }
                                                    autoComplete="new-password"
                                                    required
                                                    onChange={(e) =>
                                                        handleAdminChange(
                                                            "confirmPassword",
                                                            e.target.value,
                                                        )
                                                    }
                                                    onBlur={() =>
                                                        handleBlur(
                                                            "confirmPassword",
                                                        )
                                                    }
                                                    className={errCls(
                                                        "confirmPassword",
                                                    )}
                                                />
                                                {EyeBtn("confirmPassword")}
                                            </div>
                                            <FieldError field="confirmPassword" />
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* Password requirements checklist */}
                            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                                <h4 className="text-sm font-semibold text-blue-900 mb-2">
                                    Password Requirements:
                                </h4>
                                <ul className="text-xs text-blue-800 space-y-1">
                                    {[
                                        [
                                            currentData.password.length >= 8,
                                            "At least 8 characters",
                                        ],
                                        [
                                            /[A-Z]/.test(currentData.password),
                                            "One uppercase letter",
                                        ],
                                        [
                                            /[a-z]/.test(currentData.password),
                                            "One lowercase letter",
                                        ],
                                        [
                                            /[0-9]/.test(currentData.password),
                                            "One number",
                                        ],
                                    ].map(([met, label]) => (
                                        <li
                                            key={label}
                                            className="flex items-center gap-2"
                                        >
                                            <div
                                                className={`w-1.5 h-1.5 rounded-full ${met ? "bg-green-600" : "bg-gray-400"}`}
                                            />
                                            {label}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Terms */}
                            <div className="pt-4">
                                <label className="flex items-start text-sm text-gray-600 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        required
                                        className="mr-3 mt-0.5 rounded border-gray-300 text-green-900 focus:ring-green-900 cursor-pointer"
                                    />
                                    <span>
                                        I agree to the{" "}
                                        <a
                                            href="#"
                                            className="text-green-900 hover:underline font-semibold"
                                        >
                                            Terms and Conditions
                                        </a>{" "}
                                        and{" "}
                                        <a
                                            href="#"
                                            className="text-green-900 hover:underline font-semibold"
                                        >
                                            Privacy Policy
                                        </a>
                                    </span>
                                </label>
                            </div>

                            <Button
                                type="submit"
                                fullWidth
                                size="lg"
                                disabled={isLoading || !isFormValid()}
                                className="bg-green-900 hover:bg-green-800 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-white font-bold py-4"
                            >
                                {isLoading
                                    ? "Sending verification link…"
                                    : "Send Verification Link"}
                            </Button>
                        </form>

                        <div className="mt-6 pt-6 border-t border-gray-200 text-center text-sm text-gray-600">
                            Already have an account?{" "}
                            <Link
                                href="/login"
                                className="text-green-900 font-semibold hover:underline"
                            >
                                Sign In
                            </Link>
                        </div>
                    </Card>

                    <div className="mt-8 text-center">
                        <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                            <div className="w-2 h-2 bg-green-500 rounded-full" />
                            <p>
                                Secure Registration • Data Protected • Official
                                Portal
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
}
