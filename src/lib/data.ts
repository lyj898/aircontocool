/**
 * The single place raw JSON becomes typed data. Templates import from here,
 * never from the JSON directly. scripts/validate-data.mjs checks the shapes
 * before every build, which is what makes these assertions safe.
 */

import servicesRaw from '../data/services.json';
import companyRaw from '../data/company.json';

import type { Company, Service } from '../types';

export const services = servicesRaw as unknown as Service[];
export const company = companyRaw as unknown as Company;

const serviceIndex = new Map(services.map((s) => [s.slug, s]));

/** Throws rather than returning undefined: a missing slug is a data bug. */
export function getService(slug: string): Service {
  const found = serviceIndex.get(slug);
  if (!found) throw new Error(`Unknown service slug: "${slug}"`);
  return found;
}
