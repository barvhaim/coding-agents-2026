// ===========================
// State Management
// ===========================
const state = {
    agents: [],
    filteredAgents: [],
    selectedCategories: new Set(),
    comparisonAgents: [],
    currentView: 'grid',
    filters: {
        search: '',
        category: 'all',
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
        state.agents = data.tools || [];
        state.filteredAgents = [...state.agents];
        
        hideLoading();
        updateStats();
        renderAgents();
        renderCategoryFilters();
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
                    <p class="agent-vendor">${agent.category}</p>
                </div>
                <span class="agent-type-badge ${getCategoryBadgeClass(agent.category)}">${agent.category}</span>
            </div>
            
            <p class="agent-capabilities">${agent.agent_capabilities ? agent.agent_capabilities.join(', ') : 'N/A'}</p>
            
            <div class="agent-meta">
                <div class="meta-item">
                    <span class="meta-label">Interfaces</span>
                    <span class="meta-value">${agent.interfaces ? agent.interfaces.slice(0, 2).join(', ') : 'N/A'}</span>
                </div>
            </div>
            
            <div class="agent-tags">
                ${agent.interfaces ? agent.interfaces.slice(0, 3).map(iface => `<span class="tag">${iface}</span>`).join('') : ''}
            </div>
            
            <div class="agent-footer">
                <span class="agent-pricing">${getPricingLabel(agent.pricing_usd)}</span>
                <div class="agent-links" onclick="event.stopPropagation()">
                    ${agent.links && agent.links.pricing ? `<a href="${agent.links.pricing}" target="_blank" rel="noopener" class="link-btn">Pricing</a>` : ''}
                    ${agent.links && agent.links.docs ? `<a href="${agent.links.docs}" target="_blank" rel="noopener" class="link-btn">Docs</a>` : ''}
                </div>
            </div>
        </div>
    `).join('');
}

function renderCategoryFilters() {
    const tagPills = document.getElementById('tag-pills');
    const allCategories = new Set();
    
    state.agents.forEach(agent => {
        if (agent.category) allCategories.add(agent.category);
    });
    
    const sortedCategories = Array.from(allCategories).sort();
    
    tagPills.innerHTML = sortedCategories.map(category => `
        <button class="tag-pill ${state.selectedCategories.has(category) ? 'active' : ''}" 
                onclick="toggleCategory('${escapeHtml(category)}')"
                data-tag="${escapeHtml(category)}">
            ${category}
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
                    <strong>Category:</strong> ${agent.category}
                </div>
                <div>
                    <strong>Interfaces:</strong> ${agent.interfaces ? agent.interfaces.join(', ') : 'N/A'}
                </div>
                <div>
                    <strong>Capabilities:</strong> ${agent.agent_capabilities ? agent.agent_capabilities.join(', ') : 'N/A'}
                </div>
                <div>
                    <strong>Pricing:</strong> ${getPricingLabel(agent.pricing_usd)}
                </div>
                <div>
                    <strong>Notes:</strong> ${agent.notes || 'N/A'}
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
            agent.category.toLowerCase().includes(searchLower) ||
            (agent.agent_capabilities && agent.agent_capabilities.some(cap => cap.toLowerCase().includes(searchLower))) ||
            (agent.interfaces && agent.interfaces.some(iface => iface.toLowerCase().includes(searchLower))) ||
            (agent.notes && agent.notes.toLowerCase().includes(searchLower))
        );
    }
    
    // Category filter
    if (state.filters.category !== 'all') {
        filtered = filtered.filter(agent => agent.category === state.filters.category);
    }
    
    // Category tag filter
    if (state.selectedCategories.size > 0) {
        filtered = filtered.filter(agent => 
            state.selectedCategories.has(agent.category)
        );
    }
    
    // Sorting
    filtered.sort((a, b) => {
        switch (state.filters.sort) {
            case 'name':
                return a.name.localeCompare(b.name);
            case 'name-desc':
                return b.name.localeCompare(a.name);
            case 'category':
                return a.category.localeCompare(b.category);
            default:
                return 0;
        }
    });
    
    state.filteredAgents = filtered;
    updateStats();
    renderAgents();
}

