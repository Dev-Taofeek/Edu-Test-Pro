"use client";

import React, { useState } from "react";
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
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useAuth } from "@/app/context/AuthContext";

export default function SignupPage() {
    const { setAuthUser } = useAuth(); // Use AuthContext
    const [role, setRole] = useState("student"); // 'student' or 'admin'
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [showSuccessModal, setShowSuccessModal] = useState(false);

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

    const handleStudentChange = (field, value) => {
        setStudentData((prev) => ({ ...prev, [field]: value }));
        setError("");
    };

    const handleAdminChange = (field, value) => {
        setAdminData((prev) => ({ ...prev, [field]: value }));
        setError("");
    };

    // Check if all fields for the current role are filled
    const isFormValid =
        role === "student"
            ? Object.values(studentData).every((val) => val.trim() !== "")
            : Object.values(adminData).every((val) => val.trim() !== "");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        // Get current data based on role
        const currentData = role === "student" ? studentData : adminData;

        // Validate passwords match
        if (currentData.password !== currentData.confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        // Validate password length
        if (currentData.password.length < 6) {
            setError("Password must be at least 6 characters long");
            return;
        }

        setIsLoading(true);

        try {
            const email = currentData.email;
            const password = currentData.password;

            // Create Auth account
            const userCredential = await createUserWithEmailAndPassword(
                auth,
                email,
                password,
            );

            const firebaseUser = userCredential.user;

            // Prepare user data for Firestore
            const userDocData = {
                role,
                email,
                firstName: currentData.firstName,
                lastName: currentData.lastName,
                ...(role === "student"
                    ? {
                          matricNo: studentData.matricNo,
                          phone: studentData.phone,
                          dateOfBirth: studentData.dateOfBirth,
                      }
                    : {
                          schoolName: adminData.schoolName,
                          department: adminData.department,
                          adminId: adminData.adminId,
                          phone: adminData.phone,
                      }),
                createdAt: new Date(),
            };

            // Save to users collection
            await setDoc(doc(db, "users", firebaseUser.uid), userDocData);

            // Create student document if role is student
            if (role === "student") {
                await setDoc(doc(db, "students", firebaseUser.uid), {
                    email,
                    firstName: studentData.firstName,
                    lastName: studentData.lastName,
                    matricNo: studentData.matricNo,
                    phone: studentData.phone,
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
                firstName: currentData.firstName,
                lastName: currentData.lastName,
                email: email,
                role: role,
                matricNo: role === "student" ? studentData.matricNo : "",
            };

            // Show success modal first
            setShowSuccessModal(true);

            // Redirect after 2 seconds using AuthContext
            setTimeout(() => {
                setAuthUser(authUser); // This will save to localStorage and redirect
            }, 2000);
        } catch (err) {
            console.error("Registration error:", err);

            let errorMessage = "Registration failed. Please try again.";

            if (err.code === "auth/email-already-in-use") {
                errorMessage =
                    "This email is already registered. Please login instead.";
            } else if (err.code === "auth/invalid-email") {
                errorMessage = "Please enter a valid email address";
            } else if (err.code === "auth/weak-password") {
                errorMessage = "Password must be at least 6 characters long";
            } else if (err.code === "auth/network-request-failed") {
                errorMessage =
                    "Network error. Please check your internet connection";
            } else if (err.code === "auth/operation-not-allowed") {
                errorMessage =
                    "Registration is currently disabled. Please contact support";
            }

            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="grow flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8 bg-green-50">
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
                        Student Registration
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
                        Admin Registration
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
                                            required
                                        />
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
                                            required
                                        />
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
                                        required
                                    />
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
                                                    e.target.value,
                                                )
                                            }
                                            required
                                        />
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
                                            required
                                        />
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
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <Input
                                            label="Password"
                                            type="password"
                                            placeholder="••••••••"
                                            value={studentData.password}
                                            onChange={(e) =>
                                                handleStudentChange(
                                                    "password",
                                                    e.target.value,
                                                )
                                            }
                                            required
                                        />
                                    </div>

                                    <div>
                                        <Input
                                            label="Confirm Password"
                                            type="password"
                                            placeholder="••••••••"
                                            value={studentData.confirmPassword}
                                            onChange={(e) =>
                                                handleStudentChange(
                                                    "confirmPassword",
                                                    e.target.value,
                                                )
                                            }
                                            required
                                        />
                                    </div>
                                </div>
                            </>
                        ) : (
                            // Admin Registration Form
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
                                            required
                                        />
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
                                            required
                                        />
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
                                        required
                                    />
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
                                            required
                                        />
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
                                            required
                                        />
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
                                                    e.target.value,
                                                )
                                            }
                                            required
                                        />
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
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <Input
                                            label="Password"
                                            type="password"
                                            placeholder="••••••••"
                                            value={adminData.password}
                                            onChange={(e) =>
                                                handleAdminChange(
                                                    "password",
                                                    e.target.value,
                                                )
                                            }
                                            required
                                        />
                                    </div>

                                    <div>
                                        <Input
                                            label="Confirm Password"
                                            type="password"
                                            placeholder="••••••••"
                                            value={adminData.confirmPassword}
                                            onChange={(e) =>
                                                handleAdminChange(
                                                    "confirmPassword",
                                                    e.target.value,
                                                )
                                            }
                                            required
                                        />
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Terms and Conditions */}
                        <div className="pt-4">
                            <label className="flex items-start text-sm text-gray-600 cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="mr-3 mt-0.5 rounded border-gray-300 text-green-900 focus:ring-green-900"
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
                            disabled={isLoading || !isFormValid}
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
        </div>
    );
}
