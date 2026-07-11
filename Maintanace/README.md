# Career Portfolio - GitHub Repository Showcase

A modern, automated portfolio website showcasing all 63+ GitHub repositories with real-time search, filtering, and daily auto-sync from GitHub API.

**Live Site**: [asif530.github.io/portfolio](https://asif530.github.io/portfolio)

---

## ✨ Features

### Core Features
- ✅ **Automatic Daily Sync** - GitHub Actions fetches latest repos every day at midnight UTC
- ✅ **All 63+ Repositories** - Display complete repository listing
- ✅ **Full Repository Details** - Name, description, language, stars, forks, topics, last updated
- ✅ **Real-time Search** - Search by repository name or description
- ✅ **Smart Filtering** - Filter by technology/language, category, and sort options
- ✅ **Dual Layout** - Card view (default) and Table/List view with toggle
- ✅ **Dark Mode** - Toggle between light and dark themes
- ✅ **New Repo Detection** - Automatic detection and notification of new repositories
- ✅ **Copy Links** - One-click copy repository links to clipboard
- ✅ **Responsive Design** - Fully responsive on desktop, tablet, and mobile
- ✅ **Professional Profile** - User profile section with bio and social links
- ✅ **About Section** - Skills, technologies, and expertise showcase
- ✅ **Contact Information** - Email and social media links

### Technical Features
- ✅ **Zero Backend** - Fully static site (no server needed)
- ✅ **Zero Database** - Uses GitHub as data source
- ✅ **GitHub Pages Hosting** - Free, fast, and reliable hosting
- ✅ **GitHub Actions Automation** - Automatic daily sync with zero configuration
- ✅ **Secure Token Handling** - Uses GitHub's built-in GITHUB_TOKEN (safe, temporary)
- ✅ **SEO Optimized** - Meta tags, semantic HTML, open graph tags
- ✅ **Accessibility** - WCAG AA compliant, keyboard navigation
- ✅ **Fast Load Time** - Optimized assets, minimal dependencies

---

## 📁 Project Structure

```
career-portfolio/
├── .github/
│   └── workflows/
│       └── sync-repos.yml              # Daily GitHub Actions workflow
├── index.html                          # Main portfolio page
├── script.js                           # JavaScript logic (all features)
├── styles.css                          # Custom styles
├── repos.json                          # Generated repository data (auto-updated)
├── repos-previous.json                 # Previous day's repos (for comparison)
├── .gitignore                          # Git ignore patterns
├── README.md                           # This file
└── LICENSE                             # MIT License (optional)
```

---

## 🚀 Getting Started

### Prerequisites
- GitHub account
- Git installed locally
- Basic knowledge of GitHub and command line

### Setup Instructions

#### Step 1: Create GitHub Repository

1. Go to [github.com/new](https://github.com/new)
2. Create new repository:
   - Name: `career-portfolio`
   - Description: "GitHub Portfolio - Showcasing my 63+ repositories"
   - Public: Yes
   - Add README: No (we have one)

#### Step 2: Clone This Repository Locally

```bash
cd /path/to/your/projects
git clone <this-repository-url> career-portfolio
cd career-portfolio
```

Or, copy all the files from `/home/asif-kamal-chowdhury/Downloads/career-portfolio/` to your new repo.

#### Step 3: Update Git Configuration

```bash
git config user.name "Your Name"
git config user.email "your-email@example.com"
```

#### Step 4: Connect to Your GitHub Repository

```bash
git remote set-url origin https://github.com/asif530/career-portfolio.git
# Or if using SSH:
git remote set-url origin git@github.com:asif530/career-portfolio.git
```

#### Step 5: Push Initial Commit

```bash
git add .
git commit -m "Initial commit: Career Portfolio website setup"
git push -u origin main
```

#### Step 6: Enable GitHub Pages

1. Go to your repository on GitHub
2. Settings → Pages
3. Select "Deploy from a branch"
4. Select branch: "main"
5. Select folder: "/" (root)
6. Click Save
7. Wait 1-2 minutes for deployment

#### Step 7: Verify Deployment

1. Go to `https://asif530.github.io/career-portfolio`
2. Your portfolio should be live!
3. Check GitHub Actions tab to see the first sync workflow

---

## 🔄 How It Works

### GitHub Actions Workflow

The `.github/workflows/sync-repos.yml` workflow runs automatically:

1. **Trigger**: Every day at 00:00 UTC (or manually via GitHub UI)
2. **Fetch**: Retrieves all your repositories from GitHub API
3. **Compare**: Compares with previous day's data
4. **Detect**: Identifies new repositories
5. **Generate**: Creates `repos.json` with all repository details
6. **Commit**: Commits changes to GitHub
7. **Deploy**: GitHub Pages automatically redeploys

**Total runtime**: ~1 minute

### Data Flow

```
Your GitHub Repos
       ↓
GitHub Actions (daily)
       ↓
Fetch GitHub API
       ↓
Compare with previous
       ↓
Generate repos.json
       ↓
Commit to GitHub
       ↓
GitHub Pages (auto-deploy)
       ↓
Live Portfolio
       ↓
Browser (real-time search, filter, view)
```

---

## 🎨 Customization

### Profile Section
Edit `index.html` to update:
- Profile image URL (line ~52)
- Name and title
- Bio/description
- Social media links

### Styling
Edit `styles.css` to customize:
- Colors and fonts
- Layout and spacing
- Dark mode appearance
- Hover effects

### JavaScript
Edit `script.js` to modify:
- Filtering logic
- Sorting options
- Notification behavior
- Any interactive features

---

## 📊 repos.json Format

The GitHub Actions workflow generates `repos.json` with this structure:

```json
{
  "repos": [
    {
      "id": 123456789,
      "name": "grpc-springboot3-netdevh",
      "full_name": "asif530/grpc-springboot3-netdevh",
      "description": "Reference implementation for Spring Boot 3.x with gRPC",
      "url": "https://api.github.com/repos/asif530/grpc-springboot3-netdevh",
      "html_url": "https://github.com/asif530/grpc-springboot3-netdevh",
      "language": "Java",
      "stargazers_count": 5,
      "forks_count": 2,
      "created_at": "2026-01-15T10:00:00Z",
      "updated_at": "2026-07-09T15:30:00Z",
      "topics": ["grpc", "spring-boot", "java"],
      "visibility": "public"
    },
    // ... more repos
  ],
  "metadata": {
    "totalCount": 63,
    "lastUpdated": "2026-07-09T00:00:00Z",
    "newReposFound": 0
  }
}
```

---

## 🔐 Security

### Token Security
- Uses GitHub's built-in `secrets.GITHUB_TOKEN`
- Token is **temporary** (expires after workflow completes)
- Token is **read-only** (cannot modify repositories)
- Token is **not stored** anywhere
- Token is **automatically rotated** by GitHub
- **No manual token management needed**

### Best Practices
- Never commit tokens to repository
- Use GitHub Secrets for any API keys
- Review Actions logs (tokens are masked)
- Tokens are safe and secure by default

---

## 📱 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

---

## 🔧 Troubleshooting

### Repos Not Appearing
- Wait for first GitHub Actions workflow to complete
- Check GitHub Actions tab for any errors
- Verify `repos.json` was created
- Check browser console for errors (F12)

### GitHub Actions Not Running
- Verify workflow file is in `.github/workflows/sync-repos.yml`
- Check Actions tab for any errors
- Ensure repository is public (required for GitHub Pages)
- Re-run workflow manually: Actions → Sync GitHub Repos → Run workflow

### Dark Mode Not Working
- Check browser's local storage is enabled
- Try clearing cache and refreshing
- Check browser console for errors

### Search/Filter Not Working
- Verify `repos.json` is loaded (check Network tab in DevTools)
- Check JavaScript is enabled in browser
- Check browser console for any errors

---

## 📈 Future Enhancements

Planned features for future phases:
- [ ] Blog section with markdown articles
- [ ] Individual project detailed pages
- [ ] Resume/CV download
- [ ] Visitor analytics
- [ ] GitHub API rate limiting info
- [ ] Social media integration
- [ ] Email subscription

---

## 📝 License

This project is open source and available under the MIT License.

---

## 🤝 Contributing

This is a personal portfolio, but feel free to:
- Fork and create your own version
- Suggest improvements
- Report bugs
- Share ideas

---

## 📞 Contact

- **Email**: [asifkamal530@gmail.com](mailto:asifkamal530@gmail.com)
- **GitHub**: [asif530](https://github.com/asif530)
- **LinkedIn**: [asif530](https://linkedin.com/in/asif530)

---

## 📚 Resources

- [GitHub API Documentation](https://docs.github.com/en/rest)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [Bootstrap 5 Documentation](https://getbootstrap.com/docs)

---

**Last Updated**: July 9, 2026  
**Status**: Phase 1 - Repository Setup Complete ✅

---

**Ready for Phase 2? The GitHub Actions workflow will auto-sync your repos daily!** 🚀
