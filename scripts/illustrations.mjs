// Generates the flat SVG illustrations in public/illo/. Run after editing:
//
//   node scripts/illustrations.mjs
//
// Same approach as PestToClear's, which follows OurKampung's assets/illo (soft
// blob backdrop, ground shadow, flat shapes, no strokes on figures), in
// AirconToCool's palette. The output files are committed; this script is only
// needed to change them.
//
// No brand logos on any unit, no people presented as the partner's crew, and
// no before-and-after pictures. Every file is drawn here for this site.

import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const out = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'illo');
mkdirSync(out, { recursive: true });

const C = {
  blob: '#E2EEF2',
  blobWarm: '#FBEBDD',
  shadow: '#CADCE2',
  cream: '#FBF8F1',
  line: '#DAE2E5',
  ink: '#24303A',
  inkSoft: '#46525C',
  brand: '#0D5C7D',
  brandDark: '#08425A',
  ice: '#C3E6F0',
  iceDeep: '#86C8DC',
  cool: '#4FA8C7',
  water: '#A8D8E8',
  sun: '#F5B562',
  sunDeep: '#E0894A',
  butter: '#F6D68F',
  sand: '#F1E2C4',
  sandDark: '#E0CFA9',
  wood: '#D9A86C',
  woodDark: '#C4935A',
  brick: '#C9764B',
  roof: '#96502D',
  sky: '#9DBBCB',
  skyPale: '#CADDE4',
  steel: '#3E4A5C',
  steelSoft: '#5B6878',
  stone: '#8A857B',
  unit: '#F7FAFB',
  unitShade: '#DCE5E9',
  unitDeep: '#BCC9CF',
  grime: '#7A6F58',
  leaf: '#8FA476',
  leafDark: '#7E9468',
  pink: '#E39C8A',
  coral: '#E07A5F',
  skin1: '#B97B52',
  skin2: '#F3CDB3',
  skin3: '#8A5A3C',
};

const svg = (w, h, body) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">\n${body.trim()}\n</svg>\n`;

const write = (name, content) => {
  mkdirSync(dirname(join(out, `${name}.svg`)), { recursive: true });
  writeFileSync(join(out, `${name}.svg`), content);
};

/** The soft backdrop and ground shadow every 320 x 220 card illustration sits on. */
const stage = (fill = C.blob) => `
  <path d="M46 126C36 70 94 30 164 30c72 0 124 34 120 96-4 58-64 78-128 78-58 0-100-24-110-78z" fill="${fill}"/>
  <ellipse cx="164" cy="184" rx="122" ry="7" fill="${C.shadow}"/>`;

/** Backdrop for the small square icons (120 x 120). */
const iconStage = (fill = C.blob) => `
  <path d="M14 66C10 34 36 14 64 14c30 0 46 18 44 48-2 30-22 44-48 44-26 0-42-14-46-40z" fill="${fill}"/>
  <ellipse cx="60" cy="104" rx="42" ry="4" fill="${C.shadow}"/>`;

// --- building blocks ----------------------------------------------------------

/** A wall-mounted fan coil, no logo. Width w, height w * 0.3. */
const wallUnit = (x, y, w = 120, { open = false } = {}) => {
  const h = Math.round(w * 0.3);
  return `
  <g>
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${h * 0.28}" fill="${C.unit}"/>
    <rect x="${x}" y="${y + h * 0.62}" width="${w}" height="${h * 0.38}" rx="${h * 0.19}" fill="${C.unitShade}"/>
    <rect x="${x + w * 0.08}" y="${y + h * 0.74}" width="${w * 0.84}" height="${h * 0.1}" rx="${h * 0.05}" fill="${C.unitDeep}"/>
    ${open ? '' : `<circle cx="${x + w * 0.86}" cy="${y + h * 0.3}" r="${Math.max(1.6, w * 0.018)}" fill="${C.cool}"/>`}
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${h * 0.28}" fill="none" stroke="${C.unitDeep}" stroke-width="1.5"/>
  </g>`;
};

/** Cool air leaving a unit: three soft swooshes. */
const coolAir = (x, y, s = 1, colour = C.iceDeep) => `
  <g transform="translate(${x} ${y}) scale(${s})" fill="none" stroke="${colour}" stroke-width="4" stroke-linecap="round">
    <path d="M0 0c10 14 4 26 18 38"/>
    <path d="M26 0c8 16 0 30 14 44" opacity=".8"/>
    <path d="M52 0c6 12 -2 24 10 34" opacity=".6"/>
  </g>`;

/** An outdoor condenser with a round fan grille. Width w, height w * 0.7. */
const outdoorUnit = (x, y, w = 90) => {
  const h = Math.round(w * 0.7);
  const cx = x + w * 0.4;
  const cy = y + h * 0.5;
  const r = h * 0.36;
  return `
  <g>
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="5" fill="${C.unit}"/>
    <rect x="${x + w * 0.78}" y="${y}" width="${w * 0.22}" height="${h}" rx="4" fill="${C.unitShade}"/>
    ${[0.2, 0.35, 0.5, 0.65, 0.8].map((f) => `<rect x="${x + w * 0.81}" y="${y + h * f}" width="${w * 0.16}" height="2" fill="${C.unitDeep}"/>`).join('')}
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="${C.unitShade}"/>
    <circle cx="${cx}" cy="${cy}" r="${r * 0.72}" fill="none" stroke="${C.unitDeep}" stroke-width="2"/>
    <circle cx="${cx}" cy="${cy}" r="${r * 0.42}" fill="none" stroke="${C.unitDeep}" stroke-width="2"/>
    <path d="M${cx - r} ${cy}h${r * 2}M${cx} ${cy - r}v${r * 2}" stroke="${C.unitDeep}" stroke-width="2"/>
    <circle cx="${cx}" cy="${cy}" r="${r * 0.14}" fill="${C.steelSoft}"/>
    <rect x="${x + w * 0.06}" y="${y + h}" width="${w * 0.12}" height="5" fill="${C.steelSoft}"/>
    <rect x="${x + w * 0.82}" y="${y + h}" width="${w * 0.12}" height="5" fill="${C.steelSoft}"/>
  </g>`;
};

/** A potted plant. */
const plant = (x, y, s = 1) => `
  <g transform="translate(${x} ${y}) scale(${s})">
    <path d="M0 0c-6-22-20-32-30-34 2 16 14 28 30 34zM0 0c4-26 18-40 32-42-2 20-14 34-32 42zM0 0c0-22-4-38-8-48 10 12 14 30 8 48z" fill="${C.leaf}"/>
    <path d="M0 0c-6-14-14-22-22-28M0 0c6-16 14-26 24-34" stroke="${C.leafDark}" stroke-width="2" fill="none"/>
    <path d="M-16 0h32l-5 26h-22z" fill="${C.brick}"/>
    <rect x="-18" y="-3" width="36" height="7" rx="2" fill="#B5663E"/>
  </g>`;

