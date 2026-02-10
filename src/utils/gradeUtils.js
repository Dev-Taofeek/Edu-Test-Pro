export const calculateGrade = (score) => {
    if (score >= 91) return "A";
    if (score >= 81) return "B";
    if (score >= 71) return "C";
    if (score >= 61) return "D";
    return "F";
};

export const getPassStatus = (score, passingScore = 50) => {
    return score >= passingScore ? "passed" : "failed";
};

export const getGradeColor = (grade) => {
    if (grade === "A") return "text-green-700 bg-green-100";
    if (grade === "B") return "text-blue-700 bg-blue-100";
    if (grade === "C") return "text-yellow-700 bg-yellow-100";
    if (grade === "D") return "text-orange-700 bg-orange-100";
    return "text-red-700 bg-red-100";
};

export const getPerformanceLabel = (score) => {
    if (score >= 91) return "Excellent";
    if (score >= 81) return "Very Good";
    if (score >= 71) return "Good";
    if (score >= 61) return "Fair";
    return "Needs Improvement";
};

export const getPerformanceColor = (score) => {
    if (score >= 91) return "text-green-700";
    if (score >= 81) return "text-blue-700";
    if (score >= 71) return "text-yellow-700";
    if (score >= 61) return "text-orange-700";
    return "text-red-700";
};
