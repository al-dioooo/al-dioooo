// Drawing kit for the profile README cards. Everything here speaks the
// graph-paper language of banner.svg and the live card served from
// al.is-a.dev/api/readme/contact: paper plates with a hard shadow, a 10/100px
// grid, construction curves, tick-and-dot rails, Acorn, Poppins, pixelarticons.
//
// The cards render inside GitHub's <img> proxy, so nothing may reference
// external fonts, images or scripts. Two WebKit rules shape the markup:
// typewriter rows are revealed through masks (a zero-width clipPath rect clips
// nothing in Safari), and mono text never uses textLength. Every element keeps
// a static base value, so a viewer without SMIL or CSS animation still sees a
// complete card.

import { ACORN, ACORN_ADVANCE } from "./acorn.mjs"
import { POPPINS_400, POPPINS_ADVANCE } from "./poppins.mjs"
import { PIXEL } from "./pixel.mjs"

export { PIXEL }

// Lifted from banner.svg and banner-dark.svg
export const palettes = {
    light: {
        paper: "#E7E5E4",
        shadow: "#79716B",
        outline: "#1C1917",
        frame: "#45403A",
        rail: "#38352E",
        grid: "#45403A",
        text: "#38352E",
        strong: "#1C1917",
        muted: "#79716B",
        block: "#38352E",
        blockInk: "#E7E5E4",
        blockMuted: "#A8A29E",
        red: "#E5484D",
        cyan: "#0EA5B7"
    },
    dark: {
        paper: "#1C1917",
        shadow: "#0C0A09",
        outline: "#E7E5E4",
        frame: "#A8A29E",
        rail: "#D6D3D1",
        grid: "#A8A29E",
        text: "#D6D3D1",
        strong: "#E7E5E4",
        muted: "#A8A29E",
        block: "#D6D3D1",
        blockInk: "#1C1917",
        blockMuted: "#57534E",
        red: "#FF6369",
        cyan: "#3DD6E0"
    }
}

// The same ink set with every text tone swapped for the block's, for content
// drawn on top of an ink block or under the selection band.
export const inverse = (ink) => ({ ...ink, strong: ink.blockInk, text: ink.blockInk, muted: ink.blockMuted })

// Card geometry: desktop cards share the 800px frame of the banner and the
// live card; mobile cards are drawn at 400px so type stays legible on a phone.
export const frame = (mobile) =>
    mobile ? { W: 400, x: 5, y: 5, w: 384, s: 5, pad: 15, mobile } : { W: 800, x: 9, y: 9, w: 776, s: 6, pad: 31, mobile }

// --- Numbers and escaping ------------------------------------------------------

export const num = (n) => Number(n.toFixed(2))
// keyTimes need more precision than coordinates
export const key = (n) => Number(n.toFixed(5))

export const esc = (value) =>
    String(value).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c])

// --- Text ------------------------------------------------------------------------

const monoStack = "ui-monospace, SFMono-Regular, Menlo, Consolas, 'Liberation Mono', monospace"

const advance = (table) => (text, size, tracking = 0) => {
    const glyphs = [...text]
    return glyphs.reduce((w, ch) => w + (table[ch] ?? 0.6) * size, 0) + tracking * Math.max(0, glyphs.length - 1)
}

export const acornWidth = advance(ACORN_ADVANCE)
export const sansWidth = advance(POPPINS_ADVANCE["400"])
export const sansAdvances = (text, size, tracking = 0) =>
    [...text].map((ch) => (POPPINS_ADVANCE["400"][ch] ?? 0.6) * size + tracking)

// Mono text uses the viewer's monospace font; layout is planned with a
// generous advance so every slot keeps slack.
export const monoWidth = (text, size, tracking = 0) => {
    const n = [...text].length
    return n * size * 0.62 + Math.max(0, n - 1) * tracking
}

// Greedy word wrap of Poppins text
export function wrapSans(text, max, size, tracking = 0) {
    const rows = []
    let current = ""
    for (const word of text.split(" ")) {
        const next = current ? `${current} ${word}` : word
        if (!current || sansWidth(next, size, tracking) <= max) current = next
        else {
            rows.push(current)
            current = word
        }
    }
    rows.push(current)
    return rows
}

const attrsOf = ({ cls, style, attrs }) => `${cls ? ` class="${cls}"` : ""}${style ? ` style="${style}"` : ""}${attrs ?? ""}`

export function mono(x, y, text, { size, fill, tracking = 0, anchor = "start", bold = false, italic = false, ...rest }) {
    return `<text x="${num(x)}" y="${num(y)}" font-family="${monoStack}" font-weight="${bold ? 700 : 400}"${italic ? ' font-style="italic"' : ""} font-size="${size}" letter-spacing="${tracking}" fill="${fill}" text-anchor="${anchor}"${attrsOf(rest)}>${esc(text)}</text>`
}

