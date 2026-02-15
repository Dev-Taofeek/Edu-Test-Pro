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
    X,
    BookOpen,
    Clock,
    Award,
    Phone,
    Hash,
    Calendar,
    TrendingUp,
    TrendingDown,
    Minus,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/app/context/AuthContext";
import { useAdminStudents } from "@/hooks/useAdminStudents";
import { useAdminExams } from "@/hooks/useAdminExams";
import { doc, updateDoc, arrayUnion, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Toast } from "@/components/ui/Toast";

// ── Student Detail Modal ──────────────────────────────────────────────────────
function StudentDetailModal({ student, adminExams, onClose }) {
    if (!student) return null;

    const avgScore =
        student.examsTaken && student.examsTaken.length > 0
            ? Math.round(
                  student.examsTaken.reduce((acc, e) => acc + e.score, 0) /
                      student.examsTaken.length,
              )
            : null;

    // Cross-reference admin exams with student's examsTaken
    const examRows = adminExams.map((exam) => {
        const taken = student.examsTaken?.find((t) => t.examId === exam.id);
        return {
            id: exam.id,
            title: exam.title,
            course: exam.course || "—",
            duration: exam.duration,
            totalQuestions: exam.totalQuestions,
            taken: !!taken,
            score: taken?.score ?? null,
            dateTaken: taken?.dateTaken || taken?.completedAt || null,
        };
    });

    const takenExams = examRows.filter((e) => e.taken);
    const notTakenExams = examRows.filter((e) => !e.taken);

    const getScoreBadge = (score) => {
        if (score === null)
            return {
                bg: "bg-gray-100",
                text: "text-gray-500",
                label: "Not taken",
            };
        if (score >= 70)
            return {
                bg: "bg-green-100",
                text: "text-green-700",
                label: `${score}%`,
            };
        if (score >= 50)
            return {
                bg: "bg-yellow-100",
                text: "text-yellow-700",
                label: `${score}%`,
            };
        return { bg: "bg-red-100", text: "text-red-700", label: `${score}%` };
    };

    const getScoreBar = (score) => {
        if (score >= 70) return "bg-green-500";
        if (score >= 50) return "bg-yellow-500";
        return "bg-red-500";
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{
                backgroundColor: "rgba(0,0,0,0.55)",
                backdropFilter: "blur(4px)",
            }}
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header strip */}
                <div className="bg-green-900 px-6 py-5 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center text-white text-2xl font-bold">
                            {student.firstName?.charAt(0) ||
                                student.name?.charAt(0) ||
                                "?"}
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">
                                {student.name ||
                                    `${student.firstName} ${student.lastName}`}
                            </h2>
                            <p className="text-green-200 text-sm">
                                {student.matricNo || "No matric number"}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-9 h-9 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-colors cursor-pointer"
                    >
                        <X className="h-5 w-5 text-white" />
                    </button>
                </div>

                {/* Scrollable body */}
                <div className="overflow-y-auto flex-1 p-6 space-y-6">
                    {/* Quick stats row */}
                    <div className="grid grid-cols-3 gap-3">
                        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 text-center">
                            <p className="text-2xl font-bold text-blue-700">
                                {takenExams.length}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                                Exams Taken
                            </p>
                        </div>
                        <div className="bg-purple-50 border border-purple-100 rounded-2xl p-4 text-center">
                            <p className="text-2xl font-bold text-purple-700">
                                {avgScore !== null ? `${avgScore}%` : "—"}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                                Avg Score
                            </p>
                        </div>
                        <div
                            className={`rounded-2xl p-4 text-center border ${
                                student.status === "active"
                                    ? "bg-green-50 border-green-100"
                                    : "bg-gray-50 border-gray-200"
                            }`}
                        >
                            <p
                                className={`text-2xl font-bold capitalize ${
                                    student.status === "active"
                                        ? "text-green-700"
                                        : "text-gray-600"
                                }`}
                            >
                                {student.status || "—"}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">Status</p>
                        </div>
                    </div>

                    {/* Personal info */}
                    <div>
                        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-3">
                            Personal Information
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {[
                                {
                                    icon: Mail,
                                    label: "Email",
                                    value: student.email,
                                },
                                {
                                    icon: Phone,
                                    label: "Phone",
                                    value: student.phone || "—",
                                },
                                {
                                    icon: Hash,
                                    label: "Matric No",
                                    value: student.matricNo || "—",
                                },
                                {
                                    icon: Calendar,
                                    label: "Joined",
                                    value:
                                        student.createdAt
                                            ?.toDate?.()
                                            .toLocaleDateString() ||
                                        student.joinedAt ||
                                        "—",
                                },
                            ].map(({ icon: Icon, label, value }) => (
                                <div
                                    key={label}
                                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl"
                                >
                                    <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center shrink-0">
                                        <Icon className="h-4 w-4 text-gray-600" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-xs text-gray-500">
                                            {label}
                                        </p>
                                        <p className="text-sm font-semibold text-gray-900 truncate">
                                            {value}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Exams taken */}
                    {takenExams.length > 0 && (
                        <div>
                            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-3">
                                Exams Taken ({takenExams.length})
                            </h3>
                            <div className="space-y-3">
                                {takenExams.map((exam) => {
                                    const badge = getScoreBadge(exam.score);
                                    return (
                                        <div
                                            key={exam.id}
                                            className="border-2 border-gray-100 hover:border-green-200 rounded-2xl p-4 transition-colors"
                                        >
                                            <div className="flex items-start justify-between gap-3 mb-3">
                                                <div className="min-w-0">
                                                    <p className="font-bold text-gray-900 truncate">
                                                        {exam.title}
                                                    </p>
                                                    <p className="text-xs text-gray-500 mt-0.5">
                                                        {exam.course} ·{" "}
                                                        {exam.totalQuestions}{" "}
                                                        questions ·{" "}
                                                        {exam.duration} mins
                                                    </p>
                                                </div>
                                                <span
                                                    className={`shrink-0 px-3 py-1 rounded-lg text-sm font-bold ${badge.bg} ${badge.text}`}
                                                >
                                                    {badge.label}
                                                </span>
                                            </div>
                                            {exam.score !== null && (
                                                <div>
                                                    <div className="w-full bg-gray-100 rounded-full h-2">
                                                        <div
                                                            className={`h-2 rounded-full transition-all duration-500 ${getScoreBar(exam.score)}`}
                                                            style={{
                                                                width: `${exam.score}%`,
                                                            }}
                                                        />
                                                    </div>
                                                    <div className="flex justify-between mt-1">
                                                        <span
                                                            className={`text-xs font-semibold ${exam.score >= 50 ? "text-green-600" : "text-red-600"}`}
                                                        >
                                                            {exam.score >= 50
                                                                ? "Passed"
                                                                : "Failed"}
                                                        </span>
                                                        {exam.dateTaken && (
                                                            <span className="text-xs text-gray-400">
                                                                {new Date(
                                                                    exam.dateTaken?.toDate?.() ||
                                                                        exam.dateTaken,
                                                                ).toLocaleDateString()}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Exams not taken */}
                    {notTakenExams.length > 0 && (
                        <div>
                            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-3">
                                Pending Exams ({notTakenExams.length})
                            </h3>
                            <div className="space-y-2">
                                {notTakenExams.map((exam) => (
                                    <div
                                        key={exam.id}
                                        className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-xl opacity-60"
                                    >
                                        <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center shrink-0">
                                            <BookOpen className="h-4 w-4 text-gray-500" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-gray-700 truncate">
                                                {exam.title}
                                            </p>
                                            <p className="text-xs text-gray-400">
                                                {exam.course} ·{" "}
                                                {exam.totalQuestions} questions
                                            </p>
                                        </div>
                                        <span className="shrink-0 px-2 py-1 bg-gray-200 text-gray-500 rounded-lg text-xs font-semibold">
                                            Not taken
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {adminExams.length === 0 && (
                        <div className="text-center py-8 text-gray-400">
                            <BookOpen className="h-10 w-10 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">No exams created yet</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-100 flex justify-end shrink-0">
                    <button
                        onClick={onClose}
                        className="px-5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors cursor-pointer text-sm"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function ManageStudents() {
    const { user } = useAuth();
    const { students, loading } = useAdminStudents(user?.uid);
    const { exams: adminExams, loading: examsLoading } = useAdminExams(
        user?.uid,
    );
    const [searchQuery, setSearchQuery] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    const [updatingStatus, setUpdatingStatus] = useState(null);
    const [toast, setToast] = useState(null);
    const [selectedStudent, setSelectedStudent] = useState(null);

    const showToast = (message, type = "success") => {
        setToast({ message, type });
    };

    const toggleStudentStatus = async (studentId, currentStatus) => {
        if (!user?.uid) return;
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
                    changedBy: user.uid,
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

    const stats = useMemo(() => {
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

    if (!user) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-green-900 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-700 font-semibold">Loading...</p>
                </div>
            </div>
        );
    }

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
        <main className="space-y-6">
            {/* Modal */}
            {selectedStudent && (
                <StudentDetailModal
                    student={selectedStudent}
                    adminExams={adminExams}
                    onClose={() => setSelectedStudent(null)}
                />
            )}

            {/* Toast */}
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
                                            onClick={() =>
                                                setSelectedStudent(student)
                                            }
                                        >
                                            <Eye className="mr-2 h-4 w-4" />
                                            View Details
                                        </Button>
                                        <a
                                            href={`https://mail.google.com/mail/?view=cm&to=${encodeURIComponent(student.email)}&su=${encodeURIComponent(`Message from Admin`)}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold cursor-pointer"
                                            >
                                                <Mail className="mr-2 h-4 w-4" />
                                                Send Email
                                            </Button>
                                        </a>
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
        </main>
    );
}
