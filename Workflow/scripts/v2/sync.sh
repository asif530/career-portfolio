#!/usr/bin/env bash
#
# Syncs GitHub repository/profile data into repos.json and profile.json,
# regenerates index.html from the template, and prepares a commit message
# describing what changed. Invoked by .github/workflows/sync-repos.yml.
set -Eeuo pipefail

trap 'error "sync.sh failed at line ${LINENO}"' ERR

readonly GITHUB_API_BASE="https://api.github.com"
readonly PREVIOUS_REPOS_FILE="repos-previous.json"
readonly REPOS_FILE="repos.json"
readonly PROFILE_FILE="profile.json"
readonly PROFILE_DEFAULTS_FILE="profile-defaults.json"
readonly TEMPLATE_FILE="index.template.html"
readonly INDEX_FILE="index.html"

: "${REPOS_PAT:?REPOS_PAT environment variable is required}"
: "${REPO_OWNER:?REPO_OWNER environment variable is required}"
: "${GITHUB_OUTPUT:?GITHUB_OUTPUT environment variable is required (expected to be set by the Actions runner)}"

# Pipeline state, populated as main() progresses and consumed by later stages.
CURRENT_REPOS_JSON=""
PREVIOUS_REPOS_JSON="[]"
USER_JSON=""
LANGUAGE_BREAKDOWN_JSON="[]"
NEW_COUNT=0
RENAMED_COUNT=0
RENAMED_JSON="[]"

log()   { printf '[INFO] %s\n' "$*"; }
warn()  { printf '[WARN] %s\n' "$*" >&2; }
error() { printf '[ERROR] %s\n' "$*" >&2; exit 1; }

requireCommand() {
  local cmd=$1
  command -v "$cmd" >/dev/null 2>&1 || error "Required command '${cmd}' not found on PATH"
}

githubApi() {
  local endpoint=$1
  curl --fail --silent --show-error \
    --header "Authorization: token ${REPOS_PAT}" \
    "${GITHUB_API_BASE}${endpoint}"
}

fetchRepositories() {
  log "Fetching repositories from GitHub API"
  CURRENT_REPOS_JSON=$(githubApi "/user/repos?per_page=100&sort=updated&affiliation=owner")

  local repo_count
  repo_count=$(jq 'length' <<< "$CURRENT_REPOS_JSON")
  if (( repo_count >= 100 )); then
    warn "Received ${repo_count} repositories (single page limit is 100); pagination may be needed if the account grows further"
  fi
}