/** A toolbox. */
const toolbox = (x, y, s = 1) => `
  <g transform="translate(${x} ${y}) scale(${s})">
    <path d="M10 0V-8a4 4 0 0 1 4-4h12a4 4 0 0 1 4 4V0" stroke="${C.ink}" stroke-width="3" fill="none"/>
    <rect x="0" y="0" width="40" height="22" rx="3" fill="${C.coral}"/>
    <rect x="0" y="7" width="40" height="3" fill="#C4614A"/>
    <rect x="17" y="5" width="6" height="7" rx="1" fill="${C.ink}"/>
  </g>`;

/** A bucket. */
const bucket = (x, y, s = 1, fill = C.cool) => `
  <g transform="translate(${x} ${y}) scale(${s})">
    <path d="M0 0h30l-4 28H4z" fill="${fill}"/>
    <ellipse cx="15" cy="0" rx="15" ry="3.5" fill="${C.water}"/>
    <path d="M1 0c0-14 28-14 28 0" stroke="${C.steelSoft}" stroke-width="2" fill="none"/>
  </g>`;

/**
 * A standing technician in work clothes, seen from the front. Generic: no
 * company name or badge. `arm` sets the raised arm: 'up', 'out' or 'down'.
 */
const technician = (x, y, { shirt = C.brand, pants = C.steel, skin = C.skin1, arm = 'down', cap = true } = {}) => {
  const arms = {
    up: `<path d="M${x + 20} ${y - 50}l14 -30" stroke="${shirt}" stroke-width="11" stroke-linecap="round"/><circle cx="${x + 35}" cy="${y - 83}" r="5" fill="${skin}"/>`,
    out: `<path d="M${x + 20} ${y - 48}l22 -10" stroke="${shirt}" stroke-width="11" stroke-linecap="round"/><circle cx="${x + 45}" cy="${y - 60}" r="5" fill="${skin}"/>`,
    down: `<rect x="${x + 15}" y="${y - 56}" width="11" height="34" rx="5" fill="${shirt}"/><circle cx="${x + 20}" cy="${y - 20}" r="5" fill="${skin}"/>`,
  };
  return `
  <g>
    <ellipse cx="${x}" cy="${y + 2}" rx="30" ry="4.5" fill="${C.shadow}"/>
    <rect x="${x - 13}" y="${y - 40}" width="11" height="40" rx="4" fill="${pants}"/>
    <rect x="${x + 2}" y="${y - 40}" width="11" height="40" rx="4" fill="${pants}"/>
    <rect x="${x - 17}" y="${y - 5}" width="16" height="7" rx="3" fill="${C.ink}"/>
    <rect x="${x + 1}" y="${y - 5}" width="16" height="7" rx="3" fill="${C.ink}"/>
    <rect x="${x - 19}" y="${y - 84}" width="38" height="50" rx="13" fill="${shirt}"/>
    <rect x="${x - 26}" y="${y - 74}" width="11" height="34" rx="5" fill="${shirt}"/>
    <circle cx="${x - 20}" cy="${y - 38}" r="5" fill="${skin}"/>
    ${arms[arm]}
    <circle cx="${x}" cy="${y - 98}" r="14" fill="${skin}"/>
    ${cap ? `<path d="M${x - 15} ${y - 99}a15 15 0 0 1 30 0z" fill="${C.sun}"/><rect x="${x}" y="${y - 103}" width="20" height="5" rx="2" fill="${C.sunDeep}"/>` : `<path d="M${x - 14} ${y - 99}a14 14 0 0 1 28 0c-5-6-22-7-28 0z" fill="${C.ink}"/>`}
  </g>`;
};

/** A resident, standing. */
const resident = (x, y, { top = C.pink, pants = C.inkSoft, skin = C.skin2, hair = C.ink } = {}) => `
  <g>
    <ellipse cx="${x}" cy="${y + 2}" rx="28" ry="4.5" fill="${C.shadow}"/>
    <rect x="${x - 12}" y="${y - 42}" width="10" height="42" rx="4" fill="${pants}"/>
    <rect x="${x + 2}" y="${y - 42}" width="10" height="42" rx="4" fill="${pants}"/>
    <rect x="${x - 16}" y="${y - 5}" width="16" height="7" rx="3" fill="${C.ink}"/>
    <rect x="${x + 1}" y="${y - 5}" width="16" height="7" rx="3" fill="${C.ink}"/>
    <rect x="${x - 18}" y="${y - 88}" width="36" height="52" rx="13" fill="${top}"/>
    <rect x="${x - 26}" y="${y - 80}" width="10" height="32" rx="5" fill="${top}"/>
    <rect x="${x + 16}" y="${y - 80}" width="10" height="32" rx="5" fill="${top}"/>
    <circle cx="${x}" cy="${y - 102}" r="14" fill="${skin}"/>
    <path d="M${x - 15} ${y - 100}a15 15 0 0 1 30 0c-2 6-4 12-3 18-4-10-16-16-27-18z" fill="${hair}"/>
  </g>`;

// --- service illustrations (320 x 220) -----------------------------------------

// General servicing: technician on a stool cleaning a wall unit.
write(
  'aircon-servicing',
  svg(320, 220, `
  ${stage()}
  <rect x="58" y="40" width="204" height="142" fill="${C.cream}"/>
  <rect x="58" y="176" width="204" height="6" fill="${C.line}"/>
  ${wallUnit(138, 56, 110, { open: true })}
  <rect x="144" y="52" width="98" height="10" rx="4" fill="${C.unitShade}" transform="rotate(-14 144 52)"/>
  <path d="M146 92c4 22 22 30 46 30s40-8 46-30z" fill="${C.ice}" opacity=".9"/>
  <path d="M150 92h84" stroke="${C.iceDeep}" stroke-width="2"/>
  <path d="M232 124c14 6 18 22 14 44" stroke="${C.iceDeep}" stroke-width="3" fill="none"/>
  ${bucket(236, 164, 0.7)}
  <rect x="72" y="148" width="54" height="10" rx="3" fill="${C.woodDark}"/>
  <rect x="76" y="158" width="7" height="24" fill="${C.woodDark}"/><rect x="115" y="158" width="7" height="24" fill="${C.woodDark}"/>
  <g transform="translate(-6 -32)">${technician(104, 180, { arm: 'up' })}</g>
  <path d="M134 66l10 2" stroke="${C.steel}" stroke-width="4" stroke-linecap="round"/>
  <g fill="${C.water}"><circle cx="150" cy="74" r="2"/><circle cx="156" cy="80" r="1.6"/><circle cx="148" cy="84" r="1.4"/></g>
  <rect x="200" y="160" width="30" height="18" rx="2" fill="#FFFFFF" stroke="${C.line}" stroke-width="2"/>
  <path d="M204 166h22M204 171h22" stroke="${C.unitDeep}" stroke-width="1.5"/>
`),
);

