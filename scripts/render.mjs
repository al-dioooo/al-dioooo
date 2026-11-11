// Draws every card of the profile README and rewrites README.md around them.
// Run: node scripts/render.mjs
//
// Full-width cards come in four files (light/dark × desktop/mobile); the small
// link cards only in light and dark. Content lives in scripts/data/profile.mjs,
// the activity snapshot in scripts/data/contributions.json (see refresh-activity.mjs).
//
// Cards go to assets/svg and are committed. The signal log is different: it is
// written to live/ (not committed), and .github/workflows/activity.yml redraws
// it every night and publishes it on the `output` branch, where the README
// reads it from.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import {
    ARROW, PIXEL, acorn, acornWidth, chip, chipFlow, delay, document, esc, frame, glitchHeading, gridDefs, icon, inverse,
    key, mono, monoWidth, num, palettes, plate, rail, sans, scan, typewriter, wrapSans
} from "./lib/kit.mjs"
import { profile } from "./data/profile.mjs"
import { body, currents, lane, layout, streamlines } from "./lib/river.mjs"

const root = join(dirname(fileURLToPath(import.meta.url)), "..")
const read = (path) => JSON.parse(readFileSync(join(root, path), "utf8"))
const ICONS = read("scripts/data/icons.json")
const ACTIVITY = read("scripts/data/contributions.json")

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

// --- Mission card ---------------------------------------------------------------------

