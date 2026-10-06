// Audits dist/ against the acceptance criteria. Run after `npm run build`:
//
//   node scripts/audit-build.mjs
//
// Adapted from PestToClear's. Checks:
//   - every internal link resolves; no orphans; trailing slashes throughout
//   - unique titles (<=60) and descriptions (<=155); self-referencing canonicals
//   - JSON-LD parses, one Organization, no LocalBusiness / AggregateRating / Review
//   - sitemap lists exactly the indexable pages; robots, CNAME, .nojekyll present
//   - service pages have enough body copy, differ from each other, and no
//     service x town or service x property-type routes exist
//   - banned copy (our technicians, prices, statistics, certification claims, brands)
//   - any page mentioning NEA or R32 links an official nea.gov.sg source
//   - the only custom GA4 event is generate_lead; no button_click
//   - form subjects are "AirconToCool – <page>"; the inbox appears only in the endpoint
//   - every image exists, with alt, width and height
//   - no links to family sites in the header or footer except the nofollow
//     "Part of OurKampung" footer link; no rel="noreferrer" on any of them

import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { BANNED_COPY } from './copy-rules.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');
const ORIGIN = 'https://aircontocool.com';
const company = JSON.parse(readFileSync(join(root, 'src', 'data', 'company.json'), 'utf8'));
const services = JSON.parse(readFileSync(join(root, 'src', 'data', 'services.json'), 'utf8'));

if (!existsSync(dist)) {
  console.error('dist/ not found. Run `npm run build` first.');
  process.exit(1);
}

const errors = [];
const warnings = [];
const err = (m) => errors.push(m);
const warn = (m) => warnings.push(m);

// --- collect built pages ----------------------------------------------------
const htmlFiles = [];
(function walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.name.endsWith('.html')) htmlFiles.push(full);
  }
})(dist);

const toRoute = (file) => {
  const rel = file.slice(dist.length).replace(/\\/g, '/');
  return rel.endsWith('/index.html') ? rel.slice(0, -'index.html'.length) : rel;
};

const decode = (s) =>
  (s ?? '')
    .replace(/&amp;|&#38;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");

const textOf = (html) =>
  decode(
    html
      .replace(/<script[\s\S]*?<\/script>/g, ' ')
      .replace(/<style[\s\S]*?<\/style>/g, ' ')
      .replace(/<[^>]+>/g, ' '),
  )
    .replace(/\s+/g, ' ')
    .trim();

const pages = new Map();
for (const file of htmlFiles) {
  const html = readFileSync(file, 'utf8');
  const route = toRoute(file);
  const pick = (re) => (html.match(re) ?? [])[1];
  pages.set(route, {
    route,
    html,
    title: pick(/<title>([\s\S]*?)<\/title>/),
    description: pick(/<meta name="description" content="([^"]*)"/),
    canonical: pick(/<link rel="canonical" href="([^"]*)"/),
    robots: pick(/<meta name="robots" content="([^"]*)"/),
    jsonLd: pick(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/),
    main: (html.match(/<main[^>]*>([\s\S]*?)<\/main>/) ?? [])[1] ?? '',
  });
}

// --- per-page head checks ---------------------------------------------------
const titles = new Map();
const descriptions = new Map();

for (const p of pages.values()) {
  const isErrorPage = p.route === '/404.html';

  if (!p.title) err(`${p.route}: no <title>`);
  else {
    const t = decode(p.title);
    if (t.length > 60) err(`${p.route}: title is ${t.length} chars (max 60): "${t}"`);
    if (titles.has(t)) err(`${p.route}: duplicate title, also on ${titles.get(t)}`);
    else titles.set(t, p.route);
  }

  if (!p.description) err(`${p.route}: no meta description`);
  else {
    const d = decode(p.description);
    if (d.length > 155) err(`${p.route}: meta description is ${d.length} chars (max 155)`);
    if (descriptions.has(d)) err(`${p.route}: duplicate meta description, also on ${descriptions.get(d)}`);
    else descriptions.set(d, p.route);
  }

  if (!p.canonical) err(`${p.route}: no canonical`);
  else {
    const expected = isErrorPage ? `${ORIGIN}/404/` : `${ORIGIN}${p.route}`;
    if (p.canonical !== expected) err(`${p.route}: canonical "${p.canonical}" is not self-referencing (expected "${expected}")`);
  }

  if (!p.jsonLd) err(`${p.route}: no JSON-LD`);
  else {
    try {
      const parsed = JSON.parse(p.jsonLd);
      const nodes = parsed['@graph'] ?? [];
      const types = nodes.map((n) => n['@type']);
      const orgs = types.filter((t) => t === 'Organization').length;
      if (orgs !== 1) err(`${p.route}: ${orgs} Organization nodes; there must be exactly one`);
      const all = JSON.stringify(parsed);
      for (const banned of ['LocalBusiness', 'AggregateRating', '"Review"', '"offers"']) {
        if (all.includes(banned)) err(`${p.route}: JSON-LD contains ${banned}`);
      }
      const depth = p.route.split('/').filter(Boolean).length;
      if (depth >= 1 && !isErrorPage && !types.includes('BreadcrumbList')) warn(`${p.route}: nested page with no BreadcrumbList`);
    } catch (e) {
      err(`${p.route}: JSON-LD does not parse: ${e.message}`);
    }
  }
}

