# Refactor Report — GitHub Portfolio

## Executive Summary

This was a code-quality refactor of the portfolio's front-end (`index.html`,
`styles.css`, `script.js`). No frameworks, build tools, or dependencies were
added; the app is still three plain files. `script.js` was reorganized into
labeled sections around a single `state` object and a cached `dom` object,
`styles.css` was regrouped around CSS variables with all dark-mode rules
consolidated, and the four required bugs were fixed. Feature behavior is
unchanged except where a bug fix explicitly corrects it.

## Files Modified

- `script.js` — reorganized, bugs fixed, no behavior changes otherwise
- `styles.css` — reorganized into labeled sections, variables introduced
- `index.html` — inline `style=` and `onclick=` attributes removed
- `REFACTOR_REPORT.md` — this report (new file)

## Major Improvements

- **Centralized state**: `allRepos` / `filteredRepos` / `currentLayout` /
  `darkMode` globals replaced with a single `state` object
  (`state.repositories`, `state.filteredRepositories`, `state.layout`,
  `state.darkMode`).
- **DOM caching**: all `getElementById` / `querySelector` lookups for
  reused elements now happen once in `cacheDomElements()` into a `dom`
  object, instead of re-querying on every render/handler call.
- **Constants instead of magic strings**: `LAYOUT`, `SORT_BY`,
  `DEFAULT_SORT`, `ALERT_TYPE`, and `STORAGE_KEYS` replace repeated string
  literals like `'card'`, `'table'`, `'updated'`, and raw `localStorage`
  key names.
- **Async/await**: `loadRepositories()` and `copyToClipboard()` were
  converted from `.then()` chains to `async`/`await` with `try/catch`.

## Structural Improvements

`script.js` is now organized into labeled sections in this order:
Configuration/Constants → Application State → DOM Cache → Initialization →
Data Loading → Rendering → Filtering → Sorting → Layout → Dark Mode →
Notifications → Utilities → Event Handlers → Application Startup.

`styles.css` is organized into: Root Variables → Base → Layout → Filters →
Profile → Repository Cards → Table View → Buttons → Dark Mode →
Responsive → Utilities, with a file-organization index comment at the end.

## Best Practices Applied

- Named event handler functions (`handleClearFiltersClick`,
  `handleDarkModeToggleClick`, `handleLayoutToggleClick`) replace anonymous
  listener callbacks for the top-level controls.
- Repeated element-construction logic extracted into small helpers:
  `createExternalLink`, `createBadge`, `createCopyButton`, `createAlert`.
- Card-building logic split into focused functions (`createCardHeader`,
  `createCardDescription`, `createCardTags`, `createCardStats`) instead of
  one long `createRepoCard`.
- Rendering, filtering, and sorting are in clearly separate sections instead
  of interleaved.
