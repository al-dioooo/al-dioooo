// Refreshes scripts/data/contributions.json, the snapshot behind the signal log
// card. Run it, then redraw the cards:
//   node scripts/refresh-activity.mjs && node scripts/render.mjs
//
// It reads the token from GITHUB_TOKEN or GH_TOKEN (the nightly workflow), or
// asks the GitHub CLI for one (a local run).
//
// The calendar is the one github.com/<login> shows, which counts private
// contributions when the profile is set to include them. Commits are also
// read per repository, but only public repositories are written down: private
// work stays an anonymous part of the calendar total, whichever token runs this.

import { execFileSync } from "node:child_process"
import { writeFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const LOGIN = process.argv[2] ?? "al-dioooo"
const DAY = 24 * 60 * 60 * 1000
// One node per active day and at most 100 per request, so the year is read in
// windows shorter than 100 days and no repository can overflow a page.
const WINDOW_DAYS = 73

const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN || execFileSync("gh", ["auth", "token"], { encoding: "utf8" }).trim()

async function graphql(query, variables) {
    const res = await fetch("https://api.github.com/graphql", {
        method: "POST",
        headers: { Authorization: `bearer ${token}`, "Content-Type": "application/json", "User-Agent": "profile-readme-cards" },
        body: JSON.stringify({ query, variables })
    })
    const body = await res.json()
    if (!res.ok || body.errors) throw new Error(`GitHub API: ${JSON.stringify(body.errors ?? body)}`)
    return body.data
}

const CALENDAR = `query($login: String!) { user(login: $login) { login contributionsCollection {
  restrictedContributionsCount
  contributionCalendar { totalContributions weeks { contributionDays { date contributionCount } } } } } }`

const COMMITS = `query($login: String!, $from: DateTime!, $to: DateTime!) { user(login: $login) {
  contributionsCollection(from: $from, to: $to) { commitContributionsByRepository(maxRepositories: 100) {
    repository { nameWithOwner isPrivate }
    contributions(first: 100) { nodes { occurredAt commitCount } } } } } }`

const { user } = await graphql(CALENDAR, { login: LOGIN })
const calendar = user.contributionsCollection.contributionCalendar
const weeks = calendar.weeks.map((week) => week.contributionDays.map((day) => [day.date, day.contributionCount]))

const repos = new Map()
const end = Date.now()
for (let from = end - 365 * DAY; from < end; from += WINDOW_DAYS * DAY) {
    const to = Math.min(from + WINDOW_DAYS * DAY, end)
    const data = await graphql(COMMITS, { login: LOGIN, from: new Date(from).toISOString(), to: new Date(to).toISOString() })
    for (const item of data.user.contributionsCollection.commitContributionsByRepository) {
        if (item.repository.isPrivate) continue
        const days = repos.get(item.repository.nameWithOwner) ?? {}
        for (const node of item.contributions.nodes) {
            const date = node.occurredAt.slice(0, 10)
            days[date] = (days[date] ?? 0) + node.commitCount
        }
        repos.set(item.repository.nameWithOwner, days)
    }
}

const snapshot = {
    user: user.login,
    fetched: weeks.at(-1).at(-1)[0],
    total: calendar.totalContributions,
    private: user.contributionsCollection.restrictedContributionsCount,
    weeks,
    // Public repositories only, busiest first; days are [date, commits]
    repos: [...repos]
        .map(([name, days]) => ({ name, commits: Object.values(days).reduce((a, b) => a + b, 0), days: Object.entries(days).sort() }))
        .sort((a, b) => b.commits - a.commits)
}

const file = join(dirname(fileURLToPath(import.meta.url)), "data/contributions.json")
writeFileSync(file, JSON.stringify(snapshot))
console.log(`${snapshot.user}: ${snapshot.total} contributions up to ${snapshot.fetched}, ${snapshot.repos.length} public repositories with commits`)