// --- routes and word counts ---------------------------------------------------
const serviceRoutes = new Set(services.map((s) => `/${s.slug}/`));
const PLACE = /\b(hdb|condo|landed|office|tampines|jurong|woodlands|bedok|punggol|sengkang|yishun|ang-mo-kio|toa-payoh|bishan|clementi)\b/;
for (const route of pages.keys()) {
  const seg = route.split('/').filter(Boolean);
  // No service x town or service x property-type pages. That pattern got OurKampung pruned.
  if (seg[0]?.startsWith('aircon-') && seg.length > 1) err(`${route}: nested below a service page (no service x town pages)`);
  if (seg[0]?.startsWith('aircon-') && !serviceRoutes.has(route)) err(`${route}: aircon route not in services.json`);
  if (seg[0]?.startsWith('aircon-') && PLACE.test(seg[0])) err(`${route}: service x place or property-type page`);
}
for (const r of serviceRoutes) if (!pages.has(r)) err(`${r}: service page not built`);

const MIN_WORDS = 900;
for (const r of serviceRoutes) {
  const p = pages.get(r);
  if (!p) continue;
  const n = textOf(p.main).split(' ').filter(Boolean).length;
  if (n < MIN_WORDS) err(`${r}: ${n} words of body copy (min ${MIN_WORDS})`);
}

// Service pages must not be one page with the noun swapped.
{
  const sentences = (r) =>
    new Set(
      textOf(pages.get(r).main)
        .split(/(?<=[.!?])\s+/)
        .map((s) => s.trim())
        .filter((s) => s.split(' ').length > 8),
    );
  const routes = [...serviceRoutes].filter((r) => pages.has(r));
  const sets = new Map(routes.map((r) => [r, sentences(r)]));
  let worst = { ratio: 0, pair: '' };
  for (let i = 0; i < routes.length; i++) {
    for (let j = i + 1; j < routes.length; j++) {
      const a = sets.get(routes[i]);
      const b = sets.get(routes[j]);
      const ratio = [...a].filter((x) => b.has(x)).length / Math.min(a.size, b.size);
      if (ratio > worst.ratio) worst = { ratio, pair: `${routes[i]} / ${routes[j]}` };
      if (ratio > 0.25) err(`${routes[i]} and ${routes[j]} share ${Math.round(ratio * 100)}% of their sentences (max 25%)`);
    }
  }
  console.log(`service pages: most-similar pair ${worst.pair} at ${Math.round(worst.ratio * 100)}% shared`);
}

// --- copy rules on rendered text --------------------------------------------
for (const p of pages.values()) {
  const text = textOf(p.html.replace(/<head>[\s\S]*?<\/head>/, ''));
  for (const rule of BANNED_COPY) {
    const m = text.match(rule.re);
    if (m) err(`${p.route}: ${rule.why} ("${m[0]}")`);
  }
  // Any mention of NEA or R32 must come with an official source on the same page.
  if (/\bNEA\b|National Environment Agency|\bR32\b/.test(text) && !/href="https:\/\/www\.nea\.gov\.sg\//.test(p.html)) {
    err(`${p.route}: mentions NEA or R32 without linking an nea.gov.sg source`);
  }
}

