#!/usr/bin/env python3
"""
GitHub Repository Downloader - Interactive Setup
Checks all prerequisites and helps user through the process

This is the MAIN ENTRY POINT - runs interactive setup and validation
"""

import os
import sys
import subprocess
import platform
import shutil
from pathlib import Path


class SetupWizard:
    def __init__(self):
        self.platform_name = platform.system()  # Windows, Darwin (Mac), Linux
        self.python_ok = False
        self.git_ok = False
        self.token = None
        self.username = None

    def print_header(self):
        print("\n" + "="*70)
        print("GitHub Repository Downloader - Setup Wizard".center(70))
        print("="*70 + "\n")

    def check_python(self):
        """Check if Python 3 is installed"""
        print("📋 Checking Python 3...")

        try:
            result = subprocess.run(
                [sys.executable, "--version"],
                capture_output=True,
                text=True,
                timeout=5
            )
            version = result.stdout.strip() + result.stderr.strip()

            # Check if Python 3.7+
            if "3." in version and int(version.split(".")[1]) >= 7:
                print(f"✅ Python 3 found: {version}")
                self.python_ok = True
                return True
            else:
                print(f"⚠️  Python version too old: {version}")
                return False

        except Exception as e:
            print(f"❌ Python 3 not found: {e}")
            return False

    def prompt_install_python(self):
        """Prompt user to install Python if missing"""
        print("\n" + "!"*70)
        print("Python 3.7+ is Required".center(70))
        print("!"*70)

        print("\nDownload Python from:")
        if self.platform_name == "Windows":
            print("  🔗 https://www.python.org/downloads/")
            print("  📍 Choose 'Latest Python 3 Release'")
            print("  ✅ During install: Check 'Add Python to PATH'")
        elif self.platform_name == "Darwin":  # Mac
            print("  🔗 https://www.python.org/downloads/")
            print("  Or: brew install python3")
        else:  # Linux
            print("  🔗 sudo apt-get install python3")
            print("  🔗 sudo yum install python3")

        print("\nAfter installing Python:")
        print("  1. Restart terminal/command prompt")
        print("  2. Run this script again: python3 setup_and_download.py")

        print("\n" + "!"*70)
        response = input("\nDo you want to continue without Python? (y/n): ").strip().lower()

        if response == "y":
            print("\n⚠️  WARNING: Will try Bash or PowerShell instead")
            return False
        else:
            print("Please install Python 3 first, then try again.")
            sys.exit(1)

    def check_git(self):
        """Check if Git is installed"""
        print("📋 Checking Git...")

        try:
            result = subprocess.run(
                ["git", "--version"],
                capture_output=True,
                text=True,
                timeout=5
            )

            if result.returncode == 0:
                version = result.stdout.strip()
                print(f"✅ Git found: {version}")
                self.git_ok = True
                return True
            else:
                print("❌ Git not found")
                return False

        except FileNotFoundError:
            print("❌ Git not found")
            return False

    def prompt_install_git(self):
        """Prompt user to install Git if missing"""
        print("\n" + "!"*70)
        print("Git is Required".center(70))
        print("!"*70)

        print("\nDownload Git from:")
        if self.platform_name == "Windows":
            print("  🔗 https://git-scm.com/download/win")
            print("  📍 Choose 'Standalone Installer'")
        elif self.platform_name == "Darwin":  # Mac
            print("  🔗 https://git-scm.com/download/mac")
            print("  Or: brew install git")
        else:  # Linux
            print("  🔗 sudo apt-get install git")
            print("  🔗 sudo yum install git")

        print("\nAfter installing Git:")
        print("  1. Restart terminal/command prompt")
        print("  2. Run this script again: python3 setup_and_download.py")

        print("\n" + "!"*70)
        response = input("\nDo you want to continue without Git? (y/n): ").strip().lower()

        if response == "y":
            print("\n❌ ERROR: Git is absolutely required")
            print("Cannot proceed without Git installed")
            sys.exit(1)
        else:
            print("Please install Git first, then try again.")
            sys.exit(1)

    def get_github_username(self):
        """Get GitHub username from user"""
        print("\n" + "-"*70)
        print("GitHub Username".center(70))
        print("-"*70 + "\n")

        print("Enter your GitHub username (e.g., asif530):")
        print("  Find it at: https://github.com/settings/profile")

        username = input("\n👤 GitHub Username: ").strip()

        if not username:
            print("❌ Username is required")
            return self.get_github_username()

        print(f"✅ Username set to: {username}")
        self.username = username
        return username

    def prompt_github_token(self):
        """Prompt for GitHub token"""
        print("\n" + "-"*70)
        print("GitHub Authentication".center(70))
        print("-"*70 + "\n")

        print("GitHub token is OPTIONAL but RECOMMENDED")
        print("\nBenefits of using a token:")
        print("  ✅ Higher API rate limits (5000 vs 60 requests/hour)")
        print("  ✅ Clone private repositories")
        print("  ✅ Faster, more reliable downloads")
        print("  ✅ No password exposure")

        print("\nWithout token:")
        print("  ⚠️  Public repos only")
        print("  ⚠️  Lower rate limits (might hit limit with 63+ repos)")
        print("  ⚠️  Need username + password for cloning")

        response = input("\nDo you want to use a GitHub token? (y/n): ").strip().lower()

        if response == "y":
            return self.setup_token()
        else:
            print("\n⚠️  Proceeding without token (public repos only)")
            return None

    def setup_token(self):
        """Guide user to create and enter GitHub token"""
        print("\n" + "="*70)
        print("Creating GitHub Personal Access Token".center(70))
        print("="*70 + "\n")

        print("Steps to create a token (takes ~2 minutes):\n")
        print("1️⃣  Go to: https://github.com/settings/tokens")
        print("2️⃣  Click: 'Generate new token' → 'Generate new token (classic)'")
        print("3️⃣  Name: 'GitHub Repos Downloader'")
        print("4️⃣  Select scope: Check ✅ 'repo' (full control of repositories)")
        print("5️⃣  Scroll down → Click: 'Generate token'")
        print("6️⃣  COPY the token immediately (won't show again!)")
        print("\n⚠️  IMPORTANT: Token will start with 'ghp_' (e.g., ghp_abc123xyz)")

        print("\n" + "-"*70)
        response = input("\nDo you have your token ready? (y/n): ").strip().lower()

        if response != "y":
            print("Please create a token at: https://github.com/settings/tokens")
            print("Then run this script again")
            sys.exit(1)

        print("\n📋 Paste your token below:")
        print("(Token will NOT be shown as you type - this is normal)")
        print("(Token will NOT be stored or saved anywhere)")

        import getpass
        token = getpass.getpass("\n🔑 GitHub Personal Access Token: ").strip()

        if not token:
            print("❌ Token is required if you chose 'yes'")
            return self.setup_token()

        if not token.startswith("ghp_"):
            print("⚠️  Warning: Token should start with 'ghp_'")
            print("Double-check you copied it correctly from GitHub")

        print("✅ Token saved for this session (will not be stored)")
        self.token = token
        return token

    def get_output_directory(self):
        """Get output directory from user"""
        print("\n" + "-"*70)
        print("Output Directory".center(70))
        print("-"*70 + "\n")

        default_dir = "github_repos"
        print(f"Where should repos be downloaded?")
        print(f"Default: {default_dir}")

        response = input("\nOutput directory (press Enter for default): ").strip()

        if not response:
            response = default_dir

        output_dir = Path(response).expanduser()

        print(f"✅ Output directory: {output_dir.absolute()}")
        return str(output_dir)

    def show_summary(self):
        """Show configuration summary before running"""
        print("\n" + "="*70)
        print("Configuration Summary".center(70))
        print("="*70 + "\n")

        print(f"Platform:        {self.platform_name}")
        print(f"Python:          {'✅ OK' if self.python_ok else '❌ Not available'}")
        print(f"Git:             {'✅ OK' if self.git_ok else '❌ Not available'}")
        print(f"GitHub Username: {self.username}")
        print(f"Token:           {'✅ Provided' if self.token else '⚠️  Not provided (public repos only)'}")

        print("\n" + "="*70)
        response = input("\nReady to download repos? (y/n): ").strip().lower()

        return response == "y"

    def run_downloader(self, output_dir):
        """Run the actual downloader script"""
        print("\n" + "="*70)
        print("Starting Download".center(70))
        print("="*70 + "\n")

        # Build command
        cmd = [
            sys.executable,
            "download_all_repos.py",
            "--username", self.username,
            "--output", output_dir
        ]

        if self.token:
            cmd.extend(["--token", self.token])

        print(f"Running: {' '.join(cmd[1:])}\n")

        try:
            result = subprocess.run(cmd, check=False)
            sys.exit(result.returncode)
        except Exception as e:
            print(f"❌ Error running downloader: {e}")
            sys.exit(1)

    def run(self):
        """Execute the setup wizard"""
        self.print_header()

        # Check Python
        if not self.check_python():
            if not self.prompt_install_python():
                print("\n⚠️  Falling back to alternative scripts...")
                self.suggest_alternatives()
                sys.exit(1)

        # Check Git
        if not self.check_git():
            self.prompt_install_git()

        # Get GitHub username
        self.get_github_username()

        # Get GitHub token (optional)
        self.prompt_github_token()

        # Get output directory
        output_dir = self.get_output_directory()

        # Show summary
        if not self.show_summary():
            print("\nCancelled by user")
            sys.exit(0)

        # Run downloader
        self.run_downloader(output_dir)

    def suggest_alternatives(self):
        """Suggest alternative scripts if Python not available"""
        print("\n" + "!"*70)
        print("Alternative Scripts Available".center(70))
        print("!"*70 + "\n")

        if self.platform_name == "Windows":
            print("Use PowerShell Script instead:")
            print("  Command: .\\download_all_repos.ps1 -Username asif530")
            print("\nOr install Python from: https://www.python.org/downloads/")

        elif self.platform_name == "Darwin":  # Mac
            print("Use Bash Script instead:")
            print("  Command: ./download_all_repos.sh asif530")
            print("\nOr install Python:")
            print("  Command: brew install python3")

        else:  # Linux
            print("Use Bash Script instead:")
            print("  Command: ./download_all_repos.sh asif530")
            print("\nOr install Python:")
            print("  Command: sudo apt-get install python3")


def main():
    """Main entry point"""
    try:
        wizard = SetupWizard()
        wizard.run()
    except KeyboardInterrupt:
        print("\n\n⚠️  Cancelled by user")
        sys.exit(0)
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
