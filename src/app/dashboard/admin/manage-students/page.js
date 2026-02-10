"use client";

import React, { useState, useMemo } from "react";
import {
    Users,
    Search,
    Eye,
    Mail,
    Ban,
    CheckCircle,
    Download,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useAdminStudents } from "@/hooks/useAdminStudents";
import { doc, updateDoc, arrayUnion, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Toast } from "@/components/ui/Toast";

export default function ManageStudents({ currentAdminId }) {
    const { students, loading } = useAdminStudents(currentAdminId);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    const [updatingStatus, setUpdatingStatus] = useState(null);
    const [toast, setToast] = useState(null);

    // Show toast notification
    const showToast = (message, type = "success") => {
        setToast({ message, type });
    };

    // Toggle student status
    const toggleStudentStatus = async (studentId, currentStatus) => {
        setUpdatingStatus(studentId);
        try {
            const newStatus =
                currentStatus === "active" ? "inactive" : "active";
            const studentRef = doc(db, "students", studentId);
            const now = Timestamp.now();

            await updateDoc(studentRef, {
                status: newStatus,
                statusHistory: arrayUnion({
                    status: newStatus,
                    changedBy: currentAdminId,
                    changedAt: now,
                }),
                lastUpdated: now,
            });

            showToast(
                `Student ${newStatus === "active" ? "activated" : "deactivated"} successfully!`,
                "success",
            );
        } catch (error) {
            console.error("Error updating student status:", error);
            showToast(
                "Failed to update student status. Please try again.",
                "error",
            );
        } finally {
            setUpdatingStatus(null);
        }
    };

    // Calculate stats using useMemo for performance
    const stats = useMemo(() => {
        // Calculate average score from all exams taken by all students
        const allScores = students.flatMap(
            (student) => student.examsTaken?.map((exam) => exam.score) || [],
        );

        const averageScore = allScores.length
            ? Math.round(
                  allScores.reduce((acc, score) => acc + score, 0) /
                      allScores.length,
              )
            : 0;

        return {
            totalStudents: students.length,
            activeStudents: students.filter((s) => s.status === "active")
                .length,
            inactiveStudents: students.filter((s) => s.status === "inactive")
                .length,
            averageScore,
        };
    }, [students]);

    // Filter students based on search and status
    const filteredStudents = useMemo(() => {
        return students.filter((student) => {
            const matchesSearch =
                student.name
                    ?.toLowerCase()
                    .includes(searchQuery.toLowerCase()) ||
                student.email
                    ?.toLowerCase()
                    .includes(searchQuery.toLowerCase()) ||
                student.matricNo
                    ?.toLowerCase()
                    .includes(searchQuery.toLowerCase()) ||
                `${student.firstName} ${student.lastName}`
                    ?.toLowerCase()
                    .includes(searchQuery.toLowerCase());

            const matchesStatus =
                filterStatus === "all" || student.status === filterStatus;

            return matchesSearch && matchesStatus;
        });
    }, [students, searchQuery, filterStatus]);

    const getStatusColor = (status) =>
        status === "active"
            ? "bg-green-100 text-green-700"
            : "bg-gray-100 text-gray-700";

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <div className="w-12 h-12 border-4 border-green-700 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-gray-700 text-lg font-semibold">
                    Loading students...
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Toast Notification */}
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                        Manage Students
                    </h1>
                    <p className="text-gray-600 mt-1">
                        View and manage students who took your exams
                    </p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="p-6 bg-white border border-gray-200 rounded-2xl">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">
                                Total Students
                            </p>
                            <p className="text-3xl font-bold text-gray-900">
                                {stats.totalStudents}
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                            <Users className="h-6 w-6 text-blue-700" />
                        </div>
                    </div>
                </Card>

                <Card className="p-6 bg-white border border-gray-200 rounded-2xl">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Active</p>
                            <p className="text-3xl font-bold text-green-700">
                                {stats.activeStudents}
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                            <CheckCircle className="h-6 w-6 text-green-700" />
                        </div>
                    </div>
                </Card>

                <Card className="p-6 bg-white border border-gray-200 rounded-2xl">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">
                                Inactive
                            </p>
                            <p className="text-3xl font-bold text-gray-700">
                                {stats.inactiveStudents}
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                            <Ban className="h-6 w-6 text-gray-700" />
                        </div>
                    </div>
                </Card>

                <Card className="p-6 bg-white border border-gray-200 rounded-2xl">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">
                                Avg Score
                            </p>
                            <p className="text-3xl font-bold text-purple-700">
                                {stats.averageScore}%
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                            <CheckCircle className="h-6 w-6 text-purple-700" />
                        </div>
                    </div>
                </Card>
            </div>

            {/* Search & Filter */}
            <Card className="p-4 bg-white border border-gray-200 rounded-2xl">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by name, email, or matric number..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-900 focus:border-transparent"
                        />
                    </div>

                    <div className="flex gap-2">
                        {["all", "active", "inactive"].map((status) => (
                            <button
                                key={status}
                                onClick={() => setFilterStatus(status)}
                                className={`px-4 py-3 rounded-xl font-semibold transition-colors cursor-pointer ${
                                    filterStatus === status
                                        ? "bg-green-900 text-white"
                                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                }`}
                            >
                                {status.charAt(0).toUpperCase() +
                                    status.slice(1)}
                            </button>
                        ))}
                    </div>

                    <Button
                        size="sm"
                        variant="outline"
                        className="border-2 border-gray-300 text-gray-700 hover:bg-gray-50 cursor-pointer font-semibold whitespace-nowrap"
                    >
                        <Download className="mr-2 h-4 w-4" />
                        Export
                    </Button>
                </div>
            </Card>

            {/* Students List */}
            <div className="space-y-4">
                {filteredStudents.length === 0 ? (
                    <Card className="p-12 bg-white border border-gray-200 rounded-2xl text-center">
                        <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-gray-900 mb-2">
                            {students.length === 0
                                ? "No students have taken your exams yet"
                                : "No students found"}
                        </h3>
                        <p className="text-gray-600">
                            {students.length === 0
                                ? "Students who take your exams will appear here"
                                : "Try adjusting your search or filter criteria"}
                        </p>
                    </Card>
                ) : (
                    filteredStudents.map((student) => (
                        <Card
                            key={student.id}
                            className="p-6 bg-white border-2 border-gray-200 rounded-2xl hover:border-green-700 transition-colors"
                        >
                            <div className="flex flex-col lg:flex-row gap-6">
                                {/* Avatar */}
                                <div className="flex items-center justify-center lg:justify-start">
                                    <div className="w-20 h-20 bg-green-900 rounded-2xl flex items-center justify-center text-white text-2xl font-bold">
                                        {student.firstName?.charAt(0) ||
                                            student.name?.charAt(0) ||
                                            "?"}
                                    </div>
                                </div>

                                {/* Student Details */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="text-xl font-bold text-gray-900">
                                            {student.name ||
                                                `${student.firstName} ${student.lastName}`}
                                        </h3>
                                        <span
                                            className={`px-3 py-1 rounded-lg text-xs font-semibold ${getStatusColor(student.status)}`}
                                        >
                                            {student.status}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600 mb-4">
                                        {student.matricNo}
                                    </p>

                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                                        <div>
                                            <p className="text-xs text-gray-600 mb-1">
                                                Email
                                            </p>
                                            <p className="text-sm font-semibold text-gray-900">
                                                {student.email}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-600 mb-1">
                                                Phone
                                            </p>
                                            <p className="text-sm font-semibold text-gray-900">
                                                {student.phone}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-600 mb-1">
                                                Exams Completed
                                            </p>
                                            <p className="text-sm font-semibold text-gray-900">
                                                {student.examsTaken?.length ||
                                                    0}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-600 mb-1">
                                                Average Score
                                            </p>
                                            <p className="text-sm font-semibold text-gray-900">
                                                {student.examsTaken &&
                                                student.examsTaken.length > 0
                                                    ? Math.round(
                                                          student.examsTaken.reduce(
                                                              (acc, exam) =>
                                                                  acc +
                                                                  exam.score,
                                                              0,
                                                          ) /
                                                              student.examsTaken
                                                                  .length,
                                                      )
                                                    : 0}
                                                %
                                            </p>
                                        </div>
                                    </div>

                                    {/* Buttons */}
                                    <div className="flex flex-wrap gap-2">
                                        <Button
                                            size="sm"
                                            className="bg-green-900 hover:bg-green-800 text-white font-semibold cursor-pointer"
                                        >
                                            <Eye className="mr-2 h-4 w-4" />
                                            View Details
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold cursor-pointer"
                                        >
                                            <Mail className="mr-2 h-4 w-4" />
                                            Send Email
                                        </Button>
                                        {student.status === "active" ? (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="border-2 border-orange-300 text-orange-700 hover:bg-orange-50 font-semibold cursor-pointer"
                                                onClick={() =>
                                                    toggleStudentStatus(
                                                        student.id,
                                                        student.status,
                                                    )
                                                }
                                                disabled={
                                                    updatingStatus ===
                                                    student.id
                                                }
                                            >
                                                {updatingStatus ===
                                                student.id ? (
                                                    <>
                                                        <div className="w-4 h-4 mr-2 border-2 border-orange-700 border-t-transparent rounded-full animate-spin"></div>
                                                        Updating...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Ban className="mr-2 h-4 w-4" />
                                                        Deactivate
                                                    </>
                                                )}
                                            </Button>
                                        ) : (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="border-2 border-green-300 text-green-700 hover:bg-green-50 font-semibold cursor-pointer"
                                                onClick={() =>
                                                    toggleStudentStatus(
                                                        student.id,
                                                        student.status,
                                                    )
                                                }
                                                disabled={
                                                    updatingStatus ===
                                                    student.id
                                                }
                                            >
                                                {updatingStatus ===
                                                student.id ? (
                                                    <>
                                                        <div className="w-4 h-4 mr-2 border-2 border-green-700 border-t-transparent rounded-full animate-spin"></div>
                                                        Updating...
                                                    </>
                                                ) : (
                                                    <>
                                                        <CheckCircle className="mr-2 h-4 w-4" />
                                                        Activate
                                                    </>
                                                )}
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
