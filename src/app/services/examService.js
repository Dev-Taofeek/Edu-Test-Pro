// services/examService.js
import {
    collection,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    getDocs,
    getDoc,
    query,
    where,
    orderBy,
    Timestamp,
    serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

const EXAMS_COLLECTION = "exams";
const DRAFTS_COLLECTION = "examDrafts";
const QUESTIONS_COLLECTION = "questions";

// Exam Operations
export const createExam = async (examData, userId) => {
    try {
        const examRef = await addDoc(collection(db, EXAMS_COLLECTION), {
            ...examData,
            userId,
            status: "active",
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });
        return { success: true, id: examRef.id };
    } catch (error) {
        console.error("Error creating exam:", error);
        return { success: false, error: error.message };
    }
};

export const updateExam = async (examId, examData) => {
    try {
        const examRef = doc(db, EXAMS_COLLECTION, examId);
        await updateDoc(examRef, {
            ...examData,
            updatedAt: serverTimestamp(),
        });
        return { success: true };
    } catch (error) {
        console.error("Error updating exam:", error);
        return { success: false, error: error.message };
    }
};

export const deleteExam = async (examId) => {
    try {
        const examRef = doc(db, EXAMS_COLLECTION, examId);
        await deleteDoc(examRef);
        return { success: true };
    } catch (error) {
        console.error("Error deleting exam:", error);
        return { success: false, error: error.message };
    }
};

export const getExam = async (examId) => {
    try {
        const examRef = doc(db, EXAMS_COLLECTION, examId);
        const examSnap = await getDoc(examRef);

        if (examSnap.exists()) {
            return {
                success: true,
                data: { id: examSnap.id, ...examSnap.data() },
            };
        } else {
            return { success: false, error: "Exam not found" };
        }
    } catch (error) {
        console.error("Error getting exam:", error);
        return { success: false, error: error.message };
    }
};

export const getAllExams = async (userId) => {
    try {
        const examsQuery = query(
            collection(db, EXAMS_COLLECTION),
            where("userId", "==", userId),
            orderBy("createdAt", "desc"),
        );

        const querySnapshot = await getDocs(examsQuery);
        const exams = [];
        querySnapshot.forEach((doc) => {
            exams.push({ id: doc.id, ...doc.data() });
        });

        return { success: true, data: exams };
    } catch (error) {
        console.error("Error getting exams:", error);
        return { success: false, error: error.message };
    }
};

// Draft Operations
export const saveDraft = async (draftData, userId) => {
    try {
        const draftRef = await addDoc(collection(db, DRAFTS_COLLECTION), {
            ...draftData,
            userId,
            status: "draft",
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });
        return { success: true, id: draftRef.id };
    } catch (error) {
        console.error("Error saving draft:", error);
        return { success: false, error: error.message };
    }
};

export const updateDraft = async (draftId, draftData) => {
    try {
        const draftRef = doc(db, DRAFTS_COLLECTION, draftId);
        await updateDoc(draftRef, {
            ...draftData,
            updatedAt: serverTimestamp(),
        });
        return { success: true };
    } catch (error) {
        console.error("Error updating draft:", error);
        return { success: false, error: error.message };
    }
};

export const getAllDrafts = async (userId) => {
    try {
        const draftsQuery = query(
            collection(db, DRAFTS_COLLECTION),
            where("userId", "==", userId),
            orderBy("createdAt", "desc"),
        );

        const querySnapshot = await getDocs(draftsQuery);
        const drafts = [];
        querySnapshot.forEach((doc) => {
            drafts.push({ id: doc.id, ...doc.data() });
        });

        return { success: true, data: drafts };
    } catch (error) {
        console.error("Error getting drafts:", error);
        return { success: false, error: error.message };
    }
};

export const deleteDraft = async (draftId) => {
    try {
        const draftRef = doc(db, DRAFTS_COLLECTION, draftId);
        await deleteDoc(draftRef);
        return { success: true };
    } catch (error) {
        console.error("Error deleting draft:", error);
        return { success: false, error: error.message };
    }
};

// Question Bank Operations
export const createQuestion = async (questionData, userId) => {
    try {
        const questionRef = await addDoc(collection(db, QUESTIONS_COLLECTION), {
            ...questionData,
            userId,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });
        return { success: true, id: questionRef.id };
    } catch (error) {
        console.error("Error creating question:", error);
        return { success: false, error: error.message };
    }
};

export const updateQuestion = async (questionId, questionData) => {
    try {
        const questionRef = doc(db, QUESTIONS_COLLECTION, questionId);
        await updateDoc(questionRef, {
            ...questionData,
            updatedAt: serverTimestamp(),
        });
        return { success: true };
    } catch (error) {
        console.error("Error updating question:", error);
        return { success: false, error: error.message };
    }
};

export const deleteQuestion = async (questionId) => {
    try {
        const questionRef = doc(db, QUESTIONS_COLLECTION, questionId);
        await deleteDoc(questionRef);
        return { success: true };
    } catch (error) {
        console.error("Error deleting question:", error);
        return { success: false, error: error.message };
    }
};

export const getAllQuestions = async (userId) => {
    try {
        const questionsQuery = query(
            collection(db, QUESTIONS_COLLECTION),
            where("userId", "==", userId),
            orderBy("createdAt", "desc"),
        );

        const querySnapshot = await getDocs(questionsQuery);
        const questions = [];
        querySnapshot.forEach((doc) => {
            questions.push({ id: doc.id, ...doc.data() });
        });

        return { success: true, data: questions };
    } catch (error) {
        console.error("Error getting questions:", error);
        return { success: false, error: error.message };
    }
};

export const getQuestionsByTopic = async (userId, topic) => {
    try {
        const questionsQuery = query(
            collection(db, QUESTIONS_COLLECTION),
            where("userId", "==", userId),
            where("topic", "==", topic),
            orderBy("createdAt", "desc"),
        );

        const querySnapshot = await getDocs(questionsQuery);
        const questions = [];
        querySnapshot.forEach((doc) => {
            questions.push({ id: doc.id, ...doc.data() });
        });

        return { success: true, data: questions };
    } catch (error) {
        console.error("Error getting questions by topic:", error);
        return { success: false, error: error.message };
    }
};
