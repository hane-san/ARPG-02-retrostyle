# TIDAL ATLAS / 潮環群島 × 星風回廊

This is the **independent exploration game** in `hane-san/ARPG-02-retrostyle` (renamed from `hane-san/fantasy-adventure-test` on 2026-10-19).
It is **not** SRPG (`hane-san/SRPG`) or ARPG (`hane-san/ARPG`).
The current canonical product is the live 2D browser prototype in this repository.
The display title, repository name, public Pages path and localStorage key are different identifiers. Do **not** rename any of them as a side effect of unrelated work.

Entry documents: [DEVELOPMENT](docs/DEVELOPMENT.md), [DESIGN](docs/DESIGN.md), [DECISIONS](docs/DECISIONS.md), [ROADMAP](docs/ROADMAP.md), [QA](docs/QA.md).
Claude Code reads this contract from `CLAUDE.md`. Use checked-in documents, current code, Issues and Git history as source of truth—not private AI chat memory.

## Shared development contract (same policy as SRPG / ARPG)

1. The human producer approves product specifications, judges playtest acceptance and controls merging into main. Do not invent unapproved decisions or quietly turn a brainstorm into a requirement.
2. Start with an Issue: scope, verified acceptance criteria, non-goals, invariants, risk, tests, approved design references. Read active PRs and coordinate overlapping files.
3. Implement from latest `origin/main` on an isolated `type/issue-topic` branch; submit PR. **Never directly push to main, force-push or enable auto-merge.**
4. Test the exact commit under review. Record failures/unknowns and evidence in the PR. The `rules` and `browser` Actions jobs are the machine checks; PASS/WARN/BLOCK are human-readable audit outcomes, not checks.
5. For low risk (docs/copy), CI and human review may suffice; medium risk (UI, audio, terrain patch, camera, interactions) requires review by an independent implementer/session; high risk (pathfinding topology, cross-world transition/save contract, world-data core) requires a written technical plan and deeper independent audit. Self-review is not independent audit.
6. Human iPhone/Safari playtest and human PR approval precede main integration. A Chromium emulation is not a physical iPhone test.
7. Confirm Actions and GitHub Pages after merge. Preserve the existing URL unless a separately approved rename occurs. Never include access tokens, local secrets or private messages in commits.
8. When independent audit or device testing is unavailable, mark it explicitly as **unverified**; do not claim approval or secretly merge.

## Game invariants

- Two distinct connected worlds: `world.js` is the 164×120 pastel archipelago (4 districts), and `silk-world.js` is the fictional 430×270 Starwind continent (9 atmosphere regions). **The game is fictional** and takes only landscape inspiration from Central Asia.
- Starting archipelago tile `START` is (41,40), with a nearby portal at (45,40) on Starwind footbridge, and a distant second portal at (160,38). Both reach the same continent spawn (28,146); the return passage on the continent also works.
- Seamless keyboard and tap-to-path travel uses legal orthogonal steps, building collision and non-traversable water. Paths must not cross water or structures; all 24 facilities and 25 NPCs remain accessible.
- The Issyk-Kul-inspired huge lake is a traversable-shore / non-traversable-water landscape. Do not shrink it into a whole-screen decoration.
- Camera is static-first: manual drag eases to a bounded target, edge-follow is gentle, the explorer remains visible, map bounds hold, and zoom is disabled while a route is active. Mobile controls and tap-anywhere conversation must work.
- The complete 68-piece original music library and per-zone selection survive; player BGM and SFX preferences persist independently. BGM defaults OFF, SFX ON; audio must never block movement. Avoid abrupt gain discontinuities, timer starvation and click/pop regressions.
- Maintain independent storage namespace `tidal-atlas:`; no accidental shared data with SRPG or ARPG. A rename of repo/display name must not silently change persistent keys.
- No combat, quests, savegame, monetization or inherited SRPG 4-phase rules. Those are not implemented and must not be presented as features.
- Avoid runtime dependencies/CDNs and audio downloads. Support GitHub Pages at a repository-relative path without breaking links. All assets are original or expressly ported and remain independently checked into this repo.
- New art, landscapes, scoring, story and mechanics require human product approval, even when another project has similar components.

## Working commands and files

`npm run check` verifies JavaScript parsing and 28+ deterministic tests on Node 22+.
`npm run dev` runs a local static server at http://127.0.0.1:4173.
`npm run test:browser` checks Chromium interactions (after temporary local Playwright install).
`game.js` owns input, world switching, Canvas and camera integration. `world.js` and `silk-world.js` own data and pathfinding. `camera-limits.js` owns camera bounds. `music.js`, `zone-music.js`, `audio.js` and `silk-music.js` own audio. `silk-art.js`, `scenic-biomes.js`, `sprite-srpg.js` own visuals. `dialogue-data.js` and `silk-dialogue.js` own conversation. See DESIGN for detailed map.

No mandatory release rebuild or generated `dist/`; Pages serves the repository root as static ES modules. Do not copy ARPG build rules or SRPG turn-phase invariants into this game.

## Release / handoff

Record Issue, PR, verified commit SHA, exact executed tests, risk/audit outcome, untested behavior, live Pages result, and required iPhone steps. Main merge and repository Settings remain human controlled. The repository was renamed to **ARPG-02-retrostyle** on 2026-10-19 (Issue #3); use the current repository name and the Pages URL `https://hane-san.github.io/ARPG-02-retrostyle/`. Do not rename the display title or the `tidal-atlas:` storage namespace. Validate Pages, links, Actions and AI integrations after renaming; branch protection is still a separate GitHub Settings task.
