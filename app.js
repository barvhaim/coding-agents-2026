// ===========================
// State Management
// ===========================
const state = {
    agents: [],
    filteredAgents: [],
    selectedTags: new Set(),
    comparisonAgents: [],
    currentView: 'grid',
    filters: {
        search: '',
        type: 'all',
        autonomy: 'all',
        sort: 'name'
    }
};

// ===========================
// Data Loading
// ===========================
async function loadData() {
    try {
        const response = await fetch('dataset.json');
        if (!response.ok) throw new Error('Failed to load data');
        
        const data = await response.json();
        state.agents = data;
        state.filteredAgents = [...data];
        
        hideLoading();
        updateStats();
        renderAgents();
        renderTagFilters();
    } catch (error) {
        console.error('Error loading data:', error);
        showError();
    }
}

// ===========================
// UI Rendering
// ===========================
function renderAgents() {
    const grid = document.getElementById('agents-grid');
    const noResults = document.getElementById('no-results');
    
    if (state.filteredAgents.length === 0) {
        grid.innerHTML = '';
        noResults.style.display = 'block';
        return;
    }
    
    noResults.style.display = 'none';
    
    grid.innerHTML = state.filteredAgents.map(agent => `
        <div class="agent-card fade-in" data-agent-id="${agent.name}" onclick="openModal('${escapeHtml(agent.name)}')">
            <div class="agent-header">
                <div>
                    <h3 class="agent-name">${agent.name}</h3>
                    <p class="agent-vendor">${agent.vendor}</p>
                </div>
                <span class="agent-type-badge ${getTypeBadgeClass(agent.type)}">${agent.type}</span>
            </div>
            
            <p class="agent-capabilities">${agent.capabilities}</p>
            
            <div class="agent-meta">
                <div class="meta-item">
                    <span class="meta-label">Autonomy</span>
                    <span class="autonomy-badge ${agent.autonomy_level.toLowerCase()}">${agent.autonomy_level}</span>
                </div>
                <div class="meta-item">
                    <span class="meta-label">Backend</span>
                    <span class="meta-value">${truncateText(agent.backend_model, 30)}</span>
                </div>
            </div>
            
            <div class="agent-tags">
                ${agent.tags.slice(0, 4).map(tag => `<span class="tag">${tag}</span>`).join('')}
                ${agent.tags.length > 4 ? `<span class="tag">+${agent.tags.length - 4}</span>` : ''}
            </div>
            
            <div class="agent-footer">
                <span class="agent-pricing">${getPricingLabel(agent.pricing)}</span>
                <div class="agent-links" onclick="event.stopPropagation()">
                    ${agent.links.website ? `<a href="${agent.links.website}" target="_blank" rel="noopener" class="link-btn">Website</a>` : ''}
                    ${agent.links.docs ? `<a href="${agent.links.docs}" target="_blank" rel="noopener" class="link-btn">Docs</a>` : ''}
                </div>
            </div>
        </div>
    `).join('');
}

function renderTagFilters() {
    const tagPills = document.getElementById('tag-pills');
    const allTags = new Set();
    
    state.agents.forEach(agent => {
        agent.tags.forEach(tag => allTags.add(tag));
    });
    
    const sortedTags = Array.from(allTags).sort();
    
    tagPills.innerHTML = sortedTags.map(tag => `
        <button class="tag-pill ${state.selectedTags.has(tag) ? 'active' : ''}" 
                onclick="toggleTag('${escapeHtml(tag)}')"
                data-tag="${escapeHtml(tag)}">
            ${tag}
        </button>
    `).join('');
}