// Chemical wash: wall unit in a catch bag, spray wand at the coil, bucket below.
write(
  'aircon-chemical-wash',
  svg(320, 220, `
  ${stage()}
  <rect x="58" y="40" width="204" height="142" fill="${C.cream}"/>
  <rect x="58" y="176" width="204" height="6" fill="${C.line}"/>
  <rect x="96" y="56" width="128" height="40" rx="10" fill="${C.unitShade}"/>
  <rect x="104" y="62" width="112" height="22" rx="3" fill="#B9C7A7"/>
  ${Array.from({ length: 18 }, (_, i) => `<rect x="${106 + i * 6}" y="62" width="2" height="22" fill="#9EAE8B"/>`).join('')}
  <path d="M90 82c0 0 4 44 70 48 66-4 70-48 70-48z" fill="${C.ice}" opacity=".85"/>
  <path d="M90 82c0 0 4 44 70 48 66-4 70-48 70-48" stroke="${C.iceDeep}" stroke-width="2" fill="none"/>
  <path d="M160 130c0 14-6 22-12 36" stroke="${C.cool}" stroke-width="5" fill="none" stroke-linecap="round"/>
  ${bucket(132, 160, 0.9, C.brand)}
  <path d="M232 132l-46-48" stroke="${C.steel}" stroke-width="5" stroke-linecap="round"/>
  <path d="M232 132l18 20" stroke="${C.coral}" stroke-width="9" stroke-linecap="round"/>
  <path d="M250 152c10 12 6 24 0 30" stroke="${C.steelSoft}" stroke-width="3" fill="none"/>
  <g stroke="${C.water}" stroke-width="2.5" stroke-linecap="round">
    <path d="M184 82l-12-8"/><path d="M184 82l-16 0"/><path d="M184 82l-12 8"/>
  </g>
  <g fill="${C.water}"><circle cx="150" cy="100" r="2.4"/><circle cx="172" cy="106" r="2"/><circle cx="136" cy="96" r="1.8"/></g>
  ${plant(82, 156, 0.8)}
`),
);

// Chemical overhaul: parts laid out, coil in a tub, empty mounting plate on the wall.
write(
  'aircon-chemical-overhaul',
  svg(320, 220, `
  ${stage()}
  <rect x="58" y="40" width="204" height="142" fill="${C.cream}"/>
  <rect x="58" y="176" width="204" height="6" fill="${C.line}"/>
  <rect x="112" y="54" width="96" height="26" rx="2" fill="none" stroke="${C.unitDeep}" stroke-width="3" stroke-dasharray="6 5"/>
  <rect x="122" y="62" width="76" height="10" rx="2" fill="${C.steelSoft}" opacity=".5"/>
  <path d="M68 166h132l-6 16H74z" fill="${C.skyPale}"/>
  <rect x="64" y="160" width="140" height="8" rx="3" fill="${C.iceDeep}"/>
  <rect x="78" y="118" width="96" height="44" rx="3" fill="#B9C7A7"/>
  ${Array.from({ length: 15 }, (_, i) => `<rect x="${82 + i * 6}" y="118" width="2" height="44" fill="#9EAE8B"/>`).join('')}
  <path d="M66 152c20-6 116-6 136 0v10H66z" fill="${C.water}" opacity=".85"/>
  <g fill="#FFFFFF" opacity=".9"><circle cx="96" cy="146" r="3"/><circle cx="130" cy="142" r="2.5"/><circle cx="160" cy="148" r="3.2"/><circle cx="186" cy="144" r="2"/></g>
  <rect x="214" y="150" width="60" height="30" rx="8" fill="${C.unit}" stroke="${C.unitDeep}" stroke-width="1.5"/>
  <rect x="220" y="168" width="48" height="5" rx="2" fill="${C.unitDeep}"/>
  <g transform="translate(244 128)">
    <circle r="16" fill="${C.unitShade}"/>
    ${Array.from({ length: 12 }, (_, i) => `<rect x="-1.2" y="-16" width="2.4" height="9" fill="${C.unitDeep}" transform="rotate(${i * 30})"/>`).join('')}
    <circle r="5" fill="${C.steelSoft}"/>
  </g>
  <rect x="210" y="96" width="58" height="12" rx="4" fill="${C.unitShade}" transform="rotate(8 239 102)"/>
  <g fill="${C.steelSoft}"><circle cx="90" cy="96" r="3"/><circle cx="100" cy="100" r="3"/><rect x="82" y="104" width="22" height="5" rx="2"/></g>
`),
);

// Gas top-up: outdoor unit on a ledge, gauges on the service valve, cylinder.
write(
  'aircon-gas-top-up',
  svg(320, 220, `
  ${stage()}
  <rect x="50" y="46" width="70" height="136" fill="${C.sand}"/>
  <rect x="62" y="62" width="46" height="60" rx="2" fill="${C.skyPale}"/>
  <path d="M85 62v60" stroke="${C.sand}" stroke-width="4"/>
  <rect x="50" y="160" width="220" height="10" fill="${C.sandDark}"/>
  <rect x="120" y="170" width="150" height="12" fill="${C.sand}"/>
  ${outdoorUnit(130, 98, 90)}
  <path d="M220 140h10v-6" stroke="${C.steelSoft}" stroke-width="4" fill="none"/>
  <path d="M230 134c10-10 10-30 20-40" stroke="${C.coral}" stroke-width="3" fill="none"/>
  <path d="M232 138c18 0 22-8 30-26" stroke="${C.cool}" stroke-width="3" fill="none"/>
  <g transform="translate(256 78)">
    <rect x="-24" y="-6" width="48" height="12" rx="4" fill="${C.steel}"/>
    <circle cx="-14" cy="-14" r="12" fill="#FFFFFF" stroke="${C.coral}" stroke-width="4"/>
    <circle cx="14" cy="-14" r="12" fill="#FFFFFF" stroke="${C.cool}" stroke-width="4"/>
    <path d="M-14-14l-6-5M14-14l5-6" stroke="${C.ink}" stroke-width="2" stroke-linecap="round"/>
  </g>
  <rect x="270" y="130" width="26" height="46" rx="11" fill="${C.cool}"/>
  <rect x="276" y="122" width="14" height="10" rx="2" fill="${C.steel}"/>
  <rect x="272" y="146" width="22" height="10" fill="#FFFFFF" opacity=".75"/>
  <path d="M283 122c0-12-12-16-22-22" stroke="${C.steelSoft}" stroke-width="3" fill="none"/>
`),
);

