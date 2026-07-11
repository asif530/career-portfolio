// ============================================================
// GitHub Portfolio - Main JavaScript
// Loads repository data and drives search, filtering, sorting,
// layout switching, and dark mode for the portfolio page.
// ============================================================

// ============================================================
// Configuration / Constants
// ============================================================
const DATA_URL = 'repos.json';

const LAYOUT = {
    CARD: 'card',
    TABLE: 'table',
};

const SORT_BY = {
    UPDATED: 'updated',
    CREATED: 'created',
    STARS: 'stars',
    NAME: 'name',
};

const DEFAULT_SORT = SORT_BY.UPDATED;

const ALERT_TYPE = {
    INFO: 'info',
    DANGER: 'danger',
};

const STORAGE_KEYS = {
    LAYOUT: 'portfolioLayout',
    DARK_MODE: 'portfolioDarkMode',
    LAST_REPOS: 'lastRepos',
};

const NOTIFICATION_DURATION_MS = 3000;

// ============================================================
// Application State
// ============================================================
const state = {
    repositories: [],
    filteredRepositories: [],
    layout: LAYOUT.CARD,
    darkMode: false,
};

// ============================================================
// DOM Cache
// ============================================================
const dom = {};

function cacheDomElements() {
    dom.searchInput = document.getElementById('searchInput');
    dom.technologyFilter = document.getElementById('technologyFilter');
    dom.sortBy = document.getElementById('sortBy');
    dom.clearFiltersBtn = document.getElementById('clearFiltersBtn');
    dom.darkModeToggle = document.getElementById('darkModeToggle');
    dom.darkModeIcon = document.querySelector('#darkModeToggle i');
    dom.layoutToggle = document.getElementById('layoutToggle');
    dom.cardView = document.getElementById('cardView');
    dom.tableView = document.getElementById('tableView');
    dom.tableBody = document.getElementById('tableBody');
    dom.emptyState = document.getElementById('emptyState');
    dom.resultCount = document.getElementById('resultCount');
    dom.lastUpdated = document.getElementById('lastUpdated');
    // First ".container" in the DOM (inside the profile section) is used
    // as the anchor point for inserting alerts above the page content.
    dom.alertAnchor = document.querySelector('.container');
}

// ============================================================
// Initialization
// ============================================================
function initializeApp() {
    cacheDomElements();
    initializeDarkMode();
    loadSavedLayout();
    setupEventListeners();
    loadRepositories();
}

// ============================================================
// Data Loading
// ============================================================
async function loadRepositories() {
    try {
        const response = await fetch(DATA_URL);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        state.repositories = data.repos || [];

        if (data.metadata) {
            updateLastUpdatedTime(data.metadata.lastUpdated);
        }

        populateTechnologyFilter();
        applyFilters();

        if (data.metadata && data.metadata.newReposFound > 0) {
            showNotification(`🎉 Found ${data.metadata.newReposFound} new repository(ies)!`);
        }

        // Only compare against previously stored repos once loading has
        // actually succeeded, so we never flag "new" repos from empty state.
        checkForNewRepos();
    } catch (error) {
        console.error('Error loading repositories:', error);
        showError('Failed to load repositories. Please try again later.');
    }
}

/**
 * Compares freshly loaded repositories against the last snapshot stored in
 * localStorage and notifies the user if new repositories have appeared.
 */
function checkForNewRepos() {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEYS.LAST_REPOS) || '[]');

    if (state.repositories.length === 0) {
        return;
    }

    if (stored.length > 0) {
        const newRepos = state.repositories.filter(
            repo => !stored.some(storedRepo => storedRepo.id === repo.id)
        );

        if (newRepos.length > 0) {
            showNotification(`🎉 Found ${newRepos.length} new repository(ies)!`);
            localStorage.setItem(STORAGE_KEYS.LAST_REPOS, JSON.stringify(state.repositories));
        }
    } else {
        localStorage.setItem(STORAGE_KEYS.LAST_REPOS, JSON.stringify(state.repositories));
    }
}

// ============================================================
// Rendering
// ============================================================
function renderRepositories(repos) {
    if (state.layout === LAYOUT.CARD) {
        renderCardView(repos);
    } else {
        renderTableView(repos);
    }

    updateLayoutVisibility();
    updateResultCount(repos.length);
    toggleEmptyState(repos.length === 0);
}

function renderCardView(repos) {
    dom.cardView.innerHTML = '';
    repos.forEach(repo => dom.cardView.appendChild(createRepoCard(repo)));
}

function renderTableView(repos) {
    dom.tableBody.innerHTML = '';
    repos.forEach(repo => dom.tableBody.appendChild(createTableRow(repo)));
}

function toggleEmptyState(isEmpty) {
    dom.emptyState.classList.toggle('d-none', !isEmpty);

    if (isEmpty) {
        dom.cardView.innerHTML = '';
        dom.tableBody.innerHTML = '';
    }
}

/**
 * Builds the card layout for a single repository, including its title,
 * description, language/topic badges, stats line, and action buttons.
 */
