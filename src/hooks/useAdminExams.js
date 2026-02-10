import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

export const useAdminExams = (adminId) => {
    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchExams = async () => {
            setLoading(true);
            try {
                const examsSnap = await getDocs(collection(db, "exams"));
                const allExams = examsSnap.docs
                    .map((doc) => ({ id: doc.id, ...doc.data() }))
                    .filter((exam) => exam.createdBy === adminId); // Only exams created by admin

                setExams(allExams);
            } catch (error) {
                console.error("Error fetching exams:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchExams();
    }, [adminId]);

    return { exams, loading };
};
