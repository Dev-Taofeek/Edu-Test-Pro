import {
    collection,
    getDocs,
    doc,
    updateDoc,
    Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export async function migrateStudentStatuses() {
    try {
        console.log("Starting student status migration...");

        const studentsRef = collection(db, "students");
        const snapshot = await getDocs(studentsRef);

        let updatedCount = 0;
        const now = Timestamp.now();

        for (const studentDoc of snapshot.docs) {
            const data = studentDoc.data();

            // Check if status is null, empty, or "null" string
            if (!data.status || data.status === "" || data.status === "null") {
                const studentRef = doc(db, "students", studentDoc.id);

                await updateDoc(studentRef, {
                    status: "active",
                    statusHistory: data.statusHistory || [],
                    lastUpdated: now,
                });

                console.log(`Updated student: ${studentDoc.id}`);
                updatedCount++;
            }
        }

        console.log(`Migration complete! Updated ${updatedCount} students.`);
        return { success: true, updatedCount };
    } catch (error) {
        console.error("Migration error:", error);
        return { success: false, error: error.message };
    }
}
