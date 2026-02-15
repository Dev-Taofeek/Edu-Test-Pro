"use client";

import React, { useState, useEffect, Suspense } from "react";
import {
    Lock,
    Eye,
    EyeOff,
    CheckCircle,
    AlertCircle,
    Check,
    X,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { confirmPasswordReset, verifyPasswordResetCode } from "firebase/auth";
import { auth } from "@/lib/firebase";

const PasswordRequirement = ({ met, text }) => (
    <li className="flex items-center gap-2 text-sm">
        {met ? (
            <Check className="h-4 w-4 text-green-600 shrink-0" />
        ) : (
            <X className="h-4 w-4 text-gray-400 shrink-0" />
        )}
        <span className={met ? "text-green-700" : "text-gray-600"}>{text}</span>
    </li>
);

function ResetPasswordContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState("");
    const [isVerifying, setIsVerifying] = useState(true);
    const [oobCode, setOobCode] = useState(null);
    const [userEmail, setUserEmail] = useState("");

    // Get the oobCode from URL parameters and verify it
    useEffect(() => {
        const verifyResetCode = async () => {
            const code = searchParams.get("oobCode");

            if (!code) {
                setError(
                    "Invalid or missing reset link. Please request a new password reset.",
                );
                setIsVerifying(false);
                return;
            }

            setOobCode(code);

            try {
                // Verify the reset code
                const email = await verifyPasswordResetCode(auth, code);
                setUserEmail(email);
                setIsVerifying(false);
            } catch (err) {
                console.error("Error verifying reset code:", err);
                let errorMessage =
                    "This password reset link is invalid or has expired.";

                if (err.code === "auth/expired-action-code") {
                    errorMessage =
                        "This password reset link has expired. Please request a new one.";
                } else if (err.code === "auth/invalid-action-code") {
                    errorMessage =
                        "This password reset link is invalid or has already been used.";
                } else if (err.code === "auth/user-disabled") {
                    errorMessage = "This account has been disabled.";
                } else if (err.code === "auth/user-not-found") {
                    errorMessage = "No account found with this email address.";
                }

                setError(errorMessage);
                setIsVerifying(false);
            }
        };

        verifyResetCode();
    }, [searchParams]);

    // Password strength validation
    const hasMinLength = newPassword.length >= 8;
    const hasUpperCase = /[A-Z]/.test(newPassword);
    const hasLowerCase = /[a-z]/.test(newPassword);
    const hasNumber = /[0-9]/.test(newPassword);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);

    const isPasswordStrong =
        hasMinLength && hasUpperCase && hasLowerCase && hasNumber;
    const passwordsMatch =
        newPassword === confirmPassword && confirmPassword !== "";
    const isFormValid = isPasswordStrong && passwordsMatch;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!isPasswordStrong) {
            setError("Password does not meet the requirements");
            return;
        }

        if (!passwordsMatch) {
            setError("Passwords do not match");
            return;
        }

        if (!oobCode) {
            setError(
                "Invalid reset link. Please request a new password reset.",
            );
            return;
        }

        setIsLoading(true);

        try {
            // Confirm the password reset with Firebase
            await confirmPasswordReset(auth, oobCode, newPassword);

            setIsSuccess(true);
            setIsLoading(false);

            // Redirect to login after 3 seconds
            setTimeout(() => {
                router.push("/login");
            }, 3000);
        } catch (err) {
            console.error("Error resetting password:", err);

            let errorMessage = "Failed to reset password. Please try again.";

            if (err.code === "auth/expired-action-code") {
                errorMessage =
                    "This reset link has expired. Please request a new one.";
            } else if (err.code === "auth/invalid-action-code") {
                errorMessage =
                    "This reset link is invalid or has already been used.";
            } else if (err.code === "auth/weak-password") {
                errorMessage =
                    "Password is too weak. Please choose a stronger password.";
            } else if (err.code === "auth/user-disabled") {
                errorMessage = "This account has been disabled.";
            } else if (err.code === "auth/user-not-found") {
                errorMessage =
                    "No account found. The account may have been deleted.";
            }

            setError(errorMessage);
            setIsLoading(false);
        }
    };

    // Show loading state while verifying the reset code
    if (isVerifying) {
        return (
            <div className="grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-green-50">
                <div className="w-full max-w-md">
                    <Card className="p-8 shadow-lg border-t-4 border-t-green-900 bg-white rounded-2xl">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-green-900 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
                                <Lock className="h-8 w-8 text-white" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                Verifying Reset Link
                            </h2>
                            <p className="text-gray-600">Please wait...</p>
                        </div>
                    </Card>
                </div>
            </div>
        );
    }

    // Show error if code verification failed
    if (error && !oobCode) {
        return (
            <div className="grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-green-50">
                <div className="w-full max-w-md">
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <AlertCircle className="h-8 w-8 text-red-600" />
                        </div>
                        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
                            Invalid Reset Link
                        </h2>
                        <p className="mt-2 text-lg text-gray-600">{error}</p>
                    </div>

                    <Card className="p-8 shadow-lg border-t-4 border-t-red-600 bg-white rounded-2xl">
                        <div className="space-y-4">
                            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                                <p className="text-sm text-gray-700">
                                    Password reset links expire after a certain
                                    time for security reasons. Please request a
                                    new password reset link.
                                </p>
                            </div>

                            <Link href="/forgot-password">
                                <Button
                                    fullWidth
                                    size="lg"
                                    className="bg-green-900 hover:bg-green-800 cursor-pointer text-white font-bold py-4"
                                >
                                    Request New Reset Link
                                </Button>
                            </Link>

                            <Link href="/login">
                                <Button
                                    fullWidth
                                    size="lg"
                                    variant="outline"
                                    className="border-gray-300 hover:bg-gray-50 cursor-pointer"
                                >
                                    Back to Login
                                </Button>
                            </Link>
                        </div>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <main className="grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-green-50">
            <div className="w-full max-w-md">
                {!isSuccess ? (
                    <>
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 bg-green-900 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <Lock className="h-8 w-8 text-white" />
                            </div>
                            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
                                Reset Password
                            </h2>
                            <p className="mt-2 text-lg text-gray-600">
                                Create a new password for your account
                            </p>
                            {userEmail && (
                                <p className="mt-1 text-sm text-gray-500">
                                    {userEmail}
                                </p>
                            )}
                        </div>

                        <Card className="p-8 shadow-lg border-t-4 border-t-green-900 bg-white rounded-2xl">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <div className="relative">
                                        <Input
                                            label="New Password"
                                            type={
                                                showPassword
                                                    ? "text"
                                                    : "password"
                                            }
                                            placeholder="Enter new password"
                                            value={newPassword}
                                            onChange={(e) =>
                                                setNewPassword(e.target.value)
                                            }
                                            required
                                            autoComplete="new-password"
                                        />
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowPassword(!showPassword)
                                            }
                                            className="absolute right-3 top-9 text-gray-500 hover:text-gray-700 cursor-pointer"
                                        >
                                            {showPassword ? (
                                                <EyeOff className="h-5 w-5" />
                                            ) : (
                                                <Eye className="h-5 w-5" />
                                            )}
                                        </button>
                                    </div>

                                    {/* Password Requirements */}
                                    {newPassword && (
                                        <div className="mt-3 p-4 bg-gray-50 rounded-xl">
                                            <p className="text-sm font-semibold text-gray-700 mb-2">
                                                Password Requirements:
                                            </p>
                                            <ul className="space-y-1.5">
                                                <PasswordRequirement
                                                    met={hasMinLength}
                                                    text="At least 8 characters"
                                                />
                                                <PasswordRequirement
                                                    met={hasUpperCase}
                                                    text="One uppercase letter"
                                                />
                                                <PasswordRequirement
                                                    met={hasLowerCase}
                                                    text="One lowercase letter"
                                                />
                                                <PasswordRequirement
                                                    met={hasNumber}
                                                    text="One number"
                                                />
                                                <PasswordRequirement
                                                    met={hasSpecialChar}
                                                    text="One special character (optional)"
                                                />
                                            </ul>
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <div className="relative">
                                        <Input
                                            label="Confirm New Password"
                                            type={
                                                showConfirmPassword
                                                    ? "text"
                                                    : "password"
                                            }
                                            placeholder="Re-enter new password"
                                            value={confirmPassword}
                                            onChange={(e) =>
                                                setConfirmPassword(
                                                    e.target.value,
                                                )
                                            }
                                            required
                                            autoComplete="new-password"
                                        />
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowConfirmPassword(
                                                    !showConfirmPassword,
                                                )
                                            }
                                            className="absolute right-3 top-9 text-gray-500 hover:text-gray-700 cursor-pointer"
                                        >
                                            {showConfirmPassword ? (
                                                <EyeOff className="h-5 w-5" />
                                            ) : (
                                                <Eye className="h-5 w-5" />
                                            )}
                                        </button>
                                    </div>

                                    {/* Password Match Indicator */}
                                    {confirmPassword && (
                                        <div className="mt-2 flex items-center gap-2">
                                            {passwordsMatch ? (
                                                <>
                                                    <Check className="h-4 w-4 text-green-600" />
                                                    <span className="text-sm text-green-700 font-medium">
                                                        Passwords match
                                                    </span>
                                                </>
                                            ) : (
                                                <>
                                                    <X className="h-4 w-4 text-red-600" />
                                                    <span className="text-sm text-red-700 font-medium">
                                                        Passwords don&apos;t
                                                        match
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                    )}
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
                                        ? "Resetting Password..."
                                        : "Reset Password"}
                                </Button>
                            </form>

                            <div className="mt-6 pt-6 border-t border-gray-200 text-center">
                                <Link
                                    href="/login"
                                    className="text-sm text-gray-600 hover:text-gray-900"
                                >
                                    Remember your password?{" "}
                                    <span className="text-green-900 font-semibold hover:underline">
                                        Sign In
                                    </span>
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
                                Password Reset Successful!
                            </h2>
                            <p className="mt-2 text-lg text-gray-600">
                                Your password has been successfully updated
                            </p>
                        </div>

                        <Card className="p-8 shadow-lg border-t-4 border-t-green-900 bg-white rounded-2xl">
                            <div className="space-y-6">
                                <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
                                    <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-3" />
                                    <p className="text-gray-700 mb-4">
                                        You can now log in with your new
                                        password. Redirecting...
                                    </p>
                                    <Link href="/login">
                                        <Button
                                            fullWidth
                                            size="lg"
                                            className="bg-green-900 hover:bg-green-800 cursor-pointer text-white font-bold py-4"
                                        >
                                            Continue to Login
                                        </Button>
                                    </Link>
                                </div>

                                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                                    <h3 className="font-bold text-gray-900 mb-2 flex items-center">
                                        <AlertCircle className="h-5 w-5 text-blue-600 mr-2" />
                                        Security Tips
                                    </h3>
                                    <ul className="space-y-2 text-sm text-gray-700">
                                        <li className="flex items-start">
                                            <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 mr-3 shrink-0" />
                                            <span>
                                                Never share your password with
                                                anyone
                                            </span>
                                        </li>
                                        <li className="flex items-start">
                                            <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 mr-3 shrink-0" />
                                            <span>
                                                Use a unique password for this
                                                account
                                            </span>
                                        </li>
                                        <li className="flex items-start">
                                            <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 mr-3 shrink-0" />
                                            <span>
                                                Change your password regularly
                                            </span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </Card>
                    </>
                )}

                <div className="mt-8 text-center">
                    <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <p>
                            Secure Connection • Password Protected • Official
                            Portal
                        </p>
                    </div>
                </div>
            </div>
        </main>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense
            fallback={
                <div className="grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-green-50">
                    <div className="w-full max-w-md">
                        <Card className="p-8 shadow-lg border-t-4 border-t-green-900 bg-white rounded-2xl">
                            <div className="text-center">
                                <div className="w-16 h-16 bg-green-900 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
                                    <Lock className="h-8 w-8 text-white" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                    Loading...
                                </h2>
                                <p className="text-gray-600">Please wait...</p>
                            </div>
                        </Card>
                    </div>
                </div>
            }
        >
            <ResetPasswordContent />
        </Suspense>
    );
}
