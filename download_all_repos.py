#!/usr/bin/env python3
"""
Download All GitHub Repositories
Works on Windows, Mac, and Linux

Usage:
    python3 download_all_repos.py --username asif530 --token YOUR_TOKEN
    python3 download_all_repos.py --username asif530 --ssh
    python3 download_all_repos.py --username asif530  # Will prompt for auth

Requirements:
    - Python 3.7+
    - git command line installed
    - GitHub account

Authentication:
    1. Token: Generate at https://github.com/settings/tokens
       (Need: repo scope)
    2. SSH: Set up SSH key at https://github.com/settings/keys
    3. HTTPS: Use GitHub username + PAT as password
"""

import os
import sys
import subprocess
import argparse
import json
from pathlib import Path
from urllib.request import urlopen
from urllib.error import URLError
import getpass


class GitHubRepoDownloader:
    def __init__(self, username, output_dir="github_repos", use_ssh=False, token=None):
        self.username = username
        self.output_dir = Path(output_dir)
        self.use_ssh = use_ssh
        self.token = token
        self.api_url = "https://api.github.com"
        self.repos_downloaded = 0
        self.repos_failed = 0

    def print_header(self):
        print("\n" + "="*60)
        print("GitHub Repositories Downloader".center(60))
        print("="*60 + "\n")

    def check_git_installed(self):
        """Verify git is installed"""
        try:
            subprocess.run(["git", "--version"], capture_output=True, check=True)
            print("✅ Git is installed")
            return True
        except (subprocess.CalledProcessError, FileNotFoundError):
            print("❌ Git is not installed. Please install it first.")
            print("   Windows: https://git-scm.com/download/win")
            print("   Mac: brew install git")
            print("   Linux: sudo apt-get install git")
            return False

    def create_output_directory(self):
        """Create output directory if it doesn't exist"""
        self.output_dir.mkdir(parents=True, exist_ok=True)
        print(f"📁 Output directory: {self.output_dir.absolute()}")

    def get_repositories(self):
        """Fetch list of repositories from GitHub API"""
        print(f"\n📥 Fetching repositories for user: {self.username}")

        repos = []
        page = 1
        per_page = 100

        while True:
            url = f"{self.api_url}/users/{self.username}/repos?per_page={per_page}&page={page}"

            try:
                headers = {}
                if self.token:
                    headers["Authorization"] = f"token {self.token}"

                req = urlopen(
                    url,
                    headers=headers if headers else None
                )

                data = json.loads(req.read().decode())

                if not data:
                    break

                repos.extend(data)
                page += 1

                print(f"   Fetched {len(repos)} repos so far...", end="\r")

            except URLError as e:
                print(f"\n❌ Error fetching repos: {e}")
                if "401" in str(e):
                    print("   Invalid token or permission denied")
                elif "404" in str(e):
                    print(f"   User '{self.username}' not found")
                return None

        print(f"✅ Found {len(repos)} repositories\n")
        return repos

    def get_clone_url(self, repo):
        """Get the appropriate clone URL based on auth method"""
        if self.use_ssh:
            return repo["ssh_url"]
        elif self.token:
            # Use token in URL for HTTPS clone
            url = repo["clone_url"]
            return url.replace("https://", f"https://{self.token}@")
        else:
            # Standard HTTPS
            return repo["clone_url"]

    def clone_repo(self, repo):
        """Clone a single repository"""
        repo_name = repo["name"]
        repo_url = self.get_clone_url(repo)
        repo_path = self.output_dir / repo_name

        # Skip if already exists
        if repo_path.exists():
            print(f"⏭️  Skipping {repo_name} (already exists)")
            return True

        try:
            print(f"📥 Cloning {repo_name}...", end=" ")

            result = subprocess.run(
                ["git", "clone", "--quiet", repo_url, str(repo_path)],
                capture_output=True,
                text=True,
                timeout=120  # 2 minute timeout per repo
            )

            if result.returncode == 0:
                print("✅")
                self.repos_downloaded += 1
                return True
            else:
                print(f"❌ ({result.stderr.strip()})")
                self.repos_failed += 1
                return False

        except subprocess.TimeoutExpired:
            print("❌ (Timeout)")
            self.repos_failed += 1
            return False
        except Exception as e:
            print(f"❌ ({str(e)})")
            self.repos_failed += 1
            return False

    def download_all_repos(self, repos):
        """Download all repositories"""
        print(f"\n{'='*60}")
        print(f"Starting downloads...")
        print(f"{'='*60}\n")

        for i, repo in enumerate(repos, 1):
            print(f"[{i}/{len(repos)}] ", end="")
            self.clone_repo(repo)

    def print_summary(self, total_repos):
        """Print download summary"""
        print(f"\n{'='*60}")
        print("Download Complete!".center(60))
        print(f"{'='*60}")
        print(f"✅ Successfully downloaded: {self.repos_downloaded}")
        print(f"❌ Failed: {self.repos_failed}")
        print(f"⏭️  Skipped: {total_repos - self.repos_downloaded - self.repos_failed}")
        print(f"📁 Location: {self.output_dir.absolute()}")
        print(f"{'='*60}\n")

    def run(self):
        """Execute the download process"""
        self.print_header()

        # Check prerequisites
        if not self.check_git_installed():
            return False

        self.create_output_directory()

        # Fetch repos
        repos = self.get_repositories()
        if repos is None:
            return False

        # Download repos
        self.download_all_repos(repos)

        # Print summary
        self.print_summary(len(repos))

        return True


def get_github_token():
    """Prompt user for GitHub token"""
    print("\n🔑 GitHub Personal Access Token Required")
    print("   Create one at: https://github.com/settings/tokens")
    print("   Scopes needed: 'repo' (full control of private repositories)")
    print("   NOTE: Token will NOT be stored, only used for this session\n")

    token = getpass.getpass("Enter your GitHub Personal Access Token: ").strip()

    if not token:
        print("❌ Token is required (or use --ssh flag for SSH authentication)")
        return None

    return token


def main():
    parser = argparse.ArgumentParser(
        description="Download all GitHub repositories for a user",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Using Personal Access Token
  python3 download_all_repos.py --username asif530 --token ghp_xxxxx

  # Using SSH (requires SSH key setup)
  python3 download_all_repos.py --username asif530 --ssh

  # Interactive prompt for token
  python3 download_all_repos.py --username asif530

  # Custom output directory
  python3 download_all_repos.py --username asif530 --output my_repos --token ghp_xxxxx
        """
    )

    parser.add_argument(
        "--username",
        required=True,
        help="GitHub username (e.g., asif530)"
    )
    parser.add_argument(
        "--token",
        help="GitHub Personal Access Token (optional, will prompt if not provided)"
    )
    parser.add_argument(
        "--ssh",
        action="store_true",
        help="Use SSH for cloning (requires SSH key setup)"
    )
    parser.add_argument(
        "--output",
        default="github_repos",
        help="Output directory (default: github_repos)"
    )

    args = parser.parse_args()

    # Get authentication method
    token = None
    use_ssh = args.ssh

    if not use_ssh and not args.token:
        token = get_github_token()
        if not token:
            sys.exit(1)
    else:
        token = args.token

    # Run downloader
    downloader = GitHubRepoDownloader(
        username=args.username,
        output_dir=args.output,
        use_ssh=use_ssh,
        token=token
    )

    success = downloader.run()
    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()
