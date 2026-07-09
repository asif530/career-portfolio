// GitHub Portfolio - Main JavaScript
// This file contains all the logic for the portfolio

// Global state
let allRepos = [];
let filteredRepos = [];
let currentLayout = 'card'; // 'card' or 'table'
let darkMode = false;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    console.log('Initializing GitHub Portfolio...');

    // Load saved preferences
    initializeDarkMode();
    loadSavedLayout();

    // Load repositories
    loadRepositories();

    // Setup event listeners
    setupEventListeners();

    // Check for new repos
    checkForNewRepos();
});

/**
 * Load repositories from repos.json
 */
function loadRepositories() {
    console.log('Loading repositories...');

    fetch('repos.json')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            allRepos = data.repos || [];
            console.log(`Loaded ${allRepos.length} repositories`);

            // Update last updated time
            if (data.metadata) {
                updateLastUpdatedTime(data.metadata.lastUpdated);
            }

            // Render repositories
            renderRepositories(allRepos);

            // Populate filter options
            populateFilters();

            // Show new repo notification if any
            if (data.metadata && data.metadata.newReposFound > 0) {
                showNotification(`🎉 Found ${data.metadata.newReposFound} new repository(ies)!`);
            }
        })
        .catch(error => {
            console.error('Error loading repositories:', error);
            showError('Failed to load repositories. Please try again later.');
        });
}

/**
 * Render repositories based on current layout
 */
function renderRepositories(repos) {
    console.log(`Rendering ${repos.length} repositories in ${currentLayout} view`);

    if (currentLayout === 'card') {
        renderCardView(repos);
    } else {
        renderTableView(repos);
    }

    // Update result counter
    updateResultCount(repos.length);

    // Show empty state if no repos
    if (repos.length === 0) {
        document.getElementById('emptyState').style.display = 'block';
        document.getElementById('cardView').innerHTML = '';
        document.getElementById('tableBody').innerHTML = '';
    } else {
        document.getElementById('emptyState').style.display = 'none';
    }
}

/**
 * Render repositories as cards
 */
function renderCardView(repos) {
    const cardView = document.getElementById('cardView');
    cardView.innerHTML = '';

    repos.forEach(repo => {
        const card = createRepoCard(repo);
        cardView.appendChild(card);
    });
}

/**
 * Render repositories as table
 */
function renderTableView(repos) {
    const tableBody = document.getElementById('tableBody');
    tableBody.innerHTML = '';

    repos.forEach(repo => {
        const row = createTableRow(repo);
        tableBody.appendChild(row);
    });
}

/**
 * Create a repository card element
 */
function createRepoCard(repo) {
    const col = document.createElement('div');
    col.className = 'col-md-4';

    const card = document.createElement('div');
    card.className = 'card repo-card h-100';

    const body = document.createElement('div');
    body.className = 'card-body';

    // Title and copy button
    const titleDiv = document.createElement('div');
    titleDiv.className = 'd-flex justify-content-between align-items-start mb-2';

    const titleLink = document.createElement('a');
    titleLink.href = repo.html_url;
    titleLink.target = '_blank';
    titleLink.className = 'repo-name h5 card-title';
    titleLink.textContent = repo.name;

    const copyBtn = document.createElement('button');
    copyBtn.className = 'btn btn-sm btn-outline-secondary copy-btn';
    copyBtn.title = 'Copy link';
    copyBtn.innerHTML = '<i class="fas fa-copy"></i>';
    copyBtn.onclick = (e) => {
        e.preventDefault();
        copyToClipboard(repo.html_url);
    };

    titleDiv.appendChild(titleLink);
    titleDiv.appendChild(copyBtn);
    body.appendChild(titleDiv);

    // Description
    const desc = document.createElement('p');
    desc.className = 'card-text text-muted';
    desc.textContent = repo.description || 'No description provided';
    body.appendChild(desc);

    // Language and topics
    if (repo.language || (repo.topics && repo.topics.length > 0)) {
        const tagsDiv = document.createElement('div');
        tagsDiv.className = 'mb-2';

        if (repo.language) {
            const badge = document.createElement('span');
            badge.className = 'badge bg-primary me-1';
            badge.textContent = repo.language;
            tagsDiv.appendChild(badge);
        }

        if (repo.topics && repo.topics.length > 0) {
            repo.topics.forEach(topic => {
                const badge = document.createElement('span');
                badge.className = 'badge bg-secondary me-1';
                badge.textContent = topic;
                tagsDiv.appendChild(badge);
            });
        }

        body.appendChild(tagsDiv);
    }

    // Stats
    const stats = document.createElement('small');
    stats.className = 'text-muted d-block mb-2';
    stats.innerHTML = `
        ⭐ ${repo.stargazers_count} |
        🍴 ${repo.forks_count} |
        Updated ${formatDate(repo.updated_at)}
    `;
    body.appendChild(stats);

    // GitHub link button
    const btn = document.createElement('a');
    btn.href = repo.html_url;
    btn.target = '_blank';
    btn.className = 'btn btn-sm btn-primary';
    btn.innerHTML = 'View on GitHub →';
    body.appendChild(btn);

    card.appendChild(body);
    col.appendChild(card);

    return col;
}

