/**
 * Every URL on the site is built here. Nothing constructs a path by hand.
 *
 * Rules, which are a one-way door and must not drift:
 *   - trailing slash on everything except root
 *   - lowercase, hyphenated, no dates
 *   - canonicals are absolute https://aircontocool.com/... with no exceptions
 *   - no service x town or service x property-type pages, ever (see README)
 */

import { company } from './data';

/** Absolute origin, no trailing slash. */
export const ORIGIN = company.siteUrl;

/** A site-root-relative path. Always starts with "/", always ends with "/". */
export type Path = `/${string}/` | '/';

const path = (...segments: string[]): Path =>
  segments.length === 0 ? '/' : (`/${segments.join('/')}/` as Path);

export const urls = {
  home: (): Path => '/',
  /** Service pages sit at the top level: /aircon-servicing/, /aircon-repair/ ... */
  service: (slug: string): Path => path(slug),
  howItWorks: (): Path => path('how-it-works'),
  about: (): Path => path('about'),
  contact: (): Path => path('contact'),
  privacy: (): Path => path('privacy'),
} as const;

/** Absolute canonical URL for a site path. */
export const canonical = (p: Path): string => `${ORIGIN}${p}`;

/** Guards against a path being built by hand and drifting from the rules. */
export function assertValidPath(p: string): asserts p is Path {
  if (p === '/') return;
  if (!p.startsWith('/')) throw new Error(`Path must start with "/": ${p}`);
  if (!p.endsWith('/')) throw new Error(`Path must end with "/" (trailingSlash: always): ${p}`);
  if (p !== p.toLowerCase()) throw new Error(`Path must be lowercase: ${p}`);
  if (/[^a-z0-9/-]/.test(p)) throw new Error(`Path may only contain a-z, 0-9, "-" and "/": ${p}`);
  if (p.includes('//')) throw new Error(`Path contains an empty segment: ${p}`);
}
