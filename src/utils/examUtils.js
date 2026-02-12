export const checkExamAvailability = (exam) => {
    const now = new Date();

    // Handle Firestore Timestamp objects
    const startDateTime = exam.startDateTime?.toDate
        ? exam.startDateTime.toDate()
        : new Date(exam.startDateTime);
    const endDateTime = exam.endDateTime?.toDate
        ? exam.endDateTime.toDate()
        : new Date(exam.endDateTime);

    // Check if exam hasn't started yet
    if (now < startDateTime) {
        return {
            isAvailable: false,
            status: "not_started",
            message: `Exam will be available on ${startDateTime.toLocaleDateString()} at ${startDateTime.toLocaleTimeString()}`,
        };
    }

    // Check if exam has ended
    if (now > endDateTime) {
        return {
            isAvailable: false,
            status: "ended",
            message: `Exam ended on ${endDateTime.toLocaleDateString()} at ${endDateTime.toLocaleTimeString()}`,
        };
    }

    // Exam is currently available
    return {
        isAvailable: true,
        status: "active",
        message: `Exam ends on ${endDateTime.toLocaleDateString()} at ${endDateTime.toLocaleTimeString()}`,
    };
};

export const getTimeRemaining = (exam) => {
    const now = new Date();
    const endDateTime = exam.endDateTime?.toDate
        ? exam.endDateTime.toDate()
        : new Date(exam.endDateTime);

    const totalSeconds = Math.max(0, Math.floor((endDateTime - now) / 1000));

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return {
        hours,
        minutes,
        seconds,
        totalSeconds,
    };
};

export const formatTimeRemaining = (totalSeconds) => {
    if (totalSeconds <= 0) return "Expired";

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
        return `${hours}h ${minutes}m remaining`;
    } else if (minutes > 0) {
        return `${minutes}m ${seconds}s remaining`;
    } else {
        return `${seconds}s remaining`;
    }
};