function toggleCategory(category) {
    if (state.selectedCategories.has(category)) {
        state.selectedCategories.delete(category);
    } else {
        state.selectedCategories.add(category);
    }
    renderCategoryFilters();
    applyFilters();
}

function resetFilters() {
    state.filters = {
        search: '',
        category: 'all',
        sort: 'name'
    };
    state.selectedCategories.clear();
    
    document.getElementById('search-input').value = '';
    document.getElementById('type-filter').value = 'all';
    document.getElementById('autonomy-filter').value = 'all';
    document.getElementById('sort-select').value = 'name';
    
    renderCategoryFilters();
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
    
    const pricingDetails = agent.pricing_usd ? agent.pricing_usd.map(p => {
        if (p.price_per_month !== undefined) {
            return `${p.plan}: $${p.price_per_month}/month`;
        } else if (p.price_per_user_month !== undefined) {
            return `${p.plan}: $${p.price_per_user_month}/user/month`;
        } else if (p.price) {
            return `${p.plan}: ${p.price}`;
        } else if (p.limits) {
            return `${p.plan}: ${p.limits}`;
        }
        return `${p.plan}`;
    }).join('<br>') : 'N/A';
    
    modalBody.innerHTML = `
        <div class="modal-agent-header">
            <h2>${agent.name}</h2>
            <p style="color: var(--text-secondary); font-size: 1.125rem; margin-bottom: 1rem;">${agent.category}</p>
            <div style="display: flex; gap: 1rem; flex-wrap: wrap; margin-bottom: 2rem;">
                <span class="agent-type-badge ${getCategoryBadgeClass(agent.category)}">${agent.category}</span>
            </div>
        </div>
        
        <h3>Interfaces</h3>
        <p>${agent.interfaces ? agent.interfaces.join(', ') : 'N/A'}</p>
        
        <h3>Agent Capabilities</h3>
        <ul>
            ${agent.agent_capabilities ? agent.agent_capabilities.map(cap => `<li>${cap}</li>`).join('') : '<li>N/A</li>'}
        </ul>
        
        <h3>Pricing</h3>
        <p>${pricingDetails}</p>
        ${agent.pricing_source ? `<p style="font-size: 0.875rem; color: var(--text-secondary);">Source: ${agent.pricing_source}</p>` : ''}
        
        ${agent.notes ? `<h3>Notes</h3><p>${agent.notes}</p>` : ''}
        
        <h3>Links</h3>
        <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
            ${Object.entries(agent.links || {}).map(([key, url]) => 
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

function getCategoryBadgeClass(category) {
    const categoryMap = {
        'IDE Commercial': 'ide',
        'CLI / Terminal': 'cli',
        'Hosted Autonomy': 'autonomous',
        'Open Source Framework': 'framework'
    };
    return categoryMap[category] || 'ide';
}

function getPricingLabel(pricingArray) {
    if (!pricingArray || pricingArray.length === 0) return 'N/A';
    
    // Check for free/open source
    const hasFree = pricingArray.some(p => 
        (p.price_per_month === 0) || 
        (p.price && (p.price.toLowerCase().includes('open-source') || p.price.toLowerCase().includes('free')))
    );
    
    if (hasFree && pricingArray.some(p => p.price && p.price.toLowerCase().includes('open-source'))) {
        return '🆓 Free & Open Source';
    } else if (hasFree) {
        return '🆓 Free Plan Available';
    }
    
    // Find lowest paid price
    const paidPrices = pricingArray
        .filter(p => p.price_per_month > 0 || p.price_per_user_month > 0)
        .map(p => p.price_per_month || p.price_per_user_month)
        .filter(p => p !== undefined);
    
    if (paidPrices.length > 0) {
        const minPrice = Math.min(...paidPrices);
        return `💰 From $${minPrice}`;
    }
    
    return '💰 Paid';
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
        state.filters.category = e.target.value;
        applyFilters();
    });
    
    document.getElementById('autonomy-filter').addEventListener('change', (e) => {
        // Not used in new structure, but keeping for compatibility
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
window.toggleCategory = toggleCategory;
window.addToComparison = addToComparison;
window.removeFromComparison = removeFromComparison;