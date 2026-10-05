/**
 * Enquiry form configuration. Contact is form-only: no phone, WhatsApp or
 * email links anywhere on the site.
 *
 * The endpoint comes from the PUBLIC_FORM_ENDPOINT build variable (a repo
 * variable in CI), as on HomeToMoved, so FormSubmit's alias can replace the
 * raw address without a code change. Until it is set, the raw address in
 * company.json is used.
 */

import { company } from './data';

const clean = (v: unknown): string => (typeof v === 'string' ? v.trim() : '');

// CI passes an unset repo variable as an empty string, not undefined, so fall
// back on any blank value rather than using ??.
const configured = clean(import.meta.env['PUBLIC_FORM_ENDPOINT']);
const raw = configured || company.formSubmit.defaultEndpoint;

/**
 * Where the enquiry form POSTs: FormSubmit's AJAX endpoint, which answers in
 * JSON. A plain FormSubmit URL (an alias, say) is converted to its AJAX form.
 */
export const FORM_ENDPOINT: string = raw.startsWith('https://formsubmit.co/ajax/')
  ? raw
  : raw.replace('https://formsubmit.co/', 'https://formsubmit.co/ajax/');

if (!FORM_ENDPOINT.startsWith('https://formsubmit.co/ajax/')) {
  throw new Error(`Form endpoint is not a FormSubmit URL: "${raw}". Check PUBLIC_FORM_ENDPOINT.`);
}

/**
 * Subject line for one page's submissions: "AirconToCool – Chemical wash".
 * The site and page are in every subject so enquiries can be counted per site
 * and per page from the inbox alone.
 */
export const formSubject = (pageName: string): string =>
  `${company.formSubmit.subjectPrefix}${pageName}`;
