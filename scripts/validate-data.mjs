// Validates src/data/*.json before every build. If it fails, the build fails.
// Run: node scripts/validate-data.mjs
//
// Shape checks keep the templates honest; the copy checks enforce the family
// rules that are easiest to break by accident while writing (see README).

import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { BANNED_COPY } from './copy-rules.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dataDir = join(root, 'src', 'data');
const read = (f) => JSON.parse(readFileSync(join(dataDir, f), 'utf8'));

const services = read('services.json');
const company = read('company.json');

const errors = [];
const err = (m) => errors.push(m);

const SLUG = /^aircon-[a-z0-9]+(-[a-z0-9]+)*$/;
const str = (v) => typeof v === 'string' && v.trim().length > 0;
const strArr = (v, min) => Array.isArray(v) && v.length >= min && v.every(str);

const seen = new Set();
const titles = new Set();
for (const s of services) {
  const at = `service "${s.slug}"`;
  if (!SLUG.test(s.slug)) err(`${at}: slug must be lowercase, hyphenated and start with "aircon-"`);
  if (seen.has(s.slug)) err(`${at}: duplicate slug`);
  seen.add(s.slug);

  for (const k of ['name', 'serviceName', 'metaTitle', 'metaDescription', 'h1', 'summary', 'includedNote', 'compareNote', 'guideLine', 'afterwards', 'illoAlt']) {
    if (!str(s[k])) err(`${at}: ${k} is missing or empty`);
  }
  if (str(s.metaTitle) && s.metaTitle.length > 60) err(`${at}: metaTitle is ${s.metaTitle.length} chars (max 60)`);
  if (titles.has(s.metaTitle)) err(`${at}: duplicate metaTitle`);
  titles.add(s.metaTitle);
  if (str(s.metaDescription) && (s.metaDescription.length > 155 || s.metaDescription.length < 70)) {
    err(`${at}: metaDescription is ${s.metaDescription.length} chars (70-155)`);
  }
  if (str(s.guideLine) && s.guideLine.split('{guide}').length !== 2) err(`${at}: guideLine needs exactly one {guide}`);

  if (!strArr(s.intro, 1)) err(`${at}: intro needs at least 1 paragraph`);
  if (!strArr(s.bookWhen, 3)) err(`${at}: bookWhen needs at least 3 entries`);
  if (!strArr(s.priceFactors, 4)) err(`${at}: priceFactors needs at least 4 entries`);
  if (!strArr(s.prepare, 3)) err(`${at}: prepare needs at least 3 entries`);
  if (!strArr(s.onTheDay, 3)) err(`${at}: onTheDay needs at least 3 entries`);

  if (!Array.isArray(s.included) || s.included.length < 4) err(`${at}: included needs at least 4 steps`);
  else s.included.forEach((t, i) => {
    if (!str(t.name) || !str(t.body)) err(`${at}: included[${i}] needs name and body`);
  });

  // The brief: property types are a section of each service page, never pages of their own.
  for (const k of ['hdb', 'condo', 'landed', 'office']) {
    if (!str(s.premises?.[k])) err(`${at}: premises.${k} is missing or empty`);
  }

  if (!Array.isArray(s.faqs) || s.faqs.length < 3) err(`${at}: faqs needs at least 3 entries`);
  else s.faqs.forEach((f, i) => {
    if (!str(f.q) || !str(f.a)) err(`${at}: faqs[${i}] needs q and a`);
  });

  for (const f of [`${s.slug}.svg`, `icon/${s.slug}.svg`]) {
    if (!existsSync(join(root, 'public', 'illo', f))) err(`${at}: public/illo/${f} is missing (run npm run illo)`);
  }

  const text = JSON.stringify(s);
  for (const rule of BANNED_COPY) {
    const m = text.match(rule.re);
    if (m) err(`${at}: ${rule.why} ("${m[0]}")`);
  }
}

// --- company ------------------------------------------------------------------
if (!/^https:\/\/formsubmit\.co\/ajax\//.test(company.formSubmit?.defaultEndpoint ?? '')) {
  err('company.json: formSubmit.defaultEndpoint must be a FormSubmit AJAX endpoint');
}
if (company.formSubmit?.subjectPrefix !== 'AirconToCool – ') {
  err('company.json: formSubmit.subjectPrefix must be "AirconToCool – " (site in every subject)');
}
if (!/^https:\/\/www\.nea\.gov\.sg\//.test(company.r32?.neaUrl ?? '')) err('company.json: r32.neaUrl must be an official nea.gov.sg page');
if (!/^https:\/\/www\.ite\.edu\.sg\//.test(company.r32?.iteUrl ?? '')) err('company.json: r32.iteUrl must be an official ite.edu.sg page');
if (!/^https:\/\/ourkampung\.com\/.+\/$/.test(company.guide?.url ?? '')) err('company.json: guide.url must be an ourkampung.com page with a trailing slash');
if (company.siteUrl !== 'https://aircontocool.com') err('company.json: siteUrl must be https://aircontocool.com');

for (const e of errors) console.error(`  ERROR ${e}`);
console.log(`validate-data: ${services.length} services, ${errors.length} error(s)`);
process.exit(errors.length ? 1 : 0);
