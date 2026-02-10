import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

export const useAdminStudents = (adminId) => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStudents = async () => {
            setLoading(true);
            try {
                // Get all students
                const studentsSnap = await getDocs(collection(db, "students"));
                const allStudents = studentsSnap.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));

                // Filter students who have taken exams created by this admin
                const filtered = allStudents.filter((student) =>
                    student.examsTaken?.some(
                        (exam) => exam.createdBy === adminId,
                    ),
                );

                setStudents(filtered);
            } catch (error) {
                console.error("Error fetching students:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStudents();
    }, [adminId]);

    return { students, loading };
};
