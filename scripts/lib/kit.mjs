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
