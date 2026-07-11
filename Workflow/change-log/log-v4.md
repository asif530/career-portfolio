# v4 — Merge-triggered builds + pipeline analysis

Output of this round: `github-actions/v4/sync-repos.yml`. `scripts/` stays at v3 — no
script changes this round. Full analysis (trigger model, pipeline stages, fallback
design, and dynamic-data proposals) was delivered as a visual artifact rather than
this file; see the link shared in chat.

## What changed functionally

**Added a `push: branches: [main]` trigger**, alongside the existing `schedule` and
`workflow_dispatch` triggers. This is the one behavior change: every merge to `main`
now regenerates and republishes the site, instead of waiting for the next daily cron.

**Added a self-trigger guard**: `jobs.sync-repos.if: github.actor != 'github-actions[bot]'`.

Why: the job's last step pushes a commit to `main`. With the push trigger active and
no guard, that commit would immediately queue another run of the same job — which
would find nothing new to sync, push nothing, but still burn a full run, on every
run, forever. Commits pushed by this job authenticate as `github-actions[bot]`
regardless of the `git config user.name` set locally in the commit step, so checking
`github.actor` reliably distinguishes "the bot just pushed" from "a person just
pushed" — real merges and direct pushes still trigger a run.

## What didn't change

`scripts/sync.sh` is untouched (still v3). Everything else in this round was
analysis and proposals, not implementation:

- A read of what each of the 9 pipeline functions does and which ones hit the
  network vs. transform local files.
- The two distinct fallback mechanisms already in place: per-field fallback
  (`profile-defaults.json` overlay) for missing data, vs. fail-loud-and-skip-the-commit
  (`set -Eeuo pipefail` + `curl --fail`) for a broken API call.
- An audit showing `repos.json` already passes through the raw GitHub repo objects,
  so `script.js` already renders stars, forks, language, topics, description, and
  `updated_at` with zero extra API calls or script changes.
- A shortlist of further dynamic fields, ranked by cost: `followers`/`following`/
  `company`/`location`/`blog` and account-wide `totalStars`/`totalForks` are free
  (already-fetched responses, just unread fields); pinned-repo ordering and a
  contribution graph both require switching to GitHub's GraphQL API, which is a
  real scope increase, not a tweak.

None of the proposals are implemented — they're written up for a future round if
wanted.
