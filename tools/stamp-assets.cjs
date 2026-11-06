#!/usr/bin/env node
/* Cache busting: adds ?v=<stamp> to every local .css/.js referenced from the site's HTML pages,
   so browsers and GitHub Pages fetch fresh files after each release.
   Usage: node tools/stamp-assets.cjs [stamp]   (default stamp: current date and time) */
const fs = require('node:fs'), path = require('node:path');
const root = path.join(__dirname, '..');
const now = new Date(), pad = n => String(n).padStart(2, '0');
const stamp = process.argv[2] || `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}${pad(now.getHours())}${pad(now.getMinutes())}`;
const pattern = /\b(href|src)="((?!https?:|\/\/|data:)[^"?#]+\.(?:css|js))(?:\?v=[^"]*)?"/g;
let files = 0, refs = 0;
for (const name of fs.readdirSync(root).filter(f => f.endsWith('.html'))) {
  const file = path.join(root, name), before = fs.readFileSync(file, 'utf8');
  const after = before.replace(pattern, (_, attr, url) => { refs++; return `${attr}="${url}?v=${stamp}"`; });
  if (after !== before) { fs.writeFileSync(file, after); files++; }
}
console.log(`stamped ${refs} references in ${files} pages with v=${stamp}`);
