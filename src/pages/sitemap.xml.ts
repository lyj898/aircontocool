/**
 * sitemap.xml, generated from the route list. Canonical URLs only; the 404 page
 * is noindex and stays out. The audit checks every indexable page is listed.
 */
import type { APIRoute } from 'astro';
import { services } from '../lib/data';
import { canonical, urls, type Path } from '../lib/urls';

export const GET: APIRoute = () => {
  const paths: Path[] = [
    urls.home(),
    ...services.map((s) => urls.service(s.slug)),
    urls.howItWorks(),
    urls.about(),
    urls.contact(),
    urls.privacy(),
  ];

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${paths.map((p) => `  <url><loc>${canonical(p)}</loc></url>`).join('\n')}
</urlset>
`;

  return new Response(body, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
