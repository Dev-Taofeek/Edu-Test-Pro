/** @type {import('next').NextConfig} */
const nextConfig = {
    async headers() {
        return [
            {
                source: "/sitemap.xml",
                headers: [
                    {
                        key: "Content-Type",
                        value: "application/xml; charset=utf-8",
                    },
                ],
            },
        ];
    },
};

export default nextConfig;
