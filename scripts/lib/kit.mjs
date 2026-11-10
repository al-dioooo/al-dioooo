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
