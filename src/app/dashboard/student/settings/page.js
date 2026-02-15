"use client";

import React, { useState, useEffect, useRef } from "react";
import {
    User,
    Mail,
    Phone,
    Calendar,
    Lock,
    Bell,
    Shield,
    Eye,
    EyeOff,
    Save,
    Camera,
    AlertCircle,
    CheckCircle,
    Upload,
    GraduationCap,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/app/context/AuthContext";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import {
    updatePassword,
    EmailAuthProvider,
    reauthenticateWithCredential,
} from "firebase/auth";
import { db, auth } from "@/lib/firebase";

export default function Settings() {
    const [activeTab, setActiveTab] = useState("profile");
    const { user, setAuthUser } = useAuth();

    // Profile data
    const [profileData, setProfileData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        matricNo: "",
        phoneNumber: "",
        dateOfBirth: "",
        photoURL: "",
    });

    const [isLoadingProfile, setIsLoadingProfile] = useState(true);

    // Image upload refs
    const fileInputRef = useRef(null);
    const cameraInputRef = useRef(null);
    const [showImageOptions, setShowImageOptions] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);

    // Security data
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Notification settings
    const [notifications, setNotifications] = useState({
        emailNotifications: true,
        examReminders: true,
        resultNotifications: true,
        marketingEmails: false,
    });

    // Preferences
    const [preferences, setPreferences] = useState({
        language: "en",
        timezone: "WAT",
    });

    const [saveStatus, setSaveStatus] = useState(null);

    // Fetch user data from Firestore on mount
    useEffect(() => {
        const fetchUserData = async () => {
            if (!user?.uid) return;

            try {
                setIsLoadingProfile(true);
                const userDoc = await getDoc(doc(db, "users", user.uid));

                if (userDoc.exists()) {
                    const userData = userDoc.data();

                    // Format phone number for display (remove country code if present)
                    let displayPhone = "";
                    if (userData.phoneNumber) {
                        const phoneStr = userData.phoneNumber.toString();
                        // If starts with 234, remove it and show last 10 digits
                        if (
                            phoneStr.startsWith("234") &&
                            phoneStr.length === 13
                        ) {
                            displayPhone = phoneStr.slice(3);
                        } else {
                            displayPhone = phoneStr;
                        }
                    }

                    setProfileData({
                        firstName: userData.firstName || "",
                        lastName: userData.lastName || "",
                        email: userData.email || "",
                        matricNo: userData.matricNo || "",
                        phoneNumber: displayPhone,
                        dateOfBirth: userData.dateOfBirth || "",
                        photoURL: userData.photoURL || "",
                    });

                    // Load notification preferences if they exist
                    if (userData.notificationPreferences) {
                        setNotifications(userData.notificationPreferences);
                    }

                    // Load general preferences if they exist
                    if (userData.preferences) {
                        setPreferences(userData.preferences);
                    }
                }
            } catch (error) {
                console.error("Error fetching user data:", error);
                setSaveStatus("error");
            } finally {
                setIsLoadingProfile(false);
            }
        };

        fetchUserData();
    }, [user?.uid]);

    // Compress image to reduce size
    const compressImage = (
        file,
        maxWidth = 500,
        maxHeight = 500,
        quality = 0.8,
    ) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);

            reader.onload = (event) => {
                const img = document.createElement("img");
                img.src = event.target.result;

                img.onload = () => {
                    const canvas = document.createElement("canvas");
                    let width = img.width;
                    let height = img.height;

                    // Calculate new dimensions
                    if (width > height) {
                        if (width > maxWidth) {
                            height *= maxWidth / width;
                            width = maxWidth;
                        }
                    } else {
                        if (height > maxHeight) {
                            width *= maxHeight / height;
                            height = maxHeight;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;

                    const ctx = canvas.getContext("2d");
                    ctx.drawImage(img, 0, 0, width, height);

                    // Convert to base64 with compression
                    const compressedBase64 = canvas.toDataURL(
                        "image/jpeg",
                        quality,
                    );
                    resolve(compressedBase64);
                };

                img.onerror = reject;
            };

            reader.onerror = reject;
        });
    };

    // Handle image upload
    const handleImageUpload = async (file) => {
        if (!file) return;

        // Validate file type
        const validTypes = ["image/png", "image/jpeg", "image/jpg"];
        if (!validTypes.includes(file.type)) {
            alert("Please upload a PNG or JPG image");
            return;
        }

        // Validate file size (5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert("Image size should be less than 5MB");
            return;
        }

        try {
            setUploadingImage(true);

            // Compress image to base64
            const compressedBase64 = await compressImage(file);

            // Check if compressed size is reasonable
            const sizeInBytes = (compressedBase64.length * 3) / 4;
            if (sizeInBytes > 700000) {
                alert(
                    "Image is too large even after compression. Please use a smaller image.",
                );
                setUploadingImage(false);
                return;
            }

            // Update Firestore
            await updateDoc(doc(db, "users", user.uid), {
                photoURL: compressedBase64,
            });

            // Also update students collection if exists
            try {
                await updateDoc(doc(db, "students", user.uid), {
                    photoURL: compressedBase64,
                });
            } catch (error) {
                console.log("No student document to update");
            }

            // Update local state
            setProfileData((prev) => ({ ...prev, photoURL: compressedBase64 }));

            // Update AuthContext
            setAuthUser({ ...user, photoURL: compressedBase64 });

            setSaveStatus("success");
            setTimeout(() => setSaveStatus(null), 3000);
        } catch (error) {
            console.error("Error uploading image:", error);
            alert("Failed to upload image. Please try again.");
        } finally {
            setUploadingImage(false);
            setShowImageOptions(false);
        }
    };

    const handleCameraCapture = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            handleImageUpload(file);
        }
    };

    const handleFileSelect = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            handleImageUpload(file);
        }
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setSaveStatus("saving");

        try {
            // Clean phone number (remove spaces, dashes, etc.)
            const cleanPhone = profileData.phoneNumber.replace(/\D/g, "");

            // Validate phone is 10 digits
            if (cleanPhone.length !== 10) {
                alert("Phone number must be 10 digits");
                setSaveStatus("error");
                setTimeout(() => setSaveStatus(null), 3000);
                return;
            }

            // Add country code and convert to number
            const fullPhoneNumber = parseInt(`234${cleanPhone}`, 10);

            // Only update fields that can be changed
            const updates = {
                firstName: profileData.firstName.trim(),
                lastName: profileData.lastName.trim(),
                phoneNumber: fullPhoneNumber,
                dateOfBirth: profileData.dateOfBirth,
            };

            // Update users collection
            await updateDoc(doc(db, "users", user.uid), updates);

            // Update students collection
            try {
                await updateDoc(doc(db, "students", user.uid), {
                    firstName: updates.firstName,
                    lastName: updates.lastName,
                    phoneNumber: updates.phoneNumber,
                    dateOfBirth: updates.dateOfBirth,
                });
            } catch (error) {
                console.log("No student document to update");
            }

            // Update AuthContext
            setAuthUser({
                ...user,
                firstName: updates.firstName,
                lastName: updates.lastName,
            });

            setSaveStatus("success");
            setTimeout(() => setSaveStatus(null), 3000);
        } catch (error) {
            console.error("Error updating profile:", error);
            setSaveStatus("error");
            setTimeout(() => setSaveStatus(null), 3000);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            alert("Passwords do not match");
            setSaveStatus("error");
            return;
        }

        if (newPassword.length < 8) {
            alert("Password must be at least 8 characters long");
            return;
        }

        setSaveStatus("saving");

        try {
            const currentUser = auth.currentUser;

            // Reauthenticate user
            const credential = EmailAuthProvider.credential(
                currentUser.email,
                currentPassword,
            );
            await reauthenticateWithCredential(currentUser, credential);

            // Update password
            await updatePassword(currentUser, newPassword);

            setSaveStatus("success");
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
            setTimeout(() => setSaveStatus(null), 3000);
        } catch (error) {
            console.error("Error updating password:", error);

            let errorMessage = "Failed to update password";
            if (error.code === "auth/wrong-password") {
                errorMessage = "Current password is incorrect";
            } else if (error.code === "auth/weak-password") {
                errorMessage = "Password is too weak";
            }

            alert(errorMessage);
            setSaveStatus("error");
            setTimeout(() => setSaveStatus(null), 3000);
        }
    };

    const handleNotificationUpdate = async () => {
        setSaveStatus("saving");

        try {
            await updateDoc(doc(db, "users", user.uid), {
                notificationPreferences: notifications,
            });

            setSaveStatus("success");
            setTimeout(() => setSaveStatus(null), 3000);
        } catch (error) {
            console.error("Error updating notifications:", error);
            setSaveStatus("error");
            setTimeout(() => setSaveStatus(null), 3000);
        }
    };

    const handlePreferencesUpdate = async (e) => {
        e.preventDefault();
        setSaveStatus("saving");

        try {
            await updateDoc(doc(db, "users", user.uid), {
                preferences: preferences,
            });

            setSaveStatus("success");
            setTimeout(() => setSaveStatus(null), 3000);
        } catch (error) {
            console.error("Error updating preferences:", error);
            setSaveStatus("error");
            setTimeout(() => setSaveStatus(null), 3000);
        }
    };

    const tabs = [
        { key: "profile", label: "Profile", icon: User },
        { key: "security", label: "Security", icon: Lock },
        { key: "notifications", label: "Notifications", icon: Bell },
        { key: "preferences", label: "Preferences", icon: Shield },
    ];

    if (isLoadingProfile) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-green-900 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading settings...</p>
                </div>
            </div>
        );
    }

    return (
        <main className="space-y-6">
            {/* Hidden file inputs */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/png, image/jpeg, image/jpg"
                onChange={handleFileSelect}
                className="hidden"
            />
            <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleCameraCapture}
                className="hidden"
            />

            {/* Header */}
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                    Settings
                </h1>
                <p className="text-gray-600 mt-1">
                    Manage your account settings and preferences
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
                                    An error occurred. Please try again.
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
                            Profile Information
                        </h3>

                        <form
                            onSubmit={handleProfileUpdate}
                            className="space-y-6"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Input
                                    label="First Name"
                                    type="text"
                                    value={profileData.firstName}
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
                                    value={profileData.lastName}
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
                                value={profileData.email}
                                disabled
                                className="bg-gray-50"
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Input
                                    label="Matric Number"
                                    type="text"
                                    value={profileData.matricNo}
                                    disabled
                                    className="bg-gray-50"
                                />
                                <div>
                                    <Input
                                        label="Phone Number"
                                        type="tel"
                                        placeholder="8012345678"
                                        value={profileData.phoneNumber}
                                        onChange={(e) => {
                                            // Only allow numbers
                                            const value =
                                                e.target.value.replace(
                                                    /\D/g,
                                                    "",
                                                );
                                            // Limit to 10 digits
                                            if (value.length <= 10) {
                                                setProfileData({
                                                    ...profileData,
                                                    phoneNumber: value,
                                                });
                                            }
                                        }}
                                        maxLength={10}
                                    />
                                    <p className="mt-1 text-xs text-gray-500">
                                        10 digits (234 will be added
                                        automatically)
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Input
                                    label="Date of Birth"
                                    type="date"
                                    value={profileData.dateOfBirth}
                                    onChange={(e) =>
                                        setProfileData({
                                            ...profileData,
                                            dateOfBirth: e.target.value,
                                        })
                                    }
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

            {/* Notifications Tab */}
            {activeTab === "notifications" && (
                <div className="space-y-6">
                    <Card className="p-6 sm:p-8 bg-white border border-gray-200 rounded-2xl">
                        <h3 className="text-xl font-bold text-gray-900 mb-6">
                            Notification Preferences
                        </h3>

                        <div className="space-y-6">
                            {[
                                {
                                    key: "emailNotifications",
                                    title: "Email Notifications",
                                    description:
                                        "Receive email updates about your account activity",
                                },
                                {
                                    key: "examReminders",
                                    title: "Exam Reminders",
                                    description:
                                        "Get notified about upcoming exams and deadlines",
                                },
                                {
                                    key: "resultNotifications",
                                    title: "Result Notifications",
                                    description:
                                        "Receive alerts when exam results are published",
                                },
                                {
                                    key: "marketingEmails",
                                    title: "Marketing Emails",
                                    description:
                                        "Stay updated with news, tips, and special offers",
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
                                onClick={handleNotificationUpdate}
                                className="bg-green-900 hover:bg-green-800 cursor-pointer text-white font-bold"
                            >
                                <Save className="mr-2 h-5 w-5" />
                                Save Preferences
                            </Button>
                        </div>
                    </Card>
                </div>
            )}

            {/* Preferences Tab */}
            {activeTab === "preferences" && (
                <div className="space-y-6">
                    <Card className="p-6 sm:p-8 bg-white border border-gray-200 rounded-2xl">
                        <h3 className="text-xl font-bold text-gray-900 mb-6">
                            General Preferences
                        </h3>

                        <form
                            onSubmit={handlePreferencesUpdate}
                            className="space-y-6"
                        >
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Language
                                </label>
                                <select
                                    value={preferences.language}
                                    onChange={(e) =>
                                        setPreferences({
                                            ...preferences,
                                            language: e.target.value,
                                        })
                                    }
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-900 focus:border-transparent"
                                >
                                    <option value="en">English</option>
                                    <option value="fr">French</option>
                                    <option value="es">Spanish</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Timezone
                                </label>
                                <select
                                    value={preferences.timezone}
                                    onChange={(e) =>
                                        setPreferences({
                                            ...preferences,
                                            timezone: e.target.value,
                                        })
                                    }
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-900 focus:border-transparent"
                                >
                                    <option value="WAT">
                                        West Africa Time (WAT)
                                    </option>
                                    <option value="GMT">
                                        Greenwich Mean Time (GMT)
                                    </option>
                                    <option value="EST">
                                        Eastern Standard Time (EST)
                                    </option>
                                </select>
                            </div>

                            <Button
                                type="submit"
                                size="lg"
                                className="bg-green-900 hover:bg-green-800 cursor-pointer text-white font-bold"
                            >
                                <Save className="mr-2 h-5 w-5" />
                                Save Preferences
                            </Button>
                        </form>
                    </Card>
                </div>
            )}
        </main>
    );
}
