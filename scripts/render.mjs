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

// --- About ---------------------------------------------------------------------------

function about(ink, f) {
    const { W, x, w, s, mobile } = f
    const blockW = mobile ? 40 : 58
    const size = mobile ? 12 : 13.5
    const lead = mobile ? 19 : 21
    const tx = x + blockW + (mobile ? 12 : 18)
    const max = x + w - (mobile ? 14 : 24) - tx
    const lines = wrapSans(profile.about, max, size, 0.2)
    const top = 5
    const first = top + (mobile ? 42 : 46)
    const h = first - top + (lines.length - 1) * lead + (mobile ? 16 : 20)
    const typed = typewriter(ink, [lines], { x: tx, rows: lines.map((_, i) => first + i * lead), size, tracking: 0.2, max, fill: ink.strong, loop: false, speed: 0.011, start: 0.5 })

    const body = `${plate(ink, { x, y: top, w, h }, { s, curves: false, outlined: true })}
  <rect x="${x}" y="${top}" width="${blockW}" height="${h}" fill="${ink.block}" stroke="${ink.outline}" stroke-width="2"/>
  ${icon(PIXEL.user, x + (blockW - 24) / 2, top + (h - 24) / 2, 24, ink.blockInk)}
  ${mono(tx, top + (mobile ? 20 : 22), "INTEL — UNIT DATA", { size: mobile ? 8 : 9, fill: ink.muted, tracking: 2 })}
  ${typed.body}`

    return document({ w: W, h: top + h + s + 3, fonts: ["sans"], label: profile.about, defs: `${gridDefs(ink)}\n    ${typed.defs}`, body })
}

// --- Field data ------------------------------------------------------------------------

function stats(ink, f) {
    const { W, x, w, s, mobile } = f
    const cols = mobile ? 2 : 4
    const gap = mobile ? 10 : 12
    const tw = (w - gap * (cols - 1)) / cols
    const th = 96
    const top = 5
    const rowsCount = Math.ceil(profile.stats.length / cols)

    const tiles = profile.stats.map((item, i) => {
        const tx = x + (i % cols) * (tw + gap)
        const ty = top + Math.floor(i / cols) * (th + gap + 2)
        const vw = acornWidth(item.value, 34, 0.5)
        return `<g class="rise" style="${delay(0.15 + i * 0.12)}">
  ${plate(ink, { x: tx, y: ty, w: tw, h: th }, { s, id: `tile${i}`, curves: false })}
  ${mono(tx + 13, ty + 20, `DATA 0${i + 1}`, { size: 7.5, fill: ink.muted, tracking: 1.6 })}
  ${bullet(ink, tx + tw - 19, ty + 13, 6, ` class="pulse" style="${delay(i * 0.4)}"`)}
  ${acorn(tx + 12, ty + 56, item.value, { size: 34, fill: ink.strong, tracking: 0.5 })}
  <path d="M${num(tx + 12 + vw + 10)} ${ty + 46}H${num(tx + tw - 13)}" stroke="${ink.rail}" stroke-width="1.2" pathLength="1" class="draw" style="${delay(0.5 + i * 0.12)}"/>
  <g fill="${ink.rail}">${[0, 1, 2].map((d) => `<rect x="${num(tx + tw - 17 - d * 10)}" y="${ty + 49}" width="4" height="1.2"/>`).join("")}</g>
  ${mono(tx + 13, ty + 72, item.unit, { size: 9, fill: ink.strong, tracking: 1.4, bold: true })}
  ${mono(tx + 13, ty + 85, item.caption, { size: 7.5, fill: ink.muted, tracking: 0.6 })}
</g>`
    })

    return document({
        w: W, h: top + rowsCount * (th + gap + 2) - gap + s + 1,
        fonts: ["acorn"],
        label: `Field data: ${profile.stats.map((i) => `${i.value} ${i.unit.toLowerCase()}, ${i.caption.toLowerCase()}`).join("; ")}`,
        defs: gridDefs(ink), body: tiles.join("\n  ")
    })
}

// --- Section header ---------------------------------------------------------------------

function header(ink, f, section, index) {
    const { W, x, w, mobile } = f
    const H = mobile ? 50 : 60
    const b = mobile ? 34 : 40
    const top = mobile ? 6 : 8
    const no = String(index + 1).padStart(2, "0")
    const size = mobile ? 20 : 27
    const tx = x + b + (mobile ? 13 : 17)
    const ty = top + b / 2 + size * 0.36
    const tw = acornWidth(section.title, size, 1)
    const sub = `// ${section.sub}`
    const subSize = mobile ? 8.5 : 10.5
    const end = x + w + (mobile ? 5 : 6)
    let cursor = tx + tw + (mobile ? 9 : 13)
    let subText = ""
    if (cursor + monoWidth(sub, subSize, 0.4) < end - 30) {
        subText = mono(cursor, ty - 1, sub, { size: subSize, fill: ink.muted, tracking: 0.4, cls: "rise", style: delay(0.35) })
        cursor += monoWidth(sub, subSize, 0.4) + (mobile ? 10 : 16)
    }
    const railY = top + b / 2 - 5
    const line = end - cursor > 70 ? rail(ink, railY, cursor, end, { marker: 8, drawn: true }) : ""

    const body = `<rect x="${x + 4}" y="${top + 4}" width="${b}" height="${b}" fill="none" stroke="${ink.muted}" stroke-width="1.5"/>
  <rect x="${x}" y="${top}" width="${b}" height="${b}" fill="${ink.block}"/>
  ${mono(x + b / 2, top + b / 2 + (mobile ? 4.5 : 5.5), no, { size: mobile ? 13 : 15, fill: ink.blockInk, tracking: 0.5, anchor: "middle", bold: true })}
  ${acorn(tx, ty, section.title, { size, fill: ink.strong, tracking: 1, cls: "boot" })}
  ${subText}
  ${line}`

    return document({ w: W, h: H, fonts: ["acorn"], label: `${no} · ${section.title} // ${section.sub}`, body })
}

