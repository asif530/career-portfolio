# Download All GitHub Repositories - Complete Guide

**Why?** To create a local backup of all your GitHub repositories and access them offline.

**What?** Three cross-platform scripts (Python, Bash, PowerShell) that download all your GitHub repos automatically.

**How?** Choose one script based on your platform and follow the setup steps.

---

## 🚀 Quick Start

### Pick Your Script

| Platform | Recommended | Backup Options |
|----------|------------|-----------------|
| **Windows** | PowerShell (`.ps1`) | Python (`.py`) |
| **Mac** | Bash (`.sh`) or Python | Python (`.py`) |
| **Linux** | Bash (`.sh`) or Python | Python (`.py`) |

---

## 📋 System Requirements

### All Platforms Require

1. **Git** installed and in PATH
   - Windows: [Download here](https://git-scm.com/download/win)
   - Mac: `brew install git`
   - Linux: `sudo apt-get install git`

   **Verify**: Run `git --version` in terminal/command prompt

2. **GitHub Account** with repos to download

### Python Script (`.py`) Additional Requirements

- **Python 3.7+** installed
  - Windows: [Download here](https://www.python.org/)
  - Mac: `brew install python3`
  - Linux: `sudo apt-get install python3`

  **Verify**: Run `python3 --version`

### Bash Script (`.sh`) Additional Requirements

- **Bash shell** (Mac/Linux default, Windows needs WSL or Git Bash)
- **curl** installed
  - Linux: `sudo apt-get install curl`
  - Mac: Usually pre-installed
  - Windows: Use Git Bash (included with Git)

  **Verify**: Run `curl --version`

### PowerShell Script (`.ps1`) Additional Requirements

- **PowerShell 5.0+** (Windows 10+ has this)
  - Older Windows: [Download PowerShell 5](https://www.microsoft.com/en-us/download/details.aspx?id=50395)

  **Verify**: Run `$PSVersionTable.PSVersion` in PowerShell

---

## 🔐 Authentication Setup

You have **3 authentication options**:

### Option 1: Personal Access Token (⭐ Recommended)

**Easiest and most flexible**

**Setup Steps:**
1. Go to: https://github.com/settings/tokens
2. Click "Generate new token" → "Generate new token (classic)"
3. Name it: `GitHub Repos Downloader`
4. Select scope: Check ✅ `repo` (full control of private repositories)
5. Click "Generate token"
6. **Copy the token immediately** (it won't show again!)
7. Use this token in the scripts

**Token Example**: `ghp_1234567890abcdefghijklmnopqrstuv`

**Pros**:
- ✅ Works on Windows, Mac, Linux
- ✅ Can limit permissions (only `repo` scope)
- ✅ Easy to revoke if compromised
- ✅ Can set expiration date

**Cons**:
- ⚠️ Token could be seen in command history
- ⚠️ Need to regenerate when expired

### Option 2: SSH Key (🔐 Most Secure)

**Most secure, no token needed**

**Setup Steps:**
1. Check if you have SSH key: `ls ~/.ssh/id_rsa`
2. If not, create one:
   ```bash
   ssh-keygen -t rsa -b 4096 -f ~/.ssh/id_rsa -N ""
   ```
3. Copy public key to GitHub:
   - Get key: `cat ~/.ssh/id_rsa.pub`
   - Go to: https://github.com/settings/keys
   - Click "New SSH key"
   - Paste the key content
   - Click "Add SSH key"
4. Test connection: `ssh -T git@github.com`
5. Use `--ssh` flag with scripts

**Pros**:
- ✅ No token needed
- ✅ Most secure
- ✅ No expiration
- ✅ Works for authentication and authorization

**Cons**:
- ⚠️ More setup required
- ⚠️ Need to keep private key safe
- ⚠️ Cannot easily limit permissions

### Option 3: HTTPS Password (❌ Not Recommended)

**Legacy, less secure**

Uses GitHub username + Personal Access Token as HTTPS password

**Not recommended** because:
- ❌ Password visible in git history
- ❌ No way to limit permissions
- ❌ Harder to revoke if leaked

---

## 💻 Running the Scripts

### Python Script (All Platforms)

**Simplest option - works everywhere**

**Basic Usage:**
```bash
# Interactive (will prompt for token)
python3 download_all_repos.py --username asif530

# With token (no prompt)
python3 download_all_repos.py --username asif530 --token ghp_xxxxx

# With SSH
python3 download_all_repos.py --username asif530 --ssh

# Custom output directory
python3 download_all_repos.py --username asif530 --output my_repos --token ghp_xxxxx
```

**Windows (Command Prompt or PowerShell)**:
```powershell
python download_all_repos.py --username asif530 --token ghp_xxxxx
```

**Mac/Linux (Terminal)**:
```bash
python3 download_all_repos.py --username asif530 --token ghp_xxxxx
```

---

### Bash Script (Mac/Linux/WSL)

**Fast, no extra dependencies**

**Make executable first:**
```bash
chmod +x download_all_repos.sh
```

**Basic Usage:**
```bash
# Interactive (will prompt for token)
./download_all_repos.sh asif530

# With custom output directory
./download_all_repos.sh asif530 my_repos

# With token
./download_all_repos.sh asif530 my_repos ghp_xxxxx

# With SSH
./download_all_repos.sh asif530 --ssh
```

**Windows (Git Bash):**
1. Right-click in folder → "Git Bash Here"
2. Run: `bash download_all_repos.sh asif530 --token ghp_xxxxx`

---

### PowerShell Script (Windows)

**Windows native, no bash needed**

**Allow Script Execution** (first time only):
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

**Basic Usage:**
```powershell
# Interactive (will prompt for token)
.\download_all_repos.ps1 -Username asif530

# With token
.\download_all_repos.ps1 -Username asif530 -Token ghp_xxxxx

# With custom output directory
.\download_all_repos.ps1 -Username asif530 -OutputDir my_repos -Token ghp_xxxxx

# With SSH
.\download_all_repos.ps1 -Username asif530 -UseSsh
```

---

## 📊 Usage Examples

### Example 1: Download All Repos (Token Method)

**Windows (PowerShell):**
```powershell
.\download_all_repos.ps1 -Username asif530 -Token ghp_abc123xyz789
```

**Mac/Linux (Bash):**
```bash
./download_all_repos.sh asif530 "" ghp_abc123xyz789
```

**All Platforms (Python):**
```bash
python3 download_all_repos.py --username asif530 --token ghp_abc123xyz789
```

### Example 2: Download with Custom Directory

**Windows:**
```powershell
.\download_all_repos.ps1 -Username asif530 -OutputDir C:\my_repos -Token ghp_abc123xyz789
```

**Mac/Linux:**
```bash
./download_all_repos.sh asif530 ~/my_repos ghp_abc123xyz789
```

**Python:**
```bash
python3 download_all_repos.py --username asif530 --output ~/my_repos --token ghp_abc123xyz789
```

### Example 3: Use SSH (Most Secure)

**Windows:**
```powershell
.\download_all_repos.ps1 -Username asif530 -UseSsh
```

**Mac/Linux:**
```bash
./download_all_repos.sh asif530 --ssh
```

**Python:**
```bash
python3 download_all_repos.py --username asif530 --ssh
```

### Example 4: Interactive (Prompts for Token)

**Windows:**
```powershell
.\download_all_repos.ps1 -Username asif530
# Then paste token when prompted
```

**Mac/Linux:**
```bash
./download_all_repos.sh asif530
# Then paste token when prompted
```

**Python:**
```bash
python3 download_all_repos.py --username asif530
# Then paste token when prompted
```

---

## 📁 What Gets Downloaded

Each script creates a folder structure like:

```
github_repos/
├── repo-name-1/
│   ├── .git/
│   ├── src/
│   ├── README.md
│   └── ... (all files)
├── repo-name-2/
│   ├── .git/
│   ├── src/
│   └── ... (all files)
├── grpc-springboot3-netdevh/
├── elasticsearch-spring-boot/
└── ... (63+ more repos)
```

**What's included:**
- ✅ All files and folders
- ✅ Full commit history (`.git` folder)
- ✅ All branches
- ✅ All tags

**Total size:** Depends on your repos (could be 100MB - 5GB+)

---

## 🔍 Troubleshooting

### "Git is not installed"

**Windows:**
- Download: https://git-scm.com/download/win
- Run installer
- Restart terminal
- Verify: `git --version`

**Mac:**
```bash
brew install git
```

**Linux:**
```bash
sudo apt-get install git
```

### "Invalid token or permission denied"

1. Verify token is correct (copy again from GitHub)
2. Check token has `repo` scope
3. Verify username is correct
4. Try creating new token if old one expired

### "User 'asif530' not found"

- Verify username spelling (case-sensitive)
- Check GitHub username at: https://github.com/settings/profile

### "curl: command not found" (Bash script)

**Mac:**
```bash
brew install curl
```

**Linux:**
```bash
sudo apt-get install curl
```

**Windows:** Use Git Bash (comes with Git) or use Python script instead

### "Permission denied" (Bash script)

Make script executable:
```bash
chmod +x download_all_repos.sh
```

### PowerShell: "cannot be loaded because running scripts is disabled"

Run this in PowerShell (admin):
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Slow download speed

- Normal: ~1-5 repos per minute (depending on repo size)
- Large repos: Can take several hours
- Check: Look at file sizes in `repos.json`
- Solution: Let it run overnight, don't interrupt

### Some repos fail to clone

- Check GitHub Actions logs for errors
- Verify network connection
- Retry: Just run script again (skips already-cloned repos)
- Manual: Clone failing repos with `git clone <url>`

---

## 🛡️ Security Tips

### Token Safety

**❌ Do NOT:**
- Don't share your token with anyone
- Don't commit token to git repositories
- Don't paste token in public forums
- Don't leave token in command history

**✅ Do:**
- Keep token secret and secure
- Revoke token if accidentally exposed
- Use SSH key for additional security
- Regenerate token periodically (monthly)

**If token is compromised:**
1. Go to: https://github.com/settings/tokens
2. Click "Delete" on the compromised token
3. Create a new token
4. Update your script

### Command History

**Remove token from command history:**

**Bash/Linux/Mac:**
```bash
# Delete last command from history
history -d $((HISTCMD-1))

# Or use HISTCONTROL to ignore sensitive commands
export HISTCONTROL=ignorespace
# Then prefix sensitive commands with space: " ./script.sh ..."
```

**PowerShell (Windows):**
```powershell
# PowerShell doesn't store command history by default between sessions
# But to be safe, use interactive prompt instead of hardcoding token
```

**Python:**
```bash
# Token is read from stdin/env, not visible in arguments
python3 download_all_repos.py --username asif530  # Will prompt for token
```

---

## 📊 What to Do After Download

### Backup the Repos

```bash
# Create a tar archive (Mac/Linux)
tar -czf github_repos_backup.tar.gz github_repos/

# Create a zip archive (Windows)
Compress-Archive -Path github_repos -DestinationPath github_repos_backup.zip
```

### Sync Regularly

Set up a cron job (Mac/Linux) or Task Scheduler (Windows) to run monthly:

**Mac/Linux (crontab):**
```bash
# First, add script to crontab
crontab -e

# Add this line (runs first day of month at 2 AM):
0 2 1 * * /path/to/download_all_repos.sh asif530 /path/to/github_repos ghp_xxxxx
```

**Windows (Task Scheduler):**
1. Open Task Scheduler
2. Create Basic Task
3. Set trigger: Monthly (first day)
4. Set action: `powershell.exe -ExecutionPolicy Bypass -File "C:\path\to\download_all_repos.ps1" -Username asif530 -Token ghp_xxxxx`

### Analyze Your Repos

```bash
# Count total lines of code
find github_repos -type f -name "*.java" -o -name "*.py" -o -name "*.js" | xargs wc -l

# List largest repos
du -sh github_repos/*/ | sort -rh | head -10

# Find most recently updated
ls -ltr github_repos/
```

---

## 📚 Additional Resources

- [GitHub API Docs](https://docs.github.com/en/rest)
- [Git Documentation](https://git-scm.com/doc)
- [Personal Access Tokens](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token)
- [SSH Keys Setup](https://docs.github.com/en/authentication/connecting-to-github-with-ssh)

---

## 🆘 Still Having Issues?

1. **Check prerequisites**: Run `git --version`, `python3 --version`, `curl --version`
2. **Verify authentication**: Test token/SSH manually with `git clone`
3. **Check network**: Ensure you have internet connection
4. **Read error messages**: Script prints detailed errors
5. **Retry**: Network issues are often temporary
6. **Check GitHub Status**: https://www.githubstatus.com/

---

**Last Updated**: July 9, 2026  
**Compatible**: Windows, Mac, Linux  
**Supported Authentication**: Token, SSH, HTTPS

