export const MOCK_USER = {
    id: "1",
    name: "Alex Johnson",
    email: "alex@student.com",
    role: "student",
};

export const MOCK_EXAMS = [
    {
        id: "exam-1",
        title: "2024 JAMB Mock - English",
        subject: "English Language",
        durationMinutes: 15,
        totalQuestions: 5,
        status: "available",
        questions: [
            {
                id: "q1",
                text: "Choose the option that best completes the sentence: The committee ______ unable to reach a consensus on the matter.",
                options: [
                    { id: "a", text: "was" },
                    { id: "b", text: "were" },
                    { id: "c", text: "are" },
                    { id: "d", text: "have been" },
                ],
                correctOptionId: "a",
            },
            {
                id: "q2",
                text: 'Which of the following is a synonym for "Benevolent"?',
                options: [
                    { id: "a", text: "Malevolent" },
                    { id: "b", text: "Kind" },
                    { id: "c", text: "Cruel" },
                    { id: "d", text: "Indifferent" },
                ],
                correctOptionId: "b",
            },
            {
                id: "q3",
                text: 'Identify the figure of speech: "The wind howled in the night."',
                options: [
                    { id: "a", text: "Simile" },
                    { id: "b", text: "Metaphor" },
                    { id: "c", text: "Personification" },
                    { id: "d", text: "Hyperbole" },
                ],
                correctOptionId: "c",
            },
            {
                id: "q4",
                text: "Choose the correctly spelled word.",
                options: [
                    { id: "a", text: "Embarrasment" },
                    { id: "b", text: "Embarassment" },
                    { id: "c", text: "Embarrassment" },
                    { id: "d", text: "Embarasment" },
                ],
                correctOptionId: "c",
            },
            {
                id: "q5",
                text: 'The phrase "kick the bucket" is an example of:',
                options: [
                    { id: "a", text: "Proverb" },
                    { id: "b", text: "Idiom" },
                    { id: "c", text: "Cliché" },
                    { id: "d", text: "Slang" },
                ],
                correctOptionId: "b",
            },
        ],
    },
    {
        id: "exam-2",
        title: "General Mathematics",
        subject: "Mathematics",
        durationMinutes: 20,
        totalQuestions: 5,
        status: "available",
        questions: [
            {
                id: "m1",
                text: "Solve for x: 2x + 5 = 15",
                options: [
                    { id: "a", text: "5" },
                    { id: "b", text: "10" },
                    { id: "c", text: "2.5" },
                    { id: "d", text: "7" },
                ],
                correctOptionId: "a",
            },
            {
                id: "m2",
                text: "What is the value of Pi to two decimal places?",
                options: [
                    { id: "a", text: "3.12" },
                    { id: "b", text: "3.14" },
                    { id: "c", text: "3.16" },
                    { id: "d", text: "3.18" },
                ],
                correctOptionId: "b",
            },
            {
                id: "m3",
                text: "If a triangle has angles 60° and 60°, what is the third angle?",
                options: [
                    { id: "a", text: "30°" },
                    { id: "b", text: "90°" },
                    { id: "c", text: "60°" },
                    { id: "d", text: "45°" },
                ],
                correctOptionId: "c",
            },
            {
                id: "m4",
                text: "Calculate the area of a square with side length 4cm.",
                options: [
                    { id: "a", text: "8 cm²" },
                    { id: "b", text: "12 cm²" },
                    { id: "c", text: "16 cm²" },
                    { id: "d", text: "20 cm²" },
                ],
                correctOptionId: "c",
            },
            {
                id: "m5",
                text: "What is 15% of 200?",
                options: [
                    { id: "a", text: "20" },
                    { id: "b", text: "25" },
                    { id: "c", text: "30" },
                    { id: "d", text: "35" },
                ],
                correctOptionId: "c",
            },
        ],
    },
];
