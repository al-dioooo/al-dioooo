// Draws every card of the profile README into assets/svg and rewrites
// README.md around them. Run: node scripts/render.mjs
//
// Full-width cards come in four files (light/dark × desktop/mobile); the small
// link cards only in light and dark. Content lives in scripts/data/profile.mjs,
// the activity grid in scripts/data/contributions.json (see refresh-activity.mjs).

import { mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import {
    ARROW, PIXEL, acorn, acornWidth, chip, chipFlow, delay, document, esc, frame, glitchHeading, gridDefs, icon, inverse,
    key, mono, monoWidth, num, palettes, plate, rail, sans, scan, typewriter, wrapSans
} from "./lib/kit.mjs"
import { profile } from "./data/profile.mjs"

const root = join(dirname(fileURLToPath(import.meta.url)), "..")
const read = (path) => JSON.parse(readFileSync(join(root, path), "utf8"))
const ICONS = read("scripts/data/icons.json")

// The small square that opens every card's header line
const bullet = (ink, x, y, size, rest = "") => `<rect x="${x}" y="${y}" width="${size}" height="${size}" fill="${ink.strong}"${rest}/>`

// Header line and top rail shared by the record cards
function cardHead(ink, f, left, right) {
    const { x, w, pad, mobile } = f
    const y = mobile ? 27 : 38
    const size = mobile ? 8 : 10
    const sq = mobile ? 8 : 9
    return `${bullet(ink, x + pad, y - sq, sq)}
  ${mono(x + pad + sq + 8, y, left, { size, fill: ink.text, tracking: mobile ? 1.4 : 2 })}
  ${right ? mono(x + w - pad, y, right, { size: size - 1, fill: ink.muted, tracking: 1.2, anchor: "end" }) : ""}
  ${rail(ink, mobile ? 38 : 52, x, x + w, { marker: 11, drawn: true })}`
}

// --- Hero ---------------------------------------------------------------------------

function hero(ink, f) {
    const { W, x, y, w, s, pad, mobile } = f
    const H = mobile ? 356 : 300
    const P = { x, y, w, h: H - y * 2 - s }
    const cx = x + w / 2
    const L = x + pad
    const R = x + w - pad

    const nameSize = mobile ? 44 : 60
    const nameY = mobile ? 96 : 136
    const nameW = acornWidth(profile.name, nameSize, 0.5)
    const heading = glitchHeading(ink, acorn(cx, nameY, profile.name, { size: nameSize, tracking: 0.5, anchor: "middle" }), {
        x: cx - nameW / 2, y: nameY - nameSize * 0.8, w: nameW, h: nameSize, dur: 9, at: 4.6
    })

    const headY = mobile ? 27 : 38
    const sq = mobile ? 8 : 9
    const head = `${bullet(ink, L, headY - sq, sq)}
  ${mono(L + sq + 8, headY, mobile ? `UNIT ${profile.unit.toUpperCase()}` : `PERSONAL DATA — UNIT ${profile.unit.toUpperCase()}`, { size: mobile ? 8 : 10, fill: ink.text, tracking: mobile ? 1.4 : 2 })}
  ${mono(R - sq - 7, headY, mobile ? "STATUS: ALIVE" : "SYSTEM_ID: ALICE · STATUS: ALIVE", { size: mobile ? 7.5 : 9, fill: ink.muted, tracking: 1.2, anchor: "end" })}
  ${bullet(ink, R - sq + 2, headY - sq + 1, sq - 2, ' class="pulse"')}`

    const railTop = mobile ? 38 : 52
    const railBottom = mobile ? 228 : 206

    // Status columns: beside the name on desktop, under it on mobile
    const rowsY = mobile ? [168, 188, 208] : [106, 130, 154]
    const size = mobile ? 8.5 : 9.5
    const column = (items, cx0, base) =>
        items.map((item, i) => `<g class="rise" style="${delay(base + i * 0.12)}">${icon(PIXEL[item.icon], cx0, rowsY[i] - 10.5, 13, ink.strong)}${mono(cx0 + 20, rowsY[i], item.text, { size, fill: ink.text, tracking: 0.2 })}</g>`).join("\n  ")
    const rightX = mobile ? cx + 8 : R - 20 - Math.max(...profile.status.right.map((i) => monoWidth(i.text, size, 0.2)))
    const status = `${column(profile.status.left, L, 0.5)}
  ${column(profile.status.right, rightX, 0.7)}`

    const title = `${mono(cx, mobile ? 120 : 164, profile.headline, { size: mobile ? 12.5 : 15, fill: ink.text, tracking: 0.6, anchor: "middle", italic: true, cls: "rise", style: delay(0.5) })}
  ${mono(cx, mobile ? 138 : 185, profile.tagline.toUpperCase(), { size: mobile ? 7.5 : 9.5, fill: ink.muted, tracking: mobile ? 1.8 : 2.4, anchor: "middle", cls: "rise", style: delay(0.65) })}`

    // Pod 042 plate under the bottom rail
    const block = mobile ? { x: L, y: 244, w: 38, h: 84 } : { x: L, y: 222, w: 58, h: 48 }
    const tx = block.x + block.w + (mobile ? 12 : 16)
    const max = R - tx - 12
    const typeSize = mobile ? 12 : 13.5
    const rowYs = mobile ? [282, 300, 318] : [260]
    const lines = profile.pod.map((line) => wrapSans(line, max, typeSize, 0.3))
    const typed = typewriter(ink, lines, { x: tx, rows: rowYs, size: typeSize, tracking: 0.3, max, fill: ink.strong })
    const pod = `<rect x="${block.x}" y="${block.y}" width="${block.w}" height="${block.h}" fill="${ink.block}"/>
  ${icon(PIXEL.comment, block.x + (block.w - 22) / 2, block.y + (block.h - 22) / 2, 22, ink.blockInk)}
  ${mono(tx, block.y + (mobile ? 12 : 11), "POD 042 — REPORT", { size: mobile ? 8 : 9, fill: ink.muted, tracking: 2 })}
  ${typed.body}`

    const body = `${plate(ink, P, { s })}
  ${scan(ink, P, { dur: 11, begin: 2 })}
  ${head}
  ${rail(ink, railTop, P.x, P.x + P.w, { marker: 12, drawn: true })}
  ${heading.body}
  ${heading.tear(ink.paper)}
  ${title}
  ${status}
  ${rail(ink, railBottom, P.x, P.x + P.w, { marker: 15, begin: 3, drawn: true })}
  ${pod}`

    return document({
        w: W, h: H, fonts: ["acorn", "sans"],
        label: `${profile.name}: ${profile.headline}, ${profile.tagline}`,
        defs: `${gridDefs(ink)}\n    ${heading.defs}\n    ${typed.defs}`,
        body
    })
}

// --- Output ----------------------------------------------------------------------------

const out = join(root, "assets/svg")
mkdirSync(out, { recursive: true })
const alts = {}
let files = 0
let bytes = 0

function emit(name, svg) {
    writeFileSync(join(out, `${name}.svg`), svg)
    files++
    bytes += Buffer.byteLength(svg)
    return svg.match(/aria-label="([^"]*)"/)[1]
}

// Four files for a full-width card
function wide(name, draw) {
    for (const theme of ["light", "dark"]) {
        for (const mobile of [false, true]) {
            alts[name] = emit(`${name}-${theme}${mobile ? "-mobile" : ""}`, draw(palettes[theme], frame(mobile)))
        }
    }
}

// Two files for a fixed-size card
function small(name, draw) {
    for (const theme of ["light", "dark"]) alts[name] = emit(`${name}-${theme}`, draw(palettes[theme]))
}

wide("hero", hero)

console.log(`${files} cards, ${(bytes / 1024).toFixed(0)} KB → assets/svg`)
