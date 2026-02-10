"use client";

import React, { useState } from "react";
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

export default function ResetPasswordPage() {
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState("");

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

    const handleSubmit = (e) => {
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

        setIsLoading(true);

        // Simulate API call
        setTimeout(() => {
            setIsSuccess(true);
            setIsLoading(false);
        }, 1500);
    };

    return (
        <div className="grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-green-50">
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
                                        password
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
        </div>
    );
}