function mission(ink, m, i) {
    const W = 392
    const P = { x: 3, y: 3, w: 380, h: 210 }
    const L = P.x + 14
    const R = P.x + P.w - 14
    const on = inverse(ink)
    const text = wrapSans(m.text, R - L, 11.5, 0.1).slice(0, 3)
    const chips = chipFlow(ink, L, 161, m.stack, R - L, { size: 7.5, h: 15, gap: 5, base: 0.5 })

    const body = `${plate(ink, P, { id: "paper" })}
  <rect x="${P.x}" y="${P.y}" width="${P.w}" height="24" fill="${ink.block}"/>
  ${mono(L, 19.5, `M-0${i + 1} // ${m.kind}`, { size: 8.5, fill: on.strong, tracking: 1.4, bold: true })}
  ${mono(R - 13, 19.5, m.year, { size: 8.5, fill: on.muted, tracking: 1, anchor: "end" })}
  <rect x="${R - 7}" y="11.5" width="7" height="7" fill="${on.strong}" class="pulse" style="${delay(i * 0.3)}"/>
  ${acorn(L, 62, m.title, { size: 23, fill: ink.strong, tracking: 0.8, cls: "boot", style: delay(0.1 + i * 0.08) })}
  ${mono(L + 1, 79, m.tag, { size: 8, fill: ink.muted, tracking: 1.2, bold: true })}
  <path d="M${L} 90H${R}" stroke="${ink.rail}" stroke-width="1.2" pathLength="1" class="draw" style="${delay(0.2)}"/>
  <g fill="${ink.rail}">${[0, 1, 2, 3].map((d) => `<rect x="${L + 4 + d * 16}" y="90.6" width="4" height="1.2"/>`).join("")}</g>
  ${text.map((line, n) => sans(L, 110 + n * 17, line, { size: 11.5, fill: ink.text, tracking: 0.1, cls: "rise", style: delay(0.3 + n * 0.08) })).join("\n  ")}
  ${chips.svg}
  <path d="M${L} 188H${R}" stroke="${ink.muted}" stroke-opacity=".6"/>
  ${mono(L, 203, m.link, { size: 8.5, fill: ink.text, tracking: 0.6 })}
  <g>${icon(ARROW, R - 11, 193, 11, ink.strong)}<animateTransform attributeName="transform" type="translate" values="0 0;0 0;2 -2;0 0" keyTimes="0;0.7;0.85;1" dur="2.4s" begin="${num(i * 0.3)}s" repeatCount="indefinite"/></g>
  ${scan(ink, P, { dur: 10, begin: 1.5 + i * 0.7 })}`

    return document({
        w: W, h: 230, fonts: ["acorn", "sans"],
        label: `${m.title}: ${m.text} ${m.tag}.`,
        defs: gridDefs(ink, 50), body
    })
}

function cta(ink) {
    const P = { x: 3, y: 3, w: 290, h: 44 }
    const body = `${plate(ink, P, { s: 5, curves: false, outlined: true })}
  <rect x="${P.x}" y="${P.y}" width="44" height="${P.h}" fill="${ink.block}" stroke="${ink.outline}" stroke-width="2"/>
  <g>${icon(ARROW, P.x + 13, P.y + 13, 18, ink.blockInk)}<animateTransform attributeName="transform" type="translate" values="0 0;0 0;2 -2;0 0" keyTimes="0;0.6;0.8;1" dur="2s" repeatCount="indefinite"/></g>
  ${mono(P.x + 58, P.y + 20, "VIEW ALL MISSION RECORDS", { size: 9.5, fill: ink.strong, tracking: 1.6, bold: true })}
  ${mono(P.x + 58, P.y + 34, "al.is-a.dev/work", { size: 8.5, fill: ink.muted, tracking: 0.6 })}`
    return document({ w: 302, h: 56, label: "View all mission records at al.is-a.dev/work", defs: gridDefs(ink, 50), body })
}

// --- Loadout ---------------------------------------------------------------------------

function loadout(ink, f) {
    const { W, x, y, w, s, pad, mobile } = f
    const groups = profile.loadout
    const L = x + pad
    const cols = mobile ? 1 : 2
    const colGap = 20
    const gw = (w - pad * 2 - colGap * (cols - 1)) / cols
    const cell = 46
    const pitch = gw / 6
    const groupH = 20 + cell + 16
    const rowGap = mobile ? 14 : 18
    const y0 = mobile ? 54 : 72
    const total = groups.reduce((n, g) => n + g.items.length, 0)

    let slot = 0
    const drawn = groups.map((group, gi) => {
        const gx = L + (gi % cols) * (gw + colGap)
        const gy = y0 + Math.floor(gi / cols) * (groupH + rowGap)
        const labelW = monoWidth(group.label, 8.5, 1.4)
        const cells = group.items.map((name, i) => {
            const item = ICONS[`loadout/${name}`]
            const cx = gx + i * pitch
            const cy = gy + 20
            const n = slot++
            return `<g class="rise" style="${delay(0.3 + n * 0.04)}">
      <rect x="${num(cx) + 0.5}" y="${cy + 0.5}" width="${cell}" height="${cell}" fill="${ink.paper}" fill-opacity=".6" stroke="${ink.muted}"/>
      ${icon(item.d, cx + (cell - 24) / 2, cy + (cell - 24) / 2, 24, ink.strong)}
      ${mono(cx + cell / 2, cy + cell + 12, item.label.toUpperCase(), { size: 7, fill: ink.text, tracking: 0.3, anchor: "middle" })}
    </g>
    <rect x="${num(cx) + 0.5}" y="${cy + 0.5}" width="${cell}" height="${cell}" fill="none" stroke="${ink.strong}" stroke-width="2.5" class="sweep" style="${delay(2 + n * 0.34)}"/>`
        })
        return `${bullet(ink, gx, gy + 2, 6)}
    ${mono(gx + 12, gy + 9, group.label, { size: 8.5, fill: ink.strong, tracking: 1.4, bold: true })}
    <path d="M${num(gx + 12 + labelW + 10)} ${gy + 5.5}H${num(gx + gw - (pitch - cell))}" stroke="${ink.muted}" stroke-opacity=".6"/>
    ${cells.join("\n    ")}`
    })

    const aiY = y0 + Math.ceil(groups.length / cols) * (groupH + rowGap) + (mobile ? 0 : 2)
    const ai = chipFlow(ink, L, aiY + 18, profile.appliedAi, w - pad * 2, { size: 8, h: 18, base: 1.2, solid: true })
    const P = { x, y, w, h: aiY + 18 + ai.h + (mobile ? 14 : 18) - y }

    const body = `${plate(ink, P, { s })}
  ${cardHead(ink, f, `INVENTORY — ${total} ITEMS EQUIPPED`, mobile ? "" : "STACK AND TOOLS")}
  ${drawn.join("\n  ")}
  ${bullet(ink, L, aiY + 2, 6)}
  ${mono(L + 12, aiY + 9, "APPLIED AI", { size: 8.5, fill: ink.strong, tracking: 1.4, bold: true })}
  <path d="M${num(L + 12 + monoWidth("APPLIED AI", 8.5, 1.4) + 10)} ${aiY + 5.5}H${x + w - pad}" stroke="${ink.muted}" stroke-opacity=".6"/>
  ${ai.svg}`

    return document({
        w: W, h: P.y + P.h + s + (mobile ? 5 : 9),
        label: `Loadout: ${groups.map((g) => `${g.label.toLowerCase()}: ${g.items.map((n) => ICONS[`loadout/${n}`].label).join(", ")}`).join("; ")}; applied AI: ${profile.appliedAi.join(", ").toLowerCase()}`,
        defs: gridDefs(ink), body
    })
}

// --- Signal log ------------------------------------------------------------------------

function activityStats() {
    const days = ACTIVITY.weeks.flat()
    let streak = 0
    let best = 0
    for (const [, count] of days) {
        streak = count > 0 ? streak + 1 : 0
        best = Math.max(best, streak)
    }
    return { total: ACTIVITY.total, best, active: days.filter(([, c]) => c > 0).length }
}

// Ink lines drift toward today: each class slides its dash pattern by one period
const FLOW = `
    @keyframes flow1 { to { stroke-dashoffset: -32; } }
    @keyframes flow2 { to { stroke-dashoffset: -48; } }
    @keyframes flow3 { to { stroke-dashoffset: -24; } }
    @keyframes flow4 { to { stroke-dashoffset: -8; } }
    .flow1 { stroke-dasharray: 26 6; animation: flow1 6s linear infinite; }
    .flow2 { stroke-dasharray: 38 10; animation: flow2 9s linear infinite; }
    .flow3 { stroke-dasharray: 17 7; animation: flow3 5s linear infinite; }
    .flow4 { stroke-dasharray: 3 5; animation: flow4 2.5s linear infinite; }`

// A plain arrowhead, nose at +x, with a dashed wake behind it
const CRAFT = { hull: "M9 0L-6 -5.2L-2.6 0L-6 5.2Z", wake: "M-7 0H-18" }

function signal(ink, f) {
    const { W, x, y, w, s, pad, mobile } = f
    const st = activityStats()
    const L = x + pad
    const R = x + w - pad
    const statY = mobile ? 72 : 98
    const fmt = (n) => n.toLocaleString("en-US")

    const facts = [
        { value: fmt(st.total), label: "SIGNALS LOGGED" },
        { value: String(st.active), label: "ACTIVE DAYS" },
        { value: String(st.best), label: mobile ? "DAY BEST STREAK" : "DAY LONGEST STREAK" }
    ]
    const factSize = mobile ? 21 : 28
    const factsSvg = facts.map((fact, i) => {
        const fx = L + i * ((R - L) / 3)
        return `<g class="rise" style="${delay(0.2 + i * 0.12)}">${acorn(fx, statY, fact.value, { size: factSize, fill: ink.strong, tracking: 0.5 })}${mobile
            ? mono(fx, statY + 13, fact.label, { size: 7, fill: ink.muted, tracking: 0.8 })
            : mono(fx + acornWidth(fact.value, factSize, 0.5) + 10, statY - 2, fact.label, { size: 8.5, fill: ink.muted, tracking: 1.4 })}</g>`
    }).join("\n  ")

    // The river: one current per repository, flowing toward today
    const box = mobile ? { top: 106, bottom: 250 } : { top: 126, bottom: 326 }
    const river = layout(currents(ACTIVITY, profile.activity), {
        x0: L, x1: R, cy: (box.top + box.bottom) / 2, height: box.bottom - box.top, gap: mobile ? 3 : 4
    })
    const { xs } = river
    const repos = river.currents.filter((c) => c.kind === "repo")
    const biggest = Math.max(...river.currents.map((c) => c.count))
    const latest = Math.max(...river.currents.map((c) => c.last))
    // The repository touched most recently flies in red
    const recent = [...repos].sort((a, b) => b.last - a.last || b.count - a.count)[0]

    const water = river.currents.map((current, k) => {
        const quiet = current.kind === "beyond"
        const wash = body(current, xs).map((d) => `<path d="${d}" fill="${ink.strong}" fill-opacity="${quiet ? 0.03 : 0.055}" stroke="none"/>`).join("")
        const lines = streamlines(current, xs, mobile ? { spacing: 3.4, minSpacing: 1.4 } : {}).map((line) => {
            const opacity = line.rank ? Math.max(0.3, 0.72 - line.rank * 0.11) : 0.9
            return `<path d="${line.d}" class="flow${quiet ? 4 : ((k + line.rank) % 3) + 1}" stroke-opacity="${num(quiet ? opacity * 0.7 : opacity)}"/>`
        }).join("")
        return `${wash}${lines}`
    }).join("\n    ")

    const craft = river.currents.map((current, k) => {
        const path = lane(current, xs, mobile ? 2.4 : 3.2)
        if (!path || path.length < 30) return ""
        const size = (mobile ? 0.5 : 0.7) + (mobile ? 0.35 : 0.5) * Math.sqrt(current.count / biggest)
        // Older work sinks: the longer since the last commit, the fainter
        const depth = num(Math.max(0.38, 1 - (latest - current.last) / 36))
        const fill = current === recent ? ink.red : ink.strong
        const dur = num(Math.min(46, Math.max(6, path.length / (mobile ? 9 : 14))))
        const timing = `dur="${dur}s" begin="-${num((k * 3.7) % dur)}s" repeatCount="indefinite"`
        return `<g transform="translate(${path.mid[0]} ${path.mid[1]})"><g opacity="${depth}">
      <animateMotion path="${path.d}" rotate="auto" ${timing}/>
      <animate attributeName="opacity" values="0;${depth};${depth};0" keyTimes="0;0.1;0.9;1" ${timing}/>
      <g transform="scale(${num(size)})"><path d="${CRAFT.wake}" fill="none" stroke="${fill}" stroke-width="1.3" stroke-dasharray="2.5 2.5" stroke-opacity=".6"/><path d="${CRAFT.hull}" fill="${fill}" stroke="${ink.paper}" stroke-width="0.8"/></g>
    </g></g>`
    }).join("\n  ")

    // Names sit on the widest free part of each current, biggest first
    const size = mobile ? 6.5 : 7.5
    const boxes = []
    const named = [...river.currents].sort((a, b) => b.count - a.count).filter((c, i) => !mobile || i < 5)
    const labels = named.map((current) => {
        const text = current.label.toUpperCase()
        const tw = monoWidth(text, size, 0.6) + 6
        const candidates = current.w.map((width, i) => i).filter((i) => current.w[i] >= 2).sort((a, b) => current.w[b] - current.w[a])
        for (const i of candidates) {
            const cx = Math.min(R - tw / 2, Math.max(L + tw / 2, xs[i]))
            const spot = { x: cx - tw / 2, y: current.c[i] - size, w: tw, h: size + 5 }
            if (boxes.some((b) => spot.x < b.x + b.w && b.x < spot.x + spot.w && spot.y < b.y + b.h && b.y < spot.y + spot.h)) continue
            boxes.push(spot)
            return mono(cx, current.c[i] + size * 0.36, text, {
                size, fill: current.kind === "repo" ? ink.strong : ink.muted, tracking: 0.6, anchor: "middle", bold: current.kind === "repo",
                attrs: ` stroke="${ink.paper}" stroke-width="3" stroke-linejoin="round" paint-order="stroke"`
            })
        }
        return ""
    }).join("\n  ")

    const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"]
    const axisY = box.bottom + (mobile ? 9 : 12)
    let months = ""
    let lastMonth = Number(ACTIVITY.weeks[0][0][0].slice(5, 7)) - 1
    let lastLabelX = -99
    ACTIVITY.weeks.forEach((week, i) => {
        const month = Number(week[0][0].slice(5, 7)) - 1
        if (month === lastMonth) return
        lastMonth = month
        months += `<rect x="${num(xs[i])}" y="${axisY - 4}" width="1.2" height="5" fill="${ink.rail}"/>`
        if (xs[i] - lastLabelX < (mobile ? 30 : 34) || xs[i] > R - 18) return
        months += mono(xs[i] + 4, axisY + 1, MONTHS[month], { size: mobile ? 6.5 : 7.5, fill: ink.muted, tracking: 0.8 })
        lastLabelX = xs[i]
    })
    const axis = `<path d="M${L} ${axisY + 1.5}H${R}" stroke="${ink.rail}" stroke-width="1.2"/>
  ${months}
  <path d="M${R} ${box.top - 4}V${axisY + 1.5}" stroke="${ink.red}" stroke-width="1.2" stroke-dasharray="3 3" class="pulse"/>
  ${mono(R - 5, box.top + 2, "NOW", { size: mobile ? 6.5 : 7.5, fill: ink.red, tracking: 1, anchor: "end", bold: true })}`

    // The last seven days as lit or empty squares
    const legendY = axisY + (mobile ? 21 : 26)
    const week = ACTIVITY.weeks.flat().slice(-7)
    const lc = mobile ? 7 : 9
    const lit = week.map(([, count], i) => {
        const lx = R - (7 - i) * (lc + 3) + 3
        return count > 0
            ? `<rect x="${num(lx)}" y="${legendY - lc + 1}" width="${lc}" height="${lc}" fill="${ink.strong}" class="pulse" style="${delay(i * 0.2)}"/>`
            : `<rect x="${num(lx) + 0.5}" y="${legendY - lc + 1.5}" width="${lc - 1}" height="${lc - 1}" fill="none" stroke="${ink.muted}"/>`
    }).join("")
    const legend = `${mono(L, legendY, mobile ? "ONE CURRENT PER REPOSITORY" : "ONE CURRENT PER REPOSITORY · WIDTH FOLLOWS COMMITS · OLDEST ON THE LEFT", { size: mobile ? 7 : 7.5, fill: ink.muted, tracking: 0.8 })}
  ${mono(R - 7 * (lc + 3) - 5, legendY, mobile ? "7 DAYS" : "LAST 7 DAYS", { size: mobile ? 7 : 7.5, fill: ink.muted, tracking: 0.8, anchor: "end" })}
  ${lit}`

    const P = { x, y, w, h: legendY + (mobile ? 12 : 16) - y }
    const card = `${plate(ink, P, { s })}
  ${cardHead(ink, f, mobile ? "TRANSMISSION LOG — 12 MONTHS" : "TRANSMISSION LOG — LAST 12 MONTHS", `SNAPSHOT ${ACTIVITY.fetched}`)}
  ${factsSvg}
  <g class="fade" style="${delay(0.3)}" fill="none" stroke="${ink.rail}" stroke-width="${mobile ? 0.7 : 0.9}" stroke-linecap="round">
    ${water}
  </g>
  ${axis}
  ${craft}
  ${labels}
  ${legend}`

    const rest = river.currents.find((c) => c.kind === "rest")
    const beyond = river.currents.find((c) => c.kind === "beyond")
    return document({
        w: W, h: P.y + P.h + s + (mobile ? 5 : 9), fonts: ["acorn"],
        label: `Signal log, snapshot ${ACTIVITY.fetched}: ${fmt(st.total)} contributions in the last 12 months, ${st.active} active days, longest streak ${st.best} days. Drawn as a river with one current per repository, busiest first: ${[...repos].sort((a, b) => b.count - a.count).map((c) => c.label).join(", ")}${rest ? `, ${rest.label.replace("+", "")} more` : ""}${beyond ? `, and ${beyond.label}` : ""}`,
        css: FLOW, defs: gridDefs(ink), body: card
    })
}

// --- Training --------------------------------------------------------------------------

function training(ink, f) {
    const { W, x, y, w, s, pad, mobile } = f
    const L = x + pad
    const R = x + w - pad
    const y0 = mobile ? 50 : 66
    const rowH = mobile ? 92 : 60
    const rows = profile.education

    const gauge = (gpa, gx, gy, gw) => {
        const fill = gw * (gpa.value / gpa.of)
        return `<rect x="${num(gx) + 0.5}" y="${gy + 0.5}" width="${gw}" height="7" fill="none" stroke="${ink.muted}"/>
    <rect x="${num(gx) + 0.5}" y="${gy + 0.5}" width="${num(fill)}" height="7" fill="${ink.strong}"><animate attributeName="width" values="0;0;${num(fill)}" keyTimes="0;0.35;1" calcMode="spline" keySplines="0 0 1 1;.2 .7 .2 1" dur="2s" fill="freeze"/></rect>`
    }

    const drawn = rows.map((row, i) => {
        const ry = y0 + i * rowH
        const gpaText = row.gpa ? `GPA ${row.gpa.value.toFixed(2)} / ${row.gpa.of.toFixed(2)}` : ""
        if (mobile) {
            const programme = wrapSans(row.programme, R - L, 11, 0.1).slice(0, 2)
            return `<g class="rise" style="${delay(0.25 + i * 0.12)}">
    ${mono(L, ry + 21, row.date, { size: 8.5, fill: ink.muted, tracking: 0.6 })}
    ${row.gpa ? `${mono(R, ry + 21, gpaText, { size: 8.5, fill: ink.strong, tracking: 0.8, anchor: "end", bold: true })}${gauge(row.gpa, R - 96, ry + 27, 96)}` : mono(R, ry + 21, row.type, { size: 7.5, fill: ink.muted, tracking: 1, anchor: "end" })}
    ${acorn(L, ry + 47, row.school, { size: 16, fill: ink.strong, tracking: 0.3 })}
    ${programme.map((line, n) => sans(L, ry + 65 + n * 15, line, { size: 11, fill: ink.text, tracking: 0.1 })).join("")}
  </g>`
        }
        return `<g class="rise" style="${delay(0.25 + i * 0.12)}">
    ${mono(L, ry + 25, String(i + 1).padStart(2, "0"), { size: 9, fill: ink.muted, tracking: 1, bold: true })}
    ${mono(L + 28, ry + 25, row.date, { size: 9.5, fill: ink.text, tracking: 0.8 })}
    ${mono(L + 28, ry + 42, row.type, { size: 8, fill: ink.muted, tracking: 1.2 })}
    ${acorn(L + 212, ry + 26, row.school, { size: 17, fill: ink.strong, tracking: 0.3 })}
    ${sans(L + 212, ry + 44, row.programme, { size: 12, fill: ink.text, tracking: 0.1 })}
    ${row.gpa ? `${mono(R, ry + 25, gpaText, { size: 9.5, fill: ink.strong, tracking: 1, anchor: "end", bold: true })}${gauge(row.gpa, R - 124 - monoWidth(gpaText, 9.5, 1) + 0, ry + 17, 110)}` : ""}
  </g>${i ? `<path d="M${L} ${ry}H${R}" stroke="${ink.muted}" stroke-opacity=".5"/>` : ""}`
    }).join("\n  ")

    const mobileSeps = mobile ? rows.slice(1).map((_, i) => `<path d="M${L} ${y0 + (i + 1) * rowH}H${R}" stroke="${ink.muted}" stroke-opacity=".5"/>`).join("") : ""
    const certY = y0 + rows.length * rowH + (mobile ? 8 : 10)
    const labels = mobile ? profile.certifications.map((c) => c.split(" · ")[1]) : profile.certifications
    const certs = chipFlow(ink, L, certY + 18, labels, R - L, { size: mobile ? 7 : 8, h: 18, base: 0.7 })
    const P = { x, y, w, h: certY + 18 + certs.h + (mobile ? 14 : 18) - y }

    const body = `${plate(ink, P, { s })}
  ${cardHead(ink, f, "TRAINING RECORD — EDUCATION", mobile ? "" : `${rows.length} ENTRIES`)}
  ${drawn}
  ${mobileSeps}
  <path d="M${L} ${certY - (mobile ? 8 : 10)}H${R}" stroke="${ink.muted}" stroke-opacity=".5"/>
  ${bullet(ink, L, certY + 2, 6)}
  ${mono(L + 12, certY + 9, "CERTIFICATIONS — 2026", { size: 8.5, fill: ink.strong, tracking: 1.4, bold: true })}
  ${certs.svg}`

    return document({
        w: W, h: P.y + P.h + s + (mobile ? 5 : 9), fonts: ["acorn", "sans"],
        label: `Training: ${rows.map((r) => `${r.school}, ${r.programme}, ${r.date}${r.gpa ? `, GPA ${r.gpa.value} of ${r.gpa.of}` : ""}`).join("; ")}. Certifications 2026: ${profile.certifications.join("; ")}`,
        defs: gridDefs(ink), body
    })
}

// --- Comms -----------------------------------------------------------------------------

function comm(ink, c, i) {
    const P = { x: 3, y: 3, w: 157, h: 42 }
    const glyph = ICONS[`comms/${c.slug}`].d
    const body = `${plate(ink, P, { s: 5, curves: false, outlined: true })}
  <rect x="${P.x}" y="${P.y}" width="40" height="${P.h}" fill="${ink.block}" stroke="${ink.outline}" stroke-width="2"/>
  ${icon(glyph, P.x + 10, P.y + 11, 20, ink.blockInk)}
  ${mono(P.x + 50, P.y + 17, c.label, { size: 8, fill: ink.strong, tracking: 1.4, bold: true })}
  ${mono(P.x + 50, P.y + 31, c.value, { size: 8.2, fill: ink.text, tracking: 0 })}
  <g>${icon(ARROW, P.x + P.w - 15, P.y + 6, 9, ink.muted)}<animateTransform attributeName="transform" type="translate" values="0 0;0 0;1.5 -1.5;0 0" keyTimes="0;0.7;0.85;1" dur="2.4s" begin="${num(i * 0.4)}s" repeatCount="indefinite"/></g>`
    return document({ w: 168, h: 60, label: `${c.label}: ${c.value}`, defs: gridDefs(ink, 50), body })
}

// --- Footer ----------------------------------------------------------------------------

function footer(ink, f) {
    const { W, x, y, w, s, pad, mobile } = f
    const P = { x, y, w, h: mobile ? 104 : 100 }
    const cx = x + w / 2
    const top = P.y
    const body = `${plate(ink, P, { s })}
  ${rail(ink, top + 18, P.x, P.x + P.w, { marker: 10, drawn: true })}
  ${mono(cx, top + 53, "[ RECORD END ]", { size: mobile ? 13 : 15, fill: ink.strong, tracking: mobile ? 5 : 7, anchor: "middle", bold: true, cls: "boot" })}
  ${mono(cx, top + 69, "GLORY TO MANKIND", { size: mobile ? 7.5 : 8.5, fill: ink.muted, tracking: 4, anchor: "middle" })}
  <rect x="${cx - 5}" y="${top + 76}" width="10" height="3" fill="${ink.strong}" class="blink"/>
  ${mono(x + pad, top + P.h - 10, "POD 042", { size: mobile ? 7 : 8, fill: ink.muted, tracking: 3 })}
  ${mono(x + w - pad, top + P.h - 10, "SIGNING OFF", { size: mobile ? 7 : 8, fill: ink.muted, tracking: 3, anchor: "end" })}`
    return document({ w: W, h: P.y + P.h + s + (mobile ? 5 : 9), label: "Record end. Glory to mankind. Pod 042, signing off.", defs: gridDefs(ink), body })
}

// --- Output ----------------------------------------------------------------------------

const out = join(root, "assets/svg")
const live = join(root, "live")
mkdirSync(out, { recursive: true })
mkdirSync(live, { recursive: true })
const alts = {}
let files = 0
let bytes = 0

function emit(name, svg, dir = out) {
    writeFileSync(join(dir, `${name}.svg`), svg)
    files++
    bytes += Buffer.byteLength(svg)
    return svg.match(/aria-label="([^"]*)"/)[1]
}

// Four files for a full-width card
function wide(name, draw, dir) {
    for (const theme of ["light", "dark"]) {
        for (const mobile of [false, true]) {
            alts[name] = emit(`${name}-${theme}${mobile ? "-mobile" : ""}`, draw(palettes[theme], frame(mobile)), dir)
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
profile.missions.forEach((m, i) => small(`mission-${m.slug}`, (ink) => mission(ink, m, i)))
small("cta-missions", cta)
wide("loadout", loadout)
wide("signal", signal, live)
wide("training", training)
profile.comms.forEach((c, i) => small(`comm-${c.slug}`, (ink) => comm(ink, c, i)))
wide("footer", footer)

// --- README ----------------------------------------------------------------------------

// Where the nightly workflow publishes the cards written to live/
const OUTPUT = `https://raw.githubusercontent.com/${profile.unit}/${profile.unit}/output`

const src = (name, base = "assets/svg") => `${base}/${name}.svg`
const link = (href, inner) => (href ? `<a href="${href}">${inner}</a>` : inner)

// `base` and `alt` are for cards redrawn outside this run: their image lives
// on another branch and their alt text must not go stale with the numbers
const wideTag = (name, href, { base, alt = alts[name] } = {}) =>
    link(href, `<picture><source media="(prefers-color-scheme: dark) and (min-width: 1012px)" srcset="${src(`${name}-dark`, base)}" /><source media="(prefers-color-scheme: light) and (min-width: 1012px)" srcset="${src(`${name}-light`, base)}" /><source media="(prefers-color-scheme: dark)" srcset="${src(`${name}-dark-mobile`, base)}" /><img src="${src(`${name}-light-mobile`, base)}" width="100%" alt="${alt}" /></picture>`)

const smallTag = (name, width, href) =>
    link(href, `<picture><source media="(prefers-color-scheme: dark)" srcset="${src(`${name}-dark`)}" /><img src="${src(`${name}-light`)}" width="${width}" alt="${alts[name]}" /></picture>`)

const head = (slug) => wideTag(`header-${slug}`)

// The live card is drawn by the portfolio site, which serves a 400px record
// for ?view=mobile; like the local cards, narrow screens get that one.
const liveCard = `${profile.site}/api/readme/contact`

const readme = `<!-- ════════════════════════════════════════════════════════════
     UNIT RECORD : ${profile.unit}
     FORMAT      : NieR graph-paper UI
     Drawn by scripts/render.mjs from scripts/data/profile.mjs.
     Edit the data or the script, then run: node scripts/render.mjs
     ════════════════════════════════════════════════════════════ -->

${wideTag("hero", profile.site)}

<p align="center">
  <a href="${profile.site}/contact">
    <picture>
      <source media="(prefers-color-scheme: dark) and (min-width: 1012px)" srcset="${liveCard}?theme=dark" />
      <source media="(prefers-color-scheme: light) and (min-width: 1012px)" srcset="${liveCard}" />
      <source media="(prefers-color-scheme: dark)" srcset="${liveCard}?theme=dark&amp;view=mobile" />
      <img src="${liveCard}?view=mobile" alt="Unit record: Operator 210 reporting the latest transmission from ${profile.unit}" width="100%" />
    </picture>
  </a>
</p>

${wideTag("about")}

${wideTag("stats")}

${head("service")}

${wideTag("experience")}

${head("missions")}

<p align="center">
${profile.missions.map((m) => smallTag(`mission-${m.slug}`, 392, m.href)).join("\n")}
</p>

<p align="center">
${smallTag("cta-missions", 302, `${profile.site}/work`)}
</p>

${head("loadout")}

${wideTag("loadout")}

${head("signal")}

${wideTag("signal", `https://github.com/${profile.unit}`, { base: OUTPUT, alt: "Signal log: a year of GitHub activity drawn as a river with one current per repository, redrawn every night" })}

${head("training")}

${wideTag("training")}

${head("comms")}

<p align="center">
${profile.comms.map((c) => smallTag(`comm-${c.slug}`, 168, esc(c.href))).join("\n")}
</p>

${wideTag("footer")}

<!-- [E]ject data? ... negative. Thanks for reading. -->
`

writeFileSync(join(root, "README.md"), readme)
console.log(`${files} cards, ${(bytes / 1024).toFixed(0)} KB → assets/svg and live; README.md rewritten`)
