/** Shapes of the JSON in src/data. scripts/validate-data.mjs enforces them at build time. */

export interface Faq {
  q: string;
  a: string;
}

export interface Step {
  name: string;
  body: string;
}

/** What the service means in each kind of property. */
export interface Premises {
  hdb: string;
  condo: string;
  landed: string;
  office: string;
}

export interface Service {
  slug: string;
  /** Short name, as used in nav and on cards: "Chemical wash". */
  name: string;
  /** The service as a buyer searches for it: "Aircon chemical wash". */
  serviceName: string;
  metaTitle: string;
  metaDescription: string;
  h1: string;
  /** One-sentence summary, used on cards and in the Service schema node. */
  summary: string;
  intro: string[];
  /** What the visit includes, step by step. */
  included: Step[];
  includedNote: string;
  /** When people book it: the situations, not the diagnosis (that's the guide's lane). */
  bookWhen: string[];
  /** One sentence pointing to OurKampung's guide, with {guide} where the link goes. */
  guideLine: string;
  priceFactors: string[];
  /** What to compare between quotes for this service. */
  compareNote: string;
  prepare: string[];
  onTheDay: string[];
  afterwards: string;
  premises: Premises;
  faqs: Faq[];
  /** Alt text for the service's illustration in public/illo/{slug}.svg. */
  illoAlt: string;
}

export interface Company {
  entityName: string;
  tradingName: string;
  parentBrand: string;
  parentBrandUrl: string;
  yearEstablished: number;
  siteUrl: string;
  operatingHoursDisplay: string;
  businessModelStatement: string;
  formSubmit: { defaultEndpoint: string; subjectPrefix: string; note: string };
  guide: { url: string; title: string; site: string };
  r32: { neaUrl: string; iteUrl: string; checked: string };
}
