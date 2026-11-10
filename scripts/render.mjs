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
    const active = days.filter(([, c]) => c > 0)
    const sorted = active.map(([, c]) => c).sort((a, b) => a - b)
    const q = (p) => sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * p))]
    return { total: ACTIVITY.total, best, active: active.length, cuts: [q(0.25), q(0.5), q(0.75)] }
}

function signal(ink, f) {
    const { W, x, y, w, s, pad, mobile } = f
    const st = activityStats()
    const L = x + pad
    const R = x + w - pad
    const weeks = ACTIVITY.weeks
    const pitch = (R - L) / weeks.length
    const cell = pitch - (mobile ? 1 : 2)
    const statY = mobile ? 72 : 98
    const gridY = mobile ? 112 : 150
    const level = (c) => (c === 0 ? 0 : c <= st.cuts[0] ? 1 : c <= st.cuts[1] ? 2 : c <= st.cuts[2] ? 3 : 4)
    const tone = [0.08, 0.3, 0.52, 0.76, 1]
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

    const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"]
    let months = ""
    let lastMonth = -1
    let lastLabelAt = -99
    const today = weeks.at(-1).at(-1)[0]
    const columns = weeks.map((week, c) => {
        const month = Number(week[0][0].slice(5, 7)) - 1
        if (month !== lastMonth && c - lastLabelAt >= (mobile ? 7 : 3) && c < weeks.length - 2) {
            months += mono(L + c * pitch, gridY - (mobile ? 5 : 7), MONTHS[month], { size: mobile ? 6.5 : 7.5, fill: ink.muted, tracking: 0.8 })
            lastLabelAt = c
        }
        lastMonth = month
        const cells = week.map(([date, count]) => {
            const d = new Date(`${date}T00:00:00Z`).getUTCDay()
            const mark = date === today ? ` stroke="${ink.red}" stroke-width="${mobile ? 1 : 1.5}" class="pulse"` : ""
            return `<rect x="${num(L + c * pitch)}" y="${num(gridY + d * pitch)}" width="${num(cell)}" height="${num(cell)}" fill="${ink.strong}" fill-opacity="${tone[level(count)]}"${mark}/>`
        }).join("")
        return `<g class="fade" style="${delay(0.3 + c * 0.022)}">${cells}</g>`
    }).join("\n  ")

    const gridH = pitch * 7
    const legendY = gridY + gridH + (mobile ? 16 : 20)
    const lc = mobile ? 7 : 10
    const legendW = 5 * (lc + 2) + monoWidth("MORE", 7.5, 0.8) + 8
    const lx = R - legendW
    const legend = `${mono(lx - 8, legendY, "LESS", { size: 7.5, fill: ink.muted, tracking: 0.8, anchor: "end" })}
  ${tone.map((o, i) => `<rect x="${num(lx + i * (lc + 2))}" y="${num(legendY - lc + 1)}" width="${lc}" height="${lc}" fill="${ink.strong}" fill-opacity="${o}"/>`).join("")}
  ${mono(R, legendY, "MORE", { size: 7.5, fill: ink.muted, tracking: 0.8, anchor: "end" })}
  ${mono(L, legendY, mobile ? "GITHUB.COM/AL-DIOOOO" : "GITHUB.COM/AL-DIOOOO · ONE SQUARE, ONE DAY", { size: 7.5, fill: ink.muted, tracking: 0.8 })}`

    const P = { x, y, w, h: legendY + (mobile ? 12 : 16) - y }
    // A reader head that crosses the grid once per cycle
    const head = `<rect x="${L}" y="${num(gridY - 3)}" width="${mobile ? 1.5 : 2}" height="${num(gridH + 4)}" fill="${ink.red}" opacity="0">
    <animate attributeName="opacity" values="0;.9;.9;0;0" keyTimes="0;0.03;0.55;0.6;1" dur="7s" begin="2s" repeatCount="indefinite"/>
    <animate attributeName="x" values="${L};${num(R)};${num(R)}" keyTimes="0;0.6;1" dur="7s" begin="2s" repeatCount="indefinite"/>
  </rect>`

    const body = `${plate(ink, P, { s })}
  ${cardHead(ink, f, mobile ? "TRANSMISSION LOG — 12 MONTHS" : "TRANSMISSION LOG — LAST 12 MONTHS", `SNAPSHOT ${ACTIVITY.fetched}`)}
  ${factsSvg}
  ${months}
  ${columns}
  ${head}
  ${legend}`

    return document({
        w: W, h: P.y + P.h + s + (mobile ? 5 : 9), fonts: ["acorn"],
        label: `Signal log, snapshot ${ACTIVITY.fetched}: ${fmt(st.total)} contributions in the last 12 months, ${st.active} active days, longest streak ${st.best} days`,
        defs: gridDefs(ink), body
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
profile.missions.forEach((m, i) => small(`mission-${m.slug}`, (ink) => mission(ink, m, i)))
small("cta-missions", cta)
wide("loadout", loadout)
wide("signal", signal)
wide("training", training)

console.log(`${files} cards, ${(bytes / 1024).toFixed(0)} KB → assets/svg`)