// Repair: outdoor unit with side panel open, multimeter, toolbox.
write(
  'aircon-repair',
  svg(320, 220, `
  ${stage()}
  ${outdoorUnit(150, 108, 104)}
  <rect x="232" y="108" width="22" height="72" rx="3" fill="${C.steel}"/>
  <rect x="236" y="116" width="14" height="10" rx="2" fill="${C.sun}"/>
  <rect x="236" y="130" width="10" height="16" rx="3" fill="${C.cool}"/>
  <path d="M238 152h12M238 158h8" stroke="${C.coral}" stroke-width="2"/>
  <rect x="256" y="104" width="30" height="76" rx="3" fill="${C.unitShade}" transform="rotate(14 256 104)"/>
  <g transform="translate(-4 0)">${technician(108, 182, { arm: 'out', shirt: C.brandDark })}</g>
  <rect x="140" y="112" width="20" height="30" rx="3" fill="${C.sun}"/>
  <rect x="143" y="116" width="14" height="9" rx="1" fill="#FFFFFF"/>
  <path d="M150 142c6 10 30 6 88 2" stroke="${C.coral}" stroke-width="2" fill="none"/>
  ${toolbox(58, 158, 0.9)}
  <path d="M62 150l26-8" stroke="${C.steelSoft}" stroke-width="4" stroke-linecap="round"/>
`),
);

// --- hero (1200 x 460): a cool room, and the homes outside -------------------
const windows = (x0, y0, cols, rows, dx, dy, w, h, fill) => {
  let s = '';
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    s += `<rect x="${x0 + c * dx}" y="${y0 + r * dy}" width="${w}" height="${h}" rx="1.5" fill="${fill}"/>`;
  }
  return s;
};
const tree = (x, y, r) => `
  <rect x="${x - 4}" y="${y}" width="8" height="${r * 2.4}" rx="3" fill="#7A5A3A"/>
  <circle cx="${x}" cy="${y - r * 0.2}" r="${r}" fill="${C.leaf}"/>
  <circle cx="${x - r * 0.6}" cy="${y + r * 0.35}" r="${r * 0.7}" fill="${C.leafDark}"/>
  <circle cx="${x + r * 0.62}" cy="${y + r * 0.3}" r="${r * 0.72}" fill="${C.leaf}"/>`;
/** A tiny outdoor unit for building facades. */
const miniOdu = (x, y) => `<rect x="${x}" y="${y}" width="14" height="10" rx="1.5" fill="${C.unit}"/><circle cx="${x + 6}" cy="${y + 5}" r="3.2" fill="${C.unitDeep}"/>`;

write(
  'hero',
  svg(1200, 460, `
  <path d="M40 380C20 200 220 70 600 64c380-6 590 110 560 316z" fill="${C.blob}"/>
  <circle cx="1080" cy="96" r="34" fill="${C.butter}"/>
  <g stroke="${C.butter}" stroke-width="5" stroke-linecap="round">
    <path d="M1080 44v-14M1080 162v-14M1028 96h-14M1146 96h-14M1043 59l-10-10M1127 143l-10-10M1043 133l-10 10M1127 49l-10 10"/>
  </g>
  <g fill="#FFFFFF"><ellipse cx="760" cy="82" rx="40" ry="12"/><ellipse cx="790" cy="74" rx="24" ry="11"/></g>

  <!-- outside: HDB block with aircon ledges, condo, landed house, office -->
  <rect x="612" y="118" width="170" height="262" fill="${C.sand}"/>
  <rect x="604" y="106" width="186" height="16" rx="3" fill="${C.brick}"/>
  ${Array.from({ length: 9 }, (_, r) => `<rect x="612" y="${150 + r * 26}" width="170" height="3" fill="${C.sandDark}"/>`).join('')}
  ${windows(622, 128, 4, 9, 42, 26, 20, 14, C.sky)}
  ${Array.from({ length: 8 }, (_, r) => miniOdu(646, 132 + r * 26) + miniOdu(730, 132 + r * 26)).join('')}

  <rect x="806" y="80" width="112" height="300" fill="#D8E6EB"/>
  <rect x="800" y="70" width="124" height="14" rx="3" fill="${C.steel}"/>
  ${Array.from({ length: 12 }, (_, r) => `<rect x="814" y="${94 + r * 24}" width="96" height="12" rx="2" fill="${C.sky}"/><rect x="810" y="${107 + r * 24}" width="104" height="2.5" fill="${C.cream}"/>`).join('')}

  ${tree(946, 320, 24)}

  <rect x="976" y="272" width="150" height="108" fill="${C.cream}"/>
  <path d="M964 278l87-50 87 50z" fill="${C.roof}"/>
  ${windows(990, 290, 3, 1, 46, 0, 28, 24, C.skyPale)}
  <rect x="1036" y="330" width="32" height="50" rx="2" fill="#566247"/>
  ${miniOdu(1090, 340)}${miniOdu(986, 340)}

  <!-- the room: a cutaway wall with a cool unit -->
  <path d="M60 64h520v316H60z" fill="${C.cream}"/>
  <rect x="60" y="64" width="520" height="12" fill="${C.line}"/>
  <rect x="580" y="64" width="14" height="316" fill="${C.line}"/>
  <rect x="440" y="120" width="120" height="150" rx="3" fill="${C.skyPale}"/>
  <path d="M500 120v150M440 195h120" stroke="${C.cream}" stroke-width="6"/>
  <rect x="434" y="266" width="132" height="8" rx="2" fill="${C.line}"/>
  ${wallUnit(150, 104, 200)}
  ${coolAir(178, 172, 1.4)}
  ${coolAir(258, 176, 1.2)}
  <!-- sofa -->
  <rect x="120" y="300" width="250" height="56" rx="14" fill="${C.cool}"/>
  <rect x="134" y="276" width="222" height="40" rx="12" fill="#62B3CF"/>
  <rect x="104" y="296" width="34" height="62" rx="12" fill="${C.brand}"/>
  <rect x="352" y="296" width="34" height="62" rx="12" fill="${C.brand}"/>
  <rect x="150" y="286" width="44" height="30" rx="8" fill="${C.sun}"/>
  <rect x="122" y="356" width="8" height="18" fill="${C.ink}"/><rect x="360" y="356" width="8" height="18" fill="${C.ink}"/>
  ${plant(420, 352, 1.3)}
  <!-- a thermometer on the wall, reading cool -->
  <g transform="translate(396 130)">
    <rect x="-8" y="0" width="16" height="70" rx="8" fill="#FFFFFF" stroke="${C.line}" stroke-width="2"/>
    <rect x="-3" y="34" width="6" height="30" rx="3" fill="${C.cool}"/>
    <circle cx="0" cy="66" r="9" fill="${C.cool}"/>
  </g>

  <!-- ground -->
  <ellipse cx="600" cy="398" rx="590" ry="50" fill="#E3EBEE"/>
  <path d="M40 380h1120" stroke="#CFDCE1" stroke-width="4" stroke-linecap="round"/>
  <ellipse cx="320" cy="384" rx="250" ry="7" fill="${C.shadow}"/>
`),
);

