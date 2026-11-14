# Claude Code entrypoint

@AGENTS.md
@docs/DEVELOPMENT.md

For PR supervision (reviews, CI fixes, conflicts, overnight rounds) follow `.claude/skills/steward/SKILL.md`.

Use the checked-out repository, live Issues/PRs and committed design decisions as the source of truth for the independent TIDAL ATLAS exploration game.
Read the design index and `docs/PROTOTYPE.md` when working on the opt-in Small Journey mode; its PR #7 is already merged, while independent review/device evidence remains unverified.
The same contract applies to ChatGPT/Codex and Claude Code. Do not reuse the SRPG combat rules or the ARPG 3D control contract.
Do not assume unseen chat history or private memory. Choose actual available AI models by role, not hard-coded version names.
Related small changes can share an Issue/PR, and ordinary independent review/device checks can be batched at playable milestones.
Follow the autopilot phase in AGENTS.md (human instruction 2026-11-14): adopted PRs merge through the required checks `rules`, `browser` and `gate` and GitHub auto-merge, and the daily 15:00 run is retired. Never push directly to main or force-push. For a large change the human asks for directly, write a short technical design in the PR body first, then leave merging to auto-merge. Record unverified checks; how the parts work is in `docs/AUTOPILOT.md`.
