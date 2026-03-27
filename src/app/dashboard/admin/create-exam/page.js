"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import {
    FileText,
    Plus,
    X,
    Save,
    AlertCircle,
    CheckCircle,
    Calendar,
    Clock,
    Globe,
    Lock,
    Upload,
    ClipboardPaste,
    PenLine,
    ChevronDown,
    ChevronUp,
    Info,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { doc, setDoc, serverTimestamp, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/app/context/AuthContext";

// ─── Toast ────────────────────────────────────────────────────────────────────

function Toast({ id, type, title, message, onDismiss }) {
    const [visible, setVisible] = useState(false);
    const [leaving, setLeaving] = useState(false);

    useEffect(() => {
        requestAnimationFrame(() => setVisible(true));
    }, []);

    const dismiss = useCallback(() => {
        setLeaving(true);
        setTimeout(() => onDismiss(id), 300);
    }, [id, onDismiss]);

    useEffect(() => {
        const t = setTimeout(dismiss, 5000);
        return () => clearTimeout(t);
    }, [dismiss]);

    const styles = {
        success: {
            bar: "bg-green-500",
            icon: (
                <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
            ),
        },
        error: {
            bar: "bg-red-500",
            icon: (
                <AlertCircle className="h-5 w-5 text-red-500   shrink-0 mt-0.5" />
            ),
        },
        info: {
            bar: "bg-blue-500",
            icon: <Info className="h-5 w-5 text-blue-500  shrink-0 mt-0.5" />,
        },
    };
    const s = styles[type] ?? styles.info;

    return (
        <div
            className={`flex items-start gap-3 bg-white rounded-xl shadow-2xl border border-gray-100 w-80 p-4 overflow-hidden relative transition-all duration-300 ease-out ${visible && !leaving ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"}`}
        >
            <span
                className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-xl ${s.bar}`}
            />
            {s.icon}
            <div className="flex-1 min-w-0 pl-1">
                {title && (
                    <p className="text-sm font-semibold text-gray-900">
                        {title}
                    </p>
                )}
                {message && (
                    <p className="text-sm text-gray-600 mt-0.5 leading-snug">
                        {message}
                    </p>
                )}
            </div>
            <button
                onClick={dismiss}
                className="text-gray-400 hover:text-gray-600 transition-colors shrink-0"
            >
                <X className="h-4 w-4" />
            </button>
        </div>
    );
}

function ToastContainer({ toasts, onDismiss }) {
    return (
        <div className="fixed bottom-4 right-4 z-9999 flex flex-col gap-3 pointer-events-none">
            {toasts.map((t) => (
                <div key={t.id} className="pointer-events-auto">
                    <Toast {...t} onDismiss={onDismiss} />
                </div>
            ))}
        </div>
    );
}

function useToast() {
    const [toasts, setToasts] = useState([]);
    const push = useCallback((type, title, message) => {
        setToasts((prev) => [
            ...prev,
            { id: Date.now() + Math.random(), type, title, message },
        ]);
    }, []);
    const dismiss = useCallback(
        (id) => setToasts((prev) => prev.filter((t) => t.id !== id)),
        [],
    );
    return {
        toasts,
        dismiss,
        toast: {
            success: (title, msg) => push("success", title, msg),
            error: (title, msg) => push("error", title, msg),
            info: (title, msg) => push("info", title, msg),
        },
    };
}

// ─── Question parser ──────────────────────────────────────────────────────────
// Handles formats like:
//   1. Question text
//   A) Option one   B) Option two   C) Option three   D) Option four
//   Answer: A
//
//   or inline:
//   1. What is X? A) foo B) bar C) baz D) qux Answer: C

function parseQuestions(raw) {
    const questions = [];
    // Split on blank lines or numbered lines
    const blocks = raw.trim().split(/\n{2,}|\r\n{2,}/);

    for (const block of blocks) {
        const lines = block
            .trim()
            .split(/\n/)
            .map((l) => l.trim())
            .filter(Boolean);
        if (!lines.length) continue;

        // Question line: starts with number
        const qLine = lines.find((l) => /^\d+[\.\)]\s+/.test(l));
        if (!qLine) continue;
        const qText = qLine.replace(/^\d+[\.\)]\s+/, "").trim();

        // Options: A) B) C) D) — can be on separate lines or same line
        const joined = lines.join(" ");
        const optionMatches = [
            ...joined.matchAll(
                /[A-Da-d][\.\)]\s+([^A-Da-d\n]+?)(?=[A-Da-d][\.\)]|Answer:|$)/g,
            ),
        ];
        if (optionMatches.length < 2) continue;
        const options = optionMatches.map((m) => m[1].trim()).slice(0, 4);
        while (options.length < 4) options.push("");

        // Correct answer
        const answerMatch = joined.match(/Answer\s*:\s*([A-Da-d])/i);
        const correctLetter = answerMatch ? answerMatch[1].toUpperCase() : "A";
        const correctOptionIndex = ["A", "B", "C", "D"].indexOf(correctLetter);

        questions.push({
            id: Date.now().toString() + Math.random(),
            text: qText,
            options,
            correctOptionIndex:
                correctOptionIndex >= 0 ? correctOptionIndex : 0,
        });
    }
    return questions;
}

// ─── PDF text extractor (client-side via pdf.js CDN) ─────────────────────────

async function extractTextFromPDF(file) {
    // Dynamically load pdf.js from CDN
    if (!window.pdfjsLib) {
        await new Promise((resolve, reject) => {
            const script = document.createElement("script");
            script.src =
                "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
        window.pdfjsLib.GlobalWorkerOptions.workerSrc =
            "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
    }

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer })
        .promise;
    let fullText = "";

    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const pageText = content.items.map((item) => item.str).join(" ");
        fullText += pageText + "\n\n";
    }

    return fullText;
}

// ─── Input method tabs ────────────────────────────────────────────────────────

const INPUT_TABS = [
    { key: "manual", label: "Manual Entry", icon: PenLine },
    { key: "pdf", label: "Upload PDF", icon: Upload },
    { key: "paste", label: "Paste Text", icon: ClipboardPaste },
];

// ─── Main component ───────────────────────────────────────────────────────────

export default function CreateExam() {
    const { user } = useAuth();
    const { toasts, dismiss, toast } = useToast();

    const EMPTY_EXAM = {
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
    };

    const [examData, setExamData] = useState(EMPTY_EXAM);
    const [selectedQuestions, setSelectedQuestions] = useState([]);
    const [saveStatus, setSaveStatus] = useState("");
    const [showQuestionModal, setShowQuestionModal] = useState(false);
    const [newQuestion, setNewQuestion] = useState({
        text: "",
        options: ["", "", "", ""],
        correctOptionIndex: 0,
    });
    const [inputTab, setInputTab] = useState("manual"); // "manual" | "pdf" | "paste"

    // PDF upload state
    const [isDragging, setIsDragging] = useState(false);
    const [pdfFile, setPdfFile] = useState(null);
    const [isParsing, setIsParsing] = useState(false);
    const [parsedPreview, setParsedPreview] = useState([]);
    const dropRef = useRef(null);
    const fileInputRef = useRef(null);

    // Paste state
    const [pasteText, setPasteText] = useState("");
    const [pastePreview, setPastePreview] = useState([]);

    const handleChange = (field, value) =>
        setExamData((prev) => ({ ...prev, [field]: value }));

    // ── PDF drag and drop ─────────────────────────────────────────────────────

    const handleDrop = useCallback(async (e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer?.files?.[0] ?? e.target?.files?.[0];
        if (!file) return;
        if (file.type !== "application/pdf") {
            toast.error("Wrong file type", "Please upload a PDF file.");
            return;
        }
        await processPDF(file);
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const handleFileInput = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.type !== "application/pdf") {
            toast.error("Wrong file type", "Please upload a PDF file.");
            return;
        }
        await processPDF(file);
    };

    const processPDF = async (file) => {
        setPdfFile(file);
        setIsParsing(true);
        setParsedPreview([]);
        try {
            const text = await extractTextFromPDF(file);
            const questions = parseQuestions(text);
            if (!questions.length) {
                toast.error(
                    "No questions found",
                    "Could not detect questions in this PDF. Try the Paste Text tab and paste your questions manually.",
                );
            } else {
                setParsedPreview(questions);
                toast.success(
                    `${questions.length} question${questions.length !== 1 ? "s" : ""} detected`,
                    "Review them below then click 'Add to Exam'.",
                );
            }
        } catch (err) {
            console.error(err);
            toast.error(
                "PDF error",
                "Failed to read the PDF. Make sure it contains selectable text (not a scanned image).",
            );
        } finally {
            setIsParsing(false);
        }
    };

    const addParsedToExam = () => {
        if (!parsedPreview.length) return;
        setSelectedQuestions((prev) => [...prev, ...parsedPreview]);
        setParsedPreview([]);
        setPdfFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
        toast.success(
            "Questions added!",
            `${parsedPreview.length} question${parsedPreview.length !== 1 ? "s" : ""} added to the exam.`,
        );
    };

    // ── Paste text ────────────────────────────────────────────────────────────

    const handleParseText = () => {
        if (!pasteText.trim()) {
            toast.error("Nothing to parse", "Please paste some text first.");
            return;
        }
        const questions = parseQuestions(pasteText);
        if (!questions.length) {
            toast.error(
                "No questions detected",
                "Make sure your text follows the format shown below.",
            );
            return;
        }
        setPastePreview(questions);
        toast.success(
            `${questions.length} question${questions.length !== 1 ? "s" : ""} detected`,
            "Review them below then click 'Add to Exam'.",
        );
    };

    const addPasteToExam = () => {
        if (!pastePreview.length) return;
        setSelectedQuestions((prev) => [...prev, ...pastePreview]);
        setPastePreview([]);
        setPasteText("");
        toast.success(
            "Questions added!",
            `${pastePreview.length} question${pastePreview.length !== 1 ? "s" : ""} added to the exam.`,
        );
    };

    // ── Manual question modal ─────────────────────────────────────────────────

    const handleAddQuestion = () => {
        if (!newQuestion.text.trim()) {
            toast.error("Required", "Question text is required.");
            return;
        }
        if (newQuestion.options.some((o) => !o.trim())) {
            toast.error("Required", "All four options are required.");
            return;
        }
        setSelectedQuestions((prev) => [
            ...prev,
            { ...newQuestion, id: Date.now().toString() },
        ]);
        setNewQuestion({
            text: "",
            options: ["", "", "", ""],
            correctOptionIndex: 0,
        });
        setShowQuestionModal(false);
        toast.success(
            "Question added",
            "The question has been added to the bank.",
        );
    };

    const removeQuestion = (id) =>
        setSelectedQuestions((prev) => prev.filter((q) => q.id !== id));
    const updateOption = (i, v) => {
        const opts = [...newQuestion.options];
        opts[i] = v;
        setNewQuestion((prev) => ({ ...prev, options: opts }));
    };

    // ── Submit ────────────────────────────────────────────────────────────────

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user?.uid) {
            toast.error(
                "Not logged in",
                "You must be logged in to create an exam.",
            );
            return;
        }
        if (!selectedQuestions.length) {
            toast.error(
                "No questions",
                "Add at least one question before creating the exam.",
            );
            return;
        }
        if (!examData.examCode || !examData.title) {
            toast.error("Missing fields", "Exam title and code are required.");
            return;
        }

        const startDateTime = new Date(
            `${examData.startDate}T${examData.startTime}`,
        );
        const endDateTime = new Date(`${examData.endDate}T${examData.endTime}`);
        if (startDateTime >= endDateTime) {
            toast.error(
                "Invalid schedule",
                "End time must be after start time.",
            );
            return;
        }

        setSaveStatus("saving");
        try {
            await setDoc(doc(db, "exams", examData.examCode), {
                ...examData,
                startDateTime: Timestamp.fromDate(startDateTime),
                endDateTime: Timestamp.fromDate(endDateTime),
                selectedQuestions,
                status: "published",
                createdBy: user.uid,
                createdAt: serverTimestamp(),
            });
            setSaveStatus("success");
            toast.success(
                "Exam created!",
                "The exam has been published successfully.",
            );
            setTimeout(() => {
                setSaveStatus(null);
                setExamData(EMPTY_EXAM);
                setSelectedQuestions([]);
            }, 2000);
        } catch (err) {
            console.error(err);
            setSaveStatus("error");
            toast.error("Failed to create exam", err.message);
        }
    };

    const handleCancel = () => {
        setExamData(EMPTY_EXAM);
        setSelectedQuestions([]);
    };

    // ── Reusable preview list ─────────────────────────────────────────────────

    const QuestionPreviewList = ({ questions, onRemove }) => (
        <div className="space-y-3">
            {questions.map((q, qi) => (
                <div
                    key={q.id}
                    className="group bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl p-4 transition-all"
                >
                    <div className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                            <div className="flex items-start gap-3 mb-3">
                                <span className="inline-flex items-center justify-center w-6 h-6 bg-green-600 text-white text-xs font-semibold rounded-full shrink-0 mt-0.5">
                                    {qi + 1}
                                </span>
                                <p className="font-medium text-gray-900 leading-relaxed">
                                    {q.text}
                                </p>
                            </div>
                            <div className="ml-9 space-y-1.5">
                                {q.options.map((opt, oi) => (
                                    <div
                                        key={oi}
                                        className={`flex items-center gap-2 text-sm ${oi === q.correctOptionIndex ? "text-green-700 font-medium" : "text-gray-600"}`}
                                    >
                                        {oi === q.correctOptionIndex ? (
                                            <CheckCircle className="h-4 w-4 shrink-0" />
                                        ) : (
                                            <div className="w-4 h-4 rounded-full border-2 border-gray-300 shrink-0" />
                                        )}
                                        {opt}
                                    </div>
                                ))}
                            </div>
                        </div>
                        {onRemove && (
                            <button
                                type="button"
                                className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                onClick={() => onRemove(q.id)}
                            >
                                <X className="h-5 w-5" />
                            </button>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );

    // ── Render ────────────────────────────────────────────────────────────────

    return (
        <>
            <ToastContainer toasts={toasts} onDismiss={dismiss} />

            <main className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                        Create New Exam
                    </h1>
                    <p className="text-gray-600 mt-1">
                        Set up a new examination for your students
                    </p>
                </div>

                {/* Save status banner */}
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
                                        Creating exam…
                                    </p>
                                </>
                            )}
                        </div>
                    </Card>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* ── Basic Information ── */}
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
                                        handleChange(
                                            "passingScore",
                                            e.target.value,
                                        )
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
                                    placeholder="Enter instructions for students…"
                                    value={examData.instructions}
                                    onChange={(e) =>
                                        handleChange(
                                            "instructions",
                                            e.target.value,
                                        )
                                    }
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-900 focus:border-transparent"
                                    required
                                />
                            </div>

                            {/* Visibility */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-3">
                                    Exam Visibility
                                </label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {[
                                        {
                                            value: "public",
                                            Icon: Globe,
                                            label: "Public",
                                            desc: "Visible to all students on the platform",
                                            activeColor:
                                                "border-green-600 bg-green-50",
                                            iconBg: "bg-green-100",
                                            iconColor: "text-green-700",
                                            textColor: "text-green-800",
                                            checkColor: "text-green-600",
                                        },
                                        {
                                            value: "private",
                                            Icon: Lock,
                                            label: "Private",
                                            desc: "Only accessible via exam code",
                                            activeColor:
                                                "border-blue-600  bg-blue-50",
                                            iconBg: "bg-blue-100",
                                            iconColor: "text-blue-700",
                                            textColor: "text-blue-800",
                                            checkColor: "text-blue-600",
                                        },
                                    ].map(
                                        ({
                                            value,
                                            Icon,
                                            label,
                                            desc,
                                            activeColor,
                                            iconBg,
                                            iconColor,
                                            textColor,
                                            checkColor,
                                        }) => {
                                            const active =
                                                examData.visibility === value;
                                            return (
                                                <button
                                                    key={value}
                                                    type="button"
                                                    onClick={() =>
                                                        handleChange(
                                                            "visibility",
                                                            value,
                                                        )
                                                    }
                                                    className={`flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all cursor-pointer ${active ? activeColor : "border-gray-200 bg-white hover:border-gray-300"}`}
                                                >
                                                    <div
                                                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${active ? iconBg : "bg-gray-100"}`}
                                                    >
                                                        <Icon
                                                            className={`h-5 w-5 ${active ? iconColor : "text-gray-500"}`}
                                                        />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center justify-between">
                                                            <p
                                                                className={`font-bold text-sm ${active ? textColor : "text-gray-700"}`}
                                                            >
                                                                {label}
                                                            </p>
                                                            {active && (
                                                                <CheckCircle
                                                                    className={`h-4 w-4 shrink-0 ${checkColor}`}
                                                                />
                                                            )}
                                                        </div>
                                                        <p className="text-xs text-gray-500 mt-0.5">
                                                            {desc}
                                                        </p>
                                                    </div>
                                                </button>
                                            );
                                        },
                                    )}
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* ── Schedule ── */}
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
                                        handleChange(
                                            "startDate",
                                            e.target.value,
                                        )
                                    }
                                    required
                                />
                                <Input
                                    label="Start Time"
                                    type="time"
                                    value={examData.startTime}
                                    onChange={(e) =>
                                        handleChange(
                                            "startTime",
                                            e.target.value,
                                        )
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

                    {/* ── Question Bank ── */}
                    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                        {/* Bank header */}
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
                                            added
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Input method tabs */}
                        <div className="border-b border-gray-200 px-6">
                            <div className="flex gap-1 -mb-px">
                                {INPUT_TABS.map(
                                    ({ key, label, icon: Icon }) => (
                                        <button
                                            key={key}
                                            type="button"
                                            onClick={() => setInputTab(key)}
                                            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${inputTab === key ? "border-green-700 text-green-800" : "border-transparent text-gray-500 hover:text-gray-700"}`}
                                        >
                                            <Icon className="h-4 w-4" />
                                            {label}
                                        </button>
                                    ),
                                )}
                            </div>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* ── Tab: Manual ── */}
                            {inputTab === "manual" && (
                                <div>
                                    <div className="flex justify-end mb-4">
                                        <button
                                            type="button"
                                            className="inline-flex items-center gap-2 px-4 py-2.5 bg-green-800 hover:bg-green-900 text-white text-sm font-medium rounded-xl shadow-md transition-all cursor-pointer"
                                            onClick={() =>
                                                setShowQuestionModal(true)
                                            }
                                        >
                                            <Plus className="h-4 w-4" /> Add
                                            Question
                                        </button>
                                    </div>

                                    {selectedQuestions.length > 0 ? (
                                        <QuestionPreviewList
                                            questions={selectedQuestions}
                                            onRemove={removeQuestion}
                                        />
                                    ) : (
                                        <div className="text-center py-12">
                                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                                <Plus className="h-8 w-8 text-gray-400" />
                                            </div>
                                            <p className="text-gray-500 text-sm font-medium">
                                                No questions added yet
                                            </p>
                                            <p className="text-gray-400 text-sm mt-1">
                                                Click &quot;Add Question&quot;
                                                to get started
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* ── Tab: Upload PDF ── */}
                            {inputTab === "pdf" && (
                                <div className="space-y-5">
                                    {/* Drop zone */}
                                    <div
                                        ref={dropRef}
                                        onDragOver={(e) => {
                                            e.preventDefault();
                                            setIsDragging(true);
                                        }}
                                        onDragLeave={() => setIsDragging(false)}
                                        onDrop={handleDrop}
                                        onClick={() =>
                                            fileInputRef.current?.click()
                                        }
                                        className={`relative flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-12 transition-all cursor-pointer select-none ${isDragging ? "border-green-500 bg-green-50" : "border-gray-300 bg-gray-50 hover:border-green-400 hover:bg-green-50"}`}
                                    >
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="application/pdf"
                                            className="hidden"
                                            onChange={handleFileInput}
                                        />
                                        <div
                                            className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-colors ${isDragging ? "bg-green-100" : "bg-gray-100"}`}
                                        >
                                            <Upload
                                                className={`h-8 w-8 transition-colors ${isDragging ? "text-green-600" : "text-gray-400"}`}
                                            />
                                        </div>
                                        <p className="text-sm font-semibold text-gray-700 mb-1">
                                            {pdfFile
                                                ? pdfFile.name
                                                : "Drop your PDF here or click to browse"}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            Supports PDF files with selectable
                                            text
                                        </p>
                                    </div>

                                    {/* Parsing indicator */}
                                    {isParsing && (
                                        <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                                            <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin shrink-0" />
                                            <p className="text-sm font-medium text-blue-800">
                                                Extracting questions from PDF…
                                            </p>
                                        </div>
                                    )}

                                    {/* Parsed preview */}
                                    {parsedPreview.length > 0 && (
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <p className="text-sm font-semibold text-gray-700">
                                                    {parsedPreview.length}{" "}
                                                    question
                                                    {parsedPreview.length !== 1
                                                        ? "s"
                                                        : ""}{" "}
                                                    detected — review before
                                                    adding:
                                                </p>
                                                <button
                                                    type="button"
                                                    onClick={addParsedToExam}
                                                    className="px-4 py-2 bg-green-800 hover:bg-green-900 text-white text-sm font-medium rounded-xl shadow transition-all cursor-pointer"
                                                >
                                                    Add to Exam
                                                </button>
                                            </div>
                                            <QuestionPreviewList
                                                questions={parsedPreview}
                                            />
                                        </div>
                                    )}

                                    {/* Format hint */}
                                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                                        <p className="text-xs font-semibold text-amber-900 mb-2">
                                            Expected PDF format:
                                        </p>
                                        <pre className="text-xs text-amber-800 leading-relaxed whitespace-pre-wrap font-mono">
                                            {`1. What is the capital of Nigeria?
A) Lagos  B) Ibadan  C) Abuja  D) Kano
Answer: C

2. Which data structure uses LIFO?
A) Queue  B) Stack  C) Tree  D) Graph
Answer: B`}
                                        </pre>
                                    </div>
                                </div>
                            )}

                            {/* ── Tab: Paste Text ── */}
                            {inputTab === "paste" && (
                                <div className="space-y-5">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Paste your questions below
                                        </label>
                                        <textarea
                                            rows={12}
                                            value={pasteText}
                                            onChange={(e) => {
                                                setPasteText(e.target.value);
                                                setPastePreview([]);
                                            }}
                                            placeholder={`1. What is the capital of Nigeria?\nA) Lagos  B) Ibadan  C) Abuja  D) Kano\nAnswer: C\n\n2. Which data structure uses LIFO?\nA) Queue  B) Stack  C) Tree  D) Graph\nAnswer: B`}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-900 focus:border-transparent font-mono text-sm resize-y"
                                        />
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <button
                                            type="button"
                                            onClick={handleParseText}
                                            className="px-5 py-2.5 bg-green-800 hover:bg-green-900 text-white text-sm font-medium rounded-xl shadow transition-all cursor-pointer"
                                        >
                                            Detect Questions
                                        </button>
                                        {pasteText && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setPasteText("");
                                                    setPastePreview([]);
                                                }}
                                                className="px-5 py-2.5 border border-gray-300 text-gray-600 hover:bg-gray-50 text-sm font-medium rounded-xl transition-all cursor-pointer"
                                            >
                                                Clear
                                            </button>
                                        )}
                                    </div>

                                    {/* Paste preview */}
                                    {pastePreview.length > 0 && (
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <p className="text-sm font-semibold text-gray-700">
                                                    {pastePreview.length}{" "}
                                                    question
                                                    {pastePreview.length !== 1
                                                        ? "s"
                                                        : ""}{" "}
                                                    detected — review before
                                                    adding:
                                                </p>
                                                <button
                                                    type="button"
                                                    onClick={addPasteToExam}
                                                    className="px-4 py-2 bg-green-800 hover:bg-green-900 text-white text-sm font-medium rounded-xl shadow transition-all cursor-pointer"
                                                >
                                                    Add to Exam
                                                </button>
                                            </div>
                                            <QuestionPreviewList
                                                questions={pastePreview}
                                            />
                                        </div>
                                    )}

                                    {/* Format hint */}
                                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                                        <p className="text-xs font-semibold text-blue-900 mb-1">
                                            Supported format:
                                        </p>
                                        <p className="text-xs text-blue-800">
                                            Number each question, list options
                                            as A) B) C) D), and end each block
                                            with{" "}
                                            <code className="bg-blue-100 px-1 rounded">
                                                Answer: X
                                            </code>
                                            . Separate questions with a blank
                                            line.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Questions already in exam (shown when not on manual tab) */}
                        {inputTab !== "manual" &&
                            selectedQuestions.length > 0 && (
                                <div className="border-t border-gray-200 p-6 space-y-4">
                                    <p className="text-sm font-semibold text-gray-700">
                                        Questions already in this exam (
                                        {selectedQuestions.length}):
                                    </p>
                                    <QuestionPreviewList
                                        questions={selectedQuestions}
                                        onRemove={removeQuestion}
                                    />
                                </div>
                            )}
                    </div>

                    {/* ── Manual question modal ── */}
                    {showQuestionModal && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-200">
                                <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
                                    <div>
                                        <h2 className="text-xl font-semibold text-gray-900">
                                            Create New Question
                                        </h2>
                                        <p className="text-sm text-gray-600 mt-1">
                                            Add a multiple-choice question
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                                        onClick={() =>
                                            setShowQuestionModal(false)
                                        }
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
                                            rows="3"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-600 focus:border-transparent transition-all resize-none"
                                            placeholder="Enter your question here…"
                                            value={newQuestion.text}
                                            onChange={(e) =>
                                                setNewQuestion((prev) => ({
                                                    ...prev,
                                                    text: e.target.value,
                                                }))
                                            }
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Answer Options *
                                        </label>
                                        <p className="text-xs text-gray-500 mb-3">
                                            Select the correct answer using the
                                            radio button
                                        </p>
                                        <div className="space-y-3">
                                            {newQuestion.options.map(
                                                (opt, i) => (
                                                    <div
                                                        key={i}
                                                        className={`flex items-center gap-3 p-3 border-2 rounded-xl transition-all ${newQuestion.correctOptionIndex === i ? "border-green-500 bg-green-50" : "border-gray-200 hover:border-gray-300"}`}
                                                    >
                                                        <input
                                                            type="radio"
                                                            name="correctOption"
                                                            className="w-4 h-4 text-green-600 focus:ring-green-600 cursor-pointer"
                                                            checked={
                                                                newQuestion.correctOptionIndex ===
                                                                i
                                                            }
                                                            onChange={() =>
                                                                setNewQuestion(
                                                                    (prev) => ({
                                                                        ...prev,
                                                                        correctOptionIndex:
                                                                            i,
                                                                    }),
                                                                )
                                                            }
                                                        />
                                                        <input
                                                            type="text"
                                                            className="flex-1 px-3 py-2 border-0 bg-transparent focus:outline-none text-gray-900 placeholder:text-gray-400"
                                                            placeholder={`Option ${i + 1}`}
                                                            value={opt}
                                                            onChange={(e) =>
                                                                updateOption(
                                                                    i,
                                                                    e.target
                                                                        .value,
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
                                        onClick={() =>
                                            setShowQuestionModal(false)
                                        }
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

                    {/* ── Submit ── */}
                    <Card className="p-6 bg-white border border-gray-200 rounded-2xl">
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Button
                                type="submit"
                                size="lg"
                                className="flex-1 bg-green-900 hover:bg-green-800 cursor-pointer text-white font-bold"
                            >
                                <Save className="mr-2 h-5 w-5" /> Create Exam
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

                {/* Help card */}
                <Card className="p-6 bg-blue-50 border border-blue-200 rounded-2xl">
                    <div className="flex gap-4">
                        <AlertCircle className="h-6 w-6 text-blue-600 shrink-0 mt-0.5" />
                        <div>
                            <h4 className="font-bold text-gray-900 mb-2">
                                Tips for Creating Exams
                            </h4>
                            <ul className="space-y-1 text-sm text-gray-700">
                                {[
                                    "Set a clear and descriptive exam title",
                                    "Ensure duration is appropriate for the number of questions",
                                    "Use Public for open exams, Private for invite-only (students need the exam code)",
                                    "For PDF uploads, make sure the PDF contains selectable text, not scanned images",
                                    "Use the Paste Text tab for quick bulk entry — follow the A) B) C) D) format",
                                    "Provide clear instructions for students",
                                    "Exams will automatically become unavailable after the end date and time",
                                ].map((tip) => (
                                    <li
                                        key={tip}
                                        className="flex items-start gap-2"
                                    >
                                        <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 shrink-0" />
                                        <span>{tip}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </Card>
            </main>
        </>
    );
}