// --- the split unit cutaway (960 x 420), with numbered parts -------------------
// The numbers match the legend in src/components/SplitUnitDiagram.astro.
const marker = (x, y, n) => `
  <g>
    <circle cx="${x}" cy="${y}" r="15" fill="${C.brandDark}"/>
    <text x="${x}" y="${y + 5.5}" text-anchor="middle" font-family="ui-sans-serif, system-ui, sans-serif" font-size="16" font-weight="700" fill="#FFFFFF">${n}</text>
  </g>`;
const leader = (x1, y1, x2, y2) => `<path d="M${x1} ${y1}L${x2} ${y2}" stroke="${C.brandDark}" stroke-width="2" stroke-dasharray="4 4"/>`;

write(
  'split-unit-cutaway',
  svg(960, 420, `
  <path d="M20 330C0 170 160 40 470 36c330-4 480 110 470 294z" fill="${C.blob}"/>
  <!-- inside wall -->
  <rect x="40" y="60" width="520" height="300" fill="${C.cream}"/>
  <rect x="560" y="40" width="34" height="340" fill="${C.sandDark}"/>
  <rect x="594" y="40" width="20" height="340" fill="${C.sand}"/>
  <!-- outside ledge -->
  <rect x="614" y="300" width="300" height="16" fill="${C.sandDark}"/>
  <rect x="614" y="316" width="300" height="10" fill="${C.sand}"/>
  <ellipse cx="480" cy="384" rx="460" ry="26" fill="#E3EBEE"/>

  <!-- indoor unit in section: casing -->
  <path d="M120 96h330a26 26 0 0 1 26 26v84a26 26 0 0 1-26 26H120a26 26 0 0 1-26-26v-84a26 26 0 0 1 26-26z" fill="${C.unitShade}"/>
  <path d="M128 106h314a20 20 0 0 1 20 20v76a20 20 0 0 1-20 20H128a20 20 0 0 1-20-20v-76a20 20 0 0 1 20-20z" fill="#FFFFFF"/>
  <!-- (1) filter: a mesh across the intake at the top -->
  <rect x="140" y="110" width="290" height="10" rx="3" fill="${C.ice}"/>
  ${Array.from({ length: 24 }, (_, i) => `<rect x="${144 + i * 12}" y="110" width="2" height="10" fill="${C.iceDeep}"/>`).join('')}
  <!-- (2) cooling coil: a bent fin block -->
  <path d="M150 128h270l-30 50H180z" fill="#B9C7A7"/>
  ${Array.from({ length: 22 }, (_, i) => `<path d="M${156 + i * 12} 128l${-4 + i * 0.4} 50" stroke="#93A47F" stroke-width="2"/>`).join('')}
  <!-- (3) blower wheel -->
  <g transform="translate(285 196)">
    <circle r="22" fill="${C.unitShade}"/>
    ${Array.from({ length: 16 }, (_, i) => `<rect x="-1.4" y="-22" width="2.8" height="10" fill="${C.unitDeep}" transform="rotate(${i * 22.5})"/>`).join('')}
    <circle r="7" fill="${C.steelSoft}"/>
  </g>
  <!-- (4) drain tray under the coil -->
  <path d="M168 180h240l-8 12H176z" fill="${C.cool}"/>
  <!-- louvre and cool air -->
  <rect x="210" y="226" width="150" height="8" rx="4" fill="${C.unitDeep}"/>
  ${coolAir(222, 244, 1.1)}
  ${coolAir(294, 244, 0.9)}
  <!-- (5) drainage pipe out through the wall -->
  <path d="M408 186h60c18 0 22 8 22 26v120c0 14 10 20 24 20h180" stroke="${C.steelSoft}" stroke-width="7" fill="none" stroke-linecap="round"/>
  <!-- refrigerant pipes, insulated, to the outdoor unit -->
  <path d="M452 140h120c18 0 26 8 40 26l40 40" stroke="${C.cool}" stroke-width="10" fill="none" stroke-linecap="round"/>
  <path d="M452 160h110c18 0 26 8 40 26l40 40" stroke="${C.coral}" stroke-width="10" fill="none" stroke-linecap="round"/>

  <!-- outdoor unit -->
  <g transform="translate(-6 0)">${outdoorUnit(700, 168, 180)}</g>
  <!-- (6) condenser coil: the finned panel; (7) the outdoor fan -->
  <!-- (8) service valves -->
  <circle cx="680" cy="206" r="8" fill="${C.sun}"/>
  <circle cx="680" cy="228" r="8" fill="${C.sun}"/>

  ${leader(170, 115, 120, 60)}${marker(110, 52, 1)}
  ${leader(240, 150, 200, 280)}${marker(196, 292, 2)}
  ${leader(285, 196, 380, 290)}${marker(390, 300, 3)}
  ${leader(400, 186, 440, 70)}${marker(446, 58, 4)}
  ${leader(490, 300, 520, 340)}${marker(530, 350, 5)}
  ${leader(856, 240, 900, 140)}${marker(906, 128, 6)}
  ${leader(766, 231, 760, 140)}${marker(756, 128, 7)}
  ${leader(680, 216, 650, 120)}${marker(646, 108, 8)}
`),
);

// --- service levels: how far each clean goes (240 x 180 each) -----------------
const levelStage = () => `
  <path d="M24 98C16 50 64 22 120 22c58 0 100 26 98 74-2 46-50 64-100 64-52 0-86-18-94-62z" fill="${C.blob}"/>
  <ellipse cx="120" cy="160" rx="96" ry="5" fill="${C.shadow}"/>`;

write(
  'level-general',
  svg(240, 180, `
  ${levelStage()}
  <rect x="34" y="34" width="172" height="120" fill="${C.cream}"/>
  ${wallUnit(56, 52, 128, { open: true })}
  <rect x="62" y="44" width="116" height="9" rx="4" fill="${C.ice}" transform="rotate(-10 62 44)"/>
  ${Array.from({ length: 10 }, (_, i) => `<rect x="${66 + i * 11}" y="44" width="2" height="9" fill="${C.iceDeep}" transform="rotate(-10 62 44)"/>`).join('')}
  <path d="M70 100c10 10 90 10 100 0" stroke="${C.iceDeep}" stroke-width="3" fill="none" stroke-dasharray="3 5" stroke-linecap="round"/>
  <path d="M150 128l-20-18" stroke="${C.steel}" stroke-width="4" stroke-linecap="round"/>
  <g fill="${C.water}"><circle cx="124" cy="104" r="2"/><circle cx="118" cy="110" r="1.6"/></g>
`),
);

