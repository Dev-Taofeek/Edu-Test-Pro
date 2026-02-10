"use client";

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
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { useStudents } from "@/hooks/useStudents";
import { useAdminExams } from "@/hooks/useAdminExams";
import { useAdminStudents } from "@/hooks/useAdminStudents";

export default function AdminDashboard({ currentAdminId }) {
    const { students, loading } = useStudents(currentAdminId);
    const { exams: activeExams, loading: examsLoading } =
        useAdminExams(currentAdminId);
    const { students: recentStudents, loading: studentsLoading } =
        useAdminStudents(currentAdminId);

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

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                    Admin Dashboard
                </h1>
                <p className="text-gray-600 mt-1">
                    Overview of your examination management system
                </p>
            </div>

            {/* Stats Cards */}
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
                    {loading ? (
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
                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                            <BarChart className="h-6 w-6 text-blue-700" />
                        </div>
                        <Link href={"/dashboard/admin/reports"}>
                            <Button
                                size="sm"
                                className="bg-blue-700 hover:bg-blue-800 text-white cursor-pointer font-semibold"
                            >
                                View Reports
                            </Button>
                        </Link>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">Exam Reports</p>
                    <p className="text-3xl font-bold text-gray-900">
                        {activeExams.length} Reports
                    </p>
                </Card>
            </div>

            {/* Exam Management */}
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

                {/* Desktop Table */}
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
                                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                                        Actions
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
                                        <td className="py-4 px-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    className="p-2 hover:bg-gray-100 rounded-lg cursor-pointer"
                                                    title="View"
                                                >
                                                    <Eye className="h-4 w-4 text-gray-600" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Mobile Cards */}
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
                                <div className="flex gap-2">
                                    <button className="flex-1 px-3 py-2 bg-green-900 hover:bg-green-800 text-white rounded-lg text-sm font-semibold cursor-pointer">
                                        <Edit className="h-4 w-4 inline mr-1" />
                                        Edit
                                    </button>
                                    <button className="px-3 py-2 border-2 border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg cursor-pointer">
                                        <Eye className="h-4 w-4" />
                                    </button>
                                    <button className="px-3 py-2 border-2 border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg cursor-pointer">
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </Card>

            {/* Student Management */}
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

                {/* Desktop Table */}
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
                                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                                        Actions
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
                                        <td className="py-4 px-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    className="p-2 hover:bg-gray-100 rounded-lg cursor-pointer"
                                                    title="View Details"
                                                >
                                                    <Eye className="h-4 w-4 text-gray-600" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Mobile Cards */}
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
                                    <button className="p-2 hover:bg-gray-100 rounded-lg cursor-pointer">
                                        <Eye className="h-4 w-4 text-gray-600" />
                                    </button>
                                </div>
                                <div className="text-sm text-gray-600">
                                    Exams taken:{" "}
                                    {student.examsCompleted ||
                                        student.examsTaken?.length ||
                                        0}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </Card>
        </div>
    );
}