export function sans(x, y, text, { size, fill, tracking = 0, anchor = "start", ...rest }) {
    return `<text x="${num(x)}" y="${num(y)}" font-family="Poppins, system-ui, sans-serif" font-weight="400" font-size="${size}" letter-spacing="${tracking}" fill="${fill}" text-anchor="${anchor}"${attrsOf(rest)}>${esc(text)}</text>`
}

export function acorn(x, y, text, { size, fill, tracking = 0, anchor = "start", ...rest }) {
    return `<text x="${num(x)}" y="${num(y)}" font-family="Acorn, Poppins, system-ui, sans-serif" font-weight="600" font-size="${size}" letter-spacing="${tracking}"${fill ? ` fill="${fill}"` : ""} text-anchor="${anchor}"${attrsOf(rest)}>${esc(text)}</text>`
}

// A 24-grid glyph (pixelarticons or a brand mark) with its top-left at (x, y)
export function icon(d, x, y, size, fill, rest = {}) {
    const paths = Array.isArray(d) ? d : [d]
    return `<g transform="translate(${num(x)} ${num(y)}) scale(${num(size / 24)})" fill="${fill}"${attrsOf(rest)}>${paths.map((p) => `<path d="${p}"/>`).join("")}</g>`
}

// The "opens elsewhere" arrow the comms tiles carry
export const ARROW = [
    "M11 5H5v2h6V5ZM5 7H3v12h2V7Zm12 12H5v2h12v-2Zm2-6h-2v6h2v-6Zm-8 0H9v2h2v-2Zm2-2h-2v2h2v-2Zm2-2h-2v2h2V9Zm2-2h-2v2h2V7Zm2-2h-2v2h2V5Zm2-2h-2v8h2V3Z",
    "M21 3h-8v2h8V3Z"
]

// --- Document ----------------------------------------------------------------------

const FACES = {
    acorn: `@font-face { font-family: "Acorn"; font-weight: 600; src: url(data:font/woff2;base64,${ACORN}) format("woff2"); }`,
    sans: `@font-face { font-family: "Poppins"; font-weight: 400; src: url(data:font/woff2;base64,${POPPINS_400}) format("woff2"); }`
}

// One-shot entrances and loops. Every keyframe set ends on the element's own
// base state, and reduced-motion viewers skip them all.
const MOTION = `
    @keyframes rise { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
    @keyframes fade { from { opacity: 0; } to { opacity: 1; } }
    @keyframes boot { 0% { opacity: 0; } 12% { opacity: 1; } 22% { opacity: .15; } 38% { opacity: 1; } 52% { opacity: .4; } 62%, 100% { opacity: 1; } }
    @keyframes blink { 0%, 55% { opacity: 1; } 56%, 100% { opacity: 0; } }
    @keyframes pulse { 0%, 60% { opacity: 1; } 80% { opacity: .2; } 100% { opacity: 1; } }
    @keyframes draw { from { stroke-dashoffset: 1; } to { stroke-dashoffset: 0; } }
    @keyframes sweep { 0%, 6% { opacity: 1; } 7%, 100% { opacity: 0; } }
    .rise { animation: rise .55s cubic-bezier(.2, .7, .2, 1) both; }
    .fade { animation: fade .6s ease-out both; }
    .boot { animation: boot .9s steps(1, end) both; }
    .blink { animation: blink 1.1s steps(1, end) infinite; }
    .pulse { animation: pulse 1.6s linear infinite; }
    .draw { stroke-dasharray: 1; animation: draw 1.1s cubic-bezier(.6, 0, .2, 1) both; }
    .sweep { opacity: 0; animation: sweep 8s steps(1, end) infinite; }
    @media (prefers-reduced-motion: reduce) { * { animation: none !important; } .sweep { opacity: 0; } }`

export const delay = (seconds) => `animation-delay: ${num(seconds)}s`