detectRepositoryChanges() {
  if [[ ! -f "$PREVIOUS_REPOS_FILE" ]]; then
    log "No previous snapshot found; skipping change detection (first run)"
    return
  fi

  PREVIOUS_REPOS_JSON=$(cat "$PREVIOUS_REPOS_FILE")

  # Repo IDs are stable across renames, unlike names, so identity is tracked by id.
  local new_repos_json
  new_repos_json=$(jq -n --argjson curr "$CURRENT_REPOS_JSON" --argjson prev "$PREVIOUS_REPOS_JSON" '
    ($prev | map(.id)) as $prevIds |
    [ $curr[] | select(.id as $id | ($prevIds | index($id)) | not) ]
  ')
  NEW_COUNT=$(jq 'length' <<< "$new_repos_json")
  if (( NEW_COUNT > 0 )); then
    log "Found ${NEW_COUNT} new repositories:"
    jq -r '.[].name' <<< "$new_repos_json"
  fi

  RENAMED_JSON=$(jq -n --argjson prev "$PREVIOUS_REPOS_JSON" --argjson curr "$CURRENT_REPOS_JSON" '
    ($prev | map({(.id|tostring): .name}) | add // {}) as $prevMap |
    [ $curr[] | . as $c | ($prevMap[($c.id|tostring)]) as $old |
        select($old != null and $old != $c.name) |
        {id: $c.id, oldName: $old, newName: $c.name} ]
  ')
  RENAMED_COUNT=$(jq 'length' <<< "$RENAMED_JSON")
  if (( RENAMED_COUNT > 0 )); then
    log "Found ${RENAMED_COUNT} renamed repositories:"
    jq -r '.[] | "\(.oldName) -> \(.newName)"' <<< "$RENAMED_JSON"
  fi
}

generateReposJson() {
  log "Generating ${REPOS_FILE}"
  jq --argjson renamed "$RENAMED_JSON" --argjson newCount "$NEW_COUNT" '{
    repos: .,
    metadata: {
      totalCount: length,
      lastUpdated: now | todate,
      newReposFound: $newCount,
      renamedRepos: $renamed
    }
  }' <<< "$CURRENT_REPOS_JSON" > "$REPOS_FILE"
}

updatePreviousSnapshot() {
  printf '%s' "$CURRENT_REPOS_JSON" > "$PREVIOUS_REPOS_FILE"
}

fetchProfile() {
  log "Fetching profile info from GitHub API"
  USER_JSON=$(githubApi "/user")
}

fetchLanguages() {
  log "Fetching per-repository language breakdown"
  local repo_names
  repo_names=$(jq -r '.[].name' <<< "$CURRENT_REPOS_JSON")

  local language_entries=""
  while IFS= read -r repo; do
    [[ -z "$repo" ]] && continue
    language_entries+="$(githubApi "/repos/${REPO_OWNER}/${repo}/languages")"$'\n'
  done <<< "$repo_names"

  # Sum bytes per language across every repo, convert to whole-number
  # percentages of the account-wide total, and keep the top 8.
  LANGUAGE_BREAKDOWN_JSON=$(jq -s '
    ([.[] | to_entries[]]) as $entries |
    ($entries | group_by(.key) | map({key: .[0].key, value: (map(.value) | add)})) as $totals |
    ($totals | map(.value) | add) as $grandTotal |
    $totals
    | map({label: .key, percentage: ((.value / $grandTotal * 100) | round)})
    | sort_by(-.percentage)
    | .[0:8]
  ' <<< "$language_entries")
}

generateProfileJson() {
  log "Generating ${PROFILE_FILE}"
  # Overlay name/bio/avatarUrl from the GitHub API onto profile-defaults.json,
  # falling back to the default value whenever the API field is null/empty.
  jq -n \
    --slurpfile defaults "$PROFILE_DEFAULTS_FILE" \
    --argjson user "$USER_JSON" \
    --argjson languages "$LANGUAGE_BREAKDOWN_JSON" \
    '
    ($defaults[0]) as $d |
    $d
    | .name = (if (($user.name // "") | length) > 0 then $user.name else $d.name end)
    | .bio = (if (($user.bio // "") | length) > 0 then $user.bio else $d.bio end)
    | .avatarUrl = (if (($user.avatar_url // "") | length) > 0 then $user.avatar_url else $d.avatarUrl end)
    | .about.languages = $languages
    ' > "$PROFILE_FILE"
}

generateWebsite() {
  log "Generating ${INDEX_FILE} from ${TEMPLATE_FILE}"
  local name avatar title_prefix desc_prefix desc_suffix repo_count

  name=$(jq -r '.name' "$PROFILE_FILE")
  avatar=$(jq -r '.avatarUrl' "$PROFILE_FILE")
  title_prefix=$(jq -r '.site.titlePrefix' "$PROFILE_FILE")
  desc_prefix=$(jq -r '.site.descriptionPrefix' "$PROFILE_FILE")
  desc_suffix=$(jq -r '.site.descriptionSuffix' "$PROFILE_FILE")
  repo_count=$(jq -r '.metadata.totalCount' "$REPOS_FILE")

  export SITE_TITLE="${title_prefix} - ${name}"
  export SITE_DESCRIPTION="${desc_prefix} ${repo_count} ${desc_suffix}"
  export SITE_URL
  SITE_URL=$(jq -r '.site.url' "$PROFILE_FILE")
  export OG_IMAGE_URL="${avatar}&s=400"
  export OG_IMAGE_WIDTH
  OG_IMAGE_WIDTH=$(jq -r '.site.ogImageWidth' "$PROFILE_FILE")
  export OG_IMAGE_HEIGHT
  OG_IMAGE_HEIGHT=$(jq -r '.site.ogImageHeight' "$PROFILE_FILE")

  envsubst '${SITE_TITLE} ${SITE_DESCRIPTION} ${SITE_URL} ${OG_IMAGE_URL} ${OG_IMAGE_WIDTH} ${OG_IMAGE_HEIGHT}' \
    < "$TEMPLATE_FILE" > "$INDEX_FILE"
}

buildCommitMessage() {
  local timestamp commit_message
  timestamp=$(date +'%Y-%m-%d %H:%M:%S UTC')

  if (( NEW_COUNT > 0 && RENAMED_COUNT > 0 )); then
    commit_message="🎉 Found ${NEW_COUNT} new repo(s), ${RENAMED_COUNT} renamed - ${timestamp}"
  elif (( NEW_COUNT > 0 )); then
    commit_message="🎉 Found ${NEW_COUNT} new repo(s) - ${timestamp}"
  elif (( RENAMED_COUNT > 0 )); then
    commit_message="✏️ ${RENAMED_COUNT} repo(s) renamed - ${timestamp}"
  else
    commit_message="📦 Synced repos from GitHub API - ${timestamp}"
  fi

  log "Commit message: ${commit_message}"
  echo "commit_message=${commit_message}" >> "$GITHUB_OUTPUT"
}

main() {
  requireCommand curl
  requireCommand jq
  requireCommand envsubst

  fetchRepositories
  detectRepositoryChanges
  generateReposJson
  updatePreviousSnapshot
  fetchProfile
  fetchLanguages
  generateProfileJson
  generateWebsite
  buildCommitMessage
}

main "$@"
