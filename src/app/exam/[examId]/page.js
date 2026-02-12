"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc, updateDoc, arrayUnion, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/app/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import {
    Clock,
    FileText,
    Calendar,
    AlertCircle,
    BookOpen,
    ChevronLeft,
    ChevronRight,
    Save,
    Send,
    Lock,
} from "lucide-react";
import Link from "next/link";
import {
    checkExamAvailability,
    formatTimeRemaining,
    getTimeRemaining,
} from "@/utils/ExamUtils";

export default function ExamPage() {
    const { examId } = useParams();
    const router = useRouter();
    const { user } = useAuth();

    const [exam, setExam] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [examStarted, setExamStarted] = useState(false);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [timeRemaining, setTimeRemaining] = useState(0);
    const [availability, setAvailability] = useState(null);
    const [examWindowTimeRemaining, setExamWindowTimeRemaining] =
        useState(null);

    useEffect(() => {
        const fetchExam = async () => {
            setLoading(true);
            try {
                const examRef = doc(db, "exams", examId);
                const examSnap = await getDoc(examRef);

                if (!examSnap.exists()) {
                    setError("Exam not found.");
                    setLoading(false);
                    return;
                }

                const examData = examSnap.data();
                setExam(examData);

                // Check exam availability
                const availabilityStatus = checkExamAvailability(examData);
                setAvailability(availabilityStatus);

                // Set exam duration timer
                setTimeRemaining(examData.duration * 60);

                // If exam is available, set window time remaining
                if (availabilityStatus.isAvailable) {
                    const remaining = getTimeRemaining(examData);
                    setExamWindowTimeRemaining(remaining);
                }

                setLoading(false);
            } catch (err) {
                console.error(err);
                setError("Error fetching exam.");
                setLoading(false);
            }
        };

        fetchExam();
    }, [examId]);

    // Check exam window availability every second
    useEffect(() => {
        if (!exam || !availability?.isAvailable) return;

        const interval = setInterval(() => {
            const remaining = getTimeRemaining(exam);
            setExamWindowTimeRemaining(remaining);

            // If exam window has ended, update availability
            if (remaining.totalSeconds <= 0) {
                const newAvailability = checkExamAvailability(exam);
                setAvailability(newAvailability);

                // If user is in the middle of exam, auto-submit
                if (examStarted) {
                    handleSubmitExam();
                }
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [exam, availability, examStarted]);

    // Timer countdown for exam duration
    useEffect(() => {
        if (!examStarted || timeRemaining <= 0) return;

        const timer = setInterval(() => {
            setTimeRemaining((prev) => {
                if (prev <= 1) {
                    handleSubmitExam();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [examStarted, timeRemaining]);

    const formatTime = (seconds) => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    };

    const handleStartExam = () => {
        // Double-check availability before starting
        if (!availability?.isAvailable) {
            setError("This exam is no longer available.");
            return;
        }
        setExamStarted(true);
    };

    const handleSaveForLater = () => {
        router.push("/dashboard");
    };

    const handleSelectAnswer = (questionIndex, optionId) => {
        setAnswers({
            ...answers,
            [questionIndex]: optionId,
        });
    };

    const handleSubmitExam = async () => {
        if (!user?.uid) {
            setError("You must be logged in to submit the exam.");
            return;
        }

        try {
            console.log("=== DEBUGGING EXAM SUBMISSION ===");
            console.log("Current user:", user.uid);
            console.log("User email:", user.email);

            // Calculate score
            let correctCount = 0;
            exam.selectedQuestions.forEach((question, index) => {
                if (answers[index] === question.correctOptionIndex.toString()) {
                    correctCount++;
                }
            });

            const score = Math.round(
                (correctCount / exam.selectedQuestions.length) * 100,
            );

            console.log("Score calculated:", score);

            // Check if student document exists
            const studentRef = doc(db, "students", user.uid);
            console.log(
                "Checking student document at:",
                `students/${user.uid}`,
            );

            const studentSnap = await getDoc(studentRef);
            console.log("Student document exists:", studentSnap.exists());

            if (studentSnap.exists()) {
                console.log("Student document data:", studentSnap.data());
            }

            if (!studentSnap.exists()) {
                console.log("Creating new student document...");
                await setDoc(studentRef, {
                    email: user.email,
                    examsTaken: [
                        {
                            examId,
                            score,
                            completedAt: new Date(),
                        },
                    ],
                    createdAt: new Date(),
                });
                console.log("Student document created successfully");
            } else {
                console.log("Updating existing student document...");
                await updateDoc(studentRef, {
                    examsTaken: arrayUnion({
                        examId,
                        score,
                        completedAt: new Date(),
                    }),
                });
                console.log("Student document updated successfully");
            }

            console.log("=== SUBMISSION SUCCESSFUL ===");
            router.push("/dashboard/student");
        } catch (err) {
            console.error("=== SUBMISSION FAILED ===");
            console.error("Error code:", err.code);
            console.error("Error message:", err.message);
            console.error("Full error:", err);
            setError("Failed to submit exam: " + err.message);
        }
    };

    const currentQuestion = exam?.selectedQuestions?.[currentQuestionIndex];
    const totalQuestions = exam?.selectedQuestions?.length || 0;
    const answeredCount = Object.keys(answers).length;

    // Add loading check for user
    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-green-900 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-green-900 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading exam...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <Card className="p-8 max-w-md w-full text-center">
                    <AlertCircle className="h-16 w-16 text-red-600 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-gray-900 mb-2">
                        Error
                    </h2>
                    <p className="text-red-600 mb-6">{error}</p>
                    <Link href={"/dashboard/student"}>
                        <Button onClick={() => router.push("/dashboard")}>
                            Return to Dashboard
                        </Button>
                    </Link>
                </Card>
            </div>
        );
    }

    // Exam not started yet
    if (availability?.status === "not_started") {
        const startDateTime = exam.startDateTime?.toDate
            ? exam.startDateTime.toDate()
            : new Date(exam.startDateTime);

        return (
            <div className="min-h-screen bg-blue-50 p-4 sm:p-6 lg:p-8 flex items-center justify-center">
                <Card className="p-8 max-w-lg w-full">
                    <div className="text-center">
                        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Calendar className="h-10 w-10 text-blue-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                            {exam.title}
                        </h2>
                        <p className="text-gray-600 mb-1">{exam.course}</p>
                        <p className="text-lg text-gray-600 mb-6">
                            Exam hasn&apos;t started yet
                        </p>
                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                            <p className="text-sm font-medium text-gray-700">
                                Starts on:
                            </p>
                            <p className="text-lg font-bold text-blue-900">
                                {startDateTime.toLocaleDateString("en-US", {
                                    weekday: "long",
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                })}
                            </p>
                            <p className="text-xl font-bold text-blue-900">
                                {startDateTime.toLocaleTimeString("en-US", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                })}
                            </p>
                        </div>
                        <p className="text-sm text-gray-500 mb-6">
                            Please check back at the scheduled time
                        </p>
                        <Link href="/dashboard/student">
                            <Button
                                variant="outline"
                                className="cursor-pointer"
                            >
                                <ChevronLeft className="mr-2 h-5 w-5" />
                                Back to Dashboard
                            </Button>
                        </Link>
                    </div>
                </Card>
            </div>
        );
    }

    // Exam has ended
    if (availability?.status === "ended") {
        const endDateTime = exam.endDateTime?.toDate
            ? exam.endDateTime.toDate()
            : new Date(exam.endDateTime);

        return (
            <div className="min-h-screen bg-red-50 p-4 sm:p-6 lg:p-8 flex items-center justify-center">
                <Card className="p-8 max-w-lg w-full">
                    <div className="text-center">
                        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Lock className="h-10 w-10 text-red-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                            {exam.title}
                        </h2>
                        <p className="text-gray-600 mb-1">{exam.course}</p>
                        <p className="text-lg text-gray-600 mb-6">
                            This exam has ended
                        </p>
                        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                            <p className="text-sm font-medium text-gray-700">
                                Ended on:
                            </p>
                            <p className="text-lg font-bold text-red-900">
                                {endDateTime.toLocaleDateString("en-US", {
                                    weekday: "long",
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                })}
                            </p>
                            <p className="text-xl font-bold text-red-900">
                                {endDateTime.toLocaleTimeString("en-US", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                })}
                            </p>
                        </div>
                        <p className="text-sm text-gray-500 mb-6">
                            This exam is no longer accepting submissions
                        </p>
                        <Link href="/dashboard/student">
                            <Button
                                variant="outline"
                                className="cursor-pointer"
                            >
                                <ChevronLeft className="mr-2 h-5 w-5" />
                                Back to Dashboard
                            </Button>
                        </Link>
                    </div>
                </Card>
            </div>
        );
    }

    // Lobby/Welcome Screen
    if (!examStarted) {
        return (
            <div className="min-h-screen bg-blue-50 p-4 sm:p-6 lg:p-8">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="mb-6">
                        <Link href={"/dashboard/student"}>
                            <button
                                onClick={() => router.push("/dashboard")}
                                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 cursor-pointer"
                            >
                                <ChevronLeft className="h-5 w-5" />
                                Back to Dashboard
                            </button>
                        </Link>
                    </div>

                    {/* Exam Window Time Remaining Banner */}
                    {examWindowTimeRemaining &&
                        examWindowTimeRemaining.totalSeconds > 0 && (
                            <Card className="mb-6 p-4 bg-linear-to-r from-amber-50 to-orange-50 border-2 border-amber-200">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Clock className="h-6 w-6 text-amber-700" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-700">
                                                Exam window closes in
                                            </p>
                                            <p className="text-lg font-bold text-amber-900">
                                                {formatTimeRemaining(
                                                    examWindowTimeRemaining.totalSeconds,
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                    <AlertCircle className="h-8 w-8 text-amber-600" />
                                </div>
                            </Card>
                        )}

                    {/* Main Lobby Card */}
                    <Card className="bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden">
                        {/* Header Section */}
                        <div className="bg-green-800 px-6 sm:px-8 py-8">
                            <div className="flex items-start gap-4">
                                <div className="w-16 h-16 bg-white/10 backdrop-blur rounded-2xl flex items-center justify-center">
                                    <FileText className="h-8 w-8 text-white" />
                                </div>
                                <div className="flex-1">
                                    <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                                        {exam.title}
                                    </h1>
                                    <p className="text-green-100">
                                        {exam.course}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Exam Details */}
                        <div className="p-6 sm:p-8 border-b border-gray-200">
                            <h2 className="text-lg font-bold text-gray-900 mb-4">
                                Exam Details
                            </h2>
                            <div className="grid sm:grid-cols-2 gap-4">
                                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                        <Clock className="h-5 w-5 text-blue-700" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">
                                            Duration
                                        </p>
                                        <p className="font-bold text-gray-900">
                                            {exam.duration} minutes
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                        <BookOpen className="h-5 w-5 text-purple-700" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">
                                            Total Questions
                                        </p>
                                        <p className="font-bold text-gray-900">
                                            {exam.selectedQuestions?.length ||
                                                0}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                        <FileText className="h-5 w-5 text-green-700" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">
                                            Passing Score
                                        </p>
                                        <p className="font-bold text-gray-900">
                                            {exam.passingScore}%
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                                        <Calendar className="h-5 w-5 text-orange-700" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">
                                            Exam Code
                                        </p>
                                        <p className="font-bold text-gray-900">
                                            {exam.examCode}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Instructions */}
                        <div className="p-6 sm:p-8 border-b border-gray-200">
                            <h2 className="text-lg font-bold text-gray-900 mb-4">
                                Instructions
                            </h2>
                            <div className="prose prose-sm max-w-none">
                                <p className="text-gray-700 whitespace-pre-wrap">
                                    {exam.instructions ||
                                        "No specific instructions provided."}
                                </p>
                            </div>
                        </div>

                        {/* Important Notice */}
                        <div className="p-6 sm:p-8 bg-amber-50 border-b border-amber-200">
                            <div className="flex gap-3">
                                <AlertCircle className="h-6 w-6 text-amber-600 shrink-0 mt-0.5" />
                                <div>
                                    <h3 className="font-bold text-gray-900 mb-2">
                                        Important Notice
                                    </h3>
                                    <ul className="space-y-2 text-sm text-gray-700">
                                        <li className="flex items-start gap-2">
                                            <span className="text-amber-600 mt-1">
                                                •
                                            </span>
                                            <span>
                                                Once you start the exam, the
                                                timer will begin and cannot be
                                                paused.
                                            </span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-amber-600 mt-1">
                                                •
                                            </span>
                                            <span>
                                                Make sure you have a stable
                                                internet connection.
                                            </span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-amber-600 mt-1">
                                                •
                                            </span>
                                            <span>
                                                The exam will auto-submit when
                                                time runs out.
                                            </span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-amber-600 mt-1">
                                                •
                                            </span>
                                            <span>
                                                You can navigate between
                                                questions freely.
                                            </span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-amber-600 mt-1">
                                                •
                                            </span>
                                            <span>
                                                The exam window will close
                                                automatically at the scheduled
                                                end time.
                                            </span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="p-6 sm:p-8 bg-gray-50">
                            <div className="flex flex-col sm:flex-row gap-4">
                                <Button
                                    onClick={handleSaveForLater}
                                    variant="outline"
                                    size="lg"
                                    className="flex-1 border-2 border-gray-300 hover:bg-gray-100 cursor-pointer"
                                >
                                    <Save className="mr-2 h-5 w-5" />
                                    Save for Later
                                </Button>
                                <Button
                                    onClick={handleStartExam}
                                    size="lg"
                                    className="flex-1 bg-green-900 hover:bg-green-800 text-white font-bold cursor-pointer"
                                >
                                    Start Exam Now
                                    <ChevronRight className="ml-2 h-5 w-5" />
                                </Button>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        );
    }

    // Exam Interface
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Fixed Header */}
            <div className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">
                                {exam.title}
                            </h1>
                            <p className="text-sm text-gray-600">
                                Question {currentQuestionIndex + 1} of{" "}
                                {totalQuestions}
                            </p>
                        </div>

                        <div className="flex items-center gap-4">
                            {/* Timer */}
                            <div className="flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-200 rounded-xl">
                                <Clock className="h-5 w-5 text-red-600" />
                                <span className="font-mono font-bold text-red-600">
                                    {formatTime(timeRemaining)}
                                </span>
                            </div>

                            {/* Progress */}
                            <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-xl">
                                <span className="text-sm text-gray-700">
                                    Answered:
                                </span>
                                <span className="font-bold text-green-700">
                                    {answeredCount}/{totalQuestions}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid lg:grid-cols-4 gap-6">
                    {/* Question Card */}
                    <div className="lg:col-span-3">
                        {currentQuestion && (
                            <div className="bg-white rounded-2xl shadow-md overflow-hidden">
                                {/* Question Header */}
                                <div className="bg-green-900 px-6 py-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-white/10 border border-white/20 rounded-lg flex items-center justify-center">
                                                <span className="text-white font-bold">
                                                    {currentQuestionIndex + 1}
                                                </span>
                                            </div>
                                            <span className="text-green-200 text-sm font-medium">
                                                Question{" "}
                                                {currentQuestionIndex + 1}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Question Text */}
                                <div className="px-6 py-5 border-b border-gray-200 bg-gray-50">
                                    <h3 className="text-lg font-semibold text-gray-800 leading-relaxed">
                                        {currentQuestion.text}
                                    </h3>
                                </div>

                                {/* Options */}
                                <div className="p-6 space-y-3">
                                    {currentQuestion.options.map(
                                        (option, index) => {
                                            const optionId = index.toString();
                                            const isSelected =
                                                answers[
                                                    currentQuestionIndex
                                                ] === optionId;

                                            return (
                                                <button
                                                    key={index}
                                                    onClick={() =>
                                                        handleSelectAnswer(
                                                            currentQuestionIndex,
                                                            optionId,
                                                        )
                                                    }
                                                    className={`w-full text-left rounded-xl border-2 transition cursor-pointer ${
                                                        isSelected
                                                            ? "bg-green-900 border-green-900 text-white shadow-md"
                                                            : "bg-white border-gray-300 hover:border-green-700"
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-4 px-5 py-4">
                                                        <div
                                                            className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg ${
                                                                isSelected
                                                                    ? "bg-white text-green-900"
                                                                    : "bg-gray-100 text-gray-700"
                                                            }`}
                                                        >
                                                            {String.fromCharCode(
                                                                65 + index,
                                                            )}
                                                        </div>
                                                        <p
                                                            className={`flex-1 ${
                                                                isSelected
                                                                    ? "text-white font-medium"
                                                                    : "text-gray-700"
                                                            }`}
                                                        >
                                                            {option}
                                                        </p>
                                                        {isSelected && (
                                                            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                                                                <svg
                                                                    className="w-5 h-5 text-green-700"
                                                                    fill="currentColor"
                                                                    viewBox="0 0 20 20"
                                                                >
                                                                    <path
                                                                        fillRule="evenodd"
                                                                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                                        clipRule="evenodd"
                                                                    />
                                                                </svg>
                                                            </div>
                                                        )}
                                                    </div>
                                                </button>
                                            );
                                        },
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Navigation Buttons */}
                        <div className="flex items-center justify-between mt-6 gap-4">
                            <Button
                                onClick={() =>
                                    setCurrentQuestionIndex((prev) =>
                                        Math.max(0, prev - 1),
                                    )
                                }
                                disabled={currentQuestionIndex === 0}
                                variant="outline"
                                className="border-2 cursor-pointer"
                            >
                                <ChevronLeft className="h-5 w-5 mr-2" />
                                Previous
                            </Button>

                            {currentQuestionIndex < totalQuestions - 1 ? (
                                <Button
                                    onClick={() =>
                                        setCurrentQuestionIndex((prev) =>
                                            Math.min(
                                                totalQuestions - 1,
                                                prev + 1,
                                            ),
                                        )
                                    }
                                    className="bg-green-900 hover:bg-green-800 cursor-pointer"
                                >
                                    Next
                                    <ChevronRight className="h-5 w-5 ml-2" />
                                </Button>
                            ) : (
                                <Button
                                    onClick={handleSubmitExam}
                                    className="bg-blue-600 hover:bg-blue-700 cursor-pointer"
                                >
                                    Submit Exam
                                    <Send className="h-5 w-5 ml-2" />
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Question Navigator Sidebar */}
                    <div className="lg:col-span-1">
                        <Card className="p-4 bg-white border border-gray-200 rounded-2xl sticky top-24">
                            <h3 className="font-bold text-gray-900 mb-4">
                                Question Navigator
                            </h3>
                            <div className="grid grid-cols-5 gap-2">
                                {exam.selectedQuestions.map((_, index) => (
                                    <button
                                        key={index}
                                        onClick={() =>
                                            setCurrentQuestionIndex(index)
                                        }
                                        className={`w-10 h-10 rounded-lg font-semibold text-sm transition ${
                                            currentQuestionIndex === index
                                                ? "bg-green-900 text-white"
                                                : answers[index]
                                                  ? "bg-green-100 text-green-900 border-2 border-green-900"
                                                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                        }`}
                                    >
                                        {index + 1}
                                    </button>
                                ))}
                            </div>

                            <div className="mt-6 pt-4 border-t border-gray-200 space-y-2 text-sm">
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 bg-green-900 rounded"></div>
                                    <span className="text-gray-600">
                                        Current
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 bg-green-100 border-2 border-green-900 rounded"></div>
                                    <span className="text-gray-600">
                                        Answered
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 bg-gray-100 rounded"></div>
                                    <span className="text-gray-600">
                                        Not Answered
                                    </span>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