write(
  'level-wash',
  svg(240, 180, `
  ${levelStage()}
  <rect x="34" y="34" width="172" height="120" fill="${C.cream}"/>
  <rect x="62" y="50" width="116" height="36" rx="9" fill="${C.unitShade}"/>
  <rect x="70" y="56" width="100" height="20" rx="3" fill="#B9C7A7"/>
  ${Array.from({ length: 16 }, (_, i) => `<rect x="${72 + i * 6}" y="56" width="2" height="20" fill="#9EAE8B"/>`).join('')}
  <path d="M56 74s4 38 64 42c60-4 64-42 64-42z" fill="${C.ice}" opacity=".85"/>
  <path d="M120 116v22" stroke="${C.cool}" stroke-width="4" stroke-linecap="round"/>
  ${bucket(106, 136, 0.9, C.brand)}
  <path d="M196 108l-36-34" stroke="${C.steel}" stroke-width="4" stroke-linecap="round"/>
  <g stroke="${C.water}" stroke-width="2.5" stroke-linecap="round"><path d="M158 72l-12-6"/><path d="M158 72l-14 2"/><path d="M158 72l-10 9"/></g>
`),
);

write(
  'level-overhaul',
  svg(240, 180, `
  ${levelStage()}
  <rect x="34" y="34" width="172" height="120" fill="${C.cream}"/>
  <rect x="70" y="44" width="100" height="22" rx="2" fill="none" stroke="${C.unitDeep}" stroke-width="2.5" stroke-dasharray="5 4"/>
  <path d="M84 72v8M156 72v8" stroke="${C.unitDeep}" stroke-width="2"/>
  <rect x="44" y="132" width="96" height="8" rx="3" fill="${C.iceDeep}"/>
  <path d="M48 138h88l-5 14H53z" fill="${C.skyPale}"/>
  <rect x="56" y="100" width="72" height="34" rx="2" fill="#B9C7A7"/>
  ${Array.from({ length: 11 }, (_, i) => `<rect x="${60 + i * 6}" y="100" width="2" height="34" fill="#9EAE8B"/>`).join('')}
  <path d="M46 126c14-4 78-4 92 0v8H46z" fill="${C.water}" opacity=".85"/>
  <g transform="translate(176 110)"><circle r="14" fill="${C.unitShade}"/>${Array.from({ length: 10 }, (_, i) => `<rect x="-1" y="-14" width="2" height="7" fill="${C.unitDeep}" transform="rotate(${i * 36})"/>`).join('')}<circle r="4" fill="${C.steelSoft}"/></g>
  <rect x="150" y="134" width="50" height="16" rx="6" fill="${C.unit}" stroke="${C.unitDeep}" stroke-width="1.5"/>
  <rect x="148" y="80" width="46" height="9" rx="3" fill="${C.unitShade}" transform="rotate(10 171 84)"/>
`),
);

// --- how it works: four steps (200 x 150 each) ----------------------------------
const stepStage = (fill = C.blob) => `
  <path d="M18 80C12 40 52 16 100 16c48 0 84 22 82 62-2 38-42 54-84 54-44 0-72-16-80-52z" fill="${fill}"/>
  <ellipse cx="100" cy="136" rx="78" ry="4.5" fill="${C.shadow}"/>`;

write(
  'step-enquiry',
  svg(200, 150, `
  ${stepStage()}
  <rect x="62" y="26" width="76" height="106" rx="10" fill="${C.steel}"/>
  <rect x="68" y="36" width="64" height="84" rx="3" fill="#FFFFFF"/>
  <rect x="74" y="44" width="40" height="5" rx="2" fill="${C.brand}"/>
  ${[56, 70, 84].map((y) => `<rect x="74" y="${y}" width="52" height="9" rx="2" fill="#FFFFFF" stroke="${C.line}" stroke-width="1.5"/>`).join('')}
  <rect x="74" y="100" width="34" height="11" rx="3" fill="${C.brand}"/>
  <g transform="translate(140 36)"><circle r="16" fill="${C.ice}"/><path d="M0-9v18M-8-4.5l16 9M-8 4.5l16-9" stroke="${C.brand}" stroke-width="2.6" stroke-linecap="round"/></g>
`),
);

write(
  'step-team',
  svg(200, 150, `
  ${stepStage()}
  <rect x="38" y="96" width="124" height="8" rx="3" fill="${C.woodDark}"/>
  <rect x="46" y="104" width="7" height="30" fill="${C.woodDark}"/><rect x="147" y="104" width="7" height="30" fill="${C.woodDark}"/>
  <rect x="64" y="52" width="70" height="44" rx="4" fill="${C.steel}"/>
  <rect x="69" y="57" width="60" height="34" rx="2" fill="${C.skyPale}"/>
  <rect x="74" y="62" width="30" height="4" rx="2" fill="${C.brand}"/>
  <rect x="74" y="70" width="48" height="3" rx="1.5" fill="#FFFFFF"/><rect x="74" y="76" width="40" height="3" rx="1.5" fill="#FFFFFF"/>
  <rect x="92" y="96" width="14" height="4" fill="${C.steelSoft}"/>
  <g transform="translate(150 50)">
    <rect x="-22" y="-14" width="44" height="28" rx="4" fill="#FFFFFF" stroke="${C.line}" stroke-width="2"/>
    <path d="M-22-12l22 15 22-15" stroke="${C.brand}" stroke-width="2.4" fill="none"/>
  </g>
  <path d="M136 72c10 0 14-6 16-10" stroke="${C.sunDeep}" stroke-width="3" fill="none" stroke-linecap="round" stroke-dasharray="3 5"/>
  <path d="M156 32l10-6-2 11" stroke="${C.sunDeep}" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
`),
);

write(
  'step-quote',
  svg(200, 150, `
  ${stepStage()}
  <rect x="58" y="22" width="84" height="110" rx="4" fill="#FFFFFF" stroke="${C.line}" stroke-width="2"/>
  <rect x="84" y="16" width="32" height="12" rx="3" fill="${C.steelSoft}"/>
  <rect x="70" y="38" width="44" height="5" rx="2" fill="${C.brand}"/>
  ${[54, 66, 78, 90].map((y) => `<rect x="70" y="${y}" width="${y === 90 ? 34 : 56}" height="4" rx="2" fill="${C.unitDeep}"/><rect x="128" y="${y}" width="6" height="4" rx="2" fill="${C.unitDeep}"/>`).join('')}
  <path d="M70 104h60" stroke="${C.ink}" stroke-width="2"/>
  <rect x="104" y="110" width="28" height="7" rx="2" fill="${C.sunDeep}"/>
  <g transform="translate(148 104)"><circle r="18" fill="${C.sun}"/><path d="M-8 0l5 6 11-12" stroke="#FFFFFF" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g>
`),
);

write(
  'step-cool',
  svg(200, 150, `
  ${stepStage()}
  <rect x="30" y="24" width="140" height="108" fill="${C.cream}"/>
  ${wallUnit(46, 36, 108)}
  ${coolAir(62, 74, 1)}
  ${coolAir(110, 76, 0.8)}
  <g transform="translate(150 106)"><circle r="18" fill="${C.brand}"/><path d="M-8 0l5 6 11-12" stroke="#FFFFFF" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g>
`),
);

