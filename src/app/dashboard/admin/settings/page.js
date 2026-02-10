"use client";

import React, { useState } from "react";
import {
    User,
    Mail,
    Phone,
    Building,
    Lock,
    Eye,
    EyeOff,
    Save,
    Camera,
    AlertCircle,
    CheckCircle,
    Shield,
    Bell,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/app/context/AuthContext";

export default function AdminSettings() {
    const [activeTab, setActiveTab] = useState("profile");
    const { user } = useAuth();
    // Security data
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // System settings
    const [systemSettings, setSystemSettings] = useState({
        allowSelfRegistration: true,
        requireEmailVerification: true,
        enableAutoGrading: true,
        allowLateSubmissions: false,
        defaultExamDuration: 90,
        passingScore: 50,
    });

    // Notification settings
    const [notifications, setNotifications] = useState({
        emailOnNewStudent: true,
        emailOnExamSubmission: false,
        weeklyReports: true,
        systemUpdates: true,
    });

    const [saveStatus, setSaveStatus] = useState(null);

    const handleProfileUpdate = (e) => {
        e.preventDefault();
        setSaveStatus("saving");
        setTimeout(() => {
            setSaveStatus("success");
            setTimeout(() => setSaveStatus(null), 3000);
        }, 1000);
    };

    const handlePasswordChange = (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setSaveStatus("error");
            return;
        }
        setSaveStatus("saving");
        setTimeout(() => {
            setSaveStatus("success");
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
            setTimeout(() => setSaveStatus(null), 3000);
        }, 1000);
    };

    const tabs = [
        { key: "profile", label: "Profile", icon: User },
        { key: "security", label: "Security", icon: Lock },
        { key: "system", label: "System", icon: Shield },
        { key: "notifications", label: "Notifications", icon: Bell },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                    Settings
                </h1>
                <p className="text-gray-600 mt-1">
                    Manage your account and system preferences
                </p>
            </div>

            {/* Tabs */}
            <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-4">
                {tabs.map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-colors cursor-pointer ${
                            activeTab === tab.key
                                ? "bg-green-900 text-white"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                    >
                        <tab.icon className="h-4 w-4" />
                        <span className="hidden sm:inline">{tab.label}</span>
                    </button>
                ))}
            </div>

            {/* Status Message */}
            {saveStatus && (
                <Card
                    className={`p-4 border-2 rounded-2xl ${
                        saveStatus === "success"
                            ? "bg-green-50 border-green-200"
                            : saveStatus === "error"
                              ? "bg-red-50 border-red-200"
                              : "bg-blue-50 border-blue-200"
                    }`}
                >
                    <div className="flex items-center gap-3">
                        {saveStatus === "success" ? (
                            <>
                                <CheckCircle className="h-5 w-5 text-green-600" />
                                <p className="text-sm font-semibold text-green-900">
                                    Changes saved successfully!
                                </p>
                            </>
                        ) : saveStatus === "error" ? (
                            <>
                                <AlertCircle className="h-5 w-5 text-red-600" />
                                <p className="text-sm font-semibold text-red-900">
                                    Passwords do not match. Please try again.
                                </p>
                            </>
                        ) : (
                            <>
                                <AlertCircle className="h-5 w-5 text-blue-600" />
                                <p className="text-sm font-semibold text-blue-900">
                                    Saving changes...
                                </p>
                            </>
                        )}
                    </div>
                </Card>
            )}

            {/* Profile Tab */}
            {activeTab === "profile" && (
                <div className="space-y-6">
                    <Card className="p-6 sm:p-8 bg-white border border-gray-200 rounded-2xl">
                        <h3 className="text-xl font-bold text-gray-900 mb-6">
                            Admin Profile Information
                        </h3>

                        {/* Profile Picture */}
                        <div className="flex items-center gap-6 mb-8">
                            <div className="relative">
                                <div className="w-24 h-24 bg-green-900 rounded-2xl flex items-center justify-center">
                                    <Shield className="h-12 w-12 text-white" />
                                </div>
                                <button className="absolute -bottom-2 -right-2 w-10 h-10 bg-green-900 hover:bg-green-800 rounded-full flex items-center justify-center cursor-pointer shadow-lg">
                                    <Camera className="h-5 w-5 text-white" />
                                </button>
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-900 mb-1">
                                    Profile Picture
                                </h4>
                                <p className="text-sm text-gray-600 mb-3">
                                    PNG, JPG up to 5MB
                                </p>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="border-2 border-gray-300 text-gray-700 hover:bg-gray-50 cursor-pointer font-semibold"
                                >
                                    Upload Photo
                                </Button>
                            </div>
                        </div>

                        <form
                            onSubmit={handleProfileUpdate}
                            className="space-y-6"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Input
                                    label="First Name"
                                    type="text"
                                    value={user.firstName}
                                    onChange={(e) =>
                                        setProfileData({
                                            ...profileData,
                                            firstName: e.target.value,
                                        })
                                    }
                                    required
                                />
                                <Input
                                    label="Last Name"
                                    type="text"
                                    value={user.lastName}
                                    onChange={(e) =>
                                        setProfileData({
                                            ...profileData,
                                            lastName: e.target.value,
                                        })
                                    }
                                    required
                                />
                            </div>

                            <Input
                                label="Email Address"
                                type="email"
                                value={user.email}
                                onChange={(e) =>
                                    setProfileData({
                                        ...profileData,
                                        email: e.target.value,
                                    })
                                }
                                required
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Input
                                    label="Phone Number"
                                    type="tel"
                                    value={user.phone}
                                    onChange={(e) =>
                                        setProfileData({
                                            ...profileData,
                                            phone: e.target.value,
                                        })
                                    }
                                />
                                <Input
                                    label="Admin ID"
                                    type="text"
                                    value={user.adminId}
                                    disabled
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Input
                                    label="School Name"
                                    type="text"
                                    value={user.schoolName}
                                    disabled
                                />
                                <Input
                                    label="Department"
                                    type="text"
                                    value={user.department}
                                    disabled
                                />
                            </div>

                            <Button
                                type="submit"
                                size="lg"
                                className="bg-green-900 hover:bg-green-800 cursor-pointer text-white font-bold"
                            >
                                <Save className="mr-2 h-5 w-5" />
                                Save Changes
                            </Button>
                        </form>
                    </Card>
                </div>
            )}

            {/* Security Tab */}
            {activeTab === "security" && (
                <div className="space-y-6">
                    <Card className="p-6 sm:p-8 bg-white border border-gray-200 rounded-2xl">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                            Change Password
                        </h3>
                        <p className="text-sm text-gray-600 mb-6">
                            Ensure your account is secure by using a strong
                            password
                        </p>

                        <form
                            onSubmit={handlePasswordChange}
                            className="space-y-6"
                        >
                            <div className="relative">
                                <Input
                                    label="Current Password"
                                    type={
                                        showCurrentPassword
                                            ? "text"
                                            : "password"
                                    }
                                    placeholder="Enter current password"
                                    value={currentPassword}
                                    onChange={(e) =>
                                        setCurrentPassword(e.target.value)
                                    }
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowCurrentPassword(
                                            !showCurrentPassword,
                                        )
                                    }
                                    className="absolute right-3 top-9 text-gray-500 hover:text-gray-700 cursor-pointer"
                                >
                                    {showCurrentPassword ? (
                                        <EyeOff className="h-5 w-5" />
                                    ) : (
                                        <Eye className="h-5 w-5" />
                                    )}
                                </button>
                            </div>

                            <div className="relative">
                                <Input
                                    label="New Password"
                                    type={showNewPassword ? "text" : "password"}
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
                                        setShowNewPassword(!showNewPassword)
                                    }
                                    className="absolute right-3 top-9 text-gray-500 hover:text-gray-700 cursor-pointer"
                                >
                                    {showNewPassword ? (
                                        <EyeOff className="h-5 w-5" />
                                    ) : (
                                        <Eye className="h-5 w-5" />
                                    )}
                                </button>
                            </div>

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
                                        setConfirmPassword(e.target.value)
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

                            <Button
                                type="submit"
                                size="lg"
                                className="bg-green-900 hover:bg-green-800 cursor-pointer text-white font-bold"
                            >
                                <Lock className="mr-2 h-5 w-5" />
                                Update Password
                            </Button>
                        </form>
                    </Card>

                    <Card className="p-6 bg-blue-50 border border-blue-200 rounded-2xl">
                        <div className="flex gap-4">
                            <Shield className="h-6 w-6 text-blue-600 shrink-0 mt-0.5" />
                            <div>
                                <h4 className="font-bold text-gray-900 mb-2">
                                    Password Requirements
                                </h4>
                                <ul className="space-y-1 text-sm text-gray-700">
                                    <li className="flex items-start">
                                        <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 mr-3 shrink-0" />
                                        <span>At least 8 characters long</span>
                                    </li>
                                    <li className="flex items-start">
                                        <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 mr-3 shrink-0" />
                                        <span>
                                            Include uppercase and lowercase
                                            letters
                                        </span>
                                    </li>
                                    <li className="flex items-start">
                                        <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 mr-3 shrink-0" />
                                        <span>Include at least one number</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </Card>
                </div>
            )}

            {/* System Settings Tab */}
            {activeTab === "system" && (
                <div className="space-y-6">
                    <Card className="p-6 sm:p-8 bg-white border border-gray-200 rounded-2xl">
                        <h3 className="text-xl font-bold text-gray-900 mb-6">
                            System Configuration
                        </h3>

                        <div className="space-y-6">
                            {[
                                {
                                    key: "allowSelfRegistration",
                                    title: "Allow Student Self-Registration",
                                    description:
                                        "Permit students to create their own accounts",
                                },
                                {
                                    key: "requireEmailVerification",
                                    title: "Require Email Verification",
                                    description:
                                        "Students must verify email before accessing exams",
                                },
                                {
                                    key: "enableAutoGrading",
                                    title: "Enable Auto-Grading",
                                    description:
                                        "Automatically grade multiple choice questions",
                                },
                                {
                                    key: "allowLateSubmissions",
                                    title: "Allow Late Submissions",
                                    description:
                                        "Permit exam submissions after deadline",
                                },
                            ].map((item) => (
                                <div
                                    key={item.key}
                                    className="flex items-start justify-between p-4 border border-gray-200 rounded-xl hover:border-green-700 transition-colors"
                                >
                                    <div className="flex-1">
                                        <h4 className="font-bold text-gray-900 mb-1">
                                            {item.title}
                                        </h4>
                                        <p className="text-sm text-gray-600">
                                            {item.description}
                                        </p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer ml-4">
                                        <input
                                            type="checkbox"
                                            checked={systemSettings[item.key]}
                                            onChange={(e) =>
                                                setSystemSettings({
                                                    ...systemSettings,
                                                    [item.key]:
                                                        e.target.checked,
                                                })
                                            }
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-900"></div>
                                    </label>
                                </div>
                            ))}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                                <Input
                                    label="Default Exam Duration (minutes)"
                                    type="number"
                                    value={systemSettings.defaultExamDuration}
                                    onChange={(e) =>
                                        setSystemSettings({
                                            ...systemSettings,
                                            defaultExamDuration: e.target.value,
                                        })
                                    }
                                />
                                <Input
                                    label="Default Passing Score (%)"
                                    type="number"
                                    value={systemSettings.passingScore}
                                    onChange={(e) =>
                                        setSystemSettings({
                                            ...systemSettings,
                                            passingScore: e.target.value,
                                        })
                                    }
                                />
                            </div>
                        </div>

                        <div className="mt-6">
                            <Button
                                size="lg"
                                onClick={handleProfileUpdate}
                                className="bg-green-900 hover:bg-green-800 cursor-pointer text-white font-bold"
                            >
                                <Save className="mr-2 h-5 w-5" />
                                Save Settings
                            </Button>
                        </div>
                    </Card>
                </div>
            )}

            {/* Notifications Tab */}
            {activeTab === "notifications" && (
                <div className="space-y-6">
                    <Card className="p-6 sm:p-8 bg-white border border-gray-200 rounded-2xl">
                        <h3 className="text-xl font-bold text-gray-900 mb-6">
                            Email Notifications
                        </h3>

                        <div className="space-y-6">
                            {[
                                {
                                    key: "emailOnNewStudent",
                                    title: "New Student Registration",
                                    description:
                                        "Get notified when a new student registers",
                                },
                                {
                                    key: "emailOnExamSubmission",
                                    title: "Exam Submissions",
                                    description:
                                        "Receive alerts for each exam submission",
                                },
                                {
                                    key: "weeklyReports",
                                    title: "Weekly Performance Reports",
                                    description:
                                        "Receive weekly analytics and performance summaries",
                                },
                                {
                                    key: "systemUpdates",
                                    title: "System Updates",
                                    description:
                                        "Important updates about platform features and maintenance",
                                },
                            ].map((item) => (
                                <div
                                    key={item.key}
                                    className="flex items-start justify-between p-4 border border-gray-200 rounded-xl hover:border-green-700 transition-colors"
                                >
                                    <div className="flex-1">
                                        <h4 className="font-bold text-gray-900 mb-1">
                                            {item.title}
                                        </h4>
                                        <p className="text-sm text-gray-600">
                                            {item.description}
                                        </p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer ml-4">
                                        <input
                                            type="checkbox"
                                            checked={notifications[item.key]}
                                            onChange={(e) =>
                                                setNotifications({
                                                    ...notifications,
                                                    [item.key]:
                                                        e.target.checked,
                                                })
                                            }
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-900"></div>
                                    </label>
                                </div>
                            ))}
                        </div>

                        <div className="mt-6">
                            <Button
                                size="lg"
                                onClick={handleProfileUpdate}
                                className="bg-green-900 hover:bg-green-800 cursor-pointer text-white font-bold"
                            >
                                <Save className="mr-2 h-5 w-5" />
                                Save Preferences
                            </Button>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
}
