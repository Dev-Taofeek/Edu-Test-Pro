"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
    BookOpen,
    Clock,
    Calendar,
    Filter,
    Search,
    ChevronRight,
    AlertCircle,
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
import {
    calculateGrade,
    getPassStatus,
    getGradeColor,
} from "@/utils/gradeUtils";

export default function Exams() {
    const [searchQuery, setSearchQuery] = useState("");
    const [filterStatus, setFilterStatus] = useState("all"); // all, available, completed
    const [loading, setLoading] = useState(true);
    const [studentData, setStudentData] = useState(null);
    const [availableExams, setAvailableExams] = useState([]);
    const [examDetails, setExamDetails] = useState({});
    const { user } = useAuth();
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

                if (studentSnap.exists()) {
                    setStudentData(studentSnap.data());
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

                setAvailableExams(exams);

                // Fetch exam details for completed exams
                if (studentSnap.exists()) {
                    const examsTaken = studentSnap.data().examsTaken || [];
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

    // Combine available and completed exams
    const allExams = useMemo(() => {
        const completed = (studentData?.examsTaken || []).map((exam) => {
            const examDetail = examDetails[exam.examId];
            const passingScore = examDetail?.passingScore || 50;
            const grade = calculateGrade(exam.score);
            const status = getPassStatus(exam.score, passingScore);

            return {
                id: exam.examId,
                examId: exam.examId,
                score: exam.score,
                grade,
                status: "completed",
                passStatus: status,
                passingScore,
                completedAt: exam.completedAt,
            };
        });

        const available = availableExams
            .filter(
                (exam) =>
                    !studentData?.examsTaken?.some(
                        (taken) => taken.examId === exam.id,
                    ),
            )
            .map((exam) => ({
                ...exam,
                status: "available",
            }));

        return [...available, ...completed];
    }, [availableExams, studentData, examDetails]);

    // Filter exams
    const filteredExams = useMemo(() => {
        return allExams.filter((exam) => {
            const matchesSearch =
                exam.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                exam.course
                    ?.toLowerCase()
                    .includes(searchQuery.toLowerCase()) ||
                exam.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                exam.examId?.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesFilter =
                filterStatus === "all" || exam.status === filterStatus;

            return matchesSearch && matchesFilter;
        });
    }, [allExams, searchQuery, filterStatus]);

    // Calculate stats
    const stats = useMemo(() => {
        const availableCount = allExams.filter(
            (e) => e.status === "available",
        ).length;
        const completedCount = allExams.filter(
            (e) => e.status === "completed",
        ).length;

        return {
            total: allExams.length,
            available: availableCount,
            completed: completedCount,
        };
    }, [allExams]);

    const handleStartExam = (examId) => {
        router.push(`/exam/${examId}`);
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <div className="w-12 h-12 border-4 border-green-700 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-gray-700 text-lg font-semibold">
                    Loading exams...
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                    My Exams
                </h1>
                <p className="text-gray-600 mt-1">
                    View and manage all your scheduled examinations
                </p>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card className="p-6 bg-white border border-gray-200 rounded-2xl">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">
                                Total Exams
                            </p>
                            <p className="text-3xl font-bold text-gray-900">
                                {stats.total}
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
                            <p className="text-3xl font-bold text-gray-900">
                                {stats.available}
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
                            <p className="text-3xl font-bold text-gray-900">
                                {stats.completed}
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                            <Calendar className="h-6 w-6 text-green-700" />
                        </div>
                    </div>
                </Card>
            </div>

            {/* Search and Filter */}
            <Card className="p-6 bg-white border border-gray-200 rounded-2xl">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search exams by title, course, or ID..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-900 focus:border-transparent"
                        />
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={() => setFilterStatus("all")}
                            className={`px-4 py-3 rounded-xl font-semibold transition-colors cursor-pointer ${
                                filterStatus === "all"
                                    ? "bg-green-900 text-white"
                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                        >
                            All
                        </button>
                        <button
                            onClick={() => setFilterStatus("available")}
                            className={`px-4 py-3 rounded-xl font-semibold transition-colors cursor-pointer ${
                                filterStatus === "available"
                                    ? "bg-green-900 text-white"
                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                        >
                            Available
                        </button>
                        <button
                            onClick={() => setFilterStatus("completed")}
                            className={`px-4 py-3 rounded-xl font-semibold transition-colors cursor-pointer ${
                                filterStatus === "completed"
                                    ? "bg-green-900 text-white"
                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                        >
                            Completed
                        </button>
                    </div>
                </div>
            </Card>

            {/* Exams List */}
            <div className="space-y-4">
                {filteredExams.length === 0 ? (
                    <Card className="p-12 bg-white border border-gray-200 rounded-2xl text-center">
                        <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-gray-900 mb-2">
                            No exams found
                        </h3>
                        <p className="text-gray-600">
                            {searchQuery
                                ? "Try adjusting your search or filter criteria"
                                : "No exams available at the moment"}
                        </p>
                    </Card>
                ) : (
                    filteredExams.map((exam) => (
                        <Card
                            key={exam.id || exam.examId}
                            className="p-6 bg-white border-2 border-gray-200 rounded-2xl hover:border-green-700 transition-colors"
                        >
                            <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                                {/* Exam Icon */}
                                <div
                                    className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 ${
                                        exam.status === "available"
                                            ? "bg-green-100"
                                            : "bg-gray-100"
                                    }`}
                                >
                                    <BookOpen
                                        className={`h-8 w-8 ${
                                            exam.status === "available"
                                                ? "text-green-700"
                                                : "text-gray-500"
                                        }`}
                                    />
                                </div>

                                {/* Exam Details */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-4 mb-3">
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900 mb-1">
                                                {exam.title || exam.examId}
                                            </h3>
                                            {exam.course && (
                                                <p className="text-sm text-gray-600">
                                                    {exam.course}
                                                </p>
                                            )}
                                        </div>
                                        <div
                                            className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap ${
                                                exam.status === "available"
                                                    ? "bg-green-100 text-green-700"
                                                    : "bg-gray-100 text-gray-700"
                                            }`}
                                        >
                                            {exam.status === "available"
                                                ? "Available"
                                                : "Completed"}
                                        </div>
                                    </div>

                                    {exam.status === "available" ? (
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm mb-3">
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <Clock className="h-4 w-4" />
                                                <span>
                                                    {exam.duration} mins
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <BookOpen className="h-4 w-4" />
                                                <span>
                                                    {exam.totalQuestions}{" "}
                                                    questions
                                                </span>
                                            </div>
                                            {exam.createdAt && (
                                                <div className="flex items-center gap-2 text-gray-600">
                                                    <Calendar className="h-4 w-4" />
                                                    <span>
                                                        {exam.createdAt
                                                            ?.toDate?.()
                                                            .toLocaleDateString() ||
                                                            exam.created ||
                                                            "N/A"}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <Calendar className="h-4 w-4" />
                                                <span>
                                                    Completed:{" "}
                                                    {exam.completedAt
                                                        ?.toDate?.()
                                                        .toLocaleDateString() ||
                                                        "N/A"}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-gray-600">
                                                    Score:
                                                </span>
                                                <span
                                                    className={`font-bold ${
                                                        exam.passStatus ===
                                                        "passed"
                                                            ? "text-green-700"
                                                            : "text-red-600"
                                                    }`}
                                                >
                                                    {exam.score}%
                                                </span>
                                                <span
                                                    className={`px-2 py-0.5 rounded text-xs font-bold ${getGradeColor(exam.grade)}`}
                                                >
                                                    {exam.grade}
                                                </span>
                                            </div>
                                        </div>
                                    )}

                                    <div className="mt-3 p-3 bg-gray-50 rounded-xl">
                                        <div className="flex items-center justify-between gap-4">
                                            <div>
                                                <p className="text-xs text-gray-600 mb-1">
                                                    Exam ID
                                                </p>
                                                <p className="text-sm font-bold font-mono text-gray-900">
                                                    {exam.id || exam.examId}
                                                </p>
                                            </div>
                                            {exam.status === "available" && (
                                                <Button
                                                    size="sm"
                                                    onClick={() =>
                                                        handleStartExam(exam.id)
                                                    }
                                                    className="bg-green-900 hover:bg-green-800 cursor-pointer text-white font-semibold"
                                                >
                                                    Start Exam
                                                    <ChevronRight className="ml-1 h-4 w-4" />
                                                </Button>
                                            )}
                                            {exam.status === "completed" && (
                                                <div
                                                    className={`px-4 py-2 rounded-lg text-sm font-semibold ${
                                                        exam.passStatus ===
                                                        "passed"
                                                            ? "bg-green-100 text-green-700"
                                                            : "bg-red-100 text-red-600"
                                                    }`}
                                                >
                                                    {exam.passStatus ===
                                                    "passed"
                                                        ? "Passed"
                                                        : "Failed"}{" "}
                                                    • Grade: {exam.grade}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ))
                )}
            </div>

            {/* Information Card */}
            <Card className="p-6 bg-blue-50 border border-blue-200 rounded-2xl">
                <div className="flex gap-4">
                    <AlertCircle className="h-6 w-6 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                        <h4 className="font-bold text-gray-900 mb-2">
                            Exam Guidelines
                        </h4>
                        <ul className="space-y-1 text-sm text-gray-700">
                            <li className="flex items-start">
                                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 mr-3 shrink-0" />
                                <span>
                                    Make sure you have a stable internet
                                    connection before starting
                                </span>
                            </li>
                            <li className="flex items-start">
                                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 mr-3 shrink-0" />
                                <span>
                                    Once you start an exam, you cannot pause or
                                    restart it
                                </span>
                            </li>
                            <li className="flex items-start">
                                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 mr-3 shrink-0" />
                                <span>
                                    Ensure you&apos;re in a quiet environment
                                    with no distractions
                                </span>
                            </li>
                            <li className="flex items-start">
                                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 mr-3 shrink-0" />
                                <span>Each exam can only be taken once</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </Card>
        </div>
    );
}