/**
 * Create a table row for repository
 */
function createTableRow(repo) {
    const row = document.createElement('tr');

    const nameCell = document.createElement('td');
    const nameLink = document.createElement('a');
    nameLink.href = repo.html_url;
    nameLink.target = '_blank';
    nameLink.textContent = repo.name;
    nameCell.appendChild(nameLink);

    const descCell = document.createElement('td');
    descCell.textContent = repo.description || '—';

    const langCell = document.createElement('td');
    langCell.innerHTML = repo.language ?
        `<span class="badge bg-primary">${repo.language}</span>` : '—';

    const starsCell = document.createElement('td');
    starsCell.textContent = repo.stargazers_count;

    const updatedCell = document.createElement('td');
    updatedCell.textContent = formatDate(repo.updated_at);

    const actionsCell = document.createElement('td');
    const copyBtn = document.createElement('button');
    copyBtn.className = 'btn btn-sm btn-outline-secondary';
    copyBtn.innerHTML = '<i class="fas fa-copy"></i>';
    copyBtn.onclick = (e) => {
        e.preventDefault();
        copyToClipboard(repo.html_url);
    };
    actionsCell.appendChild(copyBtn);

    row.appendChild(nameCell);
    row.appendChild(descCell);
    row.appendChild(langCell);
    row.appendChild(starsCell);
    row.appendChild(updatedCell);
    row.appendChild(actionsCell);

    return row;
}

/**
 * Populate filter dropdowns
 */
function populateFilters() {
    // Get unique technologies/languages
    const languages = new Set();
    allRepos.forEach(repo => {
        if (repo.language) {
            languages.add(repo.language);
        }
    });

    const techFilter = document.getElementById('technologyFilter');
    languages.forEach(lang => {
        const option = document.createElement('option');
        option.value = lang;
        option.textContent = lang;
        techFilter.appendChild(option);
    });
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
    // Search input
    document.getElementById('searchInput').addEventListener('input', function() {
        filterAndRender();
    });

    // Technology filter
    document.getElementById('technologyFilter').addEventListener('change', function() {
        filterAndRender();
    });

    // Sort dropdown
    document.getElementById('sortBy').addEventListener('change', function() {
        filterAndRender();
    });

    // Dark mode toggle
    document.getElementById('darkModeToggle').addEventListener('click', function() {
        toggleDarkMode();
    });

    // Layout toggle
    document.getElementById('layoutToggle').addEventListener('click', function() {
        toggleLayout();
    });
}

/**
 * Filter and render repositories
 */
function filterAndRender() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const selectedTech = document.getElementById('technologyFilter').value;
    const sortBy = document.getElementById('sortBy').value;

    // Filter repositories
    filteredRepos = allRepos.filter(repo => {
        const matchesSearch = repo.name.toLowerCase().includes(searchTerm) ||
                            (repo.description && repo.description.toLowerCase().includes(searchTerm));
        const matchesTech = !selectedTech || repo.language === selectedTech;

        return matchesSearch && matchesTech;
    });

    // Sort repositories
    filteredRepos = sortRepositories(filteredRepos, sortBy);

    // Render
    renderRepositories(filteredRepos);
}