// --- internal links -----------------------------------------------------------
const linkedTo = new Set();
for (const p of pages.values()) {
  for (const [, href] of p.html.matchAll(/href="([^"]+)"/g)) {
    if (/^(https?:|mailto:|tel:|#)/.test(href)) continue;
    const clean = href.split('#')[0].split('?')[0];
    if (!clean) continue;
    if (!clean.startsWith('/')) {
      err(`${p.route}: relative internal link "${href}"`);
      continue;
    }
    const isFile = /\.[a-z0-9]+$/i.test(clean);
    if (clean !== '/' && !clean.endsWith('/') && !isFile) err(`${p.route}: internal link lacks a trailing slash: "${href}"`);
    linkedTo.add(clean);
    if (!pages.has(clean) && !(isFile && existsSync(join(dist, clean)))) err(`${p.route}: broken internal link "${href}"`);
  }
  for (const [, href] of p.html.matchAll(/href="(#[^"]+)"/g)) {
    if (href === '#main') continue;
    if (!p.html.includes(`id="${href.slice(1)}"`)) err(`${p.route}: in-page link ${href} has no target`);
  }
}
for (const p of pages.values()) {
  if (p.route === '/' || p.route === '/404.html') continue;
  if (!linkedTo.has(p.route)) warn(`${p.route}: orphan, no internal page links to it`);
}