export function document({ w, h, label, fonts = [], defs = "", body }) {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="${esc(label)}">
  <title>${esc(label)}</title>
  <style>
    ${fonts.map((f) => FACES[f]).join("\n    ")}${MOTION}
  </style>
  <defs>
    ${defs}
  </defs>
  ${body}
</svg>
`
}

// --- Paper ------------------------------------------------------------------------

export function gridDefs(ink, major = 100) {
    const cross = major / 20
    return `<pattern id="gridMinor" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M10 0H0V10" fill="none" stroke="${ink.grid}" stroke-opacity=".05"/></pattern>
    <pattern id="gridMajor" x="2.5" y="-27.5" width="${major}" height="${major}" patternUnits="userSpaceOnUse"><path d="M${major} 0H0V${major}" fill="none" stroke="${ink.grid}" stroke-opacity=".1"/><path d="M-${cross} 0h${cross * 2}M0 -${cross}v${cross * 2}" stroke="${ink.grid}" stroke-opacity=".2"/></pattern>`
}

// The paper plate exactly as the banner draws it. `id` names its clipPath.
export function plate(ink, { x, y, w, h }, { s = 6, id = "paper", curves = true, outlined = false } = {}) {
    const lines = curves
        ? `<g clip-path="url(#${id})" fill="none" stroke="${ink.grid}">
    <path d="M${x} ${y}l${num(h * 1.1)} ${num(h * 1.1)}M${num(x + w * 0.18)} ${y}l${num(h * 1.1)} ${num(h * 1.1)}" stroke-opacity=".2"/>
    <path d="M${num(x + w * 0.56)} ${y}C${num(x + w * 0.57)} ${num(y + h * 0.5)} ${num(x + w * 0.32)} ${num(y + h)} ${x} ${num(y + h)}M${num(x + w * 0.54)} ${y}C${num(x + w * 0.55)} ${num(y + h * 0.48)} ${num(x + w * 0.31)} ${num(y + h * 0.97)} ${x} ${num(y + h * 0.97)}" stroke-opacity=".22"/>
  </g>`
        : ""
    return `<clipPath id="${id}"><rect x="${x}" y="${y}" width="${w}" height="${h}"/></clipPath>
  <rect x="${x + s}" y="${y + s}" width="${w}" height="${h}" fill="${ink.shadow}" stroke="${ink.outline}" stroke-width="2"/>
  <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${ink.paper}"/>
  <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#gridMinor)"/>
  <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#gridMajor)"/>
  ${lines}
  <rect x="${x + 1}" y="${y + 1}" width="${w - 2}" height="${h - 2}" fill="none" stroke="${outlined ? ink.outline : ink.frame}" stroke-width="2"/>`
}

// Rail with the banner's ticks and downward three-dot clusters. `marker` adds
// a block that travels the rail; `drawn` draws the line in on load.
export function rail(ink, y, x0, x1, { marker = 0, dots = true, drawn = false, begin = 0 } = {}) {
    const step = 33.357
    const count = Math.floor((x1 - x0 - 40) / step)
    const start = x0 + (x1 - x0 - count * step) / 2
    let marks = ""
    for (let i = 0; i <= count; i++) marks += `<rect x="${num(start + i * step - 2.4)}" y="${num(y + 0.6)}" width="4.85" height="1.21"/>`
    if (dots) {
        for (let i = 0; i < count; i++) {
            const cx = start + (i + 0.5) * step
            marks += `<circle cx="${num(cx - 3.64)}" cy="${num(y + 3.94)}" r="1.52"/><circle cx="${num(cx + 3.64)}" cy="${num(y + 3.94)}" r="1.52"/><circle cx="${num(cx)}" cy="${num(y + 8.19)}" r="1.52"/>`
        }
    }
    const runner = marker
        ? `<rect x="${x0}" y="${num(y - 2.4)}" width="18" height="4.8" fill="${ink.rail}" opacity="0">
    <animate attributeName="x" values="${x0};${num(x1 - 18)}" dur="${marker}s" begin="${begin}s" repeatCount="indefinite"/>
    <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.04;0.96;1" dur="${marker}s" begin="${begin}s" repeatCount="indefinite"/>
  </rect>`
        : ""
    return `<path d="M${x0} ${y}H${x1}" stroke="${ink.rail}" stroke-width="1.21"${drawn ? ` pathLength="1" class="draw"` : ""}/>
  <g fill="${ink.rail}"${drawn ? ` class="fade" style="${delay(0.5)}"` : ""}>${marks}</g>
  ${runner}`
}

// Outlined label chip; returns the markup and the width it took
export function chip(ink, x, y, text, { size = 8, h = 16, padX = 7, tracking = 0.8, solid = false, rest = {} } = {}) {
    const w = monoWidth(text, size, tracking) + padX * 2
    const svg = `<g${attrsOf(rest)}><rect x="${num(x) + 0.5}" y="${num(y) + 0.5}" width="${num(w)}" height="${h}" fill="${solid ? ink.block : "none"}" stroke="${solid ? ink.block : ink.muted}"/>${mono(x + padX, y + h / 2 + size * 0.36, text, { size, fill: solid ? ink.blockInk : ink.text, tracking, bold: solid })}</g>`
    return { svg, w: w + 1 }
}

// Chips flowed into rows inside `max`; returns markup and the height used
export function chipFlow(ink, x, y, labels, max, { gap = 6, rowGap = 6, h = 16, base = 0, step = 0.05, ...options } = {}) {
    let cx = x
    let cy = y
    let svg = ""
    labels.forEach((label, i) => {
        const probe = chip(ink, 0, 0, label, { h, ...options })
        if (cx > x && cx + probe.w > x + max) {
            cx = x
            cy += h + rowGap
        }
        svg += chip(ink, cx, cy, label, { h, ...options, rest: { cls: "rise", style: delay(base + i * step) } }).svg
        cx += probe.w + gap
    })
    return { svg, h: cy - y + h + 1 }
}
