"use client";

import React, { useState } from "react";
import {
    FileText,
    Plus,
    X,
    Save,
    AlertCircle,
    CheckCircle,
    Calendar,
    Clock,
    CheckCircle2,
    Globe,
    Lock,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/app/context/AuthContext";

export default function CreateExam() {
    const { user } = useAuth();

    const [examData, setExamData] = useState({
        title: "",
        examCode: "",
        course: "",
        duration: "",
        totalQuestions: "",
        passingScore: "",
        instructions: "",
        startDate: "",
        startTime: "",
        endDate: "",
        endTime: "",
        visibility: "public", // "public" | "private"
    });

    const [selectedQuestions, setSelectedQuestions] = React.useState([]);
    const [saveStatus, setSaveStatus] = useState("");
    const [showQuestionModal, setShowQuestionModal] = React.useState(false);
    const [newQuestion, setNewQuestion] = React.useState({
        text: "",
        options: ["", "", "", ""],
        correctOptionIndex: 0,
    });
    const [errorModal, setErrorModal] = useState({
        show: false,
        message: "",
    });

    const saveAsDraft = async () => {
        if (!user?.uid) {
            setErrorModal({
                show: true,
                message: "You must be logged in to save an exam.",
            });
            return;
        }
        if (!examData.examCode || !examData.title) {
            setErrorModal({
                show: true,
                message: "Exam title and code are required to save as draft.",
            });
            return;
        }
        setSaveStatus("saving");
        try {
            const examRef = doc(db, "exams", examData.examCode);
            await setDoc(examRef, {
                ...examData,
                selectedQuestions,
                status: "draft",
                createdBy: user.uid,
                createdAt: serverTimestamp(),
            });
            setSaveStatus("success");
            setTimeout(() => setSaveStatus(null), 3000);
        } catch (error) {
            console.error("Error saving draft:", error);
            setSaveStatus("error");
            setErrorModal({
                show: true,
                message: `Error saving draft: ${error.message}`,
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user?.uid) {
            setErrorModal({
                show: true,
                message: "You must be logged in to create an exam.",
            });
            return;
        }
        if (selectedQuestions.length < 1) {
            setErrorModal({
                show: true,
                message: "You must select at least one question.",
            });
            return;
        }
        if (!examData.examCode || !examData.title) {
            setErrorModal({
                show: true,
                message: "Exam title and code are required.",
            });
            return;
        }
        const startDateTime = new Date(
            `${examData.startDate}T${examData.startTime}`,
        );
        const endDateTime = new Date(`${examData.endDate}T${examData.endTime}`);
        if (startDateTime >= endDateTime) {
            setErrorModal({
                show: true,
                message: "End time must be after start time.",
            });
            return;
        }
        setSaveStatus("saving");
        try {
            const examRef = doc(db, "exams", examData.examCode);
            await setDoc(examRef, {
                ...examData,
                selectedQuestions,
                status: "published",
                createdBy: user.uid,
                createdAt: serverTimestamp(),
            });
            setSaveStatus("success");
            setTimeout(() => {
                setSaveStatus(null);
                setExamData({
                    title: "",
                    examCode: "",
                    course: "",
                    duration: "",
                    totalQuestions: "",
                    passingScore: "",
                    instructions: "",
                    startDate: "",
                    startTime: "",
                    endDate: "",
                    endTime: "",
                    visibility: "public",
                });
                setSelectedQuestions([]);
            }, 2000);
        } catch (error) {
            console.error("Error creating exam:", error);
            setSaveStatus("error");
            setErrorModal({
                show: true,
                message: `Error creating exam: ${error.message}`,
            });
        }
    };

    const handleCancel = () => {
        setExamData({
            title: "",
            examCode: "",
            course: "",
            duration: "",
            totalQuestions: "",
            passingScore: "",
            instructions: "",
            startDate: "",
            startTime: "",
            endDate: "",
            endTime: "",
            visibility: "public",
        });
        setSelectedQuestions([]);
    };

    const handleChange = (field, value) => {
        setExamData({ ...examData, [field]: value });
    };

    const handleAddQuestion = () => {
        if (!newQuestion.text.trim()) {
            setErrorModal({ show: true, message: "Question text is required" });
            return;
        }
        if (newQuestion.options.some((o) => !o.trim())) {
            setErrorModal({ show: true, message: "All options are required" });
            return;
        }
        setSelectedQuestions([
            ...selectedQuestions,
            { ...newQuestion, id: Date.now().toString() },
        ]);
        setNewQuestion({
            text: "",
            options: ["", "", "", ""],
            correctOptionIndex: 0,
        });
        setShowQuestionModal(false);
    };

    const removeQuestion = (questionId) => {
        setSelectedQuestions(
            selectedQuestions.filter((q) => q.id !== questionId),
        );
    };

    const updateOption = (index, value) => {
        const updatedOptions = [...newQuestion.options];
        updatedOptions[index] = value;
        setNewQuestion({ ...newQuestion, options: updatedOptions });
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                    Create New Exam
                </h1>
                <p className="text-gray-600 mt-1">
                    Set up a new examination for your students
                </p>
            </div>

            {/* Status Message */}
            {saveStatus && (
                <Card
                    className={`p-4 border-2 rounded-2xl ${saveStatus === "success" ? "bg-green-50 border-green-200" : "bg-blue-50 border-blue-200"}`}
                >
                    <div className="flex items-center gap-3">
                        {saveStatus === "success" ? (
                            <>
                                <CheckCircle className="h-5 w-5 text-green-600" />
                                <p className="text-sm font-semibold text-green-900">
                                    Exam created successfully!
                                </p>
                            </>
                        ) : (
                            <>
                                <AlertCircle className="h-5 w-5 text-blue-600" />
                                <p className="text-sm font-semibold text-blue-900">
                                    Creating exam...
                                </p>
                            </>
                        )}
                    </div>
                </Card>
            )}

            {/* Error Modal */}
            {errorModal.show && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl p-6 animate-in zoom-in-95 duration-200">
                        <div className="flex flex-col items-center gap-4">
                            <AlertCircle className="h-10 w-10 text-red-600" />
                            <p className="text-center text-gray-900 font-semibold">
                                {errorModal.message}
                            </p>
                            <button
                                className="mt-4 px-6 py-2 text-white bg-red-600 hover:bg-red-700 rounded-xl font-medium shadow-sm hover:shadow-md transition-all"
                                onClick={() =>
                                    setErrorModal({ show: false, message: "" })
                                }
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <Card className="p-6 sm:p-8 bg-white border border-gray-200 rounded-2xl">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                            <FileText className="h-6 w-6 text-green-700" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">
                                Basic Information
                            </h2>
                            <p className="text-sm text-gray-600">
                                Enter the exam details
                            </p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input
                                label="Exam Title"
                                type="text"
                                placeholder="e.g., Data Structures Midterm"
                                value={examData.title}
                                onChange={(e) =>
                                    handleChange("title", e.target.value)
                                }
                                required
                            />
                            <Input
                                label="Exam Code"
                                type="text"
                                placeholder="e.g., CSC201-MID-001"
                                value={examData.examCode}
                                onChange={(e) =>
                                    handleChange("examCode", e.target.value)
                                }
                                required
                            />
                        </div>

                        <Input
                            label="Course Name"
                            type="text"
                            placeholder="e.g., CSC 201 - Data Structures"
                            value={examData.course}
                            onChange={(e) =>
                                handleChange("course", e.target.value)
                            }
                            required
                        />

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <Input
                                label="Duration (minutes)"
                                type="number"
                                placeholder="e.g., 90"
                                value={examData.duration}
                                onChange={(e) =>
                                    handleChange("duration", e.target.value)
                                }
                                required
                            />
                            <Input
                                label="Total Questions"
                                type="number"
                                placeholder="e.g., 50"
                                value={examData.totalQuestions}
                                onChange={(e) =>
                                    handleChange(
                                        "totalQuestions",
                                        e.target.value,
                                    )
                                }
                                required
                            />
                            <Input
                                label="Passing Score (%)"
                                type="number"
                                placeholder="e.g., 50"
                                value={examData.passingScore}
                                onChange={(e) =>
                                    handleChange("passingScore", e.target.value)
                                }
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Exam Instructions
                            </label>
                            <textarea
                                rows="4"
                                placeholder="Enter instructions for students..."
                                value={examData.instructions}
                                onChange={(e) =>
                                    handleChange("instructions", e.target.value)
                                }
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-900 focus:border-transparent"
                                required
                            />
                        </div>

                        {/* ── Visibility Toggle ── */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-3">
                                Exam Visibility
                            </label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {/* Public Option */}
                                <button
                                    type="button"
                                    onClick={() =>
                                        handleChange("visibility", "public")
                                    }
                                    className={`flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all cursor-pointer ${
                                        examData.visibility === "public"
                                            ? "border-green-600 bg-green-50"
                                            : "border-gray-200 bg-white hover:border-gray-300"
                                    }`}
                                >
                                    <div
                                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                                            examData.visibility === "public"
                                                ? "bg-green-100"
                                                : "bg-gray-100"
                                        }`}
                                    >
                                        <Globe
                                            className={`h-5 w-5 ${
                                                examData.visibility === "public"
                                                    ? "text-green-700"
                                                    : "text-gray-500"
                                            }`}
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                            <p
                                                className={`font-bold text-sm ${
                                                    examData.visibility ===
                                                    "public"
                                                        ? "text-green-800"
                                                        : "text-gray-700"
                                                }`}
                                            >
                                                Public
                                            </p>
                                            {examData.visibility ===
                                                "public" && (
                                                <CheckCircle className="h-4 w-4 text-green-600 shrink-0" />
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-500 mt-0.5">
                                            Visible to all students on the
                                            platform
                                        </p>
                                    </div>
                                </button>

                                {/* Private Option */}
                                <button
                                    type="button"
                                    onClick={() =>
                                        handleChange("visibility", "private")
                                    }
                                    className={`flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all cursor-pointer ${
                                        examData.visibility === "private"
                                            ? "border-blue-600 bg-blue-50"
                                            : "border-gray-200 bg-white hover:border-gray-300"
                                    }`}
                                >
                                    <div
                                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                                            examData.visibility === "private"
                                                ? "bg-blue-100"
                                                : "bg-gray-100"
                                        }`}
                                    >
                                        <Lock
                                            className={`h-5 w-5 ${
                                                examData.visibility ===
                                                "private"
                                                    ? "text-blue-700"
                                                    : "text-gray-500"
                                            }`}
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                            <p
                                                className={`font-bold text-sm ${
                                                    examData.visibility ===
                                                    "private"
                                                        ? "text-blue-800"
                                                        : "text-gray-700"
                                                }`}
                                            >
                                                Private
                                            </p>
                                            {examData.visibility ===
                                                "private" && (
                                                <CheckCircle className="h-4 w-4 text-blue-600 shrink-0" />
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-500 mt-0.5">
                                            Only accessible via exam code
                                        </p>
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Schedule */}
                <Card className="p-6 sm:p-8 bg-white border border-gray-200 rounded-2xl">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                            <Calendar className="h-6 w-6 text-blue-700" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">
                                Exam Schedule
                            </h2>
                            <p className="text-sm text-gray-600">
                                Set the exam date and time
                            </p>
                        </div>
                    </div>
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input
                                label="Start Date"
                                type="date"
                                value={examData.startDate}
                                onChange={(e) =>
                                    handleChange("startDate", e.target.value)
                                }
                                required
                            />
                            <Input
                                label="Start Time"
                                type="time"
                                value={examData.startTime}
                                onChange={(e) =>
                                    handleChange("startTime", e.target.value)
                                }
                                required
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input
                                label="End Date"
                                type="date"
                                value={examData.endDate}
                                onChange={(e) =>
                                    handleChange("endDate", e.target.value)
                                }
                                required
                            />
                            <Input
                                label="End Time"
                                type="time"
                                value={examData.endTime}
                                onChange={(e) =>
                                    handleChange("endTime", e.target.value)
                                }
                                required
                            />
                        </div>
                    </div>
                </Card>

                {/* Question Bank */}
                <div className="w-full max-w-4xl mx-auto">
                    <div className="bg-white border border-gray-200 rounded-2xl shadow-md overflow-hidden">
                        <div className="p-6 border-b border-gray-100 bg-linear-to-r from-green-50 to-white">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-green-900 rounded-xl flex items-center justify-center shadow-sm">
                                        <Plus className="h-6 w-6 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-semibold text-gray-900">
                                            Question Bank
                                        </h2>
                                        <p className="text-sm text-gray-600 mt-0.5">
                                            {selectedQuestions.length} question
                                            {selectedQuestions.length !== 1
                                                ? "s"
                                                : ""}{" "}
                                            selected
                                        </p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-green-800 hover:bg-green-900 text-white text-sm font-medium rounded-xl shadow-md transition-all duration-200 cursor-pointer"
                                    onClick={() => setShowQuestionModal(true)}
                                >
                                    <Plus className="h-4 w-4" />
                                    Add Question
                                </button>
                            </div>
                        </div>
                        <div className="p-6">
                            {selectedQuestions.length > 0 ? (
                                <div className="space-y-3">
                                    {selectedQuestions.map((q, qIndex) => (
                                        <div
                                            key={q.id}
                                            className="group bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl p-4 transition-all duration-200 shadow-sm"
                                        >
                                            <div className="flex justify-between items-start gap-4">
                                                <div className="flex-1">
                                                    <div className="flex items-start gap-3 mb-3">
                                                        <span className="inline-flex items-center justify-center w-6 h-6 bg-green-600 text-white text-xs font-semibold rounded-full shrink-0 mt-0.5">
                                                            {qIndex + 1}
                                                        </span>
                                                        <p className="font-medium text-gray-900 leading-relaxed">
                                                            {q.text}
                                                        </p>
                                                    </div>
                                                    <div className="ml-9 space-y-2">
                                                        {q.options.map(
                                                            (
                                                                option,
                                                                optIndex,
                                                            ) => (
                                                                <div
                                                                    key={
                                                                        optIndex
                                                                    }
                                                                    className={`flex items-center gap-2 text-sm ${optIndex === q.correctOptionIndex ? "text-green-700 font-medium" : "text-gray-700"}`}
                                                                >
                                                                    {optIndex ===
                                                                    q.correctOptionIndex ? (
                                                                        <CheckCircle className="h-4 w-4 shrink-0" />
                                                                    ) : (
                                                                        <div className="w-4 h-4 rounded-full border-2 border-gray-300 shrink-0" />
                                                                    )}
                                                                    <span>
                                                                        {option}
                                                                    </span>
                                                                </div>
                                                            ),
                                                        )}
                                                    </div>
                                                </div>
                                                <button
                                                    type="button"
                                                    className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                                                    onClick={() =>
                                                        removeQuestion(q.id)
                                                    }
                                                >
                                                    <X className="h-5 w-5" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Plus className="h-8 w-8 text-gray-400" />
                                    </div>
                                    <p className="text-gray-500 text-sm font-medium">
                                        No questions added yet
                                    </p>
                                    <p className="text-gray-400 text-sm mt-1">
                                        Click &quot;Add Question&quot; to get
                                        started
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Question Modal */}
                {showQuestionModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                        <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-200">
                            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
                                <div>
                                    <h2 className="text-xl font-semibold text-gray-900">
                                        Create New Question
                                    </h2>
                                    <p className="text-sm text-gray-600 mt-1">
                                        Add a multiple-choice question to your
                                        bank
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                                    onClick={() => setShowQuestionModal(false)}
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                            <div className="p-6 space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Question Text *
                                    </label>
                                    <textarea
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-600 focus:border-transparent transition-all resize-none"
                                        placeholder="Enter your question here..."
                                        rows="3"
                                        value={newQuestion.text}
                                        onChange={(e) =>
                                            setNewQuestion({
                                                ...newQuestion,
                                                text: e.target.value,
                                            })
                                        }
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-3">
                                        Answer Options *
                                    </label>
                                    <p className="text-xs text-gray-500 mb-3">
                                        Select the correct answer by clicking
                                        the radio button
                                    </p>
                                    <div className="space-y-3">
                                        {newQuestion.options.map(
                                            (option, index) => (
                                                <div
                                                    key={index}
                                                    className={`flex items-center gap-3 p-3 border-2 rounded-xl transition-all ${newQuestion.correctOptionIndex === index ? "border-green-500 bg-green-50" : "border-gray-200 hover:border-gray-300"}`}
                                                >
                                                    <input
                                                        type="radio"
                                                        name="correctOption"
                                                        className="w-4 h-4 text-green-600 focus:ring-green-600 cursor-pointer"
                                                        checked={
                                                            newQuestion.correctOptionIndex ===
                                                            index
                                                        }
                                                        onChange={() =>
                                                            setNewQuestion({
                                                                ...newQuestion,
                                                                correctOptionIndex:
                                                                    index,
                                                            })
                                                        }
                                                    />
                                                    <input
                                                        type="text"
                                                        className="flex-1 px-3 py-2 border-0 bg-transparent focus:outline-none text-gray-900 placeholder:text-gray-400"
                                                        placeholder={`Option ${index + 1}`}
                                                        value={option}
                                                        onChange={(e) =>
                                                            updateOption(
                                                                index,
                                                                e.target.value,
                                                            )
                                                        }
                                                    />
                                                </div>
                                            ),
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-6 flex items-center justify-end gap-3">
                                <button
                                    type="button"
                                    className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
                                    onClick={() => setShowQuestionModal(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    className="px-5 py-2.5 text-sm font-medium text-white bg-green-800 hover:bg-green-900 rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer"
                                    onClick={handleAddQuestion}
                                >
                                    Add Question
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Submit Buttons */}
                <Card className="p-6 bg-white border border-gray-200 rounded-2xl">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <Button
                            type="submit"
                            size="lg"
                            className="flex-1 bg-green-900 hover:bg-green-800 cursor-pointer text-white font-bold"
                        >
                            <Save className="mr-2 h-5 w-5" />
                            Create Exam
                        </Button>
                        <Button
                            type="button"
                            size="lg"
                            variant="outline"
                            className="flex-1 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 cursor-pointer font-semibold"
                            onClick={saveAsDraft}
                        >
                            Save as Draft
                        </Button>
                        <Button
                            type="button"
                            size="lg"
                            variant="outline"
                            className="border-2 border-red-300 text-red-700 hover:bg-red-50 cursor-pointer font-semibold"
                            onClick={handleCancel}
                        >
                            Cancel
                        </Button>
                    </div>
                </Card>
            </form>

            {/* Help Card */}
            <Card className="p-6 bg-blue-50 border border-blue-200 rounded-2xl">
                <div className="flex gap-4">
                    <AlertCircle className="h-6 w-6 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                        <h4 className="font-bold text-gray-900 mb-2">
                            Tips for Creating Exams
                        </h4>
                        <ul className="space-y-1 text-sm text-gray-700">
                            <li className="flex items-start">
                                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 mr-3 shrink-0" />
                                <span>
                                    Set a clear and descriptive exam title
                                </span>
                            </li>
                            <li className="flex items-start">
                                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 mr-3 shrink-0" />
                                <span>
                                    Ensure duration is appropriate for the
                                    number of questions
                                </span>
                            </li>
                            <li className="flex items-start">
                                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 mr-3 shrink-0" />
                                <span>
                                    Use <strong>Public</strong> for open exams,{" "}
                                    <strong>Private</strong> for invite-only
                                    (students need the exam code)
                                </span>
                            </li>
                            <li className="flex items-start">
                                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 mr-3 shrink-0" />
                                <span>
                                    Provide clear instructions for students
                                </span>
                            </li>
                        </ul>
                    </div>
                </div>
            </Card>
        </div>
    );
}