// --- images -----------------------------------------------------------------
// Every image must exist in the build and carry an alt attribute (empty for
// decorative ones, which the illustrations on the service cards are).
for (const p of pages.values()) {
  for (const [tag] of p.html.matchAll(/<img[^>]*>/g)) {
    const src = (tag.match(/src="([^"]+)"/) ?? [])[1];
    if (!src) err(`${p.route}: <img> without src`);
    else if (src.startsWith('/') && !existsSync(join(dist, src.split('?')[0]))) err(`${p.route}: image ${src} is not in the build`);
    if (!/alt="/.test(tag)) err(`${p.route}: <img> without alt: ${src}`);
    if (!/width="/.test(tag) || !/height="/.test(tag)) err(`${p.route}: <img> without width and height (layout shift): ${src}`);
  }
}

// --- family links -------------------------------------------------------------
// Family sites, plus the outside partner Junk to Clear and its SkillsToFix,
// none of which may sit in the header or footer.
const FAMILY = /https?:\/\/(www\.)?(junktoclear\.com\.sg|hometoclean\.com|hometomoved\.com|pesttoclear\.com|brokentofixed\.com|spacetoreno\.com|skillstofix\.com|ourkampung\.com|swyftclear\.com|relocado\.asia)/;
for (const p of pages.values()) {
  const chrome = [
    (p.html.match(/<header[\s\S]*?<\/header>/) ?? [''])[0],
    (p.html.match(/<footer[\s\S]*?<\/footer>/) ?? [''])[0],
  ].join('');
  // The one allowed exception (family revamp, 5 Oct 2026): the footer's
  // "Part of OurKampung" link to the home page, marked nofollow.
  const footer = (p.html.match(/<footer[\s\S]*?<\/footer>/) ?? [''])[0];
  const mother = [...footer.matchAll(/<a\b[^>]*href="https:\/\/ourkampung\.com\/"[^>]*>/g)];
  if (mother.length !== 1) err(`${p.route}: footer needs exactly one "Part of OurKampung" link to https://ourkampung.com/`);
  for (const [tag] of mother) if (!/rel="nofollow"/.test(tag)) err(`${p.route}: the footer's OurKampung link must be rel="nofollow"`);
  const rest = chrome.replace(/<a\b[^>]*href="https:\/\/ourkampung\.com\/"[^>]*>/g, '');
  if (FAMILY.test(rest)) err(`${p.route}: family-site link in the header or footer (only "Part of OurKampung" is allowed)`);
  for (const [tag] of p.html.matchAll(/<a\b[^>]*>/g)) {
    if (FAMILY.test(tag) && /noreferrer/.test(tag)) err(`${p.route}: rel="noreferrer" on a family link hides the referral`);
  }
}

// --- analytics and the form ----------------------------------------------------
// The endpoint compiled into the pages: PUBLIC_FORM_ENDPOINT when set, else the default.
const endpoint = (process.env.PUBLIC_FORM_ENDPOINT || '').trim()
  ? process.env.PUBLIC_FORM_ENDPOINT.trim().replace('https://formsubmit.co/', 'https://formsubmit.co/ajax/').replace('/ajax/ajax/', '/ajax/')
  : company.formSubmit.defaultEndpoint;
const inbox = company.formSubmit.defaultEndpoint.split('/').pop();
for (const p of pages.values()) {
  const events = [...p.html.matchAll(/gtag\(\s*['"]event['"]\s*,\s*['"]([^'"]+)['"]/g)].map((m) => m[1]);
  for (const e of events) if (e !== 'generate_lead') err(`${p.route}: GA4 event "${e}" (generate_lead is the only one)`);
  if (/button_click|form_start|form_submit/.test(p.html)) err(`${p.route}: contains button_click, form_start or form_submit`);

  const hasForm = /<form data-lead-form/.test(p.html);
  if (hasForm) {
    if (events.length !== 1) err(`${p.route}: has the form but ${events.length} generate_lead calls (expected 1)`);
    const subject = (p.html.match(/(?:let|const|var) subject = ("[^"]*")/) ?? [])[1];
    const parsed = subject ? JSON.parse(subject) : '';
    if (!/^AirconToCool – \S/.test(parsed)) err(`${p.route}: form subject is "${parsed}", expected "AirconToCool – <page>"`);
    if (!/Your details go to the OurKampung team, who pass them to the partner who’ll quote for the job/.test(textOf(p.html))) err(`${p.route}: form without the family's PDPA notice (the OurKampung team)`);
    if ((p.html.match(/<form data-lead-form/g) ?? []).length > 1) err(`${p.route}: more than one enquiry form`);
  } else if (events.length) {
    err(`${p.route}: GA4 event without a form`);
  }

  if (inbox?.includes('@')) {
    const hits = p.html.split(inbox).length - 1;
    const allowed = endpoint.includes(inbox) ? p.html.split(endpoint).length - 1 : 0;
    if (hits > allowed) err(`${p.route}: destination inbox appears outside the FormSubmit endpoint`);
  }
  if (/href="tel:|href="https:\/\/wa\.me\/|href="mailto:/.test(p.html)) err(`${p.route}: phone, WhatsApp or email link (contact is form-only)`);

  const placeholders = [...new Set(p.html.match(/\[[A-Z][A-Z_0-9]{2,}\]/g) ?? [])];
  if (placeholders.length) err(`${p.route}: unresolved placeholder(s): ${placeholders.join(', ')}`);
}

// --- sitemap, robots, Pages files ------------------------------------------------
const sitemapPath = join(dist, 'sitemap.xml');
if (!existsSync(sitemapPath)) err('sitemap.xml not built');
else {
  const locs = [...readFileSync(sitemapPath, 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  const seen = new Set();
  for (const loc of locs) {
    if (seen.has(loc)) err(`sitemap.xml: duplicate ${loc}`);
    seen.add(loc);
    const page = pages.get(loc.slice(ORIGIN.length));
    if (!loc.startsWith(`${ORIGIN}/`) || !page) err(`sitemap.xml: ${loc} has no built page`);
    else if (page.robots?.includes('noindex')) err(`sitemap.xml: ${loc} is noindex`);
  }
  for (const p of pages.values()) {
    if (p.route === '/404.html' || p.robots?.includes('noindex')) continue;
    if (!seen.has(`${ORIGIN}${p.route}`)) err(`${p.route}: indexable but missing from sitemap.xml`);
  }
  console.log(`sitemap.xml: ${locs.length} URL(s)`);
}

if (!existsSync(join(dist, 'robots.txt'))) err('robots.txt not built');
if (!existsSync(join(dist, '.nojekyll'))) err('.nojekyll missing from dist: Pages would strip _astro/ and every stylesheet 404s');
if (!existsSync(join(dist, 'CNAME'))) err('CNAME missing from dist: Pages drops the custom domain on deploy');
else if (readFileSync(join(dist, 'CNAME'), 'utf8').trim() !== 'aircontocool.com') err('CNAME is not aircontocool.com');

// --- report -----------------------------------------------------------------------
for (const w of warnings) console.warn(`  warn  ${w}`);
for (const e of errors) console.error(`  ERROR ${e}`);
console.log(`\npages audited: ${pages.size}`);
console.log(`${errors.length} error(s), ${warnings.length} warning(s)`);
process.exit(errors.length ? 1 : 0);
