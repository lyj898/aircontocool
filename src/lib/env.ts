/**
 * Typed access to PUBLIC_ environment variables.
 *
 * PUBLIC_GA4_ID is optional by design: without it no analytics script is
 * emitted at all. In CI it comes from the repo variable of the same name.
 */

const clean = (v: unknown): string => (typeof v === 'string' ? v.trim() : '');

/** GA4 measurement ID, e.g. "G-XXXXXXXXXX". Empty when unconfigured. */
export const GA4_ID: string = clean(import.meta.env['PUBLIC_GA4_ID']);

export const hasAnalytics = (): boolean => GA4_ID.length > 0;
