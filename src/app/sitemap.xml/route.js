export async function GET() {
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://online-cbt-exam.vercel.app/</loc>
    <lastmod>2026-02-15T09:39:52.875Z</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1</priority>
  </url>
  <url>
    <loc>https://online-cbt-exam.vercel.app/login</loc>
    <lastmod>2026-02-15T09:39:52.875Z</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://online-cbt-exam.vercel.app/register</loc>
    <lastmod>2026-02-15T09:39:52.875Z</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://online-cbt-exam.vercel.app/instruction</loc>
    <lastmod>2026-02-15T09:39:52.875Z</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.5</priority>
  </url>
</urlset>`;

    return new Response(sitemap, {
        headers: {
            "Content-Type": "application/xml; charset=utf-8",
        },
    });
}
