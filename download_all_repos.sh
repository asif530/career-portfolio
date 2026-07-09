#!/bin/bash
###############################################################################
# Download All GitHub Repositories
# Works on: Mac, Linux, and Windows (WSL/Git Bash)
#
# Usage:
#   ./download_all_repos.sh asif530 [output_dir] [github_token]
#   ./download_all_repos.sh asif530 --ssh
#
# Requirements:
#   - bash shell
#   - git installed
#   - curl installed
#   - GitHub account
#
# Authentication:
#   1. Token: Generate at https://github.com/settings/tokens
#   2. SSH: Set up SSH key at https://github.com/settings/keys
#   3. HTTPS: Use GitHub username + PAT as password
###############################################################################

set -e

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
USERNAME="${1:-}"
OUTPUT_DIR="${2:-github_repos}"
GITHUB_TOKEN="${3:-}"
USE_SSH=false

# API endpoints
API_URL="https://api.github.com"

# Statistics
REPOS_DOWNLOADED=0
REPOS_FAILED=0
REPOS_SKIPPED=0

###############################################################################
# Helper Functions
###############################################################################

print_header() {
    echo ""
    echo "=============================================================="
    echo "GitHub Repositories Downloader".center
    echo "=============================================================="
    echo ""
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_status() {
    echo -ne "${BLUE}📥 $1${NC}\r"
}

usage() {
    echo "Usage: $0 <username> [output_dir] [token]"
    echo ""
    echo "Examples:"
    echo "  $0 asif530                          # Interactive prompt"
    echo "  $0 asif530 my_repos                 # Custom output dir"
    echo "  $0 asif530 my_repos ghp_xxxxx       # With token"
    echo "  $0 asif530 --ssh                    # Use SSH"
    echo ""
    echo "Environment variables:"
    echo "  GITHUB_TOKEN - Set token via env var instead of argument"
    exit 1
}

###############################################################################
# Validation Functions
###############################################################################

check_prerequisites() {
    print_info "Checking prerequisites..."

    # Check git
    if ! command -v git &> /dev/null; then
        print_error "Git is not installed"
        echo "Install it from: https://git-scm.com/"
        return 1
    fi
    print_success "Git is installed"

    # Check curl
    if ! command -v curl &> /dev/null; then
        print_error "curl is not installed"
        echo "Install it from: https://curl.se/"
        return 1
    fi
    print_success "curl is installed"

    return 0
}

create_output_directory() {
    if [ ! -d "$OUTPUT_DIR" ]; then
        mkdir -p "$OUTPUT_DIR"
        print_info "Created output directory: $OUTPUT_DIR"
    else
        print_info "Output directory: $OUTPUT_DIR"
    fi

    OUTPUT_DIR="$(cd "$OUTPUT_DIR" && pwd)" # Get absolute path
}

###############################################################################
# GitHub API Functions
###############################################################################

get_repositories() {
    print_info "Fetching repositories for user: $USERNAME"

    local repos_json="/tmp/repos_${USERNAME}_$RANDOM.json"
    local page=1
    local per_page=100
    local total_fetched=0

    # Fetch all repos (handle pagination)
    while true; do
        local url="${API_URL}/users/${USERNAME}/repos?per_page=${per_page}&page=${page}&sort=updated"

        # Add auth header if token provided
        local auth_header=""
        if [ -n "$GITHUB_TOKEN" ]; then
            auth_header="-H 'Authorization: token $GITHUB_TOKEN'"
        fi

        print_status "Fetching page $page..."

        # Fetch with error handling
        local response
        if [ -n "$auth_header" ]; then
            response=$(curl -s -H "Authorization: token $GITHUB_TOKEN" "$url")
        else
            response=$(curl -s "$url")
        fi

        # Check for errors
        if echo "$response" | grep -q '"message"'; then
            local error_msg=$(echo "$response" | grep -o '"message":"[^"]*' | cut -d'"' -f4)
            print_error "API Error: $error_msg"
            print_error "Check your username and token"
            return 1
        fi

        # Check if empty response (no more pages)
        if [ "$(echo "$response" | jq length 2>/dev/null || echo 0)" -eq 0 ]; then
            break
        fi

        # Append to temp file
        echo "$response" | jq -r '.[]' >> "$repos_json" 2>/dev/null || {
            print_error "Failed to parse JSON response"
            return 1
        }

        total_fetched=$((total_fetched + per_page))
        page=$((page + 1))
    done

    # Count and display repos
    if [ -f "$repos_json" ]; then
        REPO_COUNT=$(grep -c '"name"' "$repos_json" || echo 0)
        print_success "Found $REPO_COUNT repositories"
        echo "$repos_json"
        return 0
    else
        print_error "No repositories found"
        return 1
    fi
}

###############################################################################
# Cloning Functions
###############################################################################

clone_repository() {
    local repo_name="$1"
    local repo_url="$2"
    local repo_path="${OUTPUT_DIR}/${repo_name}"

    # Skip if already exists
    if [ -d "$repo_path" ]; then
        print_warning "Skipping $repo_name (already exists)"
        REPOS_SKIPPED=$((REPOS_SKIPPED + 1))
        return 0
    fi

    # Clone repo
    if timeout 120 git clone --quiet "$repo_url" "$repo_path" 2>/dev/null; then
        print_success "Cloned $repo_name"
        REPOS_DOWNLOADED=$((REPOS_DOWNLOADED + 1))
        return 0
    else
        print_error "Failed to clone $repo_name"
        REPOS_FAILED=$((REPOS_FAILED + 1))
        return 1
    fi
}

###############################################################################
# Main Logic
###############################################################################

main() {
    print_header

    # Validate arguments
    if [ -z "$USERNAME" ]; then
        print_error "GitHub username is required"
        usage
    fi

    # Check for SSH flag
    if [ "$OUTPUT_DIR" = "--ssh" ] || [ "$GITHUB_TOKEN" = "--ssh" ]; then
        USE_SSH=true
        OUTPUT_DIR="github_repos"
    fi

    # Check prerequisites
    check_prerequisites || exit 1

    # Get token if not provided
    if [ -z "$GITHUB_TOKEN" ] && [ "$USE_SSH" = false ]; then
        print_warning "No token provided"
        read -sp "Enter GitHub Personal Access Token (or press Enter to skip): " GITHUB_TOKEN
        echo ""
    fi

    # Create output directory
    create_output_directory

    # Fetch repositories
    repos_file=$(get_repositories) || exit 1

    # Download repositories
    print_info "Starting downloads...\n"

    local repo_count=$(grep -c '"name"' "$repos_file" 2>/dev/null || echo 0)
    local current=1

    while IFS= read -r line; do
        if [[ "$line" == *'"name":'* ]]; then
            local repo_name=$(echo "$line" | grep -o '"name":"[^"]*' | cut -d'"' -f4)
            local clone_url
            local ssh_url=$(echo "$line" | grep -o '"ssh_url":"[^"]*' | cut -d'"' -f4)
            local https_url=$(echo "$line" | grep -o '"clone_url":"[^"]*' | cut -d'"' -f4)

            # Choose clone URL based on auth method
            if [ "$USE_SSH" = true ]; then
                clone_url="$ssh_url"
            else
                if [ -n "$GITHUB_TOKEN" ]; then
                    # Insert token into HTTPS URL
                    clone_url="${https_url/https:\/\//https://$GITHUB_TOKEN@}"
                else
                    clone_url="$https_url"
                fi
            fi

            echo "[$current/$repo_count] ", -n
            clone_repository "$repo_name" "$clone_url"
            current=$((current + 1))
        fi
    done < "$repos_file"

    # Cleanup temp file
    rm -f "$repos_file"

    # Print summary
    echo ""
    echo "=============================================================="
    echo "Download Complete!".center
    echo "=============================================================="
    print_success "Successfully downloaded: $REPOS_DOWNLOADED"
    print_error "Failed: $REPOS_FAILED"
    print_warning "Skipped: $REPOS_SKIPPED"
    print_info "Location: $OUTPUT_DIR"
    echo "=============================================================="
    echo ""
}

# Run main function
main "$@"