- Comments trimmed to ones that explain *why* (e.g. why `checkForNewRepos`
  runs where it does, why transitions aren't on `*`), not restating what
  the code already says.

## Bug Fixes

1. **Layout toggle didn't switch views** — `renderRepositories()` now calls
   `updateLayoutVisibility()`, which toggles Bootstrap's `d-none` class on
   `#cardView` / `#tableView` based on `state.layout`. Previously only the
   state variable changed; the DOM never reflected it.
2. **`checkForNewRepos()` ran before repos loaded** — it was called
   synchronously in `DOMContentLoaded`, immediately after `loadRepositories()`
   was *invoked* (not awaited), so `state.repositories` was always empty
   when it ran. It's now called inside `loadRepositories()`, after the
   fetch resolves and `state.repositories` is populated, and only on the
   success path (not in the `catch` block).
3. **Initial load ignored the default sort option** — the first render used
   to call `renderRepositories(allRepos)` directly on the raw fetched array.
   It now calls `applyFilters()`, the same function used on every
   user-driven change, which reads `dom.sortBy.value` (defaulting to
   `updated`, the HTML's pre-selected option) and sorts accordingly before
   the first render.
4. **Technology dropdown wasn't sorted** — `populateTechnologyFilter()` now
   does `Array.from(languages).sort((a, b) => a.localeCompare(b))` before
   creating `<option>` elements, instead of iterating the `Set` in
   first-seen order.

## Code Quality Improvements

- Removed dead/duplicate logic: two near-identical alert-building blocks
  (`showNotification` / `showError`) now share one `createAlert(message,
  type)` helper.
- `sortRepositories` and `filterRepositories` are now pure functions (no
  DOM/global reads), called from `applyFilters()`, which is the only place
  that reads the form controls.
- Removed an unnecessary `!important` on the `.btn, input, select`
  transition rule that was only there to fight the now-removed universal
  `*` transition rule.

## Maintainability Improvements

- Adding a new sort option or storage key means touching one constant
  object, not hunting for string literals across the file.
- Adding a new card field/badge only requires touching the small
  `createCard*` helper, not a 90-line function.
- CSS dark-mode overrides live in one place, so theming changes don't
  require scrolling through every component section.

## Performance Improvements

- DOM lookups for frequently used elements happen once at startup instead
  of on every render/filter/sort call.
- The global `* { transition: ... }` rule (which forced every element on
  the page, including ones that never change color, to carry a transition)
  was replaced with transitions scoped to the specific surfaces that
  actually change in dark mode.

## Intentional Non-Changes

- No frameworks, bundlers, TypeScript, or npm packages were introduced.
- `script.js` remains a single file; no ES modules were introduced.
- HTML structure, Bootstrap classes, and visual design are unchanged aside
  from removing inline `style`/`onclick` attributes.
- `formatDate` / `formatFullDateTime` logic is unchanged.
- The `#tableView` CSS rule was intentionally left as a comment rather than
  a `display: none` declaration, since visibility is now driven entirely by
  Bootstrap's `d-none` utility class (set in HTML and toggled in JS) to
  avoid two competing mechanisms for the same thing.

## Future Recommendations (Not Implemented)

These were out of scope for a behavior-preserving refactor but worth
flagging:

- Debounce the search `input` listener if the repo list grows large enough
  for re-render cost to matter.
- Extract repo card/row templates into `<template>` elements instead of
  building DOM nodes imperatively, if the file continues to grow.
- Add a basic test harness (even just for `filterRepositories` /
  `sortRepositories`, which are now pure and easy to test).
- Consider an `aria-live` region for `#resultCount` / notifications for
  accessibility.

## Before vs After Assessment

| Aspect                        | Before                                             | After                     |
|-------------------------------|----------------------------------------------------|---------------------------|
| Global variables              | 4 unrelated `let`s                                 | 1 `state` object          |
| DOM queries                   | Repeated per call                                  | Cached once at startup    |
| Magic strings                 | `'card'`, `'table'`, `'updated'`, raw storage keys | Named constants           |
| Layout toggle                 | Broken (state changed, view didn't)                | Fixed                     |
| Initial sort                  | Ignored dropdown default                           | Respected                 |
| Tech dropdown order           | Insertion order                                    | Alphabetical              |
| `checkForNewRepos` timing     | Before data loaded (no-op)                         | After successful load     |
| CSS transitions               | Universal `* { }` rule                             | Scoped to themed surfaces |
| CSS dark mode rules           | Scattered across file                              | Grouped in one section    |
| Inline HTML `style`/`onclick` | 3 instances                                        | 0                         |

## Estimated Maintainability Score

**Before: 4/10 → After: 8/10** — centralized state, named constants, and
cached DOM lookups make future changes localized instead of scattered.

## Estimated Readability Score

**Before: 5/10 → After: 8.5/10** — labeled sections, small focused
functions, and consistent naming make the file scannable top to bottom.

## Estimated Technical Debt Reduction

**~60%** — the four functional bugs are fixed, duplication in alert/badge/
link creation is eliminated, and the CSS's scattered dark-mode rules and
universal transition rule (the two biggest structural CSS issues) are
resolved. Remaining debt is mostly the "Future Recommendations" items
above, none of which were required for this pass.