function renderComparison() {
    const comparisonContent = document.getElementById('comparison-content');
    
    if (state.comparisonAgents.length === 0) {
        comparisonContent.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 2rem; color: var(--text-secondary);">
                <p>Click on agent cards to add them to comparison (max 3)</p>
            </div>
        `;
        return;
    }
    
    comparisonContent.innerHTML = state.comparisonAgents.map(agent => `
        <div class="comparison-card selected">
            <button class="remove-comparison" onclick="removeFromComparison('${escapeHtml(agent.name)}')" aria-label="Remove from comparison">×</button>
            <h3 style="margin-bottom: 1rem;">${agent.name}</h3>
            <div style="display: flex; flex-direction: column; gap: 1rem;">
                <div>
                    <strong>Type:</strong> ${agent.type}
                </div>
                <div>
                    <strong>Vendor:</strong> ${agent.vendor}
                </div>
                <div>
                    <strong>Autonomy:</strong> <span class="autonomy-badge ${agent.autonomy_level.toLowerCase()}">${agent.autonomy_level}</span>
                </div>
                <div>
                    <strong>Backend:</strong> ${agent.backend_model}
                </div>
                <div>
                    <strong>Pricing:</strong> ${getPricingLabel(agent.pricing)}
                </div>
                <div>
                    <strong>Languages:</strong> ${truncateText(agent.supported_languages, 100)}
                </div>
                <div>
                    <strong>Integration:</strong> ${truncateText(agent.integration, 100)}
                </div>
                <div>
                    <strong>Use Cases:</strong> ${truncateText(agent.use_cases, 150)}
                </div>
            </div>
        </div>
    `).join('');
}

// ===========================
// Filtering & Sorting
// ===========================
function applyFilters() {
    let filtered = [...state.agents];
    
    // Search filter
    if (state.filters.search) {
        const searchLower = state.filters.search.toLowerCase();
        filtered = filtered.filter(agent => 
            agent.name.toLowerCase().includes(searchLower) ||
            agent.vendor.toLowerCase().includes(searchLower) ||
            agent.capabilities.toLowerCase().includes(searchLower) ||
            agent.use_cases.toLowerCase().includes(searchLower) ||
            agent.backend_model.toLowerCase().includes(searchLower) ||
            agent.tags.some(tag => tag.toLowerCase().includes(searchLower))
        );
    }
    
    // Type filter
    if (state.filters.type !== 'all') {
        filtered = filtered.filter(agent => agent.type === state.filters.type);
    }
    
    // Autonomy filter
    if (state.filters.autonomy !== 'all') {
        filtered = filtered.filter(agent => agent.autonomy_level === state.filters.autonomy);
    }
    
    // Tag filter
    if (state.selectedTags.size > 0) {
        filtered = filtered.filter(agent => 
            agent.tags.some(tag => state.selectedTags.has(tag))
        );
    }
    
    // Sorting
    filtered.sort((a, b) => {
        switch (state.filters.sort) {
            case 'name':
                return a.name.localeCompare(b.name);
            case 'name-desc':
                return b.name.localeCompare(a.name);
            case 'autonomy':
                const autonomyOrder = { 'High': 3, 'Medium': 2, 'Low': 1 };
                return (autonomyOrder[b.autonomy_level] || 0) - (autonomyOrder[a.autonomy_level] || 0);
            case 'type':
                return a.type.localeCompare(b.type);
            default:
                return 0;
        }
    });
    
    state.filteredAgents = filtered;
    updateStats();
    renderAgents();
}

function toggleTag(tag) {
    if (state.selectedTags.has(tag)) {
        state.selectedTags.delete(tag);
    } else {
        state.selectedTags.add(tag);
    }
    renderTagFilters();
    applyFilters();
}

function resetFilters() {
    state.filters = {
        search: '',
        type: 'all',
        autonomy: 'all',
        sort: 'name'
    };
    state.selectedTags.clear();
    
    document.getElementById('search-input').value = '';
    document.getElementById('type-filter').value = 'all';
    document.getElementById('autonomy-filter').value = 'all';
    document.getElementById('sort-select').value = 'name';
    
    renderTagFilters();
    applyFilters();
}

// ===========================
// View Management
// ===========================
function switchView(view) {
    state.currentView = view;
    
    const grid = document.getElementById('agents-grid');
    const comparison = document.getElementById('comparison-view');
    const viewBtns = document.querySelectorAll('.view-btn');
    
    viewBtns.forEach(btn => btn.classList.remove('active'));
    
    if (view === 'grid') {
        grid.classList.remove('list-view');
        grid.style.display = 'grid';
        comparison.style.display = 'none';
        document.getElementById('grid-view').classList.add('active');
    } else if (view === 'list') {
        grid.classList.add('list-view');
        grid.style.display = 'grid';
        comparison.style.display = 'none';
        document.getElementById('list-view').classList.add('active');
    } else if (view === 'compare') {
        grid.style.display = 'none';
        comparison.style.display = 'block';
        document.getElementById('compare-view').classList.add('active');
        renderComparison();
    }
}

// ===========================
// Comparison Management
// ===========================
function addToComparison(agentName) {
    if (state.comparisonAgents.length >= 3) {
        alert('You can compare up to 3 agents at a time');
        return;
    }
    
    const agent = state.agents.find(a => a.name === agentName);
    if (agent && !state.comparisonAgents.find(a => a.name === agentName)) {
        state.comparisonAgents.push(agent);
        if (state.currentView === 'compare') {
            renderComparison();
        }
    }
}

function removeFromComparison(agentName) {
    state.comparisonAgents = state.comparisonAgents.filter(a => a.name !== agentName);
    renderComparison();
}

// ===========================
// Modal Management
// ===========================
function openModal(agentName) {
    const agent = state.agents.find(a => a.name === agentName);
    if (!agent) return;
    
    const modal = document.getElementById('modal');
    const modalBody = document.getElementById('modal-body');
    
    modalBody.innerHTML = `
        <div class="modal-agent-header">
            <h2>${agent.name}</h2>
            <p style="color: var(--text-secondary); font-size: 1.125rem; margin-bottom: 1rem;">${agent.vendor}</p>
            <div style="display: flex; gap: 1rem; flex-wrap: wrap; margin-bottom: 2rem;">
                <span class="agent-type-badge ${getTypeBadgeClass(agent.type)}">${agent.type}</span>
                <span class="autonomy-badge ${agent.autonomy_level.toLowerCase()}">${agent.autonomy_level} Autonomy</span>
            </div>
        </div>
        
        <h3>Capabilities</h3>
        <p>${agent.capabilities}</p>
        
        <h3>Use Cases</h3>
        <p>${agent.use_cases}</p>
        
        <h3>Integration</h3>
        <p>${agent.integration}</p>
        
        <h3>Supported Languages</h3>
        <p>${agent.supported_languages}</p>
        
        <h3>Backend Model</h3>
        <p>${agent.backend_model}</p>
        
        <h3>Pricing</h3>
        <p>${agent.pricing}</p>
        
        <h3>Ideal User Profile</h3>
        <p>${agent.ideal_user_profile}</p>
        
        <h3>Tags</h3>
        <div class="agent-tags" style="margin-bottom: 2rem;">
            ${agent.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
        </div>
        
        <h3>Links</h3>
        <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
            ${Object.entries(agent.links).map(([key, url]) => 
                url ? `<a href="${url}" target="_blank" rel="noopener" class="btn-primary" style="text-decoration: none;">${capitalizeFirst(key)}</a>` : ''
            ).join('')}
        </div>
        
        <div style="margin-top: 2rem; padding-top: 2rem; border-top: 1px solid var(--border-color);">
            <button onclick="addToComparison('${escapeHtml(agent.name)}')" class="btn-primary">
                Add to Comparison
            </button>
        </div>
    `;
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    const modal = document.getElementById('modal');
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

// ===========================
// Utility Functions
// ===========================
function updateStats() {
    document.getElementById('total-agents').textContent = state.agents.length;
    document.getElementById('filtered-count').textContent = state.filteredAgents.length;
}

function hideLoading() {
    document.getElementById('loading').style.display = 'none';
}

function showError() {
    document.getElementById('loading').style.display = 'none';
    document.getElementById('error').style.display = 'block';
}

function getTypeBadgeClass(type) {
    const typeMap = {
        'IDE Assistant': 'ide',
        'CLI Agent': 'cli',
        'Autonomous Agent': 'autonomous',
        'Framework': 'framework',
        'Foundation Model': 'model'
    };
    return typeMap[type] || 'ide';
}

function getPricingLabel(pricing) {
    if (!pricing) return 'N/A';
    
    const pricingLower = pricing.toLowerCase();
    if (pricingLower.includes('free') && pricingLower.includes('open source')) {
        return '🆓 Free & Open Source';
    } else if (pricingLower.includes('free')) {
        return '🆓 Free';
    } else if (pricingLower.includes('$0')) {
        return '🆓 Free';
    } else if (pricingLower.match(/\$\d+/)) {
        const match = pricing.match(/\$\d+/);
        return `💰 From ${match[0]}`;
    } else {
        return '💰 Paid';
    }
}

function truncateText(text, maxLength) {
    if (!text) return 'N/A';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// ===========================
// Event Listeners
// ===========================
document.addEventListener('DOMContentLoaded', () => {
    // Load data
    loadData();
    
    // Search
    const searchInput = document.getElementById('search-input');
    let searchTimeout;
    searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            state.filters.search = e.target.value;
            applyFilters();
        }, 300);
    });
    
    // Filters
    document.getElementById('type-filter').addEventListener('change', (e) => {
        state.filters.type = e.target.value;
        applyFilters();
    });
    
    document.getElementById('autonomy-filter').addEventListener('change', (e) => {
        state.filters.autonomy = e.target.value;
        applyFilters();
    });
    
    document.getElementById('sort-select').addEventListener('change', (e) => {
        state.filters.sort = e.target.value;
        applyFilters();
    });
    
    document.getElementById('reset-filters').addEventListener('click', resetFilters);
    
    // View toggle
    document.getElementById('grid-view').addEventListener('click', () => switchView('grid'));
    document.getElementById('list-view').addEventListener('click', () => switchView('list'));
    document.getElementById('compare-view').addEventListener('click', () => switchView('compare'));
    
    // Clear search
    document.getElementById('clear-search').addEventListener('click', () => {
        searchInput.value = '';
        state.filters.search = '';
        applyFilters();
    });
    
    // Modal
    document.getElementById('modal-close').addEventListener('click', closeModal);
    document.getElementById('modal-overlay').addEventListener('click', closeModal);
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal();
        }
        if (e.key === '/' && e.target.tagName !== 'INPUT') {
            e.preventDefault();
            searchInput.focus();
        }
    });
    
    // Footer links
    document.getElementById('about-link').addEventListener('click', (e) => {
        e.preventDefault();
        alert('AI Coding Agents Dashboard 2026\n\nA comprehensive comparison tool for AI-powered development assistants, agents, and frameworks.\n\nData compiled from official sources and research papers.');
    });
    
    document.getElementById('contribute-link').addEventListener('click', (e) => {
        e.preventDefault();
        alert('Want to contribute?\n\nThis is an open-source project. You can contribute by:\n- Suggesting new agents to add\n- Updating existing information\n- Reporting issues\n- Improving the UI/UX\n\nVisit the GitHub repository to get started!');
    });
});

// ===========================
// Export for global access
// ===========================
window.openModal = openModal;
window.closeModal = closeModal;
window.toggleTag = toggleTag;
window.addToComparison = addToComparison;
window.removeFromComparison = removeFromComparison;
