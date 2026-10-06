// Copy rules shared by validate-data.mjs (on the JSON) and audit-build.mjs (on
// the rendered pages). Each one is a family or brief rule that is easy to break
// by accident while writing.

export const BANNED_COPY = [
  {
    // AirconToCool is a matching service. Partner firms do the work.
    re: /\bour (technicians?|team (will )?(service|repair|clean)s?|aircon (specialists?|experts?|team)|crews?|specialists?|engineers?|staff (service|repair))/i,
    why: 'claims our own technicians or crews (matching service: the partner firm does the work)',
  },
  {
    // No prices until the partner has quoted real ones.
    re: /S\$\s?\d|\$\s?\d{2,}|\bSGD\s?\d/i,
    why: 'contains a price (the price comes with a quick quote)',
  },
  {
    // No invented statistics or "units serviced" counts.
    re: /\b\d{1,3}(\.\d+)?\s?%|\b\d+(,\d{3})+\+? (homes|customers|jobs|clients|units)|\bunits serviced\b/i,
    why: 'contains a statistic or a jobs count (none are sourced)',
  },
  {
    // Certification claims need the partner checked and the official source linked. Not yet.
    re: /\b(ITE[- ]certified|certified (technicians?|engineers?)|licen[cs]ed (technicians?|aircon))\b/i,
    why: 'claims certified or licensed technicians (only once the partner is checked, with the source linked)',
  },
  {
    // Independence (6 Oct 2026): no company runs the family, and nothing is
    // borrowed from SKAP or Junk to Clear.
    re: /SKAP|Waste Management Pte|team behind Junk to Clear|trading name|established (in )?2009|since 2009|\bUEN\b/i,
    why: 'names SKAP or borrows from Junk to Clear (the site is run by the OurKampung team)',
  },
  {
    re: /\b(testimonial|5[- ]star|rated \d|\d(\.\d)? stars?)\b/i,
    why: 'looks like a review or rating (none have been collected)',
  },
  {
    // No brand names of aircon makers: no logos, no implied partnerships.
    re: /\b(Daikin|Mitsubishi|Panasonic|Midea|Fujitsu|Toshiba|LG|Samsung|Gree|Hitachi|York|Carrier)\b/,
    why: 'names an aircon brand (no brand names or logos on the site)',
  },
];
