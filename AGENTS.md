# TIDAL ATLAS / 潮環群島 × 星風回廊

## 1. This game and the other two

This is the **independent exploration game** in `hane-san/ARPG-02-retrostyle` (renamed from `hane-san/fantasy-adventure-test` on 2026-10-19, Issue #3). The other independent games are SRPG (`hane-san/SRPG-01-FEstyle`) and 3D ARPG (`hane-san/ARPG-01-SkyrimStyle`). Scope work to this repository; do not touch the others and do not reuse the SRPG combat rules or the ARPG 3D control contract.
The display title, repository name, Pages path (`https://hane-san.github.io/ARPG-02-retrostyle/`) and the `tidal-atlas:` storage namespace are different identifiers. Do **not** rename any of them as a side effect of unrelated work, and preserve the existing Pages URL unless a separately approved rename occurs.

Entry documents: [DEVELOPMENT](docs/DEVELOPMENT.md), [DESIGN](docs/DESIGN.md), [DECISIONS](docs/DECISIONS.md) (dated history, including the original text of sections moved out of this file on 2026-11-14), [ROADMAP](docs/ROADMAP.md), [QA](docs/QA.md). Claude Code reads this contract from `CLAUDE.md`. Use checked-in documents, current code, Issues and Git history as the source of truth—not private AI chat memory.

## 2. Current phase and development contract

### Autopilot phase (human instruction 2026-11-14)

This replaces the nonstop prototype phase of 2026-10-21 and the daily 15:00 afternoon run. Until the human declares a stabilization phase, this section overrides the merge wording elsewhere in this file, in `CLAUDE.md`, in `docs/DEVELOPMENT.md` and in the steward skill. How the parts work: [docs/AUTOPILOT.md](docs/AUTOPILOT.md).

- **Flow**: Issues from the owner account (filed from GPT/Claude chats or other AIs) are triaged automatically (labels only). `lane/auto` (low/medium risk) is implemented one at a time per repository by the Claude Code scheduled task 「自動操縦の見回り」 (twice a day, around 4:00 and 13:00 JST), which opens a ready PR containing `Closes #n` and arms auto-merge. `lane/claude` (high risk) is implemented when the human asks Claude Code directly. Every adopted PR merges through GitHub auto-merge.
- **Adopted work** = Issues and PRs created by the owner account (including GPT/Codex/Claude acting for the owner), unless the title starts with 「提案」, the body states that the change is 未採用/保留/マージ保留, or it carries a `hold`/`proposal` label. Proposals are never implemented on their own initiative.
- **Merge condition**: the required checks `rules`, `browser` and `gate` succeed on the head commit and the PR does not conflict with `main`. **GitHub's auto-merge feature is allowed** and is the normal way PRs merge (merge commit). No human approval, pre-merge audit or time window is required. A session may also merge a passing adopted PR itself with a normal merge commit.
- **Safety**: if `main` CI fails, the main guard opens a "main is red" Issue labelled `autopilot-stop`; while any `autopilot-stop` Issue is open the scheduled task implements nothing new and opens a revert PR instead. Closing the Issue resumes. Anything that must not merge gets `hold`.
- Human playtests, independent audit, physical iPhone and ear listening are batched to the evening play session. Record them as unverified; never call them done.
- Still prohibited: direct push to `main`, force-push or history rewrite, PR approvals, AI changes to repository Settings/Secrets/Variables/Rulesets, deleting or weakening tests, renaming the repository/display title/storage keys, touching other repositories, and changing `.github/workflows` except in a session the human starts to fix the autopilot wiring. Game invariants stay binding; a change that breaks them needs an explicit Issue from the human.
- **Large changes asked of Claude Code directly**: write a short technical design in the PR body first, then implement; leave merging to auto-merge and note the result in the 「自動操縦の日報」 Issue.
- **Supervision after merge** (when the human asks, and in the dawn patrol): audit merged PRs against the invariants, open a fix Issue or revert PR when needed, rescue `stuck` items and reconcile contradictory directions (the newest human statement wins). Procedure: `.claude/skills/steward/SKILL.md`.
- **Scenario and direction documents**: story/world direction lives in `docs/DIRECTION.md` (created by the first PR that needs it). Direction PRs may be docs-only; only the parts the human adopted are implemented. Unadopted brainstorms stay marked 「提案」.

### Rapid-prototype rules still in force (2026-10-19)

- Old pending review/device records are not a prerequisite for new development. The `main` Ruleset is now set by the human for the autopilot phase (required checks `rules`, `browser`, `gate`).
- Related small improvements may share an Issue and PR. Copy the adopted Chat request into a short scope/acceptance summary and continue without repeatedly asking for the same approval. PRs can be concise: purpose, changes, checks and remaining items.
- Low-risk and reversible medium-risk changes may batch independent review and iPhone playtests at a playable milestone. Record what was deferred. High-risk pathfinding, cross-world or storage-contract changes keep a targeted design and review.

### Shared development contract (same policy as SRPG / ARPG)

1. The human producer approves product specifications and judges playtest acceptance. Do not invent unapproved decisions or quietly turn a brainstorm into a requirement. New art, landscapes, scoring, story and mechanics require human product approval, even when another project has similar components.
2. Start with an Issue: scope, verified acceptance criteria, non-goals, invariants, risk, tests, approved design references. Read active PRs and coordinate overlapping files.
3. Implement from latest `origin/main` on an isolated `type/issue-topic` branch; submit a PR.
4. Test the exact commit under review. Record failures/unknowns and evidence in the PR. The `rules` and `browser` Actions jobs are the machine checks; PASS/WARN/BLOCK are human-readable audit outcomes, not checks.
5. Risk levels: low (docs/copy) — CI and human review may suffice; medium (UI, audio, terrain patch, camera, interactions) — review by an independent implementer/session; high (pathfinding topology, cross-world transition/save contract, world-data core) — a written technical plan and deeper independent audit. Self-review is not independent audit. The batching rule above applies during early development.
6. iPhone/Safari playtest is batched for ordinary prototype changes and required before release acceptance during stabilization. A Chromium emulation is not a physical iPhone test.
7. Confirm Actions and GitHub Pages after merge. Repository Settings remain human controlled. Never include access tokens, local secrets or private messages in commits.
8. When independent audit, device testing or ear listening is unavailable, mark it explicitly as **unverified**; do not claim approval or secretly merge.

## 3. Game invariants (current values)

### Entrances and modes

- `./` opens the **100-board screen-switching atlas** at the central hub after preparing the connected pilgrimage underneath (producer chat 2026-11-12). Help switches between the atlas and the connected world.
- `./?walk=1` and `?journey=1` open the connected pilgrimage directly; so do `?atlas=previous` (previous atlas data, for comparison/regression), `?maze=turns` (opt-in maze trial) and `?camera=*`.
- `./?mode=classic` (alias `?journey=0`) keeps both complete older worlds. `./?prototype=1` selects Small Journey: an 80×110 crop at original coordinates, two districts, four sites/four NPCs, no mainland transitions, keeping the original pathfinder's 164-wide indexing, crop bounds and removed-building collision cleanup. The mini mode never becomes the default. Details: [PROTOTYPE](docs/PROTOTYPE.md), [JOURNEY](docs/JOURNEY.md).

### Older worlds (classic)

- `world.js` is the 164×120 pastel archipelago (4 districts); `silk-world.js` is the fictional 430×270 Starwind continent (9 atmosphere regions). **The game is fictional** and takes only landscape inspiration from Central Asia.
- `START` is (41,40); the nearby portal at (45,40) on Starwind footbridge and the distant portal at (160,38) both reach the continent spawn (28,146); the return passage works.
- Seamless keyboard and tap-to-path travel uses legal orthogonal steps, building collision and non-traversable water; paths never cross water or structures; all 24 facilities and 25 NPCs stay reachable.
- The Issyk-Kul-inspired huge lake is a traversable-shore / non-traversable-water landscape, never a whole-screen decoration.

### Connected pilgrimage (`?walk=1`)

- The authored pilgrimage loop in `pilgrimage-world.js` (plan: [PILGRIMAGE-LOOP](docs/PILGRIMAGE-LOOP.md)) is **480×832** with 33 regions, 87 sites (one is the trial utility) and 32 NPCs, including twelve western studies ([WESTERN-SKY-STUDIES](docs/WESTERN-SKY-STUDIES.md)) and four southeast countries ([LIVING-LANDSCAPES](docs/LIVING-LANDSCAPES.md)). Field/map walking speeds stay 5.7/7.35.
- Real water, solid feet and stair/bridge floors are the collision source. Full-floor connectivity and object-clearance tests are mandatory; regional terrain and detail are read from physical floor/wall/bridge/water data with bounded chunks and visible-range objects.
- Eight world sky openings (seven west plus the cloud ridge) use immutable geometry, layered light/clouds and blocked transparent sky cells. Western terrain chunks keep alpha in sky openings; never paint opaque black over them. Cliff time advances only inside its real world rectangle, accumulated per session. See [SKY-AND-TRIAL-TRAVEL](docs/SKY-AND-TRIAL-TRAVEL.md).
- The trial waystone at (25,104), entrance (26,107), is the only exception to seamless walking: a session-local random bag of 19 curated lands, a repeat jump, and return via Help. It is not lore, a quest or saved progress; it is not exposed in older modes and does not inflate discovery counts. The camera/music arrival APIs are only for these explicit jumps, and walking regressions must never use the tool to bypass routes.

### Camera

- Static-first in every mode: manual drag eases to a bounded target, follow is gentle, the explorer stays visible, map bounds hold, and **manual zoom is disabled in all modes** (Issue #30).
- Connected pilgrimage scales: ordinary outdoor terrain, towns, outdoor ruins and architecture **0.8** from the first frame; authored wide/plain vantages **0.6**; cliff/cloud ridge **0.46**; capital/citadel **0.38**; Reduced Motion **0.6**; all with spatial/temporal hysteresis and regional entry/exit dwell rather than zooming around single objects. Real interiors may use **1.35** when implemented (there are none now); outdoor structures and monoliths never trigger a close zoom.
- The connected pilgrimage's default follower is the improved **composed follower** (Issue #108), also used by `?camera=deadzone`. `?camera=directional` keeps the #96/#101 comparison (direction-sensitive viewport-relative lead grown through a five-tile smoothstep, bounded catch-up scaled with pace). In every follower, a manually panned view is held until the traveller catches its forward side, and short taps do not recenter.
- Old atlas/maze/classic/prototype framing, regional scales and speeds are unchanged.

### Screen-switching atlas (default `./`)

- 100 boards (10×10), each a 15×15 grid with a common isotropic viewport fit and 560 ms transitions. It starts at the central (4,5) watershed-wheel. The original 33 boards (21 ported regions) remain alongside 67 authored boards and 11 original sky compositions; all ten northern boards have authored sky bearings. Ledgers: [FIXED-SCREEN-BRANCHES](docs/FIXED-SCREEN-BRANCHES.md), [FIXED-GRAND-JOURNEY](docs/FIXED-GRAND-JOURNEY.md), [FIXED-HUNDRED-ATLAS](docs/FIXED-HUNDRED-ATLAS.md), [FIXED-CONNECTED-GEOGRAPHY](docs/FIXED-CONNECTED-GEOGRAPHY.md), [FIXED-DEFAULT-AREAS](docs/FIXED-DEFAULT-AREAS.md).
- Real tap/path walking with source-correct collision (original solids and renderers at the same scale). Shared offset and split bands form the seams of the new terrain; every lane, physical fault, water and solid foot is preserved, and the diagonal fault is walked around its upper tip, never bridged by connectivity repair. Water, ditches, faults and solids are never used as rescue floor.
- The original world is kept in memory: returning from the atlas restores its safe occupied cell, held camera and previous track, discarding stale routes and input.
- Portrait-first layering: objects in front, walkable ground, natural surroundings filling non-walkable cells, neighbouring boards, then a layered regional panorama in front of the sky.
- The closed court keeps its quiet state.
- 88 boards carry seeded, physically honest playful landforms that are rejected whenever any lane, doorstep or person would be cut off. No items, quests, scores or saved progress.

### Music and audio

- All **110** original pieces survive with their IDs and exact score/event hashes (the first 68 are the classic library). The sound room lists all 110.
- Atlas music follows **20 contiguous areas** (`fixed-areas.js`): one piece continues across an area and changes only at area edges; each area's 4–7 piece playlist moves on after two loops and at least 150 s of actual listening; all 110 pieces are placed in the field. Music continues uninterrupted within a region/area across board transitions.
- The four energetic pieces 53:1–54:2 are the primary cues of mountain/canyon/mesa/grass only; earlier pieces remain available.
- BGM defaults OFF, SFX ON; player BGM/SFX preferences and volumes persist independently. Audio never blocks movement. Avoid abrupt gain discontinuities, timer starvation and click/pop regressions; keep continuous release/crossfade.

### Product boundaries

- Independent storage namespace `tidal-atlas:`; no shared data with SRPG or ARPG; renames never silently change persistent keys.
- The optional world studies and vistas give story inspiration without deciding the open mythology ([WORLD-STUDIES](docs/WORLD-STUDIES.md)); do not add mythology answers without approval.
- No combat, quests, savegame, monetization or inherited SRPG 4-phase rules; never present them as features.
- No runtime dependencies/CDNs or audio downloads. Support GitHub Pages at a repository-relative path. All assets are original or expressly ported and checked into this repo.

## 4. Commands and file map

- `npm run check` verifies JavaScript parsing and deterministic tests on Node 22+.
- `npm run dev` serves http://127.0.0.1:4173. `npm run test:browser` runs all Chromium checks (after a temporary local Playwright install); CI shards them into `BROWSER_GROUP=core|landscapes|journey|fixed|atlas`, and the `browser` aggregate succeeds only when every group does.
- No release build or generated `dist/`; Pages serves the repository root as static ES modules. Do not copy ARPG build rules or SRPG turn-phase invariants into this game.
- Tests never add public debug APIs to the product or move the traveller directly; browser checks walk with real input, and original walking regressions are never replaced by warps.
- `game.js`: input, world switching, Canvas and camera integration. `world.js` / `silk-world.js`: classic data and pathfinding. `pilgrimage-world.js` / `pilgrimage-art.js`: the connected pilgrimage. `fixed-*.js`: the screen-switching atlas. `camera-limits.js`: camera bounds. `music.js`, `zone-music.js`, `audio.js`, `silk-music.js`, `journey-music.js`: audio. `prototype-world.js`: Small Journey filter (no separate save namespace). Full map: [DESIGN](docs/DESIGN.md) and the implementation boundaries in [DEVELOPMENT](docs/DEVELOPMENT.md).

## 5. Records and handoff

Record the Issue, PR, verified commit SHA, exact executed tests, risk/audit outcome, untested behaviour, live Pages result and required iPhone steps. Physical iPhone/Safari, ear listening, independent audit and human aesthetic acceptance stay **unverified** until actually performed. Adoption decisions and their history go to [DECISIONS](docs/DECISIONS.md); remaining work to [ROADMAP](docs/ROADMAP.md).
