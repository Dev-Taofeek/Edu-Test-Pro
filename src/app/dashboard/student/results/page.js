"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
    Award,
    TrendingUp,
    TrendingDown,
    CheckCircle,
    XCircle,
    Eye,
    Download,
    BarChart,
    Calendar,
    Clock,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/app/context/AuthContext";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
    calculateGrade,
    getPassStatus,
    getGradeColor,
    getPerformanceLabel,
    getPerformanceColor,
} from "@/utils/gradeUtils";

export default function Results() {
    const [selectedResult, setSelectedResult] = useState(null);
    const [loading, setLoading] = useState(true);
    const [studentData, setStudentData] = useState(null);
    const [examDetails, setExamDetails] = useState({});
    const { user } = useAuth();

    // Fetch student data
    useEffect(() => {
        const fetchData = async () => {
            if (!user?.uid) return;

            setLoading(true);
            try {
                const studentRef = doc(db, "students", user.uid);
                const studentSnap = await getDoc(studentRef);

                if (studentSnap.exists()) {
                    const data = studentSnap.data();
                    setStudentData(data);

                    // Fetch exam details for each completed exam
                    const examsTaken = data.examsTaken || [];
                    const examDetailsMap = {};

                    for (const takenExam of examsTaken) {
                        const examRef = doc(db, "exams", takenExam.examId);
                        const examSnap = await getDoc(examRef);
                        if (examSnap.exists()) {
                            examDetailsMap[takenExam.examId] = examSnap.data();
                        }
                    }

                    setExamDetails(examDetailsMap);
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user?.uid]);

    // Process results from examsTaken
    const results = useMemo(() => {
        if (!studentData?.examsTaken) return [];

        return studentData.examsTaken
            .map((exam) => {
                const examDetail = examDetails[exam.examId];
                const passingScore = examDetail?.passingScore || 50;
                const percentage = exam.score;
                const grade = calculateGrade(percentage);
                const status = getPassStatus(percentage, passingScore);

                return {
                    id: exam.examId,
                    examId: exam.examId,
                    title: examDetail?.title || exam.examId,
                    score: percentage,
                    percentage,
                    grade,
                    status,
                    passingScore,
                    completedAt: exam.completedAt?.toDate?.() || null,
                    date:
                        exam.completedAt?.toDate?.().toLocaleDateString() ||
                        "N/A",
                    time:
                        exam.completedAt?.toDate?.().toLocaleTimeString() ||
                        "N/A",
                };
            })
            .sort((a, b) => {
                // Sort by date, newest first
                if (!a.completedAt) return 1;
                if (!b.completedAt) return -1;
                return b.completedAt - a.completedAt;
            });
    }, [studentData, examDetails]);

    // Calculate stats
    const stats = useMemo(() => {
        if (results.length === 0) {
            return {
                averageScore: 0,
                totalExams: 0,
                passed: 0,
                failed: 0,
                trend: "stable",
            };
        }

        const averageScore =
            results.reduce((acc, r) => acc + r.percentage, 0) / results.length;
        const passed = results.filter((r) => r.status === "passed").length;
        const failed = results.filter((r) => r.status === "failed").length;

        // Simple trend calculation (comparing last 2 exams if available)
        let trend = "stable";
        if (results.length >= 2) {
            const recentScore = results[0].percentage;
            const previousScore = results[1].percentage;
            if (recentScore > previousScore + 5) trend = "improving";
            else if (recentScore < previousScore - 5) trend = "declining";
        }

        return {
            averageScore: Math.round(averageScore),
            totalExams: results.length,
            passed,
            failed,
            trend,
        };
    }, [results]);

    // Get strengths and weaknesses
    const insights = useMemo(() => {
        if (results.length === 0) {
            return {
                strengths: [],
                weaknesses: [],
            };
        }

        const sortedByScore = [...results].sort(
            (a, b) => b.percentage - a.percentage,
        );
        const topPerformers = sortedByScore
            .slice(0, 3)
            .filter((r) => r.status === "passed");
        const needsImprovement = sortedByScore
            .slice(-3)
            .filter((r) => r.status === "failed");

        const strengths = topPerformers.map(
            (r) =>
                `Excellent performance in ${r.title} (${r.percentage}% - Grade ${r.grade})`,
        );

        const weaknesses = needsImprovement.map(
            (r) =>
                `Focus more on ${r.title} (${r.percentage}% - Grade ${r.grade})`,
        );

        // Add generic insights if not enough data
        if (strengths.length === 0) {
            strengths.push("Keep working hard to improve your scores");
        }
        if (stats.averageScore >= 71) {
            strengths.push("Consistent performance across exams");
        }

        if (weaknesses.length === 0 && stats.averageScore < 71) {
            weaknesses.push("Practice more past questions before exams");
            weaknesses.push("Review concepts regularly");
        }

        return {
            strengths,
            weaknesses,
        };
    }, [results, stats.averageScore]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <div className="w-12 h-12 border-4 border-green-700 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-gray-700 text-lg font-semibold">
                    Loading results...
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                    My Results
                </h1>
                <p className="text-gray-600 mt-1">
                    View your examination performance and detailed analytics
                </p>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="p-6 bg-white border border-gray-200 rounded-2xl">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">
                                Average Score
                            </p>
                            <p className="text-3xl font-bold text-gray-900">
                                {stats.averageScore}%
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                            <BarChart className="h-6 w-6 text-purple-700" />
                        </div>
                    </div>
                </Card>

                <Card className="p-6 bg-white border border-gray-200 rounded-2xl">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">
                                Exams Taken
                            </p>
                            <p className="text-3xl font-bold text-gray-900">
                                {stats.totalExams}
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                            <Award className="h-6 w-6 text-blue-700" />
                        </div>
                    </div>
                </Card>

                <Card className="p-6 bg-white border border-gray-200 rounded-2xl">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Passed</p>
                            <p className="text-3xl font-bold text-gray-900">
                                {stats.passed}
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
                            <p className="text-sm text-gray-600 mb-1">Failed</p>
                            <p className="text-3xl font-bold text-gray-900">
                                {stats.failed}
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                            <XCircle className="h-6 w-6 text-red-600" />
                        </div>
                    </div>
                </Card>
            </div>

            {/* Performance Trend */}
            {results.length > 0 && (
                <Card className="p-6 bg-white border border-gray-200 rounded-2xl">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 mb-1">
                                Performance Overview
                            </h3>
                            <p className="text-sm text-gray-600">
                                Your examination performance summary
                            </p>
                        </div>
                        <div
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl ${
                                stats.trend === "improving"
                                    ? "bg-green-100"
                                    : stats.trend === "declining"
                                      ? "bg-red-100"
                                      : "bg-gray-100"
                            }`}
                        >
                            {stats.trend === "improving" ? (
                                <>
                                    <TrendingUp className="h-5 w-5 text-green-700" />
                                    <span className="font-bold text-green-900">
                                        Improving
                                    </span>
                                </>
                            ) : stats.trend === "declining" ? (
                                <>
                                    <TrendingDown className="h-5 w-5 text-red-600" />
                                    <span className="font-bold text-red-900">
                                        Declining
                                    </span>
                                </>
                            ) : (
                                <>
                                    <BarChart className="h-5 w-5 text-gray-700" />
                                    <span className="font-bold text-gray-900">
                                        Stable
                                    </span>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-6">
                        <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                            <div className="flex items-center gap-3 mb-3">
                                <CheckCircle className="h-6 w-6 text-green-700" />
                                <h4 className="font-bold text-gray-900">
                                    Strengths
                                </h4>
                            </div>
                            {insights.strengths.length > 0 ? (
                                <ul className="space-y-2 text-sm text-gray-700">
                                    {insights.strengths.map((strength, idx) => (
                                        <li
                                            key={idx}
                                            className="flex items-start"
                                        >
                                            <div className="w-1.5 h-1.5 bg-green-700 rounded-full mt-2 mr-3 shrink-0" />
                                            <span>{strength}</span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-sm text-gray-600">
                                    Take more exams to see your strengths
                                </p>
                            )}
                        </div>

                        <div className="p-4 bg-orange-50 border border-orange-200 rounded-xl">
                            <div className="flex items-center gap-3 mb-3">
                                <TrendingUp className="h-6 w-6 text-orange-600" />
                                <h4 className="font-bold text-gray-900">
                                    Areas for Improvement
                                </h4>
                            </div>
                            {insights.weaknesses.length > 0 ? (
                                <ul className="space-y-2 text-sm text-gray-700">
                                    {insights.weaknesses.map(
                                        (weakness, idx) => (
                                            <li
                                                key={idx}
                                                className="flex items-start"
                                            >
                                                <div className="w-1.5 h-1.5 bg-orange-600 rounded-full mt-2 mr-3 shrink-0" />
                                                <span>{weakness}</span>
                                            </li>
                                        ),
                                    )}
                                </ul>
                            ) : (
                                <p className="text-sm text-gray-600">
                                    Keep up the great work!
                                </p>
                            )}
                        </div>
                    </div>
                </Card>
            )}

            {/* Results List */}
            <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                    All Results ({results.length})
                </h3>

                {results.length === 0 ? (
                    <Card className="p-12 bg-white border border-gray-200 rounded-2xl text-center">
                        <Award className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-gray-900 mb-2">
                            No exam results yet
                        </h3>
                        <p className="text-gray-600">
                            Take your first exam to see your results here
                        </p>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {results.map((result) => (
                            <Card
                                key={result.id}
                                className="p-6 bg-white border-2 border-gray-200 rounded-2xl hover:border-green-700 transition-colors"
                            >
                                <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                                    {/* Score Circle */}
                                    <div className="w-20 h-20 rounded-2xl bg-gray-50 border-4 border-gray-200 flex flex-col items-center justify-center shrink-0">
                                        <span className="text-2xl font-bold text-gray-900">
                                            {result.percentage}%
                                        </span>
                                        <span
                                            className={`text-xs font-bold px-2 py-0.5 rounded ${getGradeColor(
                                                result.grade,
                                            )}`}
                                        >
                                            {result.grade}
                                        </span>
                                    </div>

                                    {/* Result Details */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-4 mb-3">
                                            <div>
                                                <h4 className="text-xl font-bold text-gray-900 mb-1">
                                                    {result.title}
                                                </h4>
                                                <p className="text-sm text-gray-600 font-mono">
                                                    {result.examId}
                                                </p>
                                            </div>
                                            <div
                                                className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 ${
                                                    result.status === "passed"
                                                        ? "bg-green-100 text-green-700"
                                                        : "bg-red-100 text-red-700"
                                                }`}
                                            >
                                                {result.status === "passed" ? (
                                                    <>
                                                        <CheckCircle className="h-3 w-3" />
                                                        Passed
                                                    </>
                                                ) : (
                                                    <>
                                                        <XCircle className="h-3 w-3" />
                                                        Failed
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
                                            <div>
                                                <p className="text-xs text-gray-600 mb-1">
                                                    Date Completed
                                                </p>
                                                <p className="text-sm font-semibold text-gray-900 flex items-center gap-1">
                                                    <Calendar className="h-4 w-4" />
                                                    {result.date}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-600 mb-1">
                                                    Time
                                                </p>
                                                <p className="text-sm font-semibold text-gray-900 flex items-center gap-1">
                                                    <Clock className="h-4 w-4" />
                                                    {result.time}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-600 mb-1">
                                                    Performance
                                                </p>
                                                <p
                                                    className={`text-sm font-semibold ${getPerformanceColor(result.percentage)}`}
                                                >
                                                    {getPerformanceLabel(
                                                        result.percentage,
                                                    )}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap gap-3">
                                            <div
                                                className={`px-4 py-2 rounded-lg text-sm font-semibold ${
                                                    result.status === "passed"
                                                        ? "bg-green-100 text-green-900"
                                                        : "bg-red-100 text-red-900"
                                                }`}
                                            >
                                                Score: {result.percentage}% •
                                                Grade: {result.grade}
                                            </div>
                                            <div className="px-4 py-2 rounded-lg text-sm font-semibold bg-gray-100 text-gray-900">
                                                Passing Score:{" "}
                                                {result.passingScore}%
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
