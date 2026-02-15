"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
    BookOpen,
    Clock,
    Calendar,
    Award,
    AlertCircle,
    CheckCircle,
    XCircle,
    ChevronRight,
    PlayCircle,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/app/context/AuthContext";
import {
    doc,
    getDoc,
    collection,
    query,
    where,
    getDocs,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { calculateGrade, getPassStatus } from "@/utils/gradeUtils";
import Link from "next/link";

export default function StudentDashboard() {
    const [examCode, setExamCode] = useState("");
    const { user } = useAuth();
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    const [studentData, setStudentData] = useState(null);
    const [availableExams, setAvailableExams] = useState([]);
    const [examDetails, setExamDetails] = useState({});
    const router = useRouter();

    // Fetch student data and available exams
    useEffect(() => {
        const fetchData = async () => {
            if (!user?.uid) return;

            setLoading(true);
            try {
                // Fetch student document
                const studentRef = doc(db, "students", user.uid);
                const studentSnap = await getDoc(studentRef);

                let studentInfo = null;
                if (studentSnap.exists()) {
                    studentInfo = studentSnap.data();
                    setStudentData(studentInfo);
                }

                // Fetch all published exams
                const examsRef = collection(db, "exams");
                const examsQuery = query(
                    examsRef,
                    where("status", "==", "published"),
                );
                const examsSnap = await getDocs(examsQuery);

                const exams = examsSnap.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));

                // Filter to only show public exams that haven't been completed
                const completedExamIds =
                    studentInfo?.examsTaken?.map((exam) => exam.examId) || [];

                const publicExams = exams.filter(
                    (exam) =>
                        exam.visibility === "public" &&
                        !completedExamIds.includes(exam.id),
                );

                setAvailableExams(publicExams);

                // Fetch exam details for completed exams
                if (studentInfo) {
                    const examsTaken = studentInfo.examsTaken || [];
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

    // Calculate stats from student data
    const stats = useMemo(() => {
        if (!studentData) {
            return {
                totalExams: 0,
                upcoming: 0,
                completed: 0,
                avgScore: 0,
            };
        }

        const completed = studentData.examsTaken?.length || 0;
        const upcoming = availableExams.length;
        const total = completed + upcoming;

        // Calculate average score
        const scores = studentData.examsTaken?.map((exam) => exam.score) || [];
        const avgScore = scores.length
            ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
            : 0;

        return {
            totalExams: total,
            upcoming,
            completed,
            avgScore,
        };
    }, [studentData, availableExams]);

    // Get completed exams with details
    const completedExams = useMemo(() => {
        if (!studentData?.examsTaken) return [];

        return studentData.examsTaken.map((exam) => {
            const examDetail = examDetails[exam.examId];
            const passingScore = examDetail?.passingScore || 50;
            const grade = calculateGrade(exam.score);
            const status = getPassStatus(exam.score, passingScore);

            return {
                id: exam.examId,
                examId: exam.examId,
                score: exam.score,
                grade,
                status,
                passingScore,
                completedAt:
                    exam.completedAt?.toDate?.().toLocaleDateString() || "N/A",
            };
        });
    }, [studentData, examDetails]);

    const handleStartExam = async (e) => {
        e.preventDefault();
        setError("");

        try {
            // Fetch exam by ID from Firebase
            const examRef = doc(db, "exams", examCode.trim());
            const examSnap = await getDoc(examRef);

            if (!examSnap.exists()) {
                setError("Exam not found. Please check the exam ID.");
                return;
            }

            const examData = examSnap.data();

            if (examData.status !== "published") {
                setError("This exam is not currently available.");
                return;
            }

            // Check if student has already taken this exam
            const alreadyTaken = studentData?.examsTaken?.some(
                (exam) => exam.examId === examCode.trim(),
            );

            if (alreadyTaken) {
                setError("You have already completed this exam.");
                return;
            }

            // Redirect to exam page
            router.push(`/exam/${examCode.trim()}`);
        } catch (err) {
            console.error("Error starting exam:", err);
            setError("Something went wrong. Please try again.");
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <div className="w-12 h-12 border-4 border-green-700 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-gray-700 text-lg font-semibold">
                    Loading dashboard...
                </p>
            </div>
        );
    }

    return (
        <main className="space-y-6">
            {/* Welcome Section */}
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                    Welcome Back,{" "}
                    {studentData?.firstName || user?.lastName || "Student"}!
                </h1>
                <p className="text-gray-600 mt-1">
                    Here&apos;s your examination dashboard overview
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <Card className="p-6 bg-white border border-gray-200 rounded-2xl">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">
                                Total Exams
                            </p>
                            <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                                {stats.totalExams}
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                            <BookOpen className="h-6 w-6 text-blue-700" />
                        </div>
                    </div>
                </Card>

                <Card className="p-6 bg-white border border-gray-200 rounded-2xl">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">
                                Available
                            </p>
                            <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                                {stats.upcoming}
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                            <Clock className="h-6 w-6 text-orange-600" />
                        </div>
                    </div>
                </Card>

                <Card className="p-6 bg-white border border-gray-200 rounded-2xl">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">
                                Completed
                            </p>
                            <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                                {stats.completed}
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
                                Avg Score
                            </p>
                            <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                                {stats.avgScore}%
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                            <Award className="h-6 w-6 text-purple-700" />
                        </div>
                    </div>
                </Card>
            </div>

            {/* Start New Exam */}
            <Card className="p-6 sm:p-8 bg-white border-t-4 border-t-green-900 rounded-2xl shadow-lg">
                <div className="flex items-start gap-4 mb-6">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center shrink-0">
                        <PlayCircle className="h-6 w-6 text-green-700" />
                    </div>
                    <div>
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                            Start New Exam
                        </h2>
                        <p className="text-gray-600">
                            Enter the unique exam ID or code provided by your
                            lecturer to begin your assessment.
                        </p>
                    </div>
                </div>

                <form onSubmit={handleStartExam} className="space-y-4">
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="flex-1">
                            <Input
                                label="Exam ID / Code"
                                type="text"
                                placeholder="e.g., OP-001"
                                value={examCode}
                                onChange={(e) => {
                                    setExamCode(e.target.value);
                                    setError("");
                                }}
                                required
                            />
                        </div>
                        <div className="sm:mt-6">
                            <Button
                                type="submit"
                                size="lg"
                                disabled={!examCode.trim()}
                                className="w-full sm:w-auto bg-green-900 hover:bg-green-800 cursor-pointer text-white font-bold px-8"
                            >
                                Start Exam
                                <ChevronRight className="ml-2 h-5 w-5" />
                            </Button>
                        </div>
                    </div>

                    {error && (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-red-700 text-sm font-semibold">
                                {error}
                            </p>
                        </div>
                    )}
                </form>
            </Card>

            {/* Main Content Grid */}
            <div className="grid lg:grid-cols-2 gap-6">
                {/* My Available Exams */}
                <Card className="p-6 bg-white border border-gray-200 rounded-2xl">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold text-gray-900">
                            Available Exams
                        </h3>
                        <span className="text-sm text-gray-500">
                            {availableExams.length} exams available
                        </span>
                    </div>

                    <p className="text-sm text-gray-600 mb-6">
                        Published exams you can take right now.
                    </p>

                    {availableExams.length === 0 ? (
                        <div className="text-center py-12">
                            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-600 font-semibold">
                                No exams available at the moment
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4 max-h-96 overflow-y-auto">
                            {availableExams.map((exam) => (
                                <Link
                                    key={exam.id}
                                    href={`/exam/${exam.id.trim()}`}
                                >
                                    <div className="p-4 border-2 rounded-xl transition-colors border-gray-200 hover:border-green-700 cursor-pointer">
                                        <div className="flex items-start justify-between mb-3">
                                            <h4 className="font-bold text-gray-900 flex-1">
                                                {exam.title}
                                            </h4>
                                            <div className="flex items-center gap-1 text-green-700 bg-green-50 px-2 py-1 rounded text-xs font-semibold">
                                                <Clock className="h-3 w-3" />
                                                Available
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
                                            <div className="flex items-center gap-1">
                                                <BookOpen className="h-4 w-4" />
                                                {exam.totalQuestions} questions
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Clock className="h-4 w-4" />
                                                {exam.duration} mins
                                            </div>
                                        </div>

                                        <div className="text-xs text-gray-500">
                                            Exam ID:{" "}
                                            <span className="font-mono font-semibold">
                                                {exam.id}
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </Card>

                {/* My Completed Exams */}
                <Card className="p-6 bg-white border border-gray-200 rounded-2xl">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold text-gray-900">
                            Completed Exams
                        </h3>
                        <span className="text-sm text-gray-500">
                            {completedExams.length} completed
                        </span>
                    </div>

                    <p className="text-sm text-gray-600 mb-6">
                        A summary of your past examination attempts and results.
                    </p>

                    {completedExams.length === 0 ? (
                        <div className="text-center py-12">
                            <Award className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-600 font-semibold">
                                No completed exams yet
                            </p>
                            <p className="text-sm text-gray-500 mt-2">
                                Take your first exam to see results here
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4 max-h-96 overflow-y-auto">
                            {completedExams.map((exam) => (
                                <div
                                    key={exam.id}
                                    className="p-4 border border-gray-200 rounded-xl hover:border-green-700 transition-colors"
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <h4 className="font-bold text-gray-900 flex-1 font-mono">
                                            {exam.examId}
                                        </h4>
                                        <div className="flex items-center gap-2">
                                            <div
                                                className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold ${
                                                    exam.status === "passed"
                                                        ? "text-green-700 bg-green-50"
                                                        : "text-red-600 bg-red-50"
                                                }`}
                                            >
                                                {exam.status === "passed" ? (
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
                                    </div>

                                    <div className="flex flex-wrap items-center justify-between gap-4 text-sm">
                                        <div className="flex items-center gap-1 text-gray-600">
                                            <Calendar className="h-4 w-4" />
                                            {exam.completedAt}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-gray-600">
                                                Score:
                                            </span>
                                            <span
                                                className={`text-lg font-bold ${
                                                    exam.status === "passed"
                                                        ? "text-green-700"
                                                        : "text-red-600"
                                                }`}
                                            >
                                                {exam.score}%
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </Card>
            </div>

            {/* Help Notice */}
            <Card className="p-6 bg-blue-50 border border-blue-200 rounded-2xl">
                <div className="flex gap-4">
                    <AlertCircle className="h-6 w-6 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                        <h4 className="font-bold text-gray-900 mb-2">
                            Need Help?
                        </h4>
                        <p className="text-sm text-gray-700 mb-3">
                            If you&apos;re having trouble accessing an exam or
                            need technical assistance, please contact your
                            lecturer or visit our support center.
                        </p>
                        <button className="text-sm font-semibold text-blue-700 hover:underline cursor-pointer">
                            Contact Support →
                        </button>
                    </div>
                </div>
            </Card>
        </main>
    );
}
