import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";

export function useStudents(currentAdminId) {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStudents = async () => {
            if (!currentAdminId) {
                setLoading(false);
                return;
            }

            try {
                console.log("Fetching students for admin:", currentAdminId);

                // Step 1: Get all exams created by this admin
                const examsQuery = query(
                    collection(db, "exams"),
                    where("createdBy", "==", currentAdminId),
                );
                const examsSnapshot = await getDocs(examsQuery);
                const adminExamIds = examsSnapshot.docs.map((doc) => doc.id);

                console.log("Admin's exam IDs:", adminExamIds);

                if (adminExamIds.length === 0) {
                    console.log("No exams created by this admin");
                    setStudents([]);
                    setLoading(false);
                    return;
                }

                // Step 2: Get all students
                const studentsSnapshot = await getDocs(
                    collection(db, "students"),
                );

                const studentsData = [];

                studentsSnapshot.forEach((doc) => {
                    const studentData = doc.data();
                    const examsTaken = studentData.examsTaken || [];

                    // Filter exams taken to only include this admin's exams
                    const relevantExams = examsTaken.filter((exam) =>
                        adminExamIds.includes(exam.examId),
                    );

                    // Only include student if they've taken at least one of this admin's exams
                    if (relevantExams.length > 0) {
                        const scores = relevantExams.map((e) => e.score || 0);
                        const averageScore = scores.length
                            ? Math.round(
                                  scores.reduce((a, b) => a + b, 0) /
                                      scores.length,
                              )
                            : 0;

                        studentsData.push({
                            id: doc.id,
                            name: `${studentData.firstName || ""} ${studentData.lastName || ""}`.trim(),
                            email: studentData.email || "N/A",
                            matricNo: studentData.matricNo || "N/A",
                            phone: studentData.phone || "N/A",
                            dateOfBirth: studentData.dateOfBirth || "N/A",
                            status: "active",
                            examsCompleted: relevantExams.length,
                            averageScore: averageScore,
                            examsTaken: relevantExams,
                        });
                    }
                });

                console.log("Filtered students:", studentsData);
                setStudents(studentsData);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching students:", error);
                setLoading(false);
            }
        };

        fetchStudents();
    }, [currentAdminId]);

    return { students, loading };
}
