/**
 * Server-side rendered sitemap.xml for oxlo.ai
 * 
 * This page renders as XML at /sitemap.xml via Next.js rewrites.
 * Helps search engines AND AI crawlers discover all our pages.
 */

export async function getServerSideProps({ res }) {
  const baseUrl = 'https://oxlo.ai';
  const now = new Date().toISOString();

  const pages = [
    { url: '/', changefreq: 'weekly', priority: '1.0' },
    { url: '/pricing', changefreq: 'weekly', priority: '0.9' },
    { url: '/models', changefreq: 'daily', priority: '0.9' },
    { url: '/privacy-policy', changefreq: 'monthly', priority: '0.3' },
    { url: '/term-of-use', changefreq: 'monthly', priority: '0.3' },
    { url: '/llms.txt', changefreq: 'weekly', priority: '0.6' },
    { url: '/llms-full.txt', changefreq: 'weekly', priority: '0.6' },
    { url: '/vs/together-ai', changefreq: 'weekly', priority: '0.8' },
    { url: '/vs/fireworks', changefreq: 'weekly', priority: '0.8' },
    { url: '/vs/openrouter', changefreq: 'weekly', priority: '0.8' },
    { url: '/vs/replicate', changefreq: 'weekly', priority: '0.8' },
  ];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages
      .map(
        (page) => `  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`
      )
      .join('\n')}
</urlset>`;

  res.setHeader('Content-Type', 'application/xml');
  res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate');
  res.write(sitemap);
  res.end();

  return { props: {} };
}

// This component never renders — getServerSideProps sends the XML directly
export default function Sitemap() {
  return null;
}
