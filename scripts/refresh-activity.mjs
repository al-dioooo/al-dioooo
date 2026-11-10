// Refreshes scripts/data/contributions.json, the snapshot behind the signal log
// card, from the signed-in GitHub CLI account. Run it, then redraw the cards:
//   node scripts/refresh-activity.mjs && node scripts/render.mjs
//
// The calendar is the same one github.com/<user> shows, which counts private
// contributions when the profile is set to include them.

import { execFileSync } from "node:child_process"
import { writeFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const query = `query { viewer { login contributionsCollection { contributionCalendar {
  totalContributions weeks { contributionDays { date contributionCount } } } } } }`

const { data } = JSON.parse(execFileSync("gh", ["api", "graphql", "-f", `query=${query}`], { encoding: "utf8" }))
const calendar = data.viewer.contributionsCollection.contributionCalendar
const weeks = calendar.weeks.map((week) => week.contributionDays.map((day) => [day.date, day.contributionCount]))

const snapshot = { user: data.viewer.login, fetched: weeks.at(-1).at(-1)[0], total: calendar.totalContributions, weeks }
const file = join(dirname(fileURLToPath(import.meta.url)), "data/contributions.json")
writeFileSync(file, JSON.stringify(snapshot))
console.log(`${snapshot.user}: ${snapshot.total} contributions up to ${snapshot.fetched}`)