/**
 * Sort repositories
 */
function sortRepositories(repos, sortBy) {
    const sorted = [...repos];

    switch (sortBy) {
        case 'updated':
            sorted.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
            break;
        case 'created':
            sorted.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            break;
        case 'stars':
            sorted.sort((a, b) => b.stargazers_count - a.stargazers_count);
            break;
        case 'name':
            sorted.sort((a, b) => a.name.localeCompare(b.name));
            break;
    }

    return sorted;
}

/**
 * Toggle between card and table view
 */
function toggleLayout() {
    currentLayout = currentLayout === 'card' ? 'table' : 'card';
    localStorage.setItem('portfolioLayout', currentLayout);
    filterAndRender();
}

/**
 * Load saved layout preference
 */
function loadSavedLayout() {
    const saved = localStorage.getItem('portfolioLayout');
    if (saved) {
        currentLayout = saved;
    }
}

/**
 * Toggle dark mode
 */
function toggleDarkMode() {
    darkMode = !darkMode;
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('portfolioDarkMode', darkMode);

    // Update button icon
    const icon = document.querySelector('#darkModeToggle i');
    icon.className = darkMode ? 'fas fa-sun' : 'fas fa-moon';
}

/**
 * Initialize dark mode from saved preference
 */
function initializeDarkMode() {
    const saved = localStorage.getItem('portfolioDarkMode');
    if (saved === 'true') {
        darkMode = true;
        document.body.classList.add('dark-mode');
        document.querySelector('#darkModeToggle i').className = 'fas fa-sun';
    }
}

/**
 * Copy text to clipboard
 */
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showNotification('Link copied to clipboard!');
    }).catch(err => {
        console.error('Failed to copy:', err);
    });
}

/**
 * Show notification
 */
function showNotification(message) {
    // Create bootstrap alert
    const alert = document.createElement('div');
    alert.className = 'alert alert-info alert-dismissible fade show';
    alert.setAttribute('role', 'alert');
    alert.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;

    // Insert at top of page
    const container = document.querySelector('.container');
    container.parentNode.insertBefore(alert, container);

    // Auto-dismiss after 3 seconds
    setTimeout(() => {
        alert.remove();
    }, 3000);
}

/**
 * Show error message
 */
function showError(message) {
    const alert = document.createElement('div');
    alert.className = 'alert alert-danger alert-dismissible fade show';
    alert.setAttribute('role', 'alert');
    alert.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;

    const container = document.querySelector('.container');
    container.parentNode.insertBefore(alert, container);
}

/**
 * Format date
 */
function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;

    // Convert to days
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'today';
    if (days === 1) return 'yesterday';
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    if (days < 365) return `${Math.floor(days / 30)} months ago`;

    return `${Math.floor(days / 365)} years ago`;
}

/**
 * Update last updated time in footer
 */
function updateLastUpdatedTime(lastUpdated) {
    document.getElementById('lastUpdated').textContent = formatDate(lastUpdated);
}

/**
 * Update result count
 */
function updateResultCount(count) {
    document.getElementById('resultCount').textContent =
        `${count} ${count === 1 ? 'repository' : 'repositories'} found`;
}

/**
 * Check for new repositories
 */
function checkForNewRepos() {
    const stored = JSON.parse(localStorage.getItem('lastRepos') || '[]');

    if (allRepos.length > 0 && stored.length > 0) {
        const newRepos = allRepos.filter(
            r => !stored.some(s => s.id === r.id)
        );

        if (newRepos.length > 0) {
            showNotification(`🎉 Found ${newRepos.length} new repository(ies)!`);
            localStorage.setItem('lastRepos', JSON.stringify(allRepos));
        }
    } else if (allRepos.length > 0) {
        localStorage.setItem('lastRepos', JSON.stringify(allRepos));
    }
}

/**
 * Clear all filters
 */
function clearFilters() {
    document.getElementById('searchInput').value = '';
    document.getElementById('technologyFilter').value = '';
    document.getElementById('sortBy').value = 'updated';
    filterAndRender();
}
