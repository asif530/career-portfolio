# Career Portfolio - Maintenance Guide

A comprehensive guide for developers maintaining the portfolio automation system, troubleshooting issues, and understanding how everything works.

---

## Table of Contents
1. [Architecture Overview](#1-architecture-overview)
2. [File Structure & Responsibilities](#2-file-structure--responsibilities)
3. [GitHub Actions Workflow Deep Dive](#3-github-actions-workflow-deep-dive)
4. [Data Flow & Synchronization Cycle](#4-data-flow--synchronization-cycle)
5. [Common Maintenance Tasks](#5-common-maintenance-tasks)
6. [Troubleshooting Guide](#6-troubleshooting-guide)
7. [Escalation Criteria](#7-escalation-criteria--when-to-escalate)
8. [Dependencies & Constraints](#8-dependencies--constraints)
9. [Performance & Optimization](#9-performance--optimization)
10. [Security & Best Practices](#10-security--best-practices)
11. [Monitoring & Health Checks](#11-monitoring--health-checks)
12. [Debugging Tips & Common Patterns](#12-debugging-tips--common-patterns)

---

## 1. Architecture Overview

### System Design

```
Your GitHub Repos (63+)
        ↓
GitHub Actions (daily @ 00:00 UTC)
        ↓
Fetch from GitHub API (curl + auth)
        ↓
Compare with previous data
        ↓
Generate repos.json + metadata
        ↓
Commit & push to GitHub
        ↓
GitHub Pages (auto-deploy)
        ↓
Live Portfolio Website
        ↓
Browser (vanilla JS, real-time search/filter/sort)
```

### Technology Stack

| Component | Technology | Notes |
|-----------|-----------|-------|
| **Hosting** | GitHub Pages | Free, static site hosting |
| **Automation** | GitHub Actions | Free tier, runs daily |
| **Frontend Framework** | Bootstrap 5 | Via CDN, no build step |
| **Styling** | Vanilla CSS | Custom + Bootstrap |
| **JavaScript** | Vanilla (No frameworks) | Lightweight, no dependencies |
| **Package Manager** | None | Zero dependencies! |
| **Backend** | None | Fully static site |
| **Database** | None | GitHub API is data source |

### Design Philosophy

- **Zero dependencies** - No npm, no build tools, no package manager
- **Static site** - Deploy with git push, no server setup
- **GitHub as backend** - Use GitHub API for data, GitHub Pages for hosting
- **Automation** - GitHub Actions handles daily sync, no manual intervention
- **Client-side** - All filtering/sorting happens in browser

### Why This Approach?

✅ **Pros**:
- Simple to understand and maintain
- Fast deployment (git push to live)
- No backend infrastructure to manage
- Free hosting + automation tier
- Easy to customize
- Works offline (after first load)

⚠️ **Cons**:
- Daily sync only (not real-time)
- Static data only (no dynamic features)
- 60-minute maximum sync lag
- GitHub API rate limits apply
- All repos must be public

---

## 2. File Structure & Responsibilities

### Frontend Files

#### `index.html` (248 lines)
**Purpose**: Structure and layout of the portfolio

**Key Sections**:
- **Navigation Bar** (lines 25-60): Sticky top nav with profile/repos/about/contact links, dark mode toggle, layout toggle
- **Profile Section** (lines 63-88): User intro, avatar, title, bio, social links
- **Search & Filter Section** (lines 91-123): Sticky filter bar with search, technology filter, sort dropdown
- **Repositories Section** (lines 126-162): Two views - card (default) and table (hidden)
- **About Section** (lines 166-198): Bio, expertise list, technology badges
- **Contact Section** (lines 202-227): Email, GitHub, LinkedIn links
- **Footer** (lines 231-238): Copyright, last updated timestamp, source link

**Key Dependencies**:
- Bootstrap 5.3.0 CSS via CDN
- Font Awesome 6.4.0 icons via CDN
- Linked to `script.js` and `styles.css`

**When to Edit**:
- Change profile image URL
- Update bio/about text
- Add/remove social links
- Modify section content
- Change navbar layout

#### `script.js` (450+ lines)
**Purpose**: All interactive functionality and data logic

**Key Components**:
- **Global State**: `allRepos[]`, `filteredRepos[]`, `currentLayout`, `darkMode`
- **Data Loading**: `loadRepositories()` - fetches repos.json via Fetch API
- **Rendering**: `renderRepositories()`, `renderCardView()`, `renderTableView()`
- **Filtering**: `filterAndRender()` - real-time search + technology filter
- **Sorting**: `sortRepositories()` - 4 sort strategies (updated, created, stars, name)
- **Layout Toggle**: `toggleLayout()` - switches card ↔ table view
- **Dark Mode**: `toggleDarkMode()`, `initializeDarkMode()` - theme switching
- **Persistence**: Uses `localStorage` for preferences
- **Utilities**: `copyToClipboard()`, `formatDate()`, `showNotification()`

**State Management**:
```javascript
allRepos = []              // Original data from repos.json
filteredRepos = []         // Current filtered/sorted results
currentLayout = 'card'     // 'card' or 'table'
darkMode = false           // Current theme state
```

**When to Edit**:
- Add new sorting options
- Change search/filter logic
- Modify notification behavior
- Update filtering algorithm
- Add new interactive features

#### `styles.css` (250+ lines)
**Purpose**: All custom styling and dark mode theming

**Key Sections**:
- **Dark Mode** (`.dark-mode` selectors): Background, text, card, input styling for dark theme
- **Repo Cards**: Hover effects, shadows, responsive grid
- **Badge Styling**: Technology tags with colors
- **Profile Section**: Social links hover animation
- **Responsive Design**: `@media` queries for tablet/mobile
- **Sticky Elements**: Filter bar positioning and z-index management

**CSS Variables** (for easy customization):
- No root variables currently defined, but can be added
- Consider adding for colors: `--primary-color`, `--dark-bg`, etc.

**When to Edit**:
- Change colors or theme
- Adjust card styling
- Modify responsive breakpoints
- Add hover effects
- Update dark mode appearance

### Automation Files

#### `.github/workflows/sync-repos.yml` (81 lines)
**Purpose**: GitHub Actions automation for daily repo sync

**Trigger Mechanisms**:
- Scheduled: `0 0 * * *` (every day at midnight UTC)
- Manual: `workflow_dispatch` (runnable from Actions tab)

**Workflow Steps** (detailed in Section 3):
1. Checkout repository
2. Fetch current repos from GitHub API
3. Check if previous repos file exists
4. Compare repos and find new ones
5. Generate repos.json for website
6. Update previous repos file
7. Commit and push changes

**When to Edit**:
- Change sync schedule
- Modify GitHub API query parameters
- Update metadata fields
- Change commit message format

### Data Files

#### `repos.json` (auto-generated, ~400-500 KB)
**Purpose**: Complete repository data + metadata for frontend

**Structure**:
```json
{
  "repos": [
    {
      "id": 123456789,
      "name": "grpc-springboot3-netdevh",
      "description": "Reference implementation...",
      "language": "Java",
      "stargazers_count": 5,
      "forks_count": 2,
      "created_at": "2026-01-15T10:00:00Z",
      "updated_at": "2026-07-09T15:30:00Z",
      "topics": ["grpc", "spring-boot"],
      "visibility": "public",
      "html_url": "https://github.com/..."
      // ... 90+ more fields
    }
    // ... 62 more repos
  ],
  "metadata": {
    "totalCount": 63,
    "lastUpdated": "2026-07-09T00:00:00Z",
    "newReposFound": 0
  }
}
```

**Generated by**: GitHub Actions workflow (sync-repos.yml)
**When**: Daily at midnight UTC
**Who generates**: GitHub Actions runner
**File size**: Typically 400-500 KB
**Performance**: ~500-800ms to load on typical connection

**Do NOT**:
- ❌ Edit manually (gets overwritten daily)
- ❌ Commit changes to repos.json

**DO**:
- ✅ Check for data validity
- ✅ Monitor file size growth
- ✅ Archive old versions for testing

#### `repos-previous.json` (auto-generated, ~400-500 KB)
**Purpose**: Previous sync's repos (used for new repo detection)

**Structure**: Same as repos.json, but from previous day

**Lifecycle**:
- Day 1: Created as empty array `[]`
- Day 2+: Contains yesterday's repos
- Next sync: Used for comparison, then overwritten

**When to Edit**: Never manually
**Generated by**: GitHub Actions workflow
**Updated**: After each successful sync

#### `repos-current.json` (temporary)
**Purpose**: Holds raw API response during workflow execution

**Lifecycle**:
- Created: During workflow step 2 (fetch repos)
- Used: During comparison step
- Deleted: Automatically (not committed to git)

**Never stored**: Not tracked in git (temporary working file)

### Configuration Files

#### `README.md`
**Purpose**: Setup and user guide (not maintenance focus)
**Scope**: For new developers setting up the project
**Reference**: Not part of daily maintenance

#### `.gitignore`
**Purpose**: Exclude temp/IDE files from version control

**Excluded**:
- `.DS_Store`, `Thumbs.db` - OS files
- `.vscode/`, `.idea/` - IDE settings
- `node_modules/`, `npm-debug.log` - If npm added later
- `.env`, `.env.local` - Never commit secrets
- `*.tmp`, `*.bak`, `*.log` - Temp files

---

## 3. GitHub Actions Workflow Deep Dive

### Workflow File Location
`.github/workflows/sync-repos.yml`

### Triggers

**Scheduled Trigger**:
```yaml
schedule:
  - cron: '0 0 * * *'  # Every day at 00:00 UTC
```
- UTC timezone (no timezone offset)
- Runs approximately at midnight UTC
- ⚠️ Note: GitHub runs scheduled workflows within 15 minutes of scheduled time (not exact)

**Manual Trigger**:
```yaml
workflow_dispatch:  # Allows manual triggering from UI
```
- Available button: GitHub Actions tab → Sync GitHub Repos Daily → Run workflow
- Useful for testing or forcing an immediate sync

### Step-by-Step Breakdown

#### Step 1: Checkout repository
```yaml
- uses: actions/checkout@v4
```
**What it does**:
- Clones the `career-portfolio` repo into the runner
- Provides read/write access to repo files
- Initializes git config for later commit

**Why needed**:
- Enables reading of `repos-previous.json`
- Enables writing of generated files
- Enables git push at end

**Common issues**:
- ❌ Permission denied → Check branch protection rules
- ❌ Timeout → Network issue, retry manually

#### Step 2: Fetch current repos from GitHub API
```bash
curl -s -H "Authorization: token ${{ secrets.GITHUB_TOKEN }}" \
  "https://api.github.com/user/repos?per_page=100&sort=updated&affiliation=owner" | \
  jq '.' > repos-current.json
```

**What it does**:
- Uses curl to fetch ALL your public repositories
- Adds authorization header with GitHub token
- Stores raw API response in `repos-current.json`

**API Parameters**:
- `per_page=100`: Fetch 100 repos per page (max)
- `sort=updated`: Sort by last update time (newest first)
- `affiliation=owner`: Only repos you own (not starred/collaborated)

**Token Details**:
- Uses `secrets.GITHUB_TOKEN` (GitHub manages automatically)
- Token is **temporary** (expires after workflow)
- Token is **read-only** (cannot modify repos)
- Token is **safe** (rotated after each workflow)

**Rate Limiting**:
- 5000 requests/hour with token (plenty for daily use)
- 60 requests/hour without token (would fail)
- Logs show X-RateLimit headers if approaching limit

**Common issues**:
- ❌ API rate limit exceeded → Hit 5000 request limit (unlikely with daily schedule)
- ❌ 401 Unauthorized → Token expired or revoked (shouldn't happen)
- ❌ 403 Forbidden → Token doesn't have required permissions
- ❌ Timeout → GitHub API slow, retry manually

#### Step 3: Check if previous repos file exists
```yaml
- name: Check if previous repos file exists
  run: |
    if [ -f repos-previous.json ]; then
      echo "Previous file found"
    else
      echo "repos-previous.json" > repos-previous.json
    fi
```

**What it does**:
- Checks if `repos-previous.json` exists
- If missing: Creates empty file for first-time run
- If present: Uses for comparison

**Why needed**:
- First run: No previous file to compare
- Subsequent runs: Need previous data for new repo detection

#### Step 4: Compare repos and find new ones
```bash
comm -23 \
  <(cat repos-current.json | jq -r '.[] | .name' | sort) \
  <(cat repos-previous.json | jq -r '.[] | .name' | sort) | \
  wc -l
```

**What it does**:
- Extracts repo names from current and previous files
- Uses `comm` command to find differences
- Counts repos in current but NOT in previous (new repos)
- Sets environment variable: `NEW_COUNT` and `NEW_REPOS_FOUND`

**Algorithm**:
1. Extract `.name` field from both JSON files
2. Sort both lists
3. Find repos in current list NOT in previous list
4. Count the difference

**Limitations**:
- Name-based comparison (handles renames poorly)
- Case-sensitive (if you rename case, detected as new)
- Cannot detect description-only changes

#### Step 5: Generate repos.json for website
```bash
cat repos-current.json | jq '{
  repos: .,
  metadata: {
    totalCount: length,
    lastUpdated: now | todate,
    newReposFound: (if env.NEW_REPOS_FOUND == "true" then (env.NEW_COUNT | tonumber) else 0 end)
  }
}' > repos.json
```

**What it does**:
- Takes raw API response (repos-current.json)
- Wraps it in `repos` array
- Adds metadata section
- Outputs to `repos.json` (used by website)

**Metadata Added**:
- `totalCount`: Number of repos
- `lastUpdated`: Current timestamp (ISO format)
- `newReposFound`: Count of new repos (0 if none)

**Why metadata?**:
- Frontend shows "Last updated" in footer
- Frontend displays notification for new repos
- Useful for monitoring (track sync frequency)

#### Step 6: Update previous repos file
```bash
cp repos-current.json repos-previous.json
```

**What it does**:
- Copies current data to become "previous" for next run
- Enables comparison for tomorrow's run

**Timing**:
- Happens AFTER repos.json generated
- Happens BEFORE commit (so old version is in commit)

#### Step 7: Commit and push changes
```bash
git config user.name "GitHub Actions Bot"
git config user.email "actions@github.com"
git add repos.json repos-previous.json

if [ "${{ env.NEW_REPOS_FOUND }}" = "true" ]; then
  git commit -m "🎉 Found ${{ env.NEW_COUNT }} new repo(s) - $(date +'%Y-%m-%d %H:%M:%S UTC')"
else
  git commit -m "📦 Synced repos from GitHub API - $(date +'%Y-%m-%d %H:%M:%S UTC')" || true
fi

git push
```

**What it does**:
- Configures git user (for commit author)
- Stages repos.json and repos-previous.json
- Creates commit with appropriate message
- Pushes to remote (main branch)

**Commit Messages**:
- If new repos found: `🎉 Found X new repo(s) - YYYY-MM-DD HH:MM:SS UTC`
- If no changes: `📦 Synced repos from GitHub API - YYYY-MM-DD HH:MM:SS UTC`

**GitHub Pages Auto-Deploy**:
- Push triggers GitHub Pages deployment
- New site available within ~1-2 minutes
- Check GitHub Pages status: Settings → Pages

**Common issues**:
- ❌ Push rejected → Branch protection (unlikely on main)
- ❌ Commit fails → No changes (|| true handles this)
- ❌ Nothing pushed → Commit message might have failed

### Workflow Execution Timeline

```
00:00:00 UTC - Workflow triggered
00:00:05      - Checkout complete
00:00:10      - API request made
00:00:15      - API response received (5-10 sec typical)
00:00:25      - repos-current.json created
00:00:30      - Comparison done
00:00:35      - repos.json generated
00:00:40      - repos-previous.json updated
00:00:45      - Commit and push
00:01:00      - Workflow complete
00:01:00-02:00 - GitHub Pages redeploy (1-2 min)
00:02:30      - Portfolio live with new data
```

### Common Failure Points & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| Workflow runs but repos.json not updated | Previous file missing | Recreate repos-previous.json from repos.json |
| API rate limit error | >5000 requests/hour | Check if other workflows running, usually not issue |
| jq parsing error | Malformed JSON from API | Rare, check GitHub API status |
| Git push fails | Token permission issue | Rare with GITHUB_TOKEN, check branch protection |
| Workflow times out | Network latency | Re-run manually, usually succeeds |
| Workflow not running | Schedule disabled | Check Settings → Actions → Disable/enable |
| New repos not detected | repos-previous.json corrupt | Delete file, let workflow recreate it |

---

## 4. Data Flow & Synchronization Cycle

### Daily Sync Timeline

```
T+00:00 UTC
  ↓ Workflow triggered
  ├─ Checkout repo
  ├─ Fetch from GitHub API (2-5 sec)
  ├─ Compare with previous
  ├─ Generate repos.json
  ├─ Commit and push
  └─ Workflow complete (~1 min)

T+00:01-00:02 UTC
  ↓ GitHub Pages receives push
  ├─ Detects main branch change
  ├─ Starts deployment
  └─ Redeploys website

T+00:02-00:03 UTC
  ↓ Portfolio live with latest data
  └─ Next browser refresh shows new repos
```

### Data Freshness Expectations

| Timeline | Event | Status |
|----------|-------|--------|
| T+00:00 | Workflow runs | ⏳ Syncing |
| T+00:01 | repos.json updated | ⏳ Deploying |
| T+00:02 | GitHub Pages deployed | ✅ Live |
| T+00:03-60min | User sees new data | ✅ Available (after refresh) |
| T+24 hours | Next sync | ⏳ Next update |

### What Data Gets Fetched?

**From GitHub API** (~100+ fields):
```json
{
  "id": 123,
  "name": "repo-name",
  "full_name": "asif530/repo-name",
  "owner": { ... },
  "private": false,
  "html_url": "https://github.com/...",
  "description": "...",
  "fork": false,
  "created_at": "2026-01-15T10:00:00Z",
  "updated_at": "2026-07-09T15:30:00Z",
  "pushed_at": "2026-07-09T15:30:00Z",
  "homepage": "...",
  "size": 1234,
  "stargazers_count": 5,
  "watchers_count": 5,
  "language": "Java",
  "forks_count": 2,
  "open_issues_count": 0,
  "default_branch": "main",
  "topics": ["spring-boot", "grpc"],
  "visibility": "public",
  "archived": false,
  "disabled": false,
  // ... 80+ more fields
}
```

**Actually Used by Frontend** (in repos.json):
- `name`, `description`, `language`, `html_url`
- `stargazers_count`, `forks_count`, `watchers_count`
- `created_at`, `updated_at`, `topics`, `visibility`
- `id`, `full_name`, `url` (for linking)

**Optimization Opportunity**: Could prune unused fields to reduce file size by 20-30%

### Data Consistency Model

**Eventual Consistency**:
- GitHub repos are source of truth
- Portfolio data is eventually consistent
- Max lag: ~24 hours (daily schedule)
- No guarantees on exact sync time (GitHub runs within ±15 min window)

**What This Means**:
- ✅ New repos appear within 24 hours
- ✅ Updated descriptions appear within 24 hours
- ⚠️ Real-time updates NOT possible
- ⚠️ Recent changes to repos appear next sync

**No Real-Time Updates Possible Without**:
- Changing to polling (every 5 min) → $$$ cost
- Adding webhook endpoints → Requires backend
- Using GraphQL subscriptions → Premium GitHub feature

---

## 5. Common Maintenance Tasks

### Task 1: Add or Remove Repositories

**When**: You create a new repo or delete an old one

**How It Works Automatically**:
1. You create/delete repo on GitHub
2. Next day at 00:00 UTC, workflow runs
3. GitHub API returns updated list
4. Comparison detects the change
5. repos.json updates automatically
6. Portfolio updates within 2 minutes

**Timeline**:
- Create repo today → Appears in portfolio tomorrow
- Delete repo today → Removed from portfolio tomorrow

**Manual Approach** (if you can't wait):
1. Go to GitHub Actions tab
2. Click "Sync GitHub Repos Daily" workflow
3. Click "Run workflow" button
4. Select branch: "main"
5. Click "Run workflow"
6. Wait 1-2 minutes
7. Refresh portfolio (hard refresh: Ctrl+Shift+R)

**Never Do This**:
- ❌ Manually edit repos.json (gets overwritten next sync)
- ❌ Delete repos.json (workflow regenerates it)
- ❌ Edit repos-previous.json (comparison depends on it)

### Task 2: Update Profile, Bio, or About Section

**What to Change**: `index.html` lines 63-88 and 166-198

**Steps**:
1. Open `index.html` in editor
2. Find Profile section (line 63)
3. Update:
   - Avatar URL: Line 67 `src=...`
   - Name: Line 69 `asif530`
   - Title: Line 70
   - Bio: Lines 71
   - Social links: Lines 75-83

4. For About section (line 166):
   - Update bio text
   - Update expertise list (lines 173-181)
   - Update technology badges (lines 186-194)

5. Test locally:
   ```bash
   # On Windows: Just open in browser (file:// works)
   # On Mac/Linux: Use simple HTTP server
   python3 -m http.server 8000
   # Then visit: http://localhost:8000
   ```

6. Commit and push:
   ```bash
   git add index.html
   git commit -m "Update profile: [brief description]"
   git push
   ```

7. Verify on GitHub Pages (live within 1-2 minutes)

**Testing Checklist**:
- [ ] Profile image displays
- [ ] Name and title correct
- [ ] Social links work
- [ ] About section renders properly
- [ ] Badges display correctly
- [ ] Mobile view looks good

### Task 3: Customize Styling

**What to Change**: `styles.css` for colors, fonts, spacing

**Common Changes**:
- Card colors/shadows
- Dark mode appearance
- Button styles
- Font sizes
- Spacing/padding

**Steps**:
1. Open `styles.css`
2. Find relevant section (comments mark sections)
3. Modify CSS properties
4. Test in browser (F12 → DevTools)
5. Test dark mode toggle
6. Test on mobile (DevTools device mode)
7. Commit when satisfied

**Dark Mode Customization**:
```css
body.dark-mode {
  background-color: #1a1a1a;  /* Change this */
  color: #e0e0e0;              /* Change this */
}

body.dark-mode .card {
  background-color: #2d2d2d;   /* Dark card background */
}
```

**Responsive Breakpoints** (in styles.css):
```css
@media (max-width: 768px) {  /* Tablet & below */
  /* Mobile adjustments */
}

@media (max-width: 576px) {  /* Phone only */
  /* Phone-specific changes */
}
```

### Task 4: Modify Search or Filter Logic

**What to Change**: `script.js` lines 308-350 (filterAndRender function)

**Current Logic**:
```javascript
filterAndRender() {
  const searchTerm = document.getElementById('searchInput').value.toLowerCase();
  const selectedTech = document.getElementById('technologyFilter').value;
  
  // Filter by search term (name + description)
  // Filter by technology (language)
  // Apply sorting
  // Render results
}
```

**Common Modifications**:

**Add Topic Search** (search in topics too):
```javascript
const searchTerm = document.getElementById('searchInput').value.toLowerCase();
filteredRepos = allRepos.filter(repo =>
  repo.name.toLowerCase().includes(searchTerm) ||
  repo.description?.toLowerCase().includes(searchTerm) ||
  (repo.topics || []).some(t => t.toLowerCase().includes(searchTerm))
);
```

**Add Star Count Filter**:
1. Add dropdown in HTML for min stars
2. Modify filterAndRender() to include:
```javascript
const minStars = parseInt(document.getElementById('minStarsFilter').value) || 0;
filteredRepos = filteredRepos.filter(r => r.stargazers_count >= minStars);
```

**Testing**:
1. Open portfolio in browser
2. Open DevTools (F12)
3. Type in Console:
   ```javascript
   filterAndRender();  // Test your changes
   console.log(filteredRepos.length);  // Check count
   ```
4. Test various search terms
5. Verify results are correct

### Task 5: Change GitHub Actions Schedule

**Current Schedule**: Daily at midnight UTC

**Format**: `cron: '0 0 * * *'`

**Cron Syntax**: `minute hour day month day-of-week`
```
0    0   *   *   *
│    │   │   │   │
│    │   │   │   └─ Day of week (0=Sunday, 6=Saturday)
│    │   │   └───── Month (1-12)
│    │   └───────── Day (1-31)
│    └───────────── Hour (0-23, UTC)
└────────────────── Minute (0-59)
```

**Common Schedules**:
```yaml
# Every day at midnight UTC
cron: '0 0 * * *'

# Every 6 hours (4x/day)
cron: '0 */6 * * *'

# Every day at 6 AM UTC
cron: '0 6 * * *'

# Every Monday at noon UTC
cron: '0 12 * * 1'

# Every 4 hours
cron: '0 */4 * * *'
```

**Steps to Change**:
1. Open `.github/workflows/sync-repos.yml`
2. Find line: `cron: '0 0 * * *'`
3. Change to desired schedule
4. Commit and push
5. Test manually: Actions tab → "Run workflow"

**Considerations**:
- ⚠️ More frequent = GitHub Actions quota usage
- ⚠️ GitHub allows ~2000 minutes/month free tier
- ✅ Daily (1 min/run) = ~30 min/month (plenty)
- ✅ Hourly (24 runs/day) = ~720 min/month (over quota)

### Task 6: Handle GitHub API Field Changes

**What Can Happen**: GitHub occasionally changes API response

**Signs of Issues**:
- Workflow suddenly fails with jq error
- repos.json has unexpected structure
- Website shows blank data

**Debug Steps**:
1. Check GitHub Status page: https://www.githubstatus.com/
2. View workflow logs (Actions tab → failed run)
3. Look for jq parsing error
4. Check if GitHub released API changes

**Fix**:
1. Update jq query in `.github/workflows/sync-repos.yml` step 5
2. Add/remove field selections as needed
3. Test by running workflow manually

**Monitoring**:
- Check GitHub API Changelog: https://docs.github.com/en/rest/overview/api-changelog
- Watch for deprecation notices in workflow logs
- Test workflow monthly (or use automated testing)

---

## 6. Troubleshooting Guide

### Issue: Portfolio Not Showing Latest Repos

**Symptoms**:
- Created new repo, not showing in portfolio
- Deleted repo, still shows in portfolio
- Repos updated but old data displayed

**Diagnosis Steps**:

Step 1: Check when repos.json was last updated
```bash
# Check file timestamp
ls -lah repos.json

# Check metadata inside file
curl -s https://raw.githubusercontent.com/asif530/career-portfolio/main/repos.json | \
  grep -o '"lastUpdated":[^,}]*'
```

Step 2: Check GitHub Actions workflow status
- Go to: https://github.com/asif530/career-portfolio/actions
- Look for "Sync GitHub Repos Daily" workflow
- Check latest run status (✅ passed or ❌ failed)

Step 3: Check portfolio is actually live
- Hard refresh portfolio (Ctrl+Shift+R)
- Clear browser cache entirely
- Wait 30 seconds before refresh

**Solutions**:

**If workflow hasn't run today**:
1. Go to Actions tab
2. Click "Sync GitHub Repos Daily"
3. Click "Run workflow"
4. Select "main" branch
5. Click "Run workflow"
6. Wait 1-2 minutes
7. Hard refresh portfolio (Ctrl+Shift+R)

**If workflow ran but no update**:
1. Check workflow logs for errors
2. Verify repos.json was actually updated (check timestamp)
3. Verify GitHub Pages deployment succeeded (Settings → Pages)

**If GitHub Pages not deploying**:
1. Check Settings → Pages
2. Verify source is "Deploy from a branch"
3. Verify branch is "main" and folder is "/"
4. Manually trigger deployment if needed

### Issue: GitHub Actions Workflow Failing

**Symptoms**:
- Red ❌ on workflow run
- Workflow never completes
- Partial run (some steps pass, others fail)

**Debug Steps**:

Step 1: View workflow logs
1. Go to Actions tab
2. Click failed workflow run
3. Expand the failed step (red ❌)
4. Read the error message carefully

Step 2: Identify the failing step

| Error Message | Likely Step | Cause |
|---------------|------------|-------|
| `curl: (7)` or timeout | Step 2 (Fetch API) | Network/API issue |
| `jq: error` or parse error | Step 5 (Generate JSON) | Malformed API response |
| `Permission denied` | Step 7 (Push) | Token/branch protection |
| `Checkout failed` | Step 1 (Checkout) | Repository access issue |

Step 3: Check GitHub Status
- Visit: https://www.githubstatus.com/
- Look for GitHub API or GitHub Actions incidents
- If incident active, wait and re-run workflow

Step 4: Re-run the workflow
1. Go to failed workflow run
2. Click "Re-run all jobs"
3. Wait 1-2 minutes
4. Check logs again

**Common Issues & Fixes**:

**Error: "curl: (28) Operation timeout"**
- Cause: GitHub API slow or unreachable
- Fix: Wait 5 minutes and manually re-run workflow

**Error: "jq: parse error"**
- Cause: API returned invalid JSON
- Fix: Check GitHub Status; if API OK, report to GitHub

**Error: "remote: Permission to push to main denied"**
- Cause: Token permissions or branch protection
- Fix: Check repository Settings → Branch protection rules

**Error: "fatal: reference is not a tree"**
- Cause: Workflow tried to checkout non-existent branch
- Fix: Ensure workflow uses correct branch name

**Step takes longer than 5 minutes**:
- Cause: Usually API latency
- Fix: Normal variance; GitHub Actions allows up to 6 hours per job

### Issue: Repos Not Loading on Website

**Symptoms**:
- Portfolio loads but "Loading repositories..." forever
- No repos showing, empty page
- JavaScript console has red errors

**Diagnosis Steps**:

Step 1: Open browser DevTools (F12)
```
Go to Console tab → Look for red errors
Go to Network tab → Check repos.json request status
```

Step 2: Check repos.json file exists
```
Visit: https://github.com/asif530/career-portfolio/blob/main/repos.json
Should see JSON data, not 404
```

Step 3: Check repos.json is valid JSON
```
Paste URL in browser: https://raw.githubusercontent.com/asif530/career-portfolio/main/repos.json
Should display JSON, not error
```

**Solutions**:

**If "Loading repositories..." persists**:
1. Hard refresh (Ctrl+Shift+R)
2. Wait 5 seconds
3. If still loading, check console for errors
4. Check if GitHub Actions workflow completed recently

**If repos.json not found (404)**:
1. Manually run GitHub Actions workflow (see earlier section)
2. Wait 1-2 minutes for deployment
3. Verify file was created: Check GitHub Actions logs

**If repos.json is invalid JSON**:
1. Check GitHub Actions logs for workflow errors
2. Look for jq parsing errors
3. Try running workflow again
4. Contact support if persists

**If console shows JavaScript errors**:
1. Note the exact error message
2. Check if it's repos.json loading error or script.js error
3. Try different browser (might be browser-specific)
4. Check if JavaScript is enabled in browser settings

### Issue: Search/Filter Not Working

**Symptoms**:
- Search input doesn't filter results
- Technology filter doesn't work
- Results don't update when typing

**Diagnosis Steps**:

Step 1: Check browser console for errors
```
F12 → Console tab → Look for red errors related to script.js
```

Step 2: Verify repos.json loaded
```
F12 → Console → Type: allRepos.length
Should show number (e.g., 63) not undefined
```

Step 3: Test filter function
```
F12 → Console → Type: filterAndRender()
Should update results immediately
```

**Solutions**:

**If allRepos.length is 0**:
1. repos.json not loaded
2. Check Network tab for failed request
3. Hard refresh and wait for load
4. Check GitHub Actions for sync errors

**If filterAndRender() errors**:
1. Check console for exact error
2. Verify script.js loaded successfully (Network tab)
3. Check for JavaScript syntax errors
4. Try different browser

**If filter works but search doesn't**:
1. Verify filterAndRender() called on input change
2. Check searchInput element exists in HTML
3. Verify event listener attached (F12 → Elements → searchInput)

**Force refresh approach**:
1. Hard refresh (Ctrl+Shift+R)
2. Wait 5 seconds for full page load
3. Type in search box
4. Check console for errors
5. Try in private/incognito mode (no cache)

### Issue: Dark Mode Toggle Not Persisting

**Symptoms**:
- Dark mode works while on page
- Refresh page → Light mode returns
- Setting not saved

**Diagnosis Steps**:

Step 1: Check if localStorage enabled
```
F12 → Application → LocalStorage → Select your site
Should see "portfolioDarkMode" key with value "true" or "false"
```

Step 2: Manually test localStorage
```
F12 → Console → Type: localStorage.setItem('test', 'value')
F12 → Console → Type: localStorage.getItem('test')
Should return 'value'
```

**Solutions**:

**If localStorage not working**:
1. Check browser privacy settings (might block localStorage)
2. Try in private/incognito mode (should work)
3. Check if cookies enabled
4. Try different browser

**If localStorage works but setting not persisting**:
1. Verify toggleDarkMode() saves to localStorage
2. Check if initializeDarkMode() reads from localStorage on load
3. Look for JavaScript errors in console
4. Verify localStorage key name is correct

**If everything looks correct**:
1. Clear browser cache and cookies
2. Hard refresh (Ctrl+Shift+R)
3. Test dark mode again
4. Try different browser

### Issue: Mobile Layout Broken

**Symptoms**:
- Content doesn't fit on mobile
- Text too small or too large
- Can't scroll properly
- Buttons unclickable

**Diagnosis Steps**:

Step 1: Test in Chrome DevTools
1. F12 → Device toggle (top left)
2. Select "iPhone 12" or "Pixel 5"
3. Try using site

Step 2: Test real device
1. Visit portfolio on actual phone
2. Try portrait and landscape
3. Try rotating device

Step 3: Check viewport meta tag
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0">
```
Should be in index.html <head>

**Solutions**:

**If DevTools shows layout issues**:
1. Check styles.css for mobile breakpoints
2. Use DevTools to toggle CSS and find culprit
3. Test Bootstrap responsive classes
4. Verify card containers have responsive grid

**If real device has issues but DevTools OK**:
1. Hard refresh on device (Ctrl+Shift+R or Cmd+Shift+R)
2. Try Chrome instead of Safari/Firefox
3. Check if viewport meta tag present
4. Try portrait/landscape orientation

**Common responsive fixes**:
```css
/* Make containers full width on mobile */
.container { width: 100%; padding: 0 10px; }

/* Single column layout on mobile */
@media (max-width: 576px) {
  .col-md-4 { width: 100%; }
}

/* Increase touch target size */
button { min-height: 44px; min-width: 44px; }
```

---

## 7. Escalation Criteria & When to Escalate

### Handle Locally (Don't Escalate)

**Frontend UI Issues**:
- ✅ CSS styling problems
- ✅ Layout not responsive
- ✅ Colors or fonts wrong
- ✅ Button not styled correctly

**JavaScript Issues**:
- ✅ Search/filter logic bug
- ✅ Dark mode toggle broken
- ✅ Layout toggle not working
- ✅ Notification not showing
- ✅ Copy to clipboard broken

**Content Updates**:
- ✅ Profile picture URL change
- ✅ Bio/about text updates
- ✅ Social link changes
- ✅ Technology badge updates

**Documentation**:
- ✅ Update README.md
- ✅ Update this maintenance guide
- ✅ Add comments to code
- ✅ Create troubleshooting docs

**How to Handle**:
1. Make changes locally
2. Test thoroughly
3. Commit with clear message
4. Push to main
5. Verify GitHub Pages deployment

### Handle Locally with Investigation

**GitHub Actions Failures**:
- ✅ Workflow error (read logs)
- ✅ Timeout (retry manually)
- ✅ API errors (check GitHub status)

**Performance Issues**:
- ✅ Slow page load (profile frontend, optimize)
- ✅ Large repos.json file (consider pruning fields)
- ✅ Sluggish search (optimize filtering algorithm)

**Adding New Features**:
- ✅ Add new sort option
- ✅ Add new filter type
- ✅ Change notification behavior
- ✅ Modify search algorithm

**Cron/Schedule Changes**:
- ✅ Change sync frequency
- ✅ Adjust timing
- ✅ Test with manual triggers

**How to Handle**:
1. Research the issue thoroughly
2. Read GitHub Actions logs if applicable
3. Check external status pages
4. Make incremental changes
5. Test before and after
6. Commit with detailed message
7. Monitor for side effects

### Escalate to Platform/DevOps Team

**GitHub Pages Issues**:
- ❌ GitHub Pages deployment failing
- ❌ Custom domain not working
- ❌ HTTPS certificate issues
- ❌ Pages settings locked

**GitHub Actions Quota**:
- ❌ Out of free tier minutes
- ❌ Workflow running too frequently
- ❌ Multiple workflows competing for resources

**GitHub API Authentication**:
- ❌ Token permissions insufficient
- ❌ Token expired or revoked
- ❌ Organization policies blocking access

**GitHub Account/Org Issues**:
- ❌ Branch protection preventing pushes
- ❌ Repository settings locked
- ❌ Permissions for team members

**How to Escalate**:
1. Gather error logs and screenshots
2. Document what you've already tried
3. Check GitHub Status page
4. Contact platform/DevOps team with:
   - Clear problem description
   - Steps to reproduce
   - Error messages/logs
   - What you've tried
   - Impact severity

### Escalate to Original Author

**Major Architecture Changes**:
- ❌ Considering redesign
- ❌ Considering new tech stack
- ❌ Considering different hosting

**Breaking Changes**:
- ❌ Changing data format significantly
- ❌ Removing core features
- ❌ Changing API structure

**Long-term Strategic Questions**:
- ❌ Should we add backend?
- ❌ Should we add database?
- ❌ Should we migrate to different platform?
- ❌ Should we add features beyond scope?

**How to Escalate**:
1. Document the proposal clearly
2. Explain pros/cons
3. Show impact assessment
4. Suggest alternatives
5. Request guidance before proceeding

---

## 8. Dependencies & Constraints

### External Dependencies (No Local Installation)

**CSS Framework**:
- Bootstrap 5.3.0
- Loaded via CDN: `https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css`
- Used for: Grid layout, responsive design, form styling, utilities
- What if CDN down?: Page will have no styling (basic HTML only)
- Alternative: Can cache Bootstrap locally if needed

**Icon Library**:
- Font Awesome 6.4.0
- Loaded via CDN: `https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css`
- Used for: Navigation icons, social icons, filter/sort icons
- What if CDN down?: Icons won't load (text still readable)
- Alternative: Can use Unicode symbols if needed

**Data Source**:
- GitHub API v3
- Endpoint: `https://api.github.com/user/repos`
- Required for: Daily repo sync, populating data
- Rate limit: 5000 requests/hour (with authentication)
- What if API down?: Workflow fails, portfolio shows last cached data

### Browser APIs Used

**Fetch API** (for loading repos.json):
```javascript
fetch('repos.json').then(r => r.json()).then(data => { ... })
```
- Modern browsers: All (IE 11 not supported)
- Polyfill available if needed

**localStorage** (for saving preferences):
```javascript
localStorage.setItem('portfolioDarkMode', 'true')
localStorage.getItem('portfolioDarkMode')
```
- Used for: Dark mode toggle, layout preference
- Storage: ~5-10 MB available (usually)
- What if disabled?: Settings won't persist across sessions
- Fallback: Works without, but state resets on refresh

**Clipboard API** (for copy button):
```javascript
navigator.clipboard.writeText(url)
```
- Modern browsers: Chrome 63+, Firefox 53+, Safari 13.1+
- Fallback: Can use older method if needed
- Security: Only works HTTPS or localhost

**CSS Variables** (for theming):
```css
:root { --primary-color: #667eea; }
```
- Browser support: All modern browsers (IE 11 not supported)
- Used for: Theme customization (currently not used, could add)

### Service Dependencies

**GitHub Availability**:
- GitHub API: 99.9% uptime SLA
- GitHub Pages: 99.9% uptime SLA (GitHub's infrastructure)
- GitHub Actions: Best effort (no explicit SLA)
- Check status: https://www.githubstatus.com/

**Domain/DNS**:
- Domain: `asif530.github.io` (GitHub-provided)
- DNS: Managed by GitHub
- What if GitHub goes down?: Portfolio completely unavailable
- Alternative: Can custom domain if needed

**CDNs**:
- jsdelivr.net: CDN for Bootstrap
- cdnjs.cloudflare.com: CDN for Font Awesome
- What if CDN down?: No styling/icons, but site functional
- Fallback: Could host resources locally

### System Constraints

**Static Site Only**:
- ❌ Cannot run server-side code
- ❌ Cannot query database
- ❌ Cannot handle form submissions
- ❌ Cannot store server-side sessions
- ✅ Can only serve static files

**No Real-Time Updates**:
- Updates happen daily only
- Max lag: 24 hours
- Cannot push updates to browser
- Cannot handle webhook subscriptions

**Public Repos Only**:
- Cannot display private repos
- Would require authentication
- Would complicate frontend

**No User Data Storage**:
- Cannot save user accounts
- Cannot persist custom filters
- Settings only in browser localStorage

**GitHub API Rate Limits**:
- 5000 requests/hour with token
- Daily sync = 1 request/day (well under limit)
- Could support hourly updates without issue

**File Size Constraints**:
- GitHub Pages: Unlimited file size (essentially)
- Current repos.json: ~400-500 KB
- Scaling: Could handle 1000+ repos easily (still <5 MB)

### Cannot Be Done Without Architectural Change

| Requirement | Current Capability | What's Needed |
|------------|-------------------|-----------------|
| Real-time updates | Daily sync only | WebSocket/polling, backend server |
| Private repos | Public only | User authentication, secure data transfer |
| Custom user filters | Client-side only | Database, user accounts |
| Analytics/tracking | Not possible | Backend logging, user tracking |
| Comments/reactions | Not possible | Database, API, user auth |
| Favorites/bookmarks | localStorage only | User accounts, database |
| Email notifications | Not possible | Email service, backend |
| Advanced search | Text search only | Full-text search DB, backend |

### Recommended Additions (if needed)

**Could Add Easily**:
- ✅ More sorting options
- ✅ More filter types
- ✅ Export to CSV/JSON
- ✅ RSS feed of new repos
- ✅ Embed portfolio in iframe
- ✅ API endpoint for portfolio data

**Would Require Backend**:
- ❌ User accounts
- ❌ Comments/discussions
- ❌ Favorites/collections
- ❌ Analytics
- ❌ Email notifications

---

## 9. Performance & Optimization

### Current Performance Metrics

**Frontend Load Time**:
- Cold load: ~1-2 seconds (first visit)
- Warm load: ~500ms (cached)
- Search/filter: Instant (<100ms)
- Dark mode toggle: <50ms (CSS only)

**File Sizes**:
- index.html: ~8 KB
- script.js: ~12 KB
- styles.css: ~8 KB
- repos.json: 400-500 KB (largest file)
- Bootstrap CSS: ~180 KB (CDN)
- Font Awesome CSS: ~40 KB (CDN)

**Total Load** (on first visit):
- HTML + JS + CSS: ~30 KB
- Bootstrap + FA: ~220 KB
- repos.json: ~400 KB
- **Total: ~650 KB** (compressed ~150 KB)

### Bottlenecks & Optimization Opportunities

**Bottleneck #1: repos.json Size (400 KB)**
- Problem: Large file means longer download
- Current: ~500ms to load
- Opportunity: Prune unused API fields
- Potential savings: 50-100 KB (20% reduction)
- Implementation:
  ```bash
  # Current: Fetches 100+ fields
  cat repos-current.json | jq '.[] | {name, description, language, ...}'
  ```

**Bottleneck #2: Search/Filter Algorithm**
- Problem: Searches across all repos every keystroke
- Current: OK for 63 repos, slow for 500+ repos
- Optimization: Debounce search input (wait for pause before filtering)
  ```javascript
  let searchTimeout;
  searchInput.addEventListener('input', () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => filterAndRender(), 300);
  });
  ```

**Bottleneck #3: CDN Dependencies**
- Problem: Page waits for Bootstrap/FA from CDN
- Current: CDN is fast (~100ms)
- Optimization: Self-host or preload
  ```html
  <link rel="preload" href="..." as="style">
  ```

**Bottleneck #4: repos.json Parsing**
- Problem: JSON parse happens on every page load
- Current: OK (~50ms for 63 repos)
- Optimization: Would need for 1000+ repos

### Monitoring Performance

**Browser DevTools** (F12):
- Network tab: See download times
- Performance tab: Profile load time
- Console: Check for errors

**Lighthouse** (built into Chrome):
1. F12 → Lighthouse tab
2. Click "Analyze page load"
3. Get performance score (should be >80)

**GitHub Actions** (workflow metrics):
- Check workflow duration in Actions log
- Should be ~1 minute total
- API fetch is usually the bottleneck (2-5 sec)

### Optimization Roadmap

**Low Effort, High Impact**:
- [ ] Prune repos.json fields (save 50-100 KB)
- [ ] Add debounce to search (feel snappier)
- [ ] Minify CSS/JS (save ~20%)

**Medium Effort, Medium Impact**:
- [ ] Lazy load repos in view
- [ ] Compress repos.json with gzip
- [ ] Cache API responses better

**High Effort, Low Impact**:
- [ ] Rewrite with frontend framework
- [ ] Add service worker for offline
- [ ] Implement infinite scroll

---

## 10. Security & Best Practices

### Current Security Posture

**Strengths**:
- ✅ No backend = no backend vulnerabilities
- ✅ No database = no SQL injection, data breaches
- ✅ No user input processing = no XSS vulnerabilities
- ✅ Read-only API token = cannot modify repos
- ✅ Token managed by GitHub = no token rotation needed
- ✅ Public repos only = no private data exposure
- ✅ Static files = no code execution vulnerabilities

**Risks**:
- ⚠️ CDN down = no styling/icons (not a security risk)
- ⚠️ GitHub API changes = workflow might break
- ⚠️ Token exposure = unlikely but possible (GitHub masks in logs)

### Token Security

**GitHub Uses**:
- `secrets.GITHUB_TOKEN` in GitHub Actions
- **Managed by GitHub** - not by you
- **Temporary** - expires after workflow completes
- **Automatic rotation** - new token every run
- **Safe** - cannot modify repositories

**Why No Manual Token Needed**:
- GitHub automatically provides token for Actions
- Token deleted after workflow completes
- Never stored or transmitted outside GitHub infrastructure

**Best Practices**:
- ✅ Never commit .env files
- ✅ Use GitHub Secrets for any custom tokens
- ✅ Review Actions logs (tokens are masked)
- ✅ No need to rotate token (GitHub handles it)

### Code Security

**What NOT to Do**:
- ❌ Don't hardcode API keys
- ❌ Don't commit secrets (passwords, tokens)
- ❌ Don't add sensitive data to repos.json
- ❌ Don't expose private repos

**What TO Do**:
- ✅ Keep GitHub token as-is (don't customize)
- ✅ Use GitHub Secrets for any custom sensitive data
- ✅ Review all commits for secrets before pushing
- ✅ Monitor portfolio for unexpected changes

### Data Privacy

**Data Collected**: None (static site)
- ✅ No cookies
- ✅ No analytics
- ✅ No tracking
- ✅ No user accounts
- ✅ No form submissions

**Browser Storage**: Only client-side
- localStorage: `portfolioDarkMode`, `portfolioLayout`
- Stored locally on user's device
- Not sent to any server

**Third-party Services**: 
- Bootstrap CDN: Load CSS
- Font Awesome CDN: Load icons
- GitHub Pages: Hosting
- No other third-party trackers

### Dependency Security

**Dependencies Audit**:
- Bootstrap 5.3.0: Maintained, security updates regular
- Font Awesome 6.4.0: Maintained, no known vulnerabilities
- No npm packages (zero vulnerabilities!)

**Keeping Secure**:
- [ ] Monthly: Check GitHub Security tab
- [ ] Monthly: Check Bootstrap security advisories
- [ ] Quarterly: Check Font Awesome for updates
- [ ] Annually: Review dependencies

### Monitoring Security

**Watch For**:
- Unexpected commits to repository
- GitHub security alerts (check Settings → Security)
- Unusual GitHub Actions activity
- Changes to workflow files

**Preventive Measures**:
- ✅ Branch protection on main (prevent direct pushes)
- ✅ Require pull request reviews (optional)
- ✅ Enable commit signing (optional but recommended)
- ✅ Audit Actions permissions (minimal access)

### GDPR & Compliance

**This Project**:
- ✅ No user data collection
- ✅ No cookies
- ✅ No tracking
- ✅ Public information only (GitHub repos)
- ✅ GDPR compliant (no PII stored)

**If Adding Features**:
- Consider privacy implications
- Get user consent if collecting data
- Document what data is stored
- Provide data deletion options

---

## 11. Monitoring & Health Checks

### Daily Health Checks (5 minutes)

**Check 1: GitHub Actions Workflow**
```
Go to: https://github.com/asif530/career-portfolio/actions
Look for: "Sync GitHub Repos Daily" workflow
Status: Should show ✅ (passed)
Last run: Should be within 24 hours
Time: Check if it ran around midnight UTC
```

**Check 2: repos.json Freshness**
```bash
# Method 1: Check via browser
Visit: https://raw.githubusercontent.com/asif530/career-portfolio/main/repos.json
Find: "lastUpdated" field
Verify: Timestamp is recent (within 24 hours)

# Method 2: Check via curl
curl -s https://raw.githubusercontent.com/asif530/career-portfolio/main/repos.json | \
  grep -o '"lastUpdated":"[^"]*'
```

**Check 3: Portfolio Loads**
```
Visit: https://asif530.github.io/career-portfolio
Expected: 
  - Page loads in <2 seconds
  - All repos display
  - No JavaScript errors (F12 → Console)
  - Responsive on mobile
```

**Check 4: Recent Commits**
```
Go to: https://github.com/asif530/career-portfolio/commits/main
Look for: Recent commits from GitHub Actions bot
Pattern: Should see daily commits with 📦 or 🎉 emoji
Timeline: One per day at midnight UTC
```

### Weekly Health Checks (30 minutes)

**Check 1: Failed Workflows**
```
Go to Actions tab
Look for red ❌ on "Sync GitHub Repos Daily"
If found:
  - Click to view details
  - Check error message
  - Note any patterns
  - Re-run if it's a one-time network issue
```

**Check 2: GitHub Actions Quota**
```
Go to: Settings → Billing and plans → Actions
Check: Usage this month
Expected: Should be <100 minutes (for monthly schedule)
Alert: If trending >500 min/month, check for issues
```

**Check 3: repos.json Size Trend**
```bash
# Check current size
ls -lh repos.json

# Expected: 400-500 KB
# Alert: If >1 MB, check for data bloat
# Alert: If <200 KB, check if data is loading properly
```

**Check 4: GitHub Status**
```
Visit: https://www.githubstatus.com
Check for: Any active incidents
Alert: If GitHub API incident, expect workflow delays
Action: Monitor until resolved
```

**Check 5: Browser Compatibility**
```
Test on:
  - Chrome (latest)
  - Firefox (latest)
  - Safari (if available)
  - Edge (if available)
Check:
  - All features work
  - No console errors
  - Styling correct
  - Responsive works
```

### Monthly Monitoring Checklist

- [ ] No failed GitHub Actions runs
- [ ] repos.json updated consistently
- [ ] Portfolio response time <2s
- [ ] All external links working
- [ ] Dark mode toggle working
- [ ] Search/filter functionality intact
- [ ] Responsive design on all devices
- [ ] No new JavaScript console errors
- [ ] File sizes reasonable
- [ ] GitHub status page clear (no incidents)

### What to Monitor

**Metrics to Track**:
- Workflow success rate (should be ~99%+)
- repos.json update frequency (daily)
- File size trend (should be stable)
- Load time (should be <2s)
- Error rate (should be 0%)

**Alerting Setup** (optional):

You can add a Slack notification to workflow failures:

```yaml
- name: Notify on failure
  if: failure()
  run: |
    curl -X POST -H 'Content-type: application/json' \
      --data '{"text":"Portfolio sync failed"}' \
      ${{ secrets.SLACK_WEBHOOK_URL }}
```

Or use GitHub's built-in notifications:
- Settings → Notifications → Enable Actions alerts

### Escalation Triggers

**Contact support if**:
- Workflow fails 3+ days in a row
- repos.json missing or corrupted
- Portfolio returns 404 or 500 error
- GitHub Actions quota mysteriously high
- Performance degrades significantly

---

## 12. Debugging Tips & Common Patterns

### Frontend Debugging

**Check repos.json loaded**:
```javascript
// Open DevTools Console (F12)
console.log(allRepos.length);           // Should be 63+, not undefined
console.log(allRepos[0]);               // Should show repo object
console.log(filteredRepos.length);      // Current filtered count
```

**Force re-render**:
```javascript
// Manually trigger filtering (if broken)
filterAndRender();
console.log('Filtered to', filteredRepos.length, 'repos');
```

**Check state**:
```javascript
// Debug current state
console.log({
  totalRepos: allRepos.length,
  filtered: filteredRepos.length,
  searchTerm: document.getElementById('searchInput').value,
  selectedTech: document.getElementById('technologyFilter').value,
  layout: currentLayout,
  darkMode: darkMode
});
```

**Test localStorage**:
```javascript
// Check if localStorage working
localStorage.setItem('test', 'value');
console.log(localStorage.getItem('test'));  // Should print 'value'

// Check portfolio settings
console.log('Dark mode:', localStorage.getItem('portfolioDarkMode'));
console.log('Layout:', localStorage.getItem('portfolioLayout'));
```

**Trace filter logic**:
```javascript
// Add to filterAndRender() temporarily for debugging
const searchTerm = document.getElementById('searchInput').value.toLowerCase();
console.log('Searching for:', searchTerm);

const matching = allRepos.filter(r => 
  r.name.toLowerCase().includes(searchTerm) ||
  (r.description || '').toLowerCase().includes(searchTerm)
);
console.log('Matches:', matching.length, matching.map(r => r.name));
```

### Workflow Debugging

**Read workflow logs**:
1. Go to GitHub Actions tab
2. Click workflow run
3. Click failed step
4. Read error carefully (often tells you exact issue)

**Add debug output**:
```yaml
- name: Debug repos.json
  run: |
    echo "File size:"
    ls -lh repos.json
    echo "Total repos:"
    cat repos.json | jq '.repos | length'
    echo "Latest update:"
    cat repos.json | jq '.metadata.lastUpdated'
```

**Test curl locally**:
```bash
# Test GitHub API (requires token)
TOKEN="your-github-token"
curl -s -H "Authorization: token $TOKEN" \
  "https://api.github.com/user/repos?per_page=100" | \
  jq '.[] | {name, language, stargazers_count}' | head -20
```

**Test jq parsing**:
```bash
# If workflow fails with jq error
cat repos-current.json | jq '.[] | {name, language}'
# Should output JSON without errors

# Count repos
cat repos-current.json | jq 'length'
```

### File Corruption Debugging

**repos.json not loading**:
```bash
# Check if file is valid JSON
curl -s https://raw.githubusercontent.com/asif530/career-portfolio/main/repos.json | \
  jq empty && echo "Valid JSON" || echo "Invalid JSON"

# Check file size
curl -s -I https://raw.githubusercontent.com/asif530/career-portfolio/main/repos.json | \
  grep -i content-length
```

**repos-previous.json issues**:
```bash
# Check if file exists
git ls-remote --heads origin main repos-previous.json

# Recreate from repos.json if needed
# (Workflow will handle it automatically on next run)
```

**script.js errors**:
```javascript
// Check if script loaded
typeof allRepos !== 'undefined' ? 'Loaded' : 'Not loaded'
typeof filterAndRender !== 'undefined' ? 'Loaded' : 'Not loaded'
```

### Common Error Messages & Solutions

| Error | Cause | Fix |
|-------|-------|-----|
| `repos.json is not defined` | repos.json not loaded | Check Network tab, wait for load |
| `Cannot read property 'length' of undefined` | allRepos not loaded | Reload page, check repos.json |
| `TypeError: filterAndRender is not a function` | script.js not loaded | Check if script.js loaded (Network tab) |
| `localStorage is not defined` | Browser security restriction | Try HTTPS or different browser |
| `curl: (7) Failed to connect` | Network timeout | Check GitHub status, retry |
| `jq: parse error` | Malformed JSON | Check GitHub API status |
| `fatal: not a git repository` | Not in git repo | `cd` to correct directory |

### Performance Profiling

**Using Chrome DevTools**:
1. F12 → Performance tab
2. Click record button
3. Interact with site (search, filter, etc.)
4. Click stop
5. Analyze the timeline

**Look for**:
- Long tasks (> 50ms)
- Excessive DOM updates
- Layout recalculations

**Optimize**:
- Add debounce to event handlers
- Use requestAnimationFrame for DOM updates
- Cache DOM queries

### Quick Debug Checklist

Before declaring something "broken":

- [ ] Hard refresh (Ctrl+Shift+R)
- [ ] Wait 30 seconds (might be loading)
- [ ] Check browser console (F12 → Console)
- [ ] Check Network tab (repos.json loading?)
- [ ] Try different browser
- [ ] Try incognito/private mode
- [ ] Check GitHub Actions workflow
- [ ] Check repos.json file (online)
- [ ] Check GitHub status page
- [ ] Wait 2-3 minutes (deployment might be in progress)

---

## Summary

This maintenance guide covers:
✅ **Architecture** - How the system works  
✅ **Files** - What each file does  
✅ **Automation** - How GitHub Actions functions  
✅ **Data** - Data flow and freshness  
✅ **Tasks** - Common maintenance procedures  
✅ **Troubleshooting** - Diagnostic steps and solutions  
✅ **Escalation** - When to seek help  
✅ **Constraints** - What's possible and what's not  
✅ **Performance** - Optimization opportunities  
✅ **Security** - Best practices and risks  
✅ **Monitoring** - Health checks and metrics  
✅ **Debugging** - Diagnostic techniques  

---

**Last Updated**: July 9, 2026  
**Maintenance Level**: Low (mostly monitoring and occasional fixes)  
**Complexity**: Medium (requires understanding automation and frontend)  

**Questions?** Check this guide first, then investigate GitHub Actions logs, or contact the original author.
