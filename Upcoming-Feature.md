# Upcoming Features

## Explicit rename notification in sync-repos workflow

Currently `.github/workflows/sync-repos.yml` matches repos by `id` between
`repos-previous.json` and `repos-current.json`, so a renamed repo is no
longer miscounted as "new" (fixed in commit `894a9e9`).

However, a rename still isn't surfaced as its own event — it's just
silently absorbed. To report it explicitly (e.g. "repo X was renamed to
Y"), we'd need a separate `id -> name` mapping comparison: for each id
present in both the previous and current fetch, compare the stored name
and flag a mismatch as a rename.
