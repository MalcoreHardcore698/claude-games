# ORION — recovered project

This package is reconstructed from the latest accessible `orion-update-v3.zip` plus eight illustrations generated later in the separate ChatGPT Work conversation on 2026-11-05. Work's unfinished, unsaved workspace was not accessible, so this is a **reconstruction** of the requested interface changes, not an exact dump of the interrupted workspace.

## Project contents
- `index.html` — ORION game portal and Tamada screen.
- `guess-who.html`, `quiz.html`, `runes.html`, `escape-from-commissariat.html` — game entry points.
- `tamada.js`, `tamada-core.js`, `tamada.css` — lobby choice flow, wheel sector voting, and responsive layout.
- `runes-menu.css`, `orion-carousel.js`, `orion-loader.js`, `screen-guard.js` — shared game mechanics and menu support.
- `assets/*.webp` — eight optimized generated illustrations, wired to relevant cards/menus.
- `assets/original-illustrations/*.png` — the exact original generated source images for editing.
- `tests/*.test.cjs` — 31 tests, run with `node --test tests/*.test.cjs`.

## Reconstructed changes
- Tamada: click the wheel sectors to give votes, Shift-click or right-click to remove votes; sector-shape animation when vote weights change; compact settings column to the right, responsive for 1024×600 and 1280×720.
- Runes: themed images for three campaigns and three modes, Arabic numbers on smaller socket-position badges with additional insets.
- Guess the Hero / Quiz Night: menu artwork stretched to a full-bleed stage, with no separate illustration frame.
- Escape from SVO: its new illustration appears on portal cards only, not on the game's opening page.

## Verification
- 31 Node.js tests passed.
- Inline scripts in all HTML pages passed `node --check`.
- Eight new WEBP assets verified as readable images.
- Browser-level screenshot verification was unavailable in the recovery environment, so check the final layout visually in the target desktop browser.