function createRepoCard(repo) {
    const column = document.createElement('div');
    column.className = 'col-md-4';

    const card = document.createElement('div');
    card.className = 'card repo-card h-100';

    const body = document.createElement('div');
    body.className = 'card-body';

    body.appendChild(createCardHeader(repo));
    body.appendChild(createCardDescription(repo));

    const tags = createCardTags(repo);
    if (tags) {
        body.appendChild(tags);
    }

    body.appendChild(createCardStats(repo));
    body.appendChild(createExternalLink(repo.html_url, 'View on GitHub →', 'btn btn-sm btn-primary'));

    card.appendChild(body);
    column.appendChild(card);

    return column;
}

function createCardHeader(repo) {
    const header = document.createElement('div');
    header.className = 'd-flex justify-content-between align-items-start mb-2';

    const nameLink = createExternalLink(repo.html_url, repo.name, 'repo-name h5 card-title');
    const copyButton = createCopyButton(repo.html_url, {
        className: 'btn btn-sm btn-outline-secondary copy-btn',
        title: 'Copy link',
    });

    header.appendChild(nameLink);
    header.appendChild(copyButton);

    return header;
}

function createCardDescription(repo) {
    const description = document.createElement('p');
    description.className = 'card-text text-muted';
    description.textContent = repo.description || 'No description provided';
    return description;
}

function createCardTags(repo) {
    const hasLanguage = Boolean(repo.language);
    const hasTopics = Boolean(repo.topics && repo.topics.length > 0);

    if (!hasLanguage && !hasTopics) {
        return null;
    }

    const tagsContainer = document.createElement('div');
    tagsContainer.className = 'mb-2';

    if (hasLanguage) {
        tagsContainer.appendChild(createBadge(repo.language, 'bg-primary'));
    }

    if (hasTopics) {
        repo.topics.forEach(topic => tagsContainer.appendChild(createBadge(topic, 'bg-secondary')));
    }

    return tagsContainer;
}

function createCardStats(repo) {
    const stats = document.createElement('small');
    stats.className = 'text-muted d-block mb-2';
    stats.innerHTML = `
        ⭐ ${repo.stargazers_count} |
        🍴 ${repo.forks_count} |
        Updated ${formatDate(repo.updated_at)}
    `;
    return stats;
}

function createTableRow(repo) {
    const row = document.createElement('tr');

    const nameCell = document.createElement('td');
    nameCell.appendChild(createExternalLink(repo.html_url, repo.name));

    const descriptionCell = document.createElement('td');
    descriptionCell.textContent = repo.description || '—';

    const languageCell = document.createElement('td');
    if (repo.language) {
        languageCell.appendChild(createBadge(repo.language, 'bg-primary', ''));
    } else {
        languageCell.textContent = '—';
    }

    const starsCell = document.createElement('td');
    starsCell.textContent = repo.stargazers_count;

    const updatedCell = document.createElement('td');
    updatedCell.textContent = formatDate(repo.updated_at);

    const actionsCell = document.createElement('td');
    actionsCell.appendChild(createCopyButton(repo.html_url));

    row.append(nameCell, descriptionCell, languageCell, starsCell, updatedCell, actionsCell);

    return row;
}

// ---- Shared element builders -------------------------------------------

function createExternalLink(url, text, className) {
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    if (className) {
        link.className = className;
    }
    link.textContent = text;
    return link;
}

function createBadge(text, bgClass, extraClass = 'me-1') {
    const badge = document.createElement('span');
    badge.className = extraClass ? `badge ${bgClass} ${extraClass}` : `badge ${bgClass}`;
    badge.textContent = text;
    return badge;
}

function createCopyButton(url, { className = 'btn btn-sm btn-outline-secondary', title } = {}) {
    const button = document.createElement('button');
    button.className = className;
    if (title) {
        button.title = title;
    }
    button.innerHTML = '<i class="fas fa-copy"></i>';
    button.addEventListener('click', event => {
        event.preventDefault();
        copyToClipboard(url);
    });
    return button;
}

function updateLayoutVisibility() {
    const isCardView = state.layout === LAYOUT.CARD;
    dom.cardView.classList.toggle('d-none', !isCardView);
    dom.tableView.classList.toggle('d-none', isCardView);
}

// ============================================================
// Filtering
// ============================================================
function populateTechnologyFilter() {
    const languages = new Set();
    state.repositories.forEach(repo => {
        if (repo.language) {
            languages.add(repo.language);
        }
    });

    const sortedLanguages = Array.from(languages).sort((a, b) => a.localeCompare(b));
    sortedLanguages.forEach(language => {
        const option = document.createElement('option');
        option.value = language;
        option.textContent = language;
        dom.technologyFilter.appendChild(option);
    });
}

function filterRepositories(repos, searchTerm, technology) {
    const normalizedSearch = searchTerm.toLowerCase();

    return repos.filter(repo => {
        const matchesSearch = repo.name.toLowerCase().includes(normalizedSearch) ||
            (repo.description && repo.description.toLowerCase().includes(normalizedSearch));
        const matchesTechnology = !technology || repo.language === technology;

        return matchesSearch && matchesTechnology;
    });
}

