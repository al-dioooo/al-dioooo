// Geometry for the signal log river: a year of activity as a streamgraph.
// Time runs left to right, every current is a repository, and its width is
// how much was committed there that week. The idea is nagare's
// (github.com/monex00/nagare, MIT); the code and the drawing are this repo's.
//
// Nothing here knows about SVG styling: it turns the activity snapshot into
// currents (centre line and width per week, in pixels) and path data.

const r1 = (n) => Number(n.toFixed(1))

// --- Series ---------------------------------------------------------------------------

// Sums [date, count] pairs into the snapshot's calendar weeks
function weekly(days, weekOf, length) {
    const series = new Array(length).fill(0)
    for (const [date, count] of days) {
        const i = weekOf.get(date)
        if (i !== undefined) series[i] += count
    }
    return series
}

// Gaussian blur over neighbouring weeks, renormalised at both ends so the
// river does not thin out just because the year starts or stops there
function smooth(series, sigma) {
    const radius = Math.ceil(sigma * 3)
    return series.map((_, i) => {
        let sum = 0
        let weight = 0
        for (let d = -radius; d <= radius; d++) {
            const j = i + d
            if (j < 0 || j >= series.length) continue
            const g = Math.exp(-(d * d) / (2 * sigma * sigma))
            sum += series[j] * g
            weight += g
        }
        return sum / weight
    })
}

const total = (series) => series.reduce((a, b) => a + b, 0)
const lastActive = (series) => series.findLastIndex((v) => v > 0)

// The currents to draw: the busiest public repositories by name, the rest of
// the public ones as one current, and whatever the calendar counts beyond
// public commits (private work, pull requests, reviews) as the outermost.
export function currents(snapshot, { top = 8, hide = [], sigma = 1.5, power = 0.42 } = {}) {
    const weeks = snapshot.weeks
    const weekOf = new Map(weeks.flatMap((week, i) => week.map(([date]) => [date, i])))
    const calendar = weeks.map((week) => week.reduce((n, [, count]) => n + count, 0))

    const repos = snapshot.repos.map((repo) => ({ ...repo, series: weekly(repo.days, weekOf, weeks.length) }))
    const named = repos.filter((repo) => !hide.includes(repo.name)).slice(0, top)
    const rest = repos.filter((repo) => !named.includes(repo))
    const publicWeekly = calendar.map((_, i) => repos.reduce((n, repo) => n + repo.series[i], 0))
    const beyond = calendar.map((count, i) => Math.max(0, count - publicWeekly[i]))

    const list = named.map((repo) => ({ kind: "repo", label: repo.name.split("/")[1], full: repo.name, raw: repo.series }))
    if (rest.length) {
        list.push({ kind: "rest", label: `+${rest.length} repositories`, raw: calendar.map((_, i) => rest.reduce((n, repo) => n + repo.series[i], 0)) })
    }
    if (total(beyond) > 0) {
        list.push({ kind: "beyond", label: (snapshot.private ?? 0) * 2 >= total(beyond) ? "private work" : "other activity", raw: beyond })
    }

    return list.map((current) => {
        const sum = total(current.raw)
        return {
            ...current,
            count: sum,
            last: lastActive(current.raw),
            // Where in the year the work sits, for the stacking order
            centroid: current.raw.reduce((n, v, i) => n + v * i, 0) / sum,
            // Compressed (a little past a square root) so light projects stay
            // readable beside heavy ones
            amp: smooth(current.raw, sigma).map((v) => v ** power)
        }
    })
}

// --- Layout ---------------------------------------------------------------------------

// Earliest work in the middle, later work outside, the anonymous current last
function stackOrder(list) {
    const order = []
    list.filter((c) => c.kind !== "beyond")
        .sort((a, b) => a.centroid - b.centroid)
        .forEach((current, i) => (i % 2 ? order.unshift(current) : order.push(current)))
    return [...order, ...list.filter((c) => c.kind === "beyond")]
}

// Places the currents in a box. The time axis widens toward today (`warp` 0
// is linear), so recent months get more room. Returns the week x positions
// and, per current, its centre line `c` and width `w` in pixels.
export function layout(list, { x0, x1, cy, height, gap = 4, warp = 0.4 }) {
    const n = list[0].amp.length
    const xs = Array.from({ length: n }, (_, i) => {
        const t = i / (n - 1)
        return x0 + (x1 - x0) * ((1 - warp) * t + warp * t * t)
    })
    const order = stackOrder(list)
    const busiest = Math.max(...xs.map((_, i) => order.reduce((sum, c) => sum + c.amp[i], 0)))
    const scale = (height - gap * (order.length - 1)) / busiest

    const placed = order.map((current) => ({ ...current, c: [], w: [] }))
    for (let i = 0; i < n; i++) {
        const widths = placed.map((current) => current.amp[i] * scale)
        // A current that has run dry takes its gap with it
        const gaps = widths.map((w) => gap * Math.min(1, w / 2.5))
        let top = cy - (total(widths) + total(gaps)) / 2
        placed.forEach((current, k) => {
            current.c.push(top + gaps[k] / 2 + widths[k] / 2)
            current.w.push(widths[k])
            top += widths[k] + gaps[k]
        })
    }
    return { xs, currents: placed }
}
