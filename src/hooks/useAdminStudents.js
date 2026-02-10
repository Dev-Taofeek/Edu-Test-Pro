import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";

export const useAdminStudents = (adminId) => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setStudents([]);
        setLoading(true);

        if (!adminId) {
            setLoading(false);
            return;
        }

        const fetchStudents = async () => {
            try {
                console.log("Fetching students for admin:", adminId);

                // First, get all exams created by this admin
                const examsSnap = await getDocs(collection(db, "exams"));
                const adminExamIds = examsSnap.docs
                    .filter((doc) => doc.data().createdBy === adminId)
                    .map((doc) => doc.id);

                console.log("Admin exam IDs:", adminExamIds);

                // Get all students
                const studentsSnap = await getDocs(collection(db, "students"));
                const allStudents = studentsSnap.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));

                console.log("All students:", allStudents.length);

                // Filter students who have taken at least one exam from this admin
                const filtered = allStudents.filter((student) => {
                    // Check if student has examsTaken array
                    if (
                        !student.examsTaken ||
                        student.examsTaken.length === 0
                    ) {
                        return false;
                    }

                    // Check if any of the exams taken matches admin's exams
                    const hasTakenAdminExam = student.examsTaken.some(
                        (exam) => {
                            // Check both examId and createdBy fields
                            return (
                                adminExamIds.includes(exam.examId) ||
                                exam.createdBy === adminId
                            );
                        },
                    );

                    return hasTakenAdminExam;
                });

                console.log("Filtered students:", filtered.length);
                setStudents(filtered);
            } catch (error) {
                console.error("Error fetching students:", error);
                setStudents([]);
            } finally {
                setLoading(false);
            }
        };

        fetchStudents();
    }, [adminId]);

    return { students, loading };
};