// --- Service record -------------------------------------------------------------------

function experience(ink, f) {
    const { W, x, y, w, s, pad, mobile } = f
    const rows = profile.experience
    const L = x + pad
    const R = x + w - pad
    const y0 = mobile ? 50 : 66
    const rowH = mobile ? 88 : 58
    const P = { x, y, w, h: y0 + rows.length * rowH + (mobile ? 8 : 12) - y }
    const band = { x: x + (mobile ? 8 : 15), w: w - (mobile ? 16 : 30), h: rowH - 6 }

    const draw = (tone, animated) =>
        rows.map((row, i) => {
            const ry = y0 + i * rowH
            const anim = animated ? ` class="rise" style="${delay(0.25 + i * 0.1)}"` : ""
            if (mobile) {
                const note = wrapSans(row.note, R - L, 11, 0.1).slice(0, 2)
                return `<g${anim}>
    ${mono(L, ry + 21, row.date, { size: 8.5, fill: tone.muted, tracking: 0.6 })}
    ${mono(R, ry + 21, row.org, { size: 8.5, fill: tone.strong, tracking: 1, anchor: "end", bold: true })}
    ${acorn(L, ry + 43, row.role, { size: 15, fill: tone.strong, tracking: 0.3 })}
    ${note.map((line, n) => sans(L, ry + 61 + n * 15, line, { size: 11, fill: tone.text, tracking: 0.1 })).join("")}
  </g>`
            }
            return `<g${anim}>
    ${mono(L, ry + 25, String(i + 1).padStart(2, "0"), { size: 9, fill: tone.muted, tracking: 1, bold: true })}
    ${mono(L + 28, ry + 25, row.date, { size: 9.5, fill: tone.text, tracking: 0.8 })}
    ${mono(L + 28, ry + 42, row.type, { size: 8, fill: tone.muted, tracking: 1.2 })}
    ${acorn(L + 212, ry + 26, row.role, { size: 17, fill: tone.strong, tracking: 0.3 })}
    ${sans(L + 212, ry + 44, row.note, { size: 12, fill: tone.text, tracking: 0.1 })}
    ${mono(R, ry + 25, row.org, { size: 9.5, fill: tone.strong, tracking: 1.2, anchor: "end", bold: true })}
  </g>`
        }).join("\n  ")

    // The menu cursor: an ink band that steps from entry to entry and inverts
    // the text under it. It rests on the current role.
    const hold = 2.6
    const slide = 0.3
    const cycle = rows.length * hold
    const values = []
    const keys = []
    rows.forEach((_, i) => {
        const ry = y0 + i * rowH + 3
        values.push(ry, ry)
        keys.push((i * hold) / cycle, ((i + 1) * hold - slide) / cycle)
    })
    values.push(y0 + 3)
    keys.push(1)
    const move = `<animate attributeName="y" values="${values.join(";")}" keyTimes="${keys.map(key).join(";")}" calcMode="spline" keySplines="${keys.slice(1).map(() => ".6 0 .2 1").join(";")}" dur="${cycle}s" begin="1.6s" repeatCount="indefinite"/>`

    const seps = rows.slice(1).map((_, i) => `<path d="M${L} ${y0 + (i + 1) * rowH}H${R}" stroke="${ink.muted}" stroke-opacity=".5"/>`).join("")

    const body = `${plate(ink, P, { s })}
  ${cardHead(ink, f, `SERVICE LOG — ${rows.length} ENTRIES`, mobile ? "NEWEST FIRST" : "SORT: NEWEST FIRST")}
  ${seps}
  ${draw(ink, true)}
  <g mask="url(#band)">
    <rect x="${band.x}" y="${y0}" width="${band.w}" height="${rows.length * rowH}" fill="${ink.block}"/>
    ${draw(inverse(ink), true)}
  </g>`

    return document({
        w: W, h: P.y + P.h + s + (mobile ? 5 : 9), fonts: ["acorn", "sans"],
        label: `Service record: ${rows.map((r) => `${r.role}, ${r.org}, ${r.date}`).join("; ")}`,
        defs: `${gridDefs(ink)}
    <mask id="band" maskUnits="userSpaceOnUse" x="${band.x}" y="${y0}" width="${band.w}" height="${rows.length * rowH}"><rect x="${band.x}" y="${y0 + 3}" width="${band.w}" height="${band.h}" fill="#fff">${move}</rect></mask>`,
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
wide("about", about)
wide("stats", stats)
profile.sections.forEach((section, i) => wide(`header-${section.slug}`, (ink, f) => header(ink, f, section, i)))
wide("experience", experience)

console.log(`${files} cards, ${(bytes / 1024).toFixed(0)} KB → assets/svg`)
