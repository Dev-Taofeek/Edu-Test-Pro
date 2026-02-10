import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

export const useAdminExams = (adminId) => {
    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setExams([]);
        setLoading(true);

        if (!adminId) {
            setLoading(false);
            return;
        }

        const fetchExams = async () => {
            try {
                const examsSnap = await getDocs(collection(db, "exams"));
                const allExams = examsSnap.docs
                    .map((doc) => ({ id: doc.id, ...doc.data() }))
                    .filter((exam) => exam.createdBy === adminId);

                setExams(allExams);
            } catch (error) {
                console.error("Error fetching exams:", error);
                setExams([]);
            } finally {
                setLoading(false);
            }
        };

        fetchExams();
    }, [adminId]);

    return { exams, loading };
};