// --- property types (120 x 120), each with its outdoor units --------------------
write(
  'property/hdb',
  svg(120, 120, `
  ${iconStage()}
  <rect x="30" y="22" width="60" height="82" fill="${C.sand}"/>
  <rect x="26" y="16" width="68" height="8" rx="2" fill="${C.brick}"/>
  ${windows(36, 30, 3, 5, 18, 14, 10, 8, C.sky)}
  ${Array.from({ length: 5 }, (_, r) => `<rect x="${r % 2 ? 46 : 64}" y="${33 + r * 14}" width="9" height="6" rx="1" fill="${C.unit}"/>`).join('')}
  <rect x="30" y="96" width="60" height="8" fill="${C.sandDark}"/>
`),
);
write(
  'property/condo',
  svg(120, 120, `
  ${iconStage()}
  <rect x="38" y="12" width="44" height="92" fill="#D8E6EB"/>
  <rect x="34" y="8" width="52" height="6" rx="2" fill="${C.steel}"/>
  ${Array.from({ length: 8 }, (_, r) => `<rect x="42" y="${18 + r * 10}" width="36" height="6" rx="1" fill="${C.sky}"/><rect x="40" y="${24 + r * 10}" width="40" height="1.6" fill="${C.cream}"/>`).join('')}
  <rect x="84" y="78" width="16" height="12" rx="2" fill="${C.unit}" stroke="${C.unitDeep}"/><circle cx="91" cy="84" r="3.6" fill="${C.unitDeep}"/>
  ${tree(24, 84, 10)}
`),
);
write(
  'property/landed',
  svg(120, 120, `
  ${iconStage()}
  <rect x="26" y="56" width="68" height="48" fill="${C.cream}"/>
  <path d="M20 60l40-28 40 28z" fill="${C.roof}"/>
  <rect x="34" y="66" width="16" height="14" rx="1.5" fill="${C.skyPale}"/>
  <rect x="70" y="66" width="16" height="14" rx="1.5" fill="${C.skyPale}"/>
  <rect x="53" y="80" width="14" height="24" rx="1.5" fill="#566247"/>
  <rect x="94" y="88" width="16" height="12" rx="2" fill="${C.unit}" stroke="${C.unitDeep}"/><circle cx="101" cy="94" r="3.6" fill="${C.unitDeep}"/>
  <rect x="76" y="40" width="14" height="10" rx="2" fill="${C.unit}" stroke="${C.unitDeep}"/><circle cx="82" cy="45" r="3" fill="${C.unitDeep}"/>
`),
);
write(
  'property/office',
  svg(120, 120, `
  ${iconStage()}
  <rect x="30" y="20" width="60" height="84" fill="${C.steel}"/>
  ${windows(36, 26, 4, 6, 13, 12, 9, 8, C.sky)}
  <rect x="50" y="94" width="20" height="10" fill="${C.skyPale}"/>
  <rect x="34" y="12" width="20" height="8" rx="2" fill="${C.unit}" stroke="${C.unitDeep}"/>
  <rect x="62" y="12" width="20" height="8" rx="2" fill="${C.unit}" stroke="${C.unitDeep}"/>
  <circle cx="40" cy="16" r="2.6" fill="${C.unitDeep}"/><circle cx="68" cy="16" r="2.6" fill="${C.unitDeep}"/>
`),
);

// --- service icons (120 x 120) ---------------------------------------------------
write(
  'icon/aircon-servicing',
  svg(120, 120, `
  ${iconStage()}
  ${wallUnit(22, 34, 76, { open: true })}
  <rect x="26" y="26" width="68" height="7" rx="3" fill="${C.ice}" transform="rotate(-10 26 26)"/>
  <path d="M80 92l-18-22" stroke="${C.steel}" stroke-width="5" stroke-linecap="round"/>
  <path d="M84 98l-6-8" stroke="${C.coral}" stroke-width="8" stroke-linecap="round"/>
  <g fill="${C.water}"><circle cx="58" cy="66" r="2.2"/><circle cx="52" cy="72" r="1.8"/></g>
`),
);
write(
  'icon/aircon-chemical-wash',
  svg(120, 120, `
  ${iconStage()}
  <rect x="26" y="28" width="68" height="22" rx="6" fill="${C.unitShade}"/>
  <path d="M22 42s2 26 38 28c36-2 38-28 38-28z" fill="${C.ice}" opacity=".9"/>
  <path d="M60 70v14" stroke="${C.cool}" stroke-width="4" stroke-linecap="round"/>
  ${bucket(47, 84, 0.86, C.brand)}
`),
);
write(
  'icon/aircon-chemical-overhaul',
  svg(120, 120, `
  ${iconStage()}
  <rect x="26" y="76" width="68" height="6" rx="2" fill="${C.iceDeep}"/>
  <path d="M28 80h64l-4 14H32z" fill="${C.skyPale}"/>
  <rect x="34" y="54" width="44" height="24" rx="2" fill="#B9C7A7"/>
  ${Array.from({ length: 7 }, (_, i) => `<rect x="${37 + i * 6}" y="54" width="2" height="24" fill="#9EAE8B"/>`).join('')}
  <path d="M27 72c10-3 56-3 66 0v6H27z" fill="${C.water}" opacity=".85"/>
  <g transform="translate(84 40)"><circle r="12" fill="${C.unitShade}"/>${Array.from({ length: 8 }, (_, i) => `<rect x="-1" y="-12" width="2" height="6" fill="${C.unitDeep}" transform="rotate(${i * 45})"/>`).join('')}<circle r="3.5" fill="${C.steelSoft}"/></g>
  <rect x="26" y="28" width="38" height="8" rx="3" fill="${C.unitShade}" transform="rotate(-8 45 32)"/>
`),
);
write(
  'icon/aircon-gas-top-up',
  svg(120, 120, `
  ${iconStage()}
  <g transform="translate(52 52)">
    <circle r="30" fill="#FFFFFF" stroke="${C.cool}" stroke-width="6"/>
    <path d="M-20 10a22 22 0 0 1 40 0" stroke="${C.line}" stroke-width="4" fill="none"/>
    <path d="M0 4l14-16" stroke="${C.ink}" stroke-width="3.5" stroke-linecap="round"/>
    <circle r="4" fill="${C.ink}"/>
  </g>
  <rect x="82" y="62" width="20" height="38" rx="9" fill="${C.cool}"/>
  <rect x="87" y="55" width="10" height="9" rx="2" fill="${C.steel}"/>
`),
);
write(
  'icon/aircon-repair',
  svg(120, 120, `
  ${iconStage()}
  ${outdoorUnit(20, 44, 64)}
  <g transform="translate(86 46) rotate(40)">
    <rect x="-4" y="-4" width="8" height="46" rx="3" fill="${C.steel}"/>
    <path d="M-12-10a12 12 0 1 0 24 0l-6 0v6h-12v-6z" fill="${C.steel}"/>
  </g>
`),
);

