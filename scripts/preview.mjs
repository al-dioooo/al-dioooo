// Writes output/readme-preview/v2.html: README.md inside a GitHub-sized column,
// with ?theme=dark and ?view=mobile switches that pick the matching <picture>
// source by hand (a local file ignores the colour-scheme emulation).
// Run: node scripts/preview.mjs

import { mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const root = join(dirname(fileURLToPath(import.meta.url)), "..")
// Cards the README reads from the output branch are shown from live/, where
// scripts/render.mjs just wrote them
const readme = readFileSync(join(root, "README.md"), "utf8").replace(/https:\/\/raw\.githubusercontent\.com\/[^/"]+\/[^/"]+\/output\//g, "live/")
const dir = join(root, "output/readme-preview")
mkdirSync(dir, { recursive: true })

writeFileSync(join(dir, "v2.html"), `<!doctype html>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>README preview</title>
<base href="../../">
<style>
  body { margin: 0; font: 14px/1.5 -apple-system, "Segoe UI", sans-serif; background: #fff; color: #1f2328; }
  body.dark { background: #0d1117; color: #f0f6fc; }
  nav { padding: 10px 16px; font: 12px ui-monospace, monospace; border-bottom: 1px solid #8884; }
  nav a { color: inherit; margin-right: 14px; }
  main { box-sizing: border-box; width: 894px; max-width: 100%; margin: 24px auto; padding: 24px; border: 1px solid #8884; border-radius: 6px; }
  body.mobile main { width: 375px; padding: 16px; margin: 0; border: 0; }
  main img { max-width: 100%; height: auto; vertical-align: middle; }
  main p, main picture { margin: 0 0 16px; }
  main > picture, main > a { display: block; margin-bottom: 16px; }
</style>
<nav><a href="?">light</a><a href="?theme=dark">dark</a><a href="?view=mobile">mobile light</a><a href="?theme=dark&view=mobile">mobile dark</a></nav>
<main>
${readme}
</main>
<script>
  const q = new URLSearchParams(location.search)
  const dark = q.get("theme") === "dark"
  const mobile = q.get("view") === "mobile"
  document.body.classList.toggle("dark", dark)
  document.body.classList.toggle("mobile", mobile)
  const matches = (media) => media.split(" and ").every((part) =>
    part.includes("prefers-color-scheme") ? part.includes(dark ? "dark" : "light") : part.includes("min-width") ? !mobile : true)
  for (const picture of document.querySelectorAll("picture")) {
    const img = picture.querySelector("img")
    const source = [...picture.querySelectorAll("source")].find((s) => matches(s.media))
    if (source) img.src = source.getAttribute("srcset")
    picture.querySelectorAll("source").forEach((s) => s.remove())
  }
</script>
`)
console.log("output/readme-preview/v2.html")
