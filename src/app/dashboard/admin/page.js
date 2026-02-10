"use client";

import { useMemo } from "react";
import {
    Users,
    BookOpen,
    FileText,
    Calendar,
    Clock,
    Edit,
    Trash2,
    Eye,
    BarChart,
    Award,
    TrendingUp,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { useAuth } from "@/app/context/AuthContext";
import { useAdminExams } from "@/hooks/useAdminExams";
import { useAdminStudents } from "@/hooks/useAdminStudents";

export default function AdminDashboard() {
    const { user } = useAuth();
    const { exams: activeExams, loading: examsLoading } = useAdminExams(
        user?.uid,
    );
    const { students: recentStudents, loading: studentsLoading } =
        useAdminStudents(user?.uid);

    // Mirrors stats.averageScore logic in Reports.jsx
    const averageScore = useMemo(() => {
        const allScores = recentStudents.flatMap(
            (student) => student.examsTaken?.map((exam) => exam.score) || [],
        );
        return allScores.length
            ? Math.round(
                  allScores.reduce((acc, score) => acc + score, 0) /
                      allScores.length,
              )
            : null;
    }, [recentStudents]);

    const getStatusColor = (status) => {
        switch (status.toLowerCase()) {
            case "published":
                return "bg-green-100 text-green-700";
            case "draft":
                return "bg-gray-100 text-gray-700";
            case "archived":
                return "bg-red-100 text-red-700";
            default:
                return "bg-gray-100 text-gray-700";
        }
    };

    const getScoreColor = (score) => {
        if (score === null || score === undefined)
            return "bg-gray-100 text-gray-500";
        if (score >= 70) return "bg-green-100 text-green-700";
        if (score >= 50) return "bg-yellow-100 text-yellow-700";
        return "bg-red-100 text-red-700";
    };

    const formatScore = (score) => {
        if (score === null || score === undefined) return "N/A";
        return `${Math.round(score)}%`;
    };

    // Compute average score for a student from their examsTaken array
    const getStudentAvgScore = (student) => {
        if (!student.examsTaken || student.examsTaken.length === 0) return null;
        return Math.round(
            student.examsTaken.reduce((acc, exam) => acc + exam.score, 0) /
                student.examsTaken.length,
        );
    };

    // Compute average score for an exam by cross-referencing students who took it
    // (mirrors the subject analysis logic in Reports.jsx)
    const getExamAvgScore = (exam) => {
        const examScores = recentStudents
            .filter((student) =>
                student.examsTaken?.some((taken) => taken.examId === exam.id),
            )
            .map((student) => {
                const taken = student.examsTaken.find(
                    (t) => t.examId === exam.id,
                );
                return taken?.score ?? 0;
            });

        if (examScores.length === 0) return null;
        return Math.round(
            examScores.reduce((acc, s) => acc + s, 0) / examScores.length,
        );
    };

    if (!user) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-green-900 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-700 font-semibold">
                        Loading dashboard...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                    Admin Dashboard
                </h1>
                <p className="text-gray-600 mt-1">
                    Welcome back, {user.firstName}! Overview of your examination
                    management system
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                <Card className="p-6 bg-white border border-gray-200 rounded-2xl">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                            <FileText className="h-6 w-6 text-blue-700" />
                        </div>
                        <Link href={"/dashboard/admin/create-exam"}>
                            <Button
                                size="sm"
                                className="bg-blue-700 hover:bg-blue-800 text-white cursor-pointer font-semibold"
                            >
                                Create Exam
                            </Button>
                        </Link>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">Total Exams</p>
                    {examsLoading ? (
                        <p className="text-gray-700 font-semibold">
                            Loading...
                        </p>
                    ) : (
                        <p className="text-3xl font-bold text-gray-900">
                            {activeExams.length} Exams
                        </p>
                    )}
                </Card>

                <Card className="p-6 bg-white border border-gray-200 rounded-2xl">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                            <Users className="h-6 w-6 text-green-700" />
                        </div>
                        <Link href={"/dashboard/admin/manage-students"}>
                            <Button
                                size="sm"
                                className="bg-green-700 hover:bg-green-800 text-white cursor-pointer font-semibold"
                            >
                                Manage Students
                            </Button>
                        </Link>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">
                        Active Students
                    </p>
                    {studentsLoading ? (
                        <p className="text-gray-700 font-semibold">
                            Loading...
                        </p>
                    ) : (
                        <p className="text-3xl font-bold text-gray-900">
                            {recentStudents.length} Students
                        </p>
                    )}
                </Card>

                <Card className="p-6 bg-white border border-gray-200 rounded-2xl">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                            <Award className="h-6 w-6 text-purple-700" />
                        </div>
                        <Link href={"/dashboard/admin/reports"}>
                            <Button
                                size="sm"
                                className="bg-purple-700 hover:bg-purple-800 text-white cursor-pointer font-semibold"
                            >
                                View Reports
                            </Button>
                        </Link>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">Average Score</p>
                    {studentsLoading ? (
                        <p className="text-gray-700 font-semibold">
                            Loading...
                        </p>
                    ) : (
                        <p className="text-3xl font-bold text-gray-900">
                            {averageScore !== null ? `${averageScore}%` : "N/A"}
                        </p>
                    )}
                </Card>
            </div>

            {/* ── Exam Management ── */}
            <Card className="p-6 bg-white border border-gray-200 rounded-2xl">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 mb-1">
                            Exam Management
                        </h2>
                        <p className="text-sm text-gray-600">
                            Overview of all active and upcoming exams
                        </p>
                    </div>
                </div>

                {/* Desktop table */}
                <div className="hidden lg:block overflow-x-auto">
                    {examsLoading ? (
                        <div className="text-center py-12">
                            <div className="w-8 h-8 border-4 border-blue-700 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                            <p className="text-gray-600">Loading exams...</p>
                        </div>
                    ) : activeExams.length === 0 ? (
                        <div className="text-center py-12">
                            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-600 font-semibold">
                                No exams created yet.
                            </p>
                        </div>
                    ) : (
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200">
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                                        Exam ID
                                    </th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                                        Title
                                    </th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                                        Duration
                                    </th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                                        Questions
                                    </th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                                        Status
                                    </th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                                        Created
                                    </th>
                                    {/* Changed: Actions → Avg. Score */}
                                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                                        Avg. Score
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {activeExams.map((exam) => (
                                    <tr
                                        key={exam.id}
                                        className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                                    >
                                        <td className="py-4 px-4 font-mono text-sm text-gray-900">
                                            {exam.id}
                                        </td>
                                        <td className="py-4 px-4 font-semibold text-gray-900">
                                            {exam.title}
                                        </td>
                                        <td className="py-4 px-4 text-sm text-gray-600">
                                            <div className="flex items-center gap-1">
                                                <Clock className="h-4 w-4" />
                                                {exam.duration} mins
                                            </div>
                                        </td>
                                        <td className="py-4 px-4 text-sm text-gray-900 font-semibold">
                                            {exam.totalQuestions}
                                        </td>
                                        <td className="py-4 px-4">
                                            <span
                                                className={`px-3 py-1 rounded-lg text-xs font-semibold ${getStatusColor(
                                                    exam.status,
                                                )}`}
                                            >
                                                {exam.status}
                                            </span>
                                        </td>
                                        <td className="py-4 px-4 text-sm text-gray-600">
                                            <div className="flex items-center gap-1">
                                                <Calendar className="h-4 w-4" />
                                                {exam.created ||
                                                    exam.createdAt
                                                        ?.toDate()
                                                        .toLocaleDateString()}
                                            </div>
                                        </td>
                                        {/* Changed: Eye button → Avg. Score badge */}
                                        <td className="py-4 px-4">
                                            <div className="flex items-center justify-end">
                                                <span
                                                    className={`px-3 py-1 rounded-lg text-xs font-semibold ${getScoreColor(
                                                        getExamAvgScore(exam),
                                                    )}`}
                                                >
                                                    {formatScore(
                                                        getExamAvgScore(exam),
                                                    )}
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Mobile cards */}
                <div className="lg:hidden space-y-4">
                    {examsLoading ? (
                        <div className="text-center py-12">
                            <div className="w-8 h-8 border-4 border-blue-700 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                            <p className="text-gray-600">Loading exams...</p>
                        </div>
                    ) : activeExams.length === 0 ? (
                        <div className="text-center py-12">
                            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-600 font-semibold">
                                No exams created yet.
                            </p>
                        </div>
                    ) : (
                        activeExams.map((exam) => (
                            <div
                                key={exam.id}
                                className="p-4 border border-gray-200 rounded-xl hover:border-green-700 transition-colors"
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div>
                                        <p className="font-mono text-xs text-gray-600 mb-1">
                                            {exam.id}
                                        </p>
                                        <h3 className="font-bold text-gray-900">
                                            {exam.title}
                                        </h3>
                                    </div>
                                    <span
                                        className={`px-3 py-1 rounded-lg text-xs font-semibold ${getStatusColor(
                                            exam.status,
                                        )}`}
                                    >
                                        {exam.status}
                                    </span>
                                </div>
                                <div className="grid grid-cols-2 gap-3 text-sm text-gray-600 mb-3">
                                    <div className="flex items-center gap-1">
                                        <Clock className="h-4 w-4" />
                                        {exam.duration} mins
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <BookOpen className="h-4 w-4" />
                                        {exam.totalQuestions} questions
                                    </div>
                                    <div className="flex items-center gap-1 col-span-2">
                                        <Calendar className="h-4 w-4" />
                                        {exam.created ||
                                            exam.createdAt
                                                ?.toDate()
                                                .toLocaleDateString()}
                                    </div>
                                </div>
                                {/* Changed: Edit/Eye/Trash buttons → Avg. Score row */}
                                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                                    <span className="text-sm text-gray-600 font-medium">
                                        Avg. Score
                                    </span>
                                    <span
                                        className={`px-3 py-1 rounded-lg text-xs font-semibold ${getScoreColor(
                                            getExamAvgScore(exam),
                                        )}`}
                                    >
                                        {formatScore(getExamAvgScore(exam))}
                                    </span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </Card>

            {/* ── Recent Students ── */}
            <Card className="p-6 bg-white border border-gray-200 rounded-2xl">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 mb-1">
                            Recent Students
                        </h2>
                        <p className="text-sm text-gray-600">
                            Students who recently took your exams
                        </p>
                    </div>
                    <Link href="/dashboard/admin/manage-students">
                        <Button
                            size="sm"
                            variant="outline"
                            className="border-2 cursor-pointer font-semibold"
                        >
                            View All
                        </Button>
                    </Link>
                </div>

                {/* Desktop table */}
                <div className="hidden lg:block overflow-x-auto">
                    {studentsLoading ? (
                        <div className="text-center py-12">
                            <div className="w-8 h-8 border-4 border-green-900 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                            <p className="text-gray-600">Loading students...</p>
                        </div>
                    ) : recentStudents.length === 0 ? (
                        <div className="text-center py-12">
                            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-600 font-semibold">
                                No students have taken your exams yet.
                            </p>
                        </div>
                    ) : (
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200">
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                                        Matric No
                                    </th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                                        Name
                                    </th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                                        Email
                                    </th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                                        Exams Taken
                                    </th>
                                    {/* Changed: Actions → Avg. Score */}
                                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                                        Avg. Score
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentStudents.slice(0, 5).map((student) => (
                                    <tr
                                        key={student.id}
                                        className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                                    >
                                        <td className="py-4 px-4 font-mono text-sm text-gray-900">
                                            {student.matricNo || "N/A"}
                                        </td>
                                        <td className="py-4 px-4 font-semibold text-gray-900">
                                            {student.name ||
                                                `${student.firstName} ${student.lastName}`}
                                        </td>
                                        <td className="py-4 px-4 text-sm text-gray-600">
                                            {student.email}
                                        </td>
                                        <td className="py-4 px-4 text-sm text-gray-900 font-semibold">
                                            {student.examsCompleted ||
                                                student.examsTaken?.length ||
                                                0}
                                        </td>
                                        {/* Changed: Eye button → Avg. Score badge */}
                                        <td className="py-4 px-4">
                                            <div className="flex items-center justify-end">
                                                <span
                                                    className={`px-3 py-1 rounded-lg text-xs font-semibold ${getScoreColor(
                                                        getStudentAvgScore(
                                                            student,
                                                        ),
                                                    )}`}
                                                >
                                                    {formatScore(
                                                        getStudentAvgScore(
                                                            student,
                                                        ),
                                                    )}
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Mobile cards */}
                <div className="lg:hidden space-y-4">
                    {studentsLoading ? (
                        <div className="text-center py-12">
                            <div className="w-8 h-8 border-4 border-green-900 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                            <p className="text-gray-600">Loading students...</p>
                        </div>
                    ) : recentStudents.length === 0 ? (
                        <div className="text-center py-12">
                            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-600 font-semibold">
                                No students have taken your exams yet.
                            </p>
                        </div>
                    ) : (
                        recentStudents.slice(0, 5).map((student) => (
                            <div
                                key={student.id}
                                className="p-4 border border-gray-200 rounded-xl hover:border-green-700 transition-colors"
                            >
                                <div className="flex items-start justify-between mb-2">
                                    <div>
                                        <p className="font-mono text-xs text-gray-600 mb-1">
                                            {student.matricNo || "N/A"}
                                        </p>
                                        <h3 className="font-bold text-gray-900">
                                            {student.name ||
                                                `${student.firstName} ${student.lastName}`}
                                        </h3>
                                        <p className="text-sm text-gray-600">
                                            {student.email}
                                        </p>
                                    </div>
                                    {/* Changed: Eye button → Avg. Score badge */}
                                    <span
                                        className={`px-3 py-1 rounded-lg text-xs font-semibold ${getScoreColor(
                                            getStudentAvgScore(student),
                                        )}`}
                                    >
                                        {formatScore(
                                            getStudentAvgScore(student),
                                        )}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between text-sm text-gray-600 pt-2 border-t border-gray-100">
                                    <span>
                                        Exams taken:{" "}
                                        {student.examsCompleted ||
                                            student.examsTaken?.length ||
                                            0}
                                    </span>
                                    <span className="font-medium text-gray-700">
                                        Avg. Score
                                    </span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </Card>
        </div>
    );
}
