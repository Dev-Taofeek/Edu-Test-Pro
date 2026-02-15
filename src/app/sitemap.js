export default function sitemap() {
    return [
        {
            url: "https://online-cbt-exam.vercel.app/",
            lastModified: new Date(),
            changeFrequency: "yearly",
            priority: 1,
        },
        {
            url: "https://online-cbt-exam.vercel.app/login",
            lastModified: new Date(),
            changeFrequency: "monthly",
            priority: 0.8,
        },
        {
            url: "https://online-cbt-exam.vercel.app/register",
            lastModified: new Date(),
            changeFrequency: "monthly",
            priority: 0.8,
        },
        {
            url: "https://online-cbt-exam.vercel.app//instruction",
            lastModified: new Date(),
            changeFrequency: "weekly",
            priority: 0.5,
        },
    ];
}