// --- page illustrations (480 x 300) ---------------------------------------------
const pageStage = (fill = C.blob) => `
  <path d="M40 170C28 84 110 30 240 30c128 0 210 50 202 140-8 82-96 108-206 108-104 0-182-30-196-108z" fill="${fill}"/>
  <ellipse cx="240" cy="262" rx="190" ry="9" fill="${C.shadow}"/>`;

// About: an enquiry passing from the team's desk to a partner firm's technician.
write(
  'about',
  svg(480, 300, `
  ${pageStage()}
  <rect x="62" y="186" width="150" height="10" rx="3" fill="${C.woodDark}"/>
  <rect x="72" y="196" width="8" height="64" fill="${C.woodDark}"/><rect x="194" y="196" width="8" height="64" fill="${C.woodDark}"/>
  <rect x="96" y="128" width="88" height="58" rx="4" fill="${C.steel}"/>
  <rect x="102" y="134" width="76" height="46" rx="2" fill="${C.skyPale}"/>
  <rect x="108" y="140" width="40" height="5" rx="2" fill="${C.brand}"/>
  <rect x="108" y="150" width="60" height="3.5" rx="1.5" fill="#FFFFFF"/><rect x="108" y="158" width="52" height="3.5" rx="1.5" fill="#FFFFFF"/><rect x="108" y="166" width="56" height="3.5" rx="1.5" fill="#FFFFFF"/>
  <rect x="134" y="186" width="12" height="4" fill="${C.steelSoft}"/>
  ${resident(56, 262, { top: C.sun, skin: C.skin3 })}
  <!-- the handoff -->
  <path d="M206 120c40-50 90-50 128-10" stroke="${C.brand}" stroke-width="3.5" fill="none" stroke-dasharray="4 7" stroke-linecap="round"/>
  <path d="M326 98l10 14-16 2" stroke="${C.brand}" stroke-width="3.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  <g transform="translate(268 70)">
    <rect x="-22" y="-15" width="44" height="30" rx="4" fill="#FFFFFF" stroke="${C.line}" stroke-width="2"/>
    <path d="M-22-13l22 16 22-16" stroke="${C.brand}" stroke-width="2.4" fill="none"/>
  </g>
  ${technician(372, 262, { arm: 'out' })}
  ${toolbox(400, 238, 0.9)}
  ${outdoorUnit(300, 196, 60)}
`),
);

// Contact: the enquiry form with a snowflake seal.
write(
  'contact',
  svg(480, 300, `
  ${pageStage()}
  <rect x="160" y="40" width="160" height="214" rx="10" fill="#FFFFFF" stroke="${C.line}" stroke-width="2"/>
  <rect x="180" y="60" width="80" height="8" rx="3" fill="${C.brand}"/>
  ${[82, 110, 138, 166].map((y) => `<rect x="180" y="${y}" width="50" height="5" rx="2" fill="${C.unitDeep}"/><rect x="180" y="${y + 9}" width="120" height="12" rx="3" fill="#FFFFFF" stroke="${C.line}" stroke-width="1.5"/>`).join('')}
  <rect x="180" y="202" width="70" height="20" rx="5" fill="${C.brand}"/>
  <g transform="translate(330 66)"><circle r="30" fill="${C.ice}"/><path d="M0-18v36M-15.6-9l31.2 18M-15.6 9l31.2-18" stroke="${C.brand}" stroke-width="4" stroke-linecap="round"/><path d="M-5-14l5 5 5-5M-5 14l5-5 5 5" stroke="${C.brand}" stroke-width="3" fill="none" stroke-linecap="round"/></g>
  ${plant(114, 258, 1.2)}
  ${wallUnit(330, 150, 100)}
  ${coolAir(342, 184, 0.8)}
`),
);

// Privacy: a form behind a shield.
write(
  'privacy',
  svg(480, 300, `
  ${pageStage()}
  <rect x="138" y="58" width="150" height="190" rx="8" fill="#FFFFFF" stroke="${C.line}" stroke-width="2"/>
  ${[80, 102, 124, 146, 168].map((y) => `<rect x="156" y="${y}" width="${y % 44 ? 110 : 80}" height="6" rx="3" fill="${C.unitDeep}"/>`).join('')}
  <path d="M300 92l64 24v52c0 40-28 66-64 80-36-14-64-40-64-80v-52z" fill="${C.brand}"/>
  <path d="M300 108l48 18v42c0 30-20 50-48 62-28-12-48-32-48-62v-42z" fill="${C.brandDark}"/>
  <rect x="280" y="156" width="40" height="32" rx="5" fill="${C.sun}"/>
  <path d="M288 156v-10a12 12 0 0 1 24 0v10" stroke="${C.sun}" stroke-width="6" fill="none"/>
  <circle cx="300" cy="170" r="4" fill="${C.brandDark}"/>
`),
);

// 404: a unit that's lost its way: a question mark in the cool air.
write(
  'not-found',
  svg(480, 300, `
  ${pageStage()}
  <rect x="80" y="50" width="320" height="200" fill="${C.cream}"/>
  ${wallUnit(150, 74, 180)}
  ${coolAir(180, 132, 1.1)}
  <text x="300" y="214" text-anchor="middle" font-family="ui-sans-serif, system-ui, sans-serif" font-size="64" font-weight="700" fill="${C.iceDeep}">?</text>
  ${plant(110, 248, 1)}
`),
);

// --- skyline strip, tiled above the footer, with outdoor units on the blocks ---
write(
  'skyline',
  svg(480, 64, `
  <g fill="#D7E6EC">
    <rect x="0" y="22" width="54" height="42"/><rect x="60" y="8" width="40" height="56"/>
    <rect x="108" y="30" width="70" height="34"/><path d="M186 64V38l30-16 30 16v26z"/>
    <rect x="254" y="14" width="46" height="50"/><rect x="306" y="34" width="62" height="30"/>
    <rect x="374" y="4" width="36" height="60"/><rect x="416" y="26" width="64" height="38"/>
  </g>
  <g fill="#C3D7DF">
    <rect x="66" y="20" width="10" height="7" rx="1"/><rect x="66" y="38" width="10" height="7" rx="1"/>
    <rect x="262" y="26" width="10" height="7" rx="1"/><rect x="380" y="16" width="10" height="7" rx="1"/><rect x="380" y="34" width="10" height="7" rx="1"/>
    <circle cx="104" cy="50" r="10"/><circle cx="250" cy="52" r="9"/><circle cx="412" cy="50" r="10"/>
  </g>
`),
);

console.log(`illustrations written to ${out}`);
