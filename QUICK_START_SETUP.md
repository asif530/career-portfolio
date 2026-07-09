# Quick Start - Download Your GitHub Repos

**Easiest way to get started** (Recommended)

---

## 🚀 One-Command Setup

### Windows (PowerShell)
```powershell
python setup_and_download.py
```

### Mac/Linux (Terminal)
```bash
python3 setup_and_download.py
```

---

## ❓ What This Script Does

✅ **Checks everything** - Python, Git, system requirements  
✅ **Prompts if missing** - Offers to help install missing tools  
✅ **Guides you through setup** - Step-by-step instructions  
✅ **Explains options** - Token, SSH, directory choices  
✅ **No manual configuration** - Everything interactive  

---

## 📋 What You Need

### Absolutely Required
- ✅ **Git** installed on your computer
  - Check: `git --version`
  - Download: https://git-scm.com/download

### Recommended  
- ✅ **Python 3.7+** (for easiest experience)
  - Check: `python3 --version`
  - Download: https://www.python.org/downloads/

### Optional
- GitHub Personal Access Token (recommended but not required)
  - For public repos: Can skip this
  - For faster downloads: Recommended

---

## 🎯 Interactive Flow

When you run the script, it will:

```
1. Check if Python 3 installed
   ↓ If NO → Ask if you want to download it
   
2. Check if Git installed  
   ↓ If NO → Tell you to install it first
   
3. Ask for your GitHub username
   
4. Ask if you want to use a token
   ↓ If YES → Explain how to create one
   ↓ If NO → Proceed without token (public repos)
   
5. Ask where to save the repos
   ↓ Default: ./github_repos
   
6. Show summary
   ↓ Confirm you're ready
   
7. Start downloading all repos!
```

---

## 📱 Token: Optional or Required?

### ✅ Without Token (Free, Simple)
- Works perfectly
- Downloads all PUBLIC repositories
- 60 API requests per hour (usually enough)
- No account/authentication needed

**Good for**: Quick backup, learning, most use cases

### ✅ With Token (Faster, More Reliable)
- 5,000 API requests per hour (way more)
- Can download PRIVATE repositories
- Slightly faster downloads
- Need to create token first (2 minutes)

**Good for**: Frequent backups, private repos, heavy use

---

## 🔐 Creating Token (If You Want It)

**Takes 2 minutes:**

1. Go to: https://github.com/settings/tokens
2. Click: "Generate new token" → "Generate new token (classic)"
3. Name: "GitHub Repos Downloader"
4. Select scope: Check ✅ `repo`
5. Click: "Generate token"
6. **Copy it** (won't show again)
7. **Paste when prompted** in the script

---

## 📊 Expected Results

After running:

```
✅ Check Python → Found (or suggest download)
✅ Check Git → Found  
✅ GitHub username → asif530
✅ Token → Not provided (public repos only)
✅ Output directory → ./github_repos

Ready? YES ↓

Starting downloads...
[1/63] Cloning grpc-springboot3-netdevh... ✅
[2/63] Cloning elasticsearch-spring-boot... ✅
[3/63] Cloning career-portfolio... ✅
... (continues for all 63 repos)

Download Complete!
✅ Successfully downloaded: 63
❌ Failed: 0
⏭️  Skipped: 0
📁 Location: /home/user/github_repos
```

---

## ⏱️ Time Required

| Scenario | Time |
|----------|------|
| First run (all checks) | 2-3 minutes |
| Actually downloading | 5-30 minutes* |
| **Total** | **7-33 minutes** |

*Depends on total size of your repos

---

## 🆘 If Something Goes Wrong

### "Python is not installed"
→ Script offers to help (with download link)

### "Git is not installed"  
→ Script tells you exactly what to do

### "Download failed midway"
→ Run script again (skips already-downloaded)

### "Token is wrong"
→ Script will show you how to create new one

### Any other error
→ Check the error message (usually very clear)

---

## 🎬 Ready to Go?

```bash
# Just run this ONE command:
python3 setup_and_download.py

# Or on Windows:
python setup_and_download.py

# Then follow the prompts!
```

---

## 📁 Result

After completion, you'll have:

```
github_repos/
├── repo-1/
│   ├── .git/        (full history)
│   ├── src/         (code)
│   └── ...
├── repo-2/
├── repo-3/
└── ... (63+ repos)
```

✅ **All repos downloaded with full git history**  
✅ **Offline access to your code**  
✅ **Ready to analyze or backup**

---

## 🆘 Need Alternative?

If Python doesn't work for you:

**Use Bash Script** (Mac/Linux):
```bash
chmod +x download_all_repos.sh
./download_all_repos.sh asif530
```

**Use PowerShell** (Windows):
```powershell
.\download_all_repos.ps1 -Username asif530
```

---

## 💡 Pro Tips

**Tip 1**: Run overnight  
→ Large repos take time, let it run while you sleep

**Tip 2**: Create backup  
→ After download completes, zip the folder as backup

**Tip 3**: Schedule monthly sync  
→ Set up automatic downloads every month

**Tip 4**: Use SSH for security  
→ More secure than token (if you're comfortable with it)

---

**That's it!** Just one command to get started. 🚀

