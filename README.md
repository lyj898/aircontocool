# aircontocool.com

AirconToCool: an aircon matching service in Singapore, run by the team behind Junk to Clear.
Enquiries arrive through a FormSubmit form; the user passes each one to the team behind Junk to Clear,
which passes it to a partner aircon firm. Built on PestToClear's structure (copied, not its text).
Brief: `../jtc-family/briefs/aircontocool.md`.

## Stack

Astro 5 + Tailwind 4, static output, `trailingSlash: 'always'`. Deployed by `.github/workflows/deploy.yml`
(GitHub Actions to Pages). `public/CNAME` and `public/.nojekyll` must stay in the published output.

Build variables (repo variables in CI, Settings → Secrets and variables → Actions → Variables):

| Variable | What it does |
|---|---|
| `PUBLIC_GA4_ID` | GA4 measurement ID. Without it no analytics loads. |
| `PUBLIC_FORM_ENDPOINT` | FormSubmit endpoint. Unset, the form posts to the raw address in `company.json`. Set it to FormSubmit's alias once the user confirms the alias; no code change needed. |

```
npm run dev      # local dev server
npm run build    # validate data, astro check, build
npm run audit    # audit dist/ (run after build)
npm run verify   # build + audit
npm run illo     # regenerate public/illo/ from scripts/illustrations.mjs
```

## Pages

- `/` and one page per service, at the top level, generated from `src/data/services.json`:
  `/aircon-servicing/`, `/aircon-chemical-wash/`, `/aircon-chemical-overhaul/`, `/aircon-gas-top-up/`,
  `/aircon-repair/`
- `/how-it-works/`, `/about/`, `/contact/`, `/privacy/`

Each service page covers what the visit includes, when people book it, what affects the price, how to
prepare and what happens on the day, and HDB, condo, landed and office premises. `validate-data.mjs`
fails the build if any of those is missing.

No installation page: the partner doesn't install (user, 5 Oct 2026). If that changes, a new
installation page must say that new electrical points need an EMA-licensed electrical worker.

## Lane

The service pages own the sales searches (aircon servicing, chemical wash, chemical overhaul, gas top-up,
repair). OurKampung's "Aircon Servicing in Singapore" guide owns the why: how often, what each service
is, what symptoms mean, why a gas top-up is rarely the answer, questions to ask. The service pages
don't answer those; they link the guide in the text (`GuideLink`, `ServiceLevels`), naming it as a
sister guide run by the same team.

## Graphics

All SVG, drawn by `scripts/illustrations.mjs` in the family style (PestToClear's, after OurKampung's
`assets/illo`: soft blob backdrop, ground shadow, flat shapes) in this site's palette. Every page has an
illustration, plus diagrams that explain:

- `split-unit-cutaway.svg`: numbered parts of a split aircon; `SplitUnitDiagram.astro` holds the legend
  (HTML, so it reads at any width) and says what each service does to each part
- `level-*.svg` in `ServiceLevels.astro`: general servicing, chemical wash and chemical overhaul side by side
- `step-*.svg`: the four steps of how it works
- `icon/*.svg` for each service and `property/*.svg` for each property type

No stock photos of people, no brand logos on units, no before-and-after pictures. Every `<img>` has alt
text (empty only where a visible label says the same) and width and height.

## Rules (enforced by `scripts/validate-data.mjs` and `scripts/audit-build.mjs`)

- **Matching service.** Never "our technicians", "our team will service" or "our crew". The partner firm does the work.
- **No service × town or service × property-type pages**, and nothing nested below a service page. That
  pattern got OurKampung pruned. Property types are a section of each service page.
- **No prices** until the partner quotes real ones: the price comes with a quick quote.
- **No invented statistics, reviews, ratings, testimonials or "units serviced" counts**, in copy or in JSON-LD.
- **No aircon brand names** (Daikin and the like) and no logos.
- **Certification.** Don't call anyone certified or licensed until the partner confirms it (not confirmed
  as of 5 Oct 2026). `R32Note` states what NEA says about R32 handling and ITE's course, links NEA and ITE,
  and makes no claim about any firm. Any page mentioning NEA or R32 must link nea.gov.sg.
- **One GA4 event:** `generate_lead`, after FormSubmit confirms delivery. The site's code sends no
  `form_submit`, `button_click` or `form_start`; enhanced measurement (left on) sends those by itself, and
  they are never key events. `generate_lead` is the only key event, created by name with "Create with code"
  at setup (PORTFOLIO, "Enquiries"). GA4 property "AirconToCool" 557346259 in the Junktoclear account,
  stream 16042175537, measurement ID G-RKY48Y5G0W (the `PUBLIC_GA4_ID` repo variable). Set up by the
  coordinator, 5 Oct 2026.
- **Form.** Subject is `AirconToCool – <page>`; the payload carries Site and Page. The PDPA line says the
  details go to the team behind Junk to Clear, which passes them to the partner who'll quote. If sending
  fails, the visitor is told and everything they typed stays; no contact details are offered. No phone
  number, WhatsApp link or email address anywhere on the site.
- **Family links.** Since the OurKampung family revamp (5 Oct 2026, `../jtc-family/briefs/family-revamp.md`)
  the footer says "Part of OurKampung", linking `https://ourkampung.com/` with `rel="nofollow"`; that is the
  only family link in the header or footer, and none go to the sister sites. The About page links Junk to Clear
  and OurKampung's `/our-sites/`; service pages link OurKampung's aircon guide in the text. Never
  `rel="noreferrer"`.

## Testing the form

Test with sending stubbed: override `window.fetch` in the browser console to return a failure, then
`{ success: "true" }`, and check the failure message keeps the fields, and that success sends one
`generate_lead`. A real test enquiry needs the user's OK; FormSubmit may ask to confirm the new site.