/**
 * Reads the current search/technology/sort controls, recomputes the
 * filtered + sorted repository list, and re-renders it. Used both for
 * user-driven changes and for applying the default state on page load.
 */
function applyFilters() {
    const searchTerm = dom.searchInput.value.toLowerCase();
    const technology = dom.technologyFilter.value;
    const sortBy = dom.sortBy.value;

    state.filteredRepositories = sortRepositories(
        filterRepositories(state.repositories, searchTerm, technology),
        sortBy
    );

    renderRepositories(state.filteredRepositories);
}

// ============================================================
// Sorting
// ============================================================
function sortRepositories(repos, sortBy) {
    const sorted = [...repos];

    switch (sortBy) {
        case SORT_BY.UPDATED:
            sorted.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
            break;
        case SORT_BY.CREATED:
            sorted.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            break;
        case SORT_BY.STARS:
            sorted.sort((a, b) => b.stargazers_count - a.stargazers_count);
            break;
        case SORT_BY.NAME:
            sorted.sort((a, b) => a.name.localeCompare(b.name));
            break;
    }

    return sorted;
}

// ============================================================
// Layout
// ============================================================
function loadSavedLayout() {
    const saved = localStorage.getItem(STORAGE_KEYS.LAYOUT);
    if (saved) {
        state.layout = saved;
    }
}

// ============================================================
// Dark Mode
// ============================================================
function initializeDarkMode() {
    const saved = localStorage.getItem(STORAGE_KEYS.DARK_MODE);
    if (saved === 'true') {
        state.darkMode = true;
        document.body.classList.add('dark-mode');
        updateDarkModeIcon();
    }
}

function updateDarkModeIcon() {
    dom.darkModeIcon.className = state.darkMode ? 'fas fa-sun' : 'fas fa-moon';
}

// ============================================================
// Notifications
// ============================================================
function createAlert(message, type) {
    const alert = document.createElement('div');
    alert.className = `alert alert-${type} alert-dismissible fade show`;
    alert.setAttribute('role', 'alert');
    alert.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    return alert;
}

function showNotification(message) {
    const alert = createAlert(message, ALERT_TYPE.INFO);
    dom.alertAnchor.parentNode.insertBefore(alert, dom.alertAnchor);
    setTimeout(() => alert.remove(), NOTIFICATION_DURATION_MS);
}

function showError(message) {
    const alert = createAlert(message, ALERT_TYPE.DANGER);
    dom.alertAnchor.parentNode.insertBefore(alert, dom.alertAnchor);
}

// ============================================================
// Utilities
// ============================================================
async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        showNotification('Link copied to clipboard!');
    } catch (error) {
        console.error('Failed to copy:', error);
    }
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (days === 0) return 'today';
    if (days === 1) return 'yesterday';
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    if (days < 365) return `${Math.floor(days / 30)} months ago`;

    return `${Math.floor(days / 365)} years ago`;
}

/**
 * Formats a date as "10 July 2026, 9:47 AM" for the footer timestamp.
 */
function formatFullDateTime(dateString) {
    const date = new Date(dateString);
    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December',
    ];

    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const ampm = date.getHours() >= 12 ? 'PM' : 'AM';
    const hours = date.getHours() % 12 || 12;

    return `${day} ${month} ${year}, ${hours}:${minutes} ${ampm}`;
}

function updateLastUpdatedTime(lastUpdated) {
    dom.lastUpdated.textContent = formatFullDateTime(lastUpdated);
}

function updateResultCount(count) {
    dom.resultCount.textContent = `${count} ${count === 1 ? 'repository' : 'repositories'} found`;
}

// ============================================================
// Event Handlers
// ============================================================
function handleClearFiltersClick() {
    dom.searchInput.value = '';
    dom.technologyFilter.value = '';
    dom.sortBy.value = DEFAULT_SORT;
    applyFilters();
}

function handleDarkModeToggleClick() {
    state.darkMode = !state.darkMode;
    document.body.classList.toggle('dark-mode');
    localStorage.setItem(STORAGE_KEYS.DARK_MODE, state.darkMode);
    updateDarkModeIcon();
}

function handleLayoutToggleClick() {
    state.layout = state.layout === LAYOUT.CARD ? LAYOUT.TABLE : LAYOUT.CARD;
    localStorage.setItem(STORAGE_KEYS.LAYOUT, state.layout);
    renderRepositories(state.filteredRepositories);
}

function setupEventListeners() {
    dom.searchInput.addEventListener('input', applyFilters);
    dom.technologyFilter.addEventListener('change', applyFilters);
    dom.sortBy.addEventListener('change', applyFilters);
    dom.clearFiltersBtn.addEventListener('click', handleClearFiltersClick);
    dom.darkModeToggle.addEventListener('click', handleDarkModeToggleClick);
    dom.layoutToggle.addEventListener('click', handleLayoutToggleClick);
}

// ============================================================
// Application Startup
// ============================================================
document.addEventListener('DOMContentLoaded', initializeApp);
