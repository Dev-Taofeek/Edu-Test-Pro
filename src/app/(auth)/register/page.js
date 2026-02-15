"use client";

import React, { useState, useRef, useEffect } from "react";
import {
    GraduationCap,
    Shield,
    Mail,
    Lock,
    User,
    School,
    Building,
    Phone,
    Calendar,
    CheckCircle,
    AlertCircle,
    Eye,
    EyeOff,
    ArrowLeft,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import {
    createUserWithEmailAndPassword,
    sendEmailVerification,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useAuth } from "@/app/context/AuthContext";

// Validation regex patterns
const EMAIL_REGEX =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
const NAME_REGEX = /^[a-zA-Z\s'-]{2,50}$/;
const PHONE_REGEX =
    /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/;
const MATRIC_REGEX = /^[A-Z0-9\/-]{3,20}$/i;
const ADMIN_ID_REGEX = /^[A-Z0-9\/-]{3,30}$/i;

// Password strength requirements
const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_MAX_LENGTH = 128;

export default function SignupPage() {
    const { setAuthUser } = useAuth();
    const [role, setRole] = useState("student");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showPassword, setShowPassword] = useState({
        password: false,
        confirmPassword: false,
    });

    // Email verification states
    const [showVerificationModal, setShowVerificationModal] = useState(false);
    const [verificationError, setVerificationError] = useState("");
    const [isCheckingVerification, setIsCheckingVerification] = useState(false);
    const [verificationEmailSent, setVerificationEmailSent] = useState(false);
    const [firebaseUser, setFirebaseUser] = useState(null);

    // Check verification status periodically
    useEffect(() => {
        let intervalId;
        if (showVerificationModal && firebaseUser) {
            intervalId = setInterval(async () => {
                await checkEmailVerification();
            }, 3000); // Check every 3 seconds
        }
        return () => {
            if (intervalId) clearInterval(intervalId);
        };
    }, [showVerificationModal, firebaseUser]);

    // Student fields
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

    // Admin fields
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

    // Track touched fields
    const [touched, setTouched] = useState({
        student: {},
        admin: {},
    });

    // Check if email is verified
    const checkEmailVerification = async () => {
        if (!firebaseUser) return;

        try {
            await firebaseUser.reload();

            if (firebaseUser.emailVerified) {
                // Email verified, complete registration
                await completeRegistration();
            }
        } catch (error) {
            console.error("Error checking verification:", error);
        }
    };

    // Resend verification email
    const handleResendVerification = async () => {
        if (!firebaseUser) return;

        try {
            await sendEmailVerification(firebaseUser);
            setVerificationEmailSent(true);
            setTimeout(() => setVerificationEmailSent(false), 3000);
        } catch (error) {
            console.error("Error resending verification:", error);
            setVerificationError(
                "Failed to resend verification email. Please try again.",
            );
        }
    };

    // Check verification manually
    const handleCheckVerification = async () => {
        setIsCheckingVerification(true);
        setVerificationError("");

        try {
            await firebaseUser.reload();

            if (firebaseUser.emailVerified) {
                await completeRegistration();
            } else {
                setVerificationError(
                    "Email not verified yet. Please check your inbox and click the verification link.",
                );
            }
        } catch (error) {
            console.error("Error checking verification:", error);
            setVerificationError(
                "Failed to check verification status. Please try again.",
            );
        } finally {
            setIsCheckingVerification(false);
        }
    };

    // Validation functions
    const validateName = (name, fieldName) => {
        if (!name.trim()) {
            return `${fieldName} is required`;
        }
        if (name.length < 2) {
            return `${fieldName} must be at least 2 characters`;
        }
        if (name.length > 50) {
            return `${fieldName} is too long`;
        }
        if (!NAME_REGEX.test(name)) {
            return `${fieldName} can only contain letters, spaces, hyphens, and apostrophes`;
        }
        return "";
    };

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

    const validatePhone = (phone) => {
        if (!phone.trim()) {
            return "Phone number is required";
        }
        if (!PHONE_REGEX.test(phone.replace(/\s/g, ""))) {
            return "Please enter a valid phone number";
        }
        return "";
    };

    const validateMatricNo = (matricNo) => {
        if (!matricNo.trim()) {
            return "Matric number is required";
        }
        if (!MATRIC_REGEX.test(matricNo)) {
            return "Invalid matric number format";
        }
        return "";
    };

    const validateAdminId = (adminId) => {
        if (!adminId.trim()) {
            return "Admin ID is required";
        }
        if (!ADMIN_ID_REGEX.test(adminId)) {
            return "Invalid admin ID format";
        }
        return "";
    };

    const validateSchoolName = (schoolName) => {
        if (!schoolName.trim()) {
            return "School name is required";
        }
        if (schoolName.length < 3) {
            return "School name must be at least 3 characters";
        }
        if (schoolName.length > 100) {
            return "School name is too long";
        }
        return "";
    };

    const validateDepartment = (department) => {
        if (!department.trim()) {
            return "Department is required";
        }
        if (department.length < 2) {
            return "Department must be at least 2 characters";
        }
        if (department.length > 100) {
            return "Department is too long";
        }
        return "";
    };

    const validateDateOfBirth = (dob) => {
        if (!dob) {
            return "Date of birth is required";
        }

        const dobDate = new Date(dob);
        const today = new Date();
        let age = today.getFullYear() - dobDate.getFullYear();
        const monthDiff = today.getMonth() - dobDate.getMonth();

        if (
            monthDiff < 0 ||
            (monthDiff === 0 && today.getDate() < dobDate.getDate())
        ) {
            age--;
        }

        if (age < 13) {
            return "You must be at least 13 years old";
        }
        if (age > 120) {
            return "Please enter a valid date of birth";
        }

        return "";
    };

    const validatePassword = (password) => {
        if (!password) {
            return "Password is required";
        }
        if (password.length < PASSWORD_MIN_LENGTH) {
            return `Password must be at least ${PASSWORD_MIN_LENGTH} characters`;
        }
        if (password.length > PASSWORD_MAX_LENGTH) {
            return "Password is too long";
        }

        // Check for complexity
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

        if (!hasUpperCase || !hasLowerCase || !hasNumber) {
            return "Password must contain uppercase, lowercase, and numbers";
        }

        return "";
    };

    const validateConfirmPassword = (password, confirmPassword) => {
        if (!confirmPassword) {
            return "Please confirm your password";
        }
        if (password !== confirmPassword) {
            return "Passwords do not match";
        }
        return "";
    };

    // Get validation errors for current role
    const getValidationErrors = () => {
        const currentData = role === "student" ? studentData : adminData;
        const currentTouched = touched[role];
        const errors = {};

        if (role === "student") {
            if (currentTouched.firstName) {
                errors.firstName = validateName(
                    currentData.firstName,
                    "First name",
                );
            }
            if (currentTouched.lastName) {
                errors.lastName = validateName(
                    currentData.lastName,
                    "Last name",
                );
            }
            if (currentTouched.email) {
                errors.email = validateEmail(currentData.email);
            }
            if (currentTouched.matricNo) {
                errors.matricNo = validateMatricNo(currentData.matricNo);
            }
            if (currentTouched.phone) {
                errors.phone = validatePhone(currentData.phone);
            }
            if (currentTouched.dateOfBirth) {
                errors.dateOfBirth = validateDateOfBirth(
                    currentData.dateOfBirth,
                );
            }
            if (currentTouched.password) {
                errors.password = validatePassword(currentData.password);
            }
            if (currentTouched.confirmPassword) {
                errors.confirmPassword = validateConfirmPassword(
                    currentData.password,
                    currentData.confirmPassword,
                );
            }
        } else {
            if (currentTouched.firstName) {
                errors.firstName = validateName(
                    currentData.firstName,
                    "First name",
                );
            }
            if (currentTouched.lastName) {
                errors.lastName = validateName(
                    currentData.lastName,
                    "Last name",
                );
            }
            if (currentTouched.email) {
                errors.email = validateEmail(currentData.email);
            }
            if (currentTouched.schoolName) {
                errors.schoolName = validateSchoolName(currentData.schoolName);
            }
            if (currentTouched.department) {
                errors.department = validateDepartment(currentData.department);
            }
            if (currentTouched.phone) {
                errors.phone = validatePhone(currentData.phone);
            }
            if (currentTouched.adminId) {
                errors.adminId = validateAdminId(currentData.adminId);
            }
            if (currentTouched.password) {
                errors.password = validatePassword(currentData.password);
            }
            if (currentTouched.confirmPassword) {
                errors.confirmPassword = validateConfirmPassword(
                    currentData.password,
                    currentData.confirmPassword,
                );
            }
        }

        return errors;
    };

    const validationErrors = getValidationErrors();

    // Check if form is valid
    const isFormValid = () => {
        const currentData = role === "student" ? studentData : adminData;

        // Check if all fields are filled
        const allFieldsFilled = Object.values(currentData).every(
            (val) => val.trim() !== "",
        );

        if (!allFieldsFilled) return false;

        // Validate all fields
        if (role === "student") {
            return (
                !validateName(currentData.firstName, "First name") &&
                !validateName(currentData.lastName, "Last name") &&
                !validateEmail(currentData.email) &&
                !validateMatricNo(currentData.matricNo) &&
                !validatePhone(currentData.phone) &&
                !validateDateOfBirth(currentData.dateOfBirth) &&
                !validatePassword(currentData.password) &&
                !validateConfirmPassword(
                    currentData.password,
                    currentData.confirmPassword,
                )
            );
        } else {
            return (
                !validateName(currentData.firstName, "First name") &&
                !validateName(currentData.lastName, "Last name") &&
                !validateEmail(currentData.email) &&
                !validateSchoolName(currentData.schoolName) &&
                !validateDepartment(currentData.department) &&
                !validatePhone(currentData.phone) &&
                !validateAdminId(currentData.adminId) &&
                !validatePassword(currentData.password) &&
                !validateConfirmPassword(
                    currentData.password,
                    currentData.confirmPassword,
                )
            );
        }
    };

    const handleBlur = (field) => {
        setTouched((prev) => ({
            ...prev,
            [role]: { ...prev[role], [field]: true },
        }));
    };

    const handleStudentChange = (field, value) => {
        // Trim for certain fields
        if (["firstName", "lastName", "email", "matricNo"].includes(field)) {
            value = value.trim();
        }

        setStudentData((prev) => ({ ...prev, [field]: value }));
        setError("");

        // Auto-mark as touched after typing
        if (value && !touched.student[field]) {
            setTouched((prev) => ({
                ...prev,
                student: { ...prev.student, [field]: true },
            }));
        }
    };

    const handleAdminChange = (field, value) => {
        // Trim for certain fields
        if (["firstName", "lastName", "email", "adminId"].includes(field)) {
            value = value.trim();
        }

        setAdminData((prev) => ({ ...prev, [field]: value }));
        setError("");

        // Auto-mark as touched after typing
        if (value && !touched.admin[field]) {
            setTouched((prev) => ({
                ...prev,
                admin: { ...prev.admin, [field]: true },
            }));
        }
    };

    const handleRoleChange = (newRole) => {
        setRole(newRole);
        setError("");
        // Keep touched state to preserve validation when switching back
    };

    // Complete registration after email verification
    const completeRegistration = async () => {
        const currentData = role === "student" ? studentData : adminData;
        const email = currentData.email.toLowerCase();

        try {
            setIsCheckingVerification(true);

            // Convert phone number to number (remove all non-numeric characters)
            const phoneNumber = parseInt(
                currentData.phone.replace(/\D/g, ""),
                10,
            );

            // Prepare user data for Firestore
            const userDocData = {
                role,
                email,
                firstName: currentData.firstName.trim(),
                lastName: currentData.lastName.trim(),
                emailVerified: true,
                ...(role === "student"
                    ? {
                          matricNo: studentData.matricNo.toUpperCase(),
                          phoneNumber: phoneNumber,
                          dateOfBirth: studentData.dateOfBirth,
                      }
                    : {
                          schoolName: adminData.schoolName.trim(),
                          department: adminData.department.trim(),
                          adminId: adminData.adminId.toUpperCase(),
                          phoneNumber: phoneNumber,
                      }),
                createdAt: new Date(),
            };

            // Save to users collection
            await setDoc(doc(db, "users", firebaseUser.uid), userDocData);

            // Create student document if role is student
            if (role === "student") {
                await setDoc(doc(db, "students", firebaseUser.uid), {
                    email,
                    firstName: studentData.firstName.trim(),
                    lastName: studentData.lastName.trim(),
                    matricNo: studentData.matricNo.toUpperCase(),
                    phoneNumber: phoneNumber,
                    dateOfBirth: studentData.dateOfBirth,
                    examsTaken: [],
                    createdAt: new Date(),
                    status: "active",
                    statusHistory: [],
                    lastUpdated: new Date(),
                });
            }

            // Prepare AuthContext user object
            const authUser = {
                uid: firebaseUser.uid,
                firstName: currentData.firstName.trim(),
                lastName: currentData.lastName.trim(),
                email: email,
                role: role,
                ...(role === "student"
                    ? {
                          matricNo: studentData.matricNo.toUpperCase(),
                          dateOfBirth: studentData.dateOfBirth,
                      }
                    : {
                          schoolName: adminData.schoolName.trim(),
                          department: adminData.department.trim(),
                          adminId: adminData.adminId.toUpperCase(),
                      }),
            };

            // Close verification modal and show success modal
            setShowVerificationModal(false);
            setShowSuccessModal(true);

            // Redirect after 2 seconds using AuthContext
            setTimeout(() => {
                setAuthUser(authUser);
            }, 2000);
        } catch (err) {
            console.error("Registration error:", err);
            setVerificationError(
                "Failed to complete registration. Please try again.",
            );
        } finally {
            setIsCheckingVerification(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Mark all fields as touched
        const allFields = Object.keys(
            role === "student" ? studentData : adminData,
        );
        const touchedFields = {};
        allFields.forEach((field) => {
            touchedFields[field] = true;
        });
        setTouched((prev) => ({
            ...prev,
            [role]: touchedFields,
        }));

        // Get current data based on role
        const currentData = role === "student" ? studentData : adminData;

        // Comprehensive validation
        if (!isFormValid()) {
            setError("Please fix all errors before submitting");
            return;
        }

        setError("");
        setIsLoading(true);

        try {
            const email = currentData.email.toLowerCase();
            const password = currentData.password;

            // Create Firebase Auth account
            const userCredential = await createUserWithEmailAndPassword(
                auth,
                email,
                password,
            );

            const user = userCredential.user;
            setFirebaseUser(user);

            // Send verification email
            await sendEmailVerification(user, {
                url: window.location.origin + "/login", // Redirect URL after verification
                handleCodeInApp: false,
            });

            // Show verification modal
            setShowVerificationModal(true);
            setIsLoading(false);
        } catch (err) {
            console.error("Error during signup:", err);

            let errorMessage = "Registration failed. Please try again.";

            if (err.code === "auth/email-already-in-use") {
                errorMessage =
                    "This email is already registered. Please login instead.";
            } else if (err.code === "auth/invalid-email") {
                errorMessage = "Please enter a valid email address";
            } else if (err.code === "auth/weak-password") {
                errorMessage = `Password must be at least ${PASSWORD_MIN_LENGTH} characters long`;
            } else if (err.code === "auth/network-request-failed") {
                errorMessage =
                    "Network error. Please check your internet connection";
            } else if (err.code === "auth/operation-not-allowed") {
                errorMessage =
                    "Registration is currently disabled. Please contact support";
            }

            setError(errorMessage);
            setIsLoading(false);
        }
    };

    // Password strength indicator
    const getPasswordStrength = (password) => {
        if (!password) return { strength: 0, label: "", color: "" };

        let strength = 0;
        if (password.length >= 8) strength++;
        if (password.length >= 12) strength++;
        if (/[a-z]/.test(password)) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++;

        if (strength <= 2)
            return { strength, label: "Weak", color: "text-red-600" };
        if (strength <= 4)
            return { strength, label: "Medium", color: "text-yellow-600" };
        return { strength, label: "Strong", color: "text-green-600" };
    };

    const currentData = role === "student" ? studentData : adminData;
    const passwordStrength = getPasswordStrength(currentData.password);

    return (
        <main className="grow flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8 bg-green-50">
            {/* Email Verification Modal */}
            {showVerificationModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4">
                        <div className="text-center mb-6">
                            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                                <Mail className="h-8 w-8 text-green-600" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">
                                Verify Your Email
                            </h3>
                            <p className="text-gray-600 text-sm mb-2">
                                We&apos;ve sent a verification link to
                            </p>
                            <p className="text-green-900 font-semibold mb-4">
                                {currentData.email}
                            </p>
                            <p className="text-sm text-gray-500">
                                Please check your inbox and click the
                                verification link to complete your registration.
                            </p>
                        </div>

                        {verificationError && (
                            <div className="mb-4 flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                                <AlertCircle className="h-5 w-5 text-red-600 shrink-0" />
                                <p className="text-sm text-red-700">
                                    {verificationError}
                                </p>
                            </div>
                        )}

                        {verificationEmailSent && (
                            <div className="mb-4 flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                                <CheckCircle className="h-5 w-5 text-green-600 shrink-0" />
                                <p className="text-sm text-green-700">
                                    Verification email sent! Please check your
                                    inbox.
                                </p>
                            </div>
                        )}

                        <div className="space-y-3">
                            <Button
                                onClick={handleCheckVerification}
                                fullWidth
                                disabled={isCheckingVerification}
                                className="bg-green-900 hover:bg-green-800"
                            >
                                {isCheckingVerification
                                    ? "Checking..."
                                    : "I've Verified My Email"}
                            </Button>

                            <Button
                                onClick={handleResendVerification}
                                fullWidth
                                variant="outline"
                                className="border-green-900 text-green-900 hover:bg-green-50"
                            >
                                Resend Verification Email
                            </Button>
                        </div>

                        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <h4 className="text-sm font-semibold text-blue-900 mb-2">
                                Can&apos;t find the email?
                            </h4>
                            <ul className="text-xs text-blue-800 space-y-1">
                                <li>• Check your spam or junk folder</li>
                                <li>
                                    • Make sure you entered the correct email
                                </li>
                                <li>• Wait a few minutes and check again</li>
                                <li>
                                    • Click &quot;Resend&quot; to get a new
                                    verification link
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            )}

            {/* Success Modal */}
            {showSuccessModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 transform transition-all animate-in fade-in zoom-in duration-300">
                        <div className="text-center">
                            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                                <CheckCircle className="h-10 w-10 text-green-600" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">
                                Account Created Successfully!
                            </h3>
                            <p className="text-gray-600 mb-6">
                                Welcome to the exam portal,{" "}
                                {role === "student"
                                    ? studentData.firstName
                                    : adminData.firstName}
                                ! Redirecting to your dashboard...
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

            <div className="w-full max-w-2xl">
                <div className="text-center mb-8">
                    <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
                        Create Account
                    </h2>
                    <p className="mt-2 text-lg text-gray-600">
                        Register to access the exam portal
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
                        Student Registration
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
                        Admin Registration
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
                            // Student Registration Form
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <Input
                                            label="First Name"
                                            type="text"
                                            placeholder="John"
                                            value={studentData.firstName}
                                            onChange={(e) =>
                                                handleStudentChange(
                                                    "firstName",
                                                    e.target.value,
                                                )
                                            }
                                            onBlur={() =>
                                                handleBlur("firstName")
                                            }
                                            required
                                            autoComplete="given-name"
                                            className={
                                                validationErrors.firstName
                                                    ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                                                    : ""
                                            }
                                        />
                                        {validationErrors.firstName && (
                                            <p className="mt-2 text-sm text-red-600 flex items-start gap-1">
                                                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                                                <span>
                                                    {validationErrors.firstName}
                                                </span>
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <Input
                                            label="Last Name"
                                            type="text"
                                            placeholder="Doe"
                                            value={studentData.lastName}
                                            onChange={(e) =>
                                                handleStudentChange(
                                                    "lastName",
                                                    e.target.value,
                                                )
                                            }
                                            onBlur={() =>
                                                handleBlur("lastName")
                                            }
                                            required
                                            autoComplete="family-name"
                                            className={
                                                validationErrors.lastName
                                                    ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                                                    : ""
                                            }
                                        />
                                        {validationErrors.lastName && (
                                            <p className="mt-2 text-sm text-red-600 flex items-start gap-1">
                                                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                                                <span>
                                                    {validationErrors.lastName}
                                                </span>
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <Input
                                        label="Email Address"
                                        type="email"
                                        placeholder="student@example.com"
                                        value={studentData.email}
                                        onChange={(e) =>
                                            handleStudentChange(
                                                "email",
                                                e.target.value,
                                            )
                                        }
                                        onBlur={() => handleBlur("email")}
                                        required
                                        autoComplete="email"
                                        className={
                                            validationErrors.email
                                                ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                                                : ""
                                        }
                                    />
                                    {validationErrors.email && (
                                        <p className="mt-2 text-sm text-red-600 flex items-start gap-1">
                                            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                                            <span>
                                                {validationErrors.email}
                                            </span>
                                        </p>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <Input
                                            label="Matric Number"
                                            type="text"
                                            placeholder="e.g., 2024/001"
                                            value={studentData.matricNo}
                                            onChange={(e) =>
                                                handleStudentChange(
                                                    "matricNo",
                                                    e.target.value.toUpperCase(),
                                                )
                                            }
                                            onBlur={() =>
                                                handleBlur("matricNo")
                                            }
                                            required
                                            className={
                                                validationErrors.matricNo
                                                    ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                                                    : ""
                                            }
                                        />
                                        {validationErrors.matricNo && (
                                            <p className="mt-2 text-sm text-red-600 flex items-start gap-1">
                                                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                                                <span>
                                                    {validationErrors.matricNo}
                                                </span>
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <Input
                                            label="Phone Number"
                                            type="tel"
                                            placeholder="+234 800 000 0000"
                                            value={studentData.phone}
                                            onChange={(e) =>
                                                handleStudentChange(
                                                    "phone",
                                                    e.target.value,
                                                )
                                            }
                                            onBlur={() => handleBlur("phone")}
                                            required
                                            autoComplete="tel"
                                            className={
                                                validationErrors.phone
                                                    ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                                                    : ""
                                            }
                                        />
                                        {validationErrors.phone && (
                                            <p className="mt-2 text-sm text-red-600 flex items-start gap-1">
                                                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                                                <span>
                                                    {validationErrors.phone}
                                                </span>
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <Input
                                        label="Date of Birth"
                                        type="date"
                                        value={studentData.dateOfBirth}
                                        onChange={(e) =>
                                            handleStudentChange(
                                                "dateOfBirth",
                                                e.target.value,
                                            )
                                        }
                                        onBlur={() => handleBlur("dateOfBirth")}
                                        required
                                        autoComplete="bday"
                                        max={
                                            new Date()
                                                .toISOString()
                                                .split("T")[0]
                                        }
                                        className={
                                            validationErrors.dateOfBirth
                                                ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                                                : ""
                                        }
                                    />
                                    {validationErrors.dateOfBirth && (
                                        <p className="mt-2 text-sm text-red-600 flex items-start gap-1">
                                            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                                            <span>
                                                {validationErrors.dateOfBirth}
                                            </span>
                                        </p>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <div className="relative">
                                            <Input
                                                label="Password"
                                                type={
                                                    showPassword.password
                                                        ? "text"
                                                        : "password"
                                                }
                                                placeholder="••••••••"
                                                value={studentData.password}
                                                onChange={(e) =>
                                                    handleStudentChange(
                                                        "password",
                                                        e.target.value,
                                                    )
                                                }
                                                onBlur={() =>
                                                    handleBlur("password")
                                                }
                                                required
                                                autoComplete="new-password"
                                                className={
                                                    validationErrors.password
                                                        ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                                                        : ""
                                                }
                                            />
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setShowPassword((prev) => ({
                                                        ...prev,
                                                        password:
                                                            !prev.password,
                                                    }))
                                                }
                                                className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
                                            >
                                                {showPassword.password ? (
                                                    <EyeOff className="h-5 w-5" />
                                                ) : (
                                                    <Eye className="h-5 w-5" />
                                                )}
                                            </button>
                                        </div>
                                        {validationErrors.password && (
                                            <p className="mt-2 text-sm text-red-600 flex items-start gap-1">
                                                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                                                <span>
                                                    {validationErrors.password}
                                                </span>
                                            </p>
                                        )}
                                        {studentData.password &&
                                            !validationErrors.password && (
                                                <p
                                                    className={`mt-2 text-sm font-medium ${passwordStrength.color}`}
                                                >
                                                    Password strength:{" "}
                                                    {passwordStrength.label}
                                                </p>
                                            )}
                                    </div>

                                    <div>
                                        <div className="relative">
                                            <Input
                                                label="Confirm Password"
                                                type={
                                                    showPassword.confirmPassword
                                                        ? "text"
                                                        : "password"
                                                }
                                                placeholder="••••••••"
                                                value={
                                                    studentData.confirmPassword
                                                }
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
                                                required
                                                autoComplete="new-password"
                                                className={
                                                    validationErrors.confirmPassword
                                                        ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                                                        : ""
                                                }
                                            />
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setShowPassword((prev) => ({
                                                        ...prev,
                                                        confirmPassword:
                                                            !prev.confirmPassword,
                                                    }))
                                                }
                                                className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
                                            >
                                                {showPassword.confirmPassword ? (
                                                    <EyeOff className="h-5 w-5" />
                                                ) : (
                                                    <Eye className="h-5 w-5" />
                                                )}
                                            </button>
                                        </div>
                                        {validationErrors.confirmPassword && (
                                            <p className="mt-2 text-sm text-red-600 flex items-start gap-1">
                                                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                                                <span>
                                                    {
                                                        validationErrors.confirmPassword
                                                    }
                                                </span>
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </>
                        ) : (
                            // Admin Registration Form (similar structure - keeping original for brevity)
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <Input
                                            label="First Name"
                                            type="text"
                                            placeholder="Jane"
                                            value={adminData.firstName}
                                            onChange={(e) =>
                                                handleAdminChange(
                                                    "firstName",
                                                    e.target.value,
                                                )
                                            }
                                            onBlur={() =>
                                                handleBlur("firstName")
                                            }
                                            required
                                            autoComplete="given-name"
                                            className={
                                                validationErrors.firstName
                                                    ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                                                    : ""
                                            }
                                        />
                                        {validationErrors.firstName && (
                                            <p className="mt-2 text-sm text-red-600 flex items-start gap-1">
                                                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                                                <span>
                                                    {validationErrors.firstName}
                                                </span>
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <Input
                                            label="Last Name"
                                            type="text"
                                            placeholder="Smith"
                                            value={adminData.lastName}
                                            onChange={(e) =>
                                                handleAdminChange(
                                                    "lastName",
                                                    e.target.value,
                                                )
                                            }
                                            onBlur={() =>
                                                handleBlur("lastName")
                                            }
                                            required
                                            autoComplete="family-name"
                                            className={
                                                validationErrors.lastName
                                                    ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                                                    : ""
                                            }
                                        />
                                        {validationErrors.lastName && (
                                            <p className="mt-2 text-sm text-red-600 flex items-start gap-1">
                                                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                                                <span>
                                                    {validationErrors.lastName}
                                                </span>
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <Input
                                        label="Official Email Address"
                                        type="email"
                                        placeholder="admin@school.edu"
                                        value={adminData.email}
                                        onChange={(e) =>
                                            handleAdminChange(
                                                "email",
                                                e.target.value,
                                            )
                                        }
                                        onBlur={() => handleBlur("email")}
                                        required
                                        autoComplete="email"
                                        className={
                                            validationErrors.email
                                                ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                                                : ""
                                        }
                                    />
                                    {validationErrors.email && (
                                        <p className="mt-2 text-sm text-red-600 flex items-start gap-1">
                                            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                                            <span>
                                                {validationErrors.email}
                                            </span>
                                        </p>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <Input
                                            label="School Name"
                                            type="text"
                                            placeholder="University of Lagos"
                                            value={adminData.schoolName}
                                            onChange={(e) =>
                                                handleAdminChange(
                                                    "schoolName",
                                                    e.target.value,
                                                )
                                            }
                                            onBlur={() =>
                                                handleBlur("schoolName")
                                            }
                                            required
                                            autoComplete="organization"
                                            className={
                                                validationErrors.schoolName
                                                    ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                                                    : ""
                                            }
                                        />
                                        {validationErrors.schoolName && (
                                            <p className="mt-2 text-sm text-red-600 flex items-start gap-1">
                                                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                                                <span>
                                                    {
                                                        validationErrors.schoolName
                                                    }
                                                </span>
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <Input
                                            label="Department/Faculty"
                                            type="text"
                                            placeholder="e.g., Computer Science"
                                            value={adminData.department}
                                            onChange={(e) =>
                                                handleAdminChange(
                                                    "department",
                                                    e.target.value,
                                                )
                                            }
                                            onBlur={() =>
                                                handleBlur("department")
                                            }
                                            required
                                            className={
                                                validationErrors.department
                                                    ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                                                    : ""
                                            }
                                        />
                                        {validationErrors.department && (
                                            <p className="mt-2 text-sm text-red-600 flex items-start gap-1">
                                                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                                                <span>
                                                    {
                                                        validationErrors.department
                                                    }
                                                </span>
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <Input
                                            label="Admin ID / Staff Number"
                                            type="text"
                                            placeholder="e.g., ADM-2024-001"
                                            value={adminData.adminId}
                                            onChange={(e) =>
                                                handleAdminChange(
                                                    "adminId",
                                                    e.target.value.toUpperCase(),
                                                )
                                            }
                                            onBlur={() => handleBlur("adminId")}
                                            required
                                            className={
                                                validationErrors.adminId
                                                    ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                                                    : ""
                                            }
                                        />
                                        {validationErrors.adminId && (
                                            <p className="mt-2 text-sm text-red-600 flex items-start gap-1">
                                                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                                                <span>
                                                    {validationErrors.adminId}
                                                </span>
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <Input
                                            label="Phone Number"
                                            type="tel"
                                            placeholder="+234 800 000 0000"
                                            value={adminData.phone}
                                            onChange={(e) =>
                                                handleAdminChange(
                                                    "phone",
                                                    e.target.value,
                                                )
                                            }
                                            onBlur={() => handleBlur("phone")}
                                            required
                                            autoComplete="tel"
                                            className={
                                                validationErrors.phone
                                                    ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                                                    : ""
                                            }
                                        />
                                        {validationErrors.phone && (
                                            <p className="mt-2 text-sm text-red-600 flex items-start gap-1">
                                                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                                                <span>
                                                    {validationErrors.phone}
                                                </span>
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <div className="relative">
                                            <Input
                                                label="Password"
                                                type={
                                                    showPassword.password
                                                        ? "text"
                                                        : "password"
                                                }
                                                placeholder="••••••••"
                                                value={adminData.password}
                                                onChange={(e) =>
                                                    handleAdminChange(
                                                        "password",
                                                        e.target.value,
                                                    )
                                                }
                                                onBlur={() =>
                                                    handleBlur("password")
                                                }
                                                required
                                                autoComplete="new-password"
                                                className={
                                                    validationErrors.password
                                                        ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                                                        : ""
                                                }
                                            />
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setShowPassword((prev) => ({
                                                        ...prev,
                                                        password:
                                                            !prev.password,
                                                    }))
                                                }
                                                className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
                                            >
                                                {showPassword.password ? (
                                                    <EyeOff className="h-5 w-5" />
                                                ) : (
                                                    <Eye className="h-5 w-5" />
                                                )}
                                            </button>
                                        </div>
                                        {validationErrors.password && (
                                            <p className="mt-2 text-sm text-red-600 flex items-start gap-1">
                                                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                                                <span>
                                                    {validationErrors.password}
                                                </span>
                                            </p>
                                        )}
                                        {adminData.password &&
                                            !validationErrors.password && (
                                                <p
                                                    className={`mt-2 text-sm font-medium ${passwordStrength.color}`}
                                                >
                                                    Password strength:{" "}
                                                    {passwordStrength.label}
                                                </p>
                                            )}
                                    </div>

                                    <div>
                                        <div className="relative">
                                            <Input
                                                label="Confirm Password"
                                                type={
                                                    showPassword.confirmPassword
                                                        ? "text"
                                                        : "password"
                                                }
                                                placeholder="••••••••"
                                                value={
                                                    adminData.confirmPassword
                                                }
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
                                                required
                                                autoComplete="new-password"
                                                className={
                                                    validationErrors.confirmPassword
                                                        ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                                                        : ""
                                                }
                                            />
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setShowPassword((prev) => ({
                                                        ...prev,
                                                        confirmPassword:
                                                            !prev.confirmPassword,
                                                    }))
                                                }
                                                className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
                                            >
                                                {showPassword.confirmPassword ? (
                                                    <EyeOff className="h-5 w-5" />
                                                ) : (
                                                    <Eye className="h-5 w-5" />
                                                )}
                                            </button>
                                        </div>
                                        {validationErrors.confirmPassword && (
                                            <p className="mt-2 text-sm text-red-600 flex items-start gap-1">
                                                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                                                <span>
                                                    {
                                                        validationErrors.confirmPassword
                                                    }
                                                </span>
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Password Requirements */}
                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                            <h4 className="text-sm font-semibold text-blue-900 mb-2">
                                Password Requirements:
                            </h4>
                            <ul className="text-xs text-blue-800 space-y-1">
                                <li className="flex items-center gap-2">
                                    <div
                                        className={`w-1.5 h-1.5 rounded-full ${currentData.password.length >= 8 ? "bg-green-600" : "bg-gray-400"}`}
                                    />
                                    At least 8 characters
                                </li>
                                <li className="flex items-center gap-2">
                                    <div
                                        className={`w-1.5 h-1.5 rounded-full ${/[A-Z]/.test(currentData.password) ? "bg-green-600" : "bg-gray-400"}`}
                                    />
                                    One uppercase letter
                                </li>
                                <li className="flex items-center gap-2">
                                    <div
                                        className={`w-1.5 h-1.5 rounded-full ${/[a-z]/.test(currentData.password) ? "bg-green-600" : "bg-gray-400"}`}
                                    />
                                    One lowercase letter
                                </li>
                                <li className="flex items-center gap-2">
                                    <div
                                        className={`w-1.5 h-1.5 rounded-full ${/[0-9]/.test(currentData.password) ? "bg-green-600" : "bg-gray-400"}`}
                                    />
                                    One number
                                </li>
                            </ul>
                        </div>

                        {/* Terms and Conditions */}
                        <div className="pt-4">
                            <label className="flex items-start text-sm text-gray-600 cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="mr-3 mt-0.5 rounded border-gray-300 text-green-900 focus:ring-green-900 cursor-pointer"
                                    required
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
                                ? "Creating Account..."
                                : "Create Account"}
                        </Button>
                    </form>

                    <div className="mt-6 pt-6 border-t border-gray-200 text-center text-sm text-gray-600">
                        Already have an account?{" "}
                        <Link
                            href={"/login"}
                            className="text-green-900 font-semibold hover:underline"
                        >
                            Sign In
                        </Link>
                    </div>
                </Card>

                <div className="mt-8 text-center">
                    <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <p>
                            Secure Registration • Data Protected • Official
                            Portal
                        </p>
                    </div>
                </div>
            </div>
        </main>
    );
}
