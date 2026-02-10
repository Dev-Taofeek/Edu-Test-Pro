"use client";

import React, { useState, useMemo } from "react";
import {
    BarChart,
    Download,
    TrendingUp,
    Users,
    Award,
    FileText,
    Calendar,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useAdminStudents } from "@/hooks/useAdminStudents";
import { useAdminExams } from "@/hooks/useAdminExams";

export default function Reports({ currentAdminId }) {
    const [dateRange, setDateRange] = useState("last30");
    const { students, loading: studentsLoading } =
        useAdminStudents(currentAdminId);
    const { exams, loading: examsLoading } = useAdminExams(currentAdminId);

    // Calculate stats from real data
    const stats = useMemo(() => {
        const totalExams = exams.length;
        const totalStudents = students.length;

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

        const totalExamsCompleted = students.reduce(
            (acc, s) => acc + (s.examsTaken?.length || 0),
            0,
        );
        const completionRate =
            totalExams > 0
                ? Math.round(
                      (totalExamsCompleted / (totalStudents * totalExams)) *
                          100,
                  )
                : 0;

        // Calculate pass rate (assuming passing is >= 50%)
        const passedExams = allScores.filter((score) => score >= 50).length;
        const passRate = allScores.length
            ? Math.round((passedExams / allScores.length) * 100)
            : 0;

        return {
            totalExams,
            totalStudents,
            averageScore,
            completionRate: Math.min(completionRate, 100), // Cap at 100%
            passRate,
            trend: "+12%", // This would need historical data to calculate
        };
    }, [students, exams]);

    // Get top performers
    const topPerformers = useMemo(() => {
        return students
            .map((student) => {
                const scores =
                    student.examsTaken?.map((exam) => exam.score) || [];
                const avgScore = scores.length
                    ? Math.round(
                          scores.reduce((a, b) => a + b, 0) / scores.length,
                      )
                    : 0;

                return {
                    name:
                        student.name ||
                        `${student.firstName} ${student.lastName}`,
                    score: avgScore,
                    exams: student.examsTaken?.length || 0,
                };
            })
            .filter((student) => student.exams > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, 5)
            .map((student, index) => ({
                rank: index + 1,
                ...student,
            }));
    }, [students]);

    // Process exam performance data
    const examPerformance = useMemo(() => {
        return exams
            .map((exam) => {
                // Get students who took this exam
                const examStudents = students.filter((student) =>
                    student.examsTaken?.some(
                        (taken) => taken.examId === exam.id,
                    ),
                );

                const examScores = examStudents.map((student) => {
                    const examTaken = student.examsTaken.find(
                        (taken) => taken.examId === exam.id,
                    );
                    return examTaken?.score || 0;
                });

                const avgScore = examScores.length
                    ? Math.round(
                          examScores.reduce((a, b) => a + b, 0) /
                              examScores.length,
                      )
                    : 0;

                const passedCount = examScores.filter(
                    (score) => score >= 50,
                ).length;
                const passRate = examScores.length
                    ? Math.round((passedCount / examScores.length) * 100)
                    : 0;

                return {
                    exam: exam.title,
                    students: examStudents.length,
                    avgScore,
                    passRate,
                    date:
                        exam.createdAt?.toDate?.().toLocaleDateString() ||
                        exam.created ||
                        "N/A",
                };
            })
            .slice(0, 10); // Limit to 10 most recent exams
    }, [exams, students]);

    // Subject analysis (group by course name)
    const subjectAnalysis = useMemo(() => {
        const courseMap = new Map();

        exams.forEach((exam) => {
            const course = exam.course || "Uncategorized";

            if (!courseMap.has(course)) {
                courseMap.set(course, {
                    subject: course,
                    totalScore: 0,
                    studentCount: 0,
                    examCount: 0,
                });
            }

            const courseData = courseMap.get(course);
            courseData.examCount++;

            // Get students who took this exam
            const examStudents = students.filter((student) =>
                student.examsTaken?.some((taken) => taken.examId === exam.id),
            );

            examStudents.forEach((student) => {
                const examTaken = student.examsTaken.find(
                    (taken) => taken.examId === exam.id,
                );
                if (examTaken) {
                    courseData.totalScore += examTaken.score || 0;
                    courseData.studentCount++;
                }
            });
        });

        return Array.from(courseMap.values())
            .map((course) => ({
                subject: course.subject,
                avgScore: course.studentCount
                    ? Math.round(course.totalScore / course.studentCount)
                    : 0,
                students: course.studentCount,
                exams: course.examCount,
            }))
            .sort((a, b) => b.avgScore - a.avgScore);
    }, [exams, students]);

    const loading = studentsLoading || examsLoading;

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <div className="w-12 h-12 border-4 border-green-700 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-gray-700 text-lg font-semibold">
                    Loading reports...
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                        View Reports
                    </h1>
                    <p className="text-gray-600 mt-1">
                        Analytics and performance insights
                    </p>
                </div>
                <div className="flex gap-3">
                    <select
                        value={dateRange}
                        onChange={(e) => setDateRange(e.target.value)}
                        className="px-4 py-2 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-900 focus:border-transparent font-semibold cursor-pointer"
                    >
                        <option value="last7">Last 7 Days</option>
                        <option value="last30">Last 30 Days</option>
                        <option value="last90">Last 90 Days</option>
                        <option value="all">All Time</option>
                    </select>
                    <Button
                        size="sm"
                        className="bg-green-900 hover:bg-green-800 cursor-pointer text-white font-bold"
                    >
                        <Download className="mr-2 h-4 w-4" />
                        Export Report
                    </Button>
                </div>
            </div>

            {/* Overview Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card className="p-6 bg-white border border-gray-200 rounded-2xl">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                            <FileText className="h-6 w-6 text-blue-700" />
                        </div>
                        <div className="flex items-center gap-1 text-green-700 text-sm font-semibold">
                            <TrendingUp className="h-4 w-4" />
                            {stats.trend}
                        </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">Total Exams</p>
                    <p className="text-3xl font-bold text-gray-900">
                        {stats.totalExams}
                    </p>
                </Card>

                <Card className="p-6 bg-white border border-gray-200 rounded-2xl">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                            <Users className="h-6 w-6 text-green-700" />
                        </div>
                        <div className="flex items-center gap-1 text-green-700 text-sm font-semibold">
                            <TrendingUp className="h-4 w-4" />
                            +8%
                        </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">Total Students</p>
                    <p className="text-3xl font-bold text-gray-900">
                        {stats.totalStudents}
                    </p>
                </Card>

                <Card className="p-6 bg-white border border-gray-200 rounded-2xl">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                            <Award className="h-6 w-6 text-purple-700" />
                        </div>
                        <div className="flex items-center gap-1 text-green-700 text-sm font-semibold">
                            <TrendingUp className="h-4 w-4" />
                            +5%
                        </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">Average Score</p>
                    <p className="text-3xl font-bold text-gray-900">
                        {stats.averageScore}%
                    </p>
                </Card>
            </div>

            {/* Performance Metrics */}
            <div className="grid lg:grid-cols-2 gap-6">
                <Card className="p-6 bg-white border border-gray-200 rounded-2xl">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">
                        Key Metrics
                    </h3>
                    <div className="space-y-4">
                        <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-semibold text-gray-700">
                                    Completion Rate
                                </span>
                                <span className="text-sm font-bold text-green-700">
                                    {stats.completionRate}%
                                </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className="bg-green-700 h-2 rounded-full transition-all duration-300"
                                    style={{
                                        width: `${stats.completionRate}%`,
                                    }}
                                />
                            </div>
                        </div>

                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-semibold text-gray-700">
                                    Pass Rate
                                </span>
                                <span className="text-sm font-bold text-blue-700">
                                    {stats.passRate}%
                                </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className="bg-blue-700 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${stats.passRate}%` }}
                                />
                            </div>
                        </div>
                    </div>
                </Card>

                <Card className="p-6 bg-white border border-gray-200 rounded-2xl">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold text-gray-900">
                            Top Performers
                        </h3>
                        <span className="text-sm text-gray-600">
                            Top 5 Students
                        </span>
                    </div>
                    {topPerformers.length === 0 ? (
                        <div className="text-center py-8">
                            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-600 font-semibold">
                                No student data available yet
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {topPerformers.map((student) => (
                                <div
                                    key={student.rank}
                                    className="flex items-center gap-4 p-3 border border-gray-200 rounded-xl hover:border-green-700 transition-colors"
                                >
                                    <div
                                        className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${
                                            student.rank === 1
                                                ? "bg-yellow-100 text-yellow-700"
                                                : student.rank === 2
                                                  ? "bg-gray-200 text-gray-700"
                                                  : student.rank === 3
                                                    ? "bg-orange-100 text-orange-700"
                                                    : "bg-gray-100 text-gray-600"
                                        }`}
                                    >
                                        {student.rank}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-gray-900 truncate">
                                            {student.name}
                                        </p>
                                        <p className="text-xs text-gray-600">
                                            {student.exams} exams completed
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-lg font-bold text-green-700">
                                            {student.score}%
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </Card>
            </div>

            {/* Exam Performance */}
            <Card className="p-6 bg-white border border-gray-200 rounded-2xl">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-1">
                            Exam Performance
                        </h3>
                        <p className="text-sm text-gray-600">
                            Overview of exam results
                        </p>
                    </div>
                </div>

                {examPerformance.length === 0 ? (
                    <div className="text-center py-12">
                        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 font-semibold">
                            No exam data available yet
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200">
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                                        Exam Title
                                    </th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                                        Students
                                    </th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                                        Avg Score
                                    </th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                                        Pass Rate
                                    </th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                                        Date
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {examPerformance.map((exam, idx) => (
                                    <tr
                                        key={idx}
                                        className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                                    >
                                        <td className="py-4 px-4">
                                            <span className="font-semibold text-gray-900">
                                                {exam.exam}
                                            </span>
                                        </td>
                                        <td className="py-4 px-4">
                                            <span className="text-sm text-gray-900">
                                                {exam.students}
                                            </span>
                                        </td>
                                        <td className="py-4 px-4">
                                            <span className="text-sm font-semibold text-gray-900">
                                                {exam.avgScore}%
                                            </span>
                                        </td>
                                        <td className="py-4 px-4">
                                            <span
                                                className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                                                    exam.passRate >= 80
                                                        ? "bg-green-100 text-green-700"
                                                        : exam.passRate >= 60
                                                          ? "bg-yellow-100 text-yellow-700"
                                                          : "bg-red-100 text-red-700"
                                                }`}
                                            >
                                                {exam.passRate}%
                                            </span>
                                        </td>
                                        <td className="py-4 px-4">
                                            <span className="text-sm text-gray-600 flex items-center gap-1">
                                                <Calendar className="h-4 w-4" />
                                                {exam.date}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>

            {/* Subject Analysis */}
            <Card className="p-6 bg-white border border-gray-200 rounded-2xl">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-1">
                            Subject Analysis
                        </h3>
                        <p className="text-sm text-gray-600">
                            Performance breakdown by course
                        </p>
                    </div>
                </div>

                {subjectAnalysis.length === 0 ? (
                    <div className="text-center py-12">
                        <BarChart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 font-semibold">
                            No subject data available yet
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {subjectAnalysis.map((subject, idx) => (
                            <div
                                key={idx}
                                className="p-4 border-2 border-gray-200 rounded-xl hover:border-green-700 transition-colors"
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <div>
                                        <h4 className="font-bold text-gray-900 mb-1">
                                            {subject.subject}
                                        </h4>
                                        <p className="text-sm text-gray-600">
                                            {subject.students} students •{" "}
                                            {subject.exams} exams
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-2xl font-bold text-gray-900">
                                            {subject.avgScore}%
                                        </p>
                                        <p className="text-xs text-gray-600">
                                            Average
                                        </p>
                                    </div>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className={`h-2 rounded-full transition-all duration-300 ${
                                            subject.avgScore >= 80
                                                ? "bg-green-700"
                                                : subject.avgScore >= 60
                                                  ? "bg-yellow-600"
                                                  : "bg-red-600"
                                        }`}
                                        style={{
                                            width: `${subject.avgScore}%`,
                                        }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </Card>
        </div>
    );
}
