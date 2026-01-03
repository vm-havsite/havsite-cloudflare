// UPDATE THIS WITH YOUR WORKER URL
const FUZZY_SEARCH_WORKER_URL = 'https://fuzzysearch.vm002248.workers.dev/search';

// Create search modal HTML
function createSearchModal() {
    const modalHTML = `
        <div class="search-modal-overlay" id="searchModalOverlay">
            <div class="search-modal-container">
                <div class="search-modal-header">
                    <span class="search-modal-icon">🔍</span>
                    <input 
                        type="text" 
                        class="search-modal-input" 
                        id="searchModalInput"
                        placeholder="Search your site..."
                        autocomplete="off"
                    >
                    <button class="search-modal-close" id="searchModalClose" aria-label="Close search">
                        ×
                    </button>
                </div>
                <div class="search-modal-loading" id="searchModalLoading">
                    Searching...
                </div>
                <div class="search-results-count" id="searchResultsCount" style="display: none;"></div>
                <div class="search-modal-results" id="searchModalResults"></div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

// Initialize search modal
function initSearchModal() {
    createSearchModal();
    
    const overlay = document.getElementById('searchModalOverlay');
    const modalInput = document.getElementById('searchModalInput');
    const closeBtn = document.getElementById('searchModalClose');
    const loading = document.getElementById('searchModalLoading');
    const resultsContainer = document.getElementById('searchModalResults');
    const resultsCount = document.getElementById('searchResultsCount');
    
    let debounceTimer;
    
    // Open modal when clicking search button or pressing in search input
    const navSearchInput = document.getElementById('searchInput');
    const navSearchButton = document.querySelector('.search-bar button');
    
    if (navSearchInput) {
        navSearchInput.addEventListener('focus', openSearchModal);
        navSearchInput.addEventListener('click', openSearchModal);
    }
    
    if (navSearchButton) {
        navSearchButton.addEventListener('click', (e) => {
            e.preventDefault();
            openSearchModal();
        });
    }
    
    // Close modal
    closeBtn.addEventListener('click', closeSearchModal);
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            closeSearchModal();
        }
    });
    
    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && overlay.classList.contains('active')) {
            closeSearchModal();
        }
    });
    
    // Search on input
    modalInput.addEventListener('input', (e) => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            performFuzzySearch(e.target.value);
        }, 300);
    });
    
    // Search on Enter
    modalInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            clearTimeout(debounceTimer);
            performFuzzySearch(e.target.value);
        }
    });
    
    // Open modal function
    function openSearchModal() {
        overlay.classList.add('active');
        modalInput.focus();
        modalInput.value = navSearchInput ? navSearchInput.value : '';
        if (modalInput.value) {
            performFuzzySearch(modalInput.value);
        }
    }
    
    // Close modal function
    function closeSearchModal() {
        overlay.classList.remove('active');
        resultsContainer.innerHTML = '';
        resultsCount.style.display = 'none';
        modalInput.value = '';
    }
    
    // Perform fuzzy search
    async function performFuzzySearch(query) {
        if (!query || query.trim().length < 2) {
            resultsContainer.innerHTML = '';
            resultsCount.style.display = 'none';
            return;
        }
        
        loading.classList.add('active');
        resultsContainer.innerHTML = '';
        resultsCount.style.display = 'none';
        
        try {
            const response = await fetch(`${FUZZY_SEARCH_WORKER_URL}?q=${encodeURIComponent(query)}`);
            const data = await response.json();
            
            loading.classList.remove('active');
            
            if (data.error) {
                showError(data.error);
                return;
            }
            
            displayResults(data);
        } catch (error) {
            loading.classList.remove('active');
            showError('Failed to fetch results. Please try again.');
            console.error('Search error:', error);
        }
    }
    
    // Display results
    function displayResults(data) {
        if (data.count === 0) {
            resultsCount.style.display = 'block';
            resultsCount.textContent = `No results found for "${data.query}"`;
            resultsContainer.innerHTML = `
                <div class="search-no-results">
                    <div class="search-no-results-icon">🔍</div>
                    <p>No matching pages found. Try a different search term.</p>
                </div>
            `;
            return;
        }
        
        resultsCount.style.display = 'block';
        resultsCount.textContent = `Found ${data.count} result${data.count !== 1 ? 's' : ''} for "${data.query}"`;
        
        resultsContainer.innerHTML = data.results.map(result => {
            const relevancePercent = Math.round((1 - result.score) * 100);
            
            const matchesHtml = result.matches && result.matches.length > 0
                ? result.matches.map(m => 
                    `<span class="search-result-match">Match in ${escapeHtml(m.field)}</span>`
                  ).join('')
                : '';
            
            return `
                <div class="search-result-item" onclick="window.location.href='${escapeHtml(result.url)}'">
                    <div class="search-result-title">${escapeHtml(result.title) || 'Untitled'}</div>
                    <div class="search-result-url">${escapeHtml(result.url)}</div>
                    <div class="search-result-description">
                        ${escapeHtml(result.description) || 'No description available'}
                    </div>
                    <div class="search-result-meta">
                        <span class="search-result-score">Relevance: ${relevancePercent}%</span>
                        ${matchesHtml}
                    </div>
                </div>
            `;
        }).join('');
    }
    
    // Show error
    function showError(message) {
        resultsCount.style.display = 'none';
        resultsContainer.innerHTML = `
            <div class="search-error">
                <strong>⚠️ Error:</strong> ${escapeHtml(message)}
            </div>
        `;
    }
    
    // Escape HTML
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Override the existing searchFunction
window.searchFunction = function() {
    // Open the fuzzy search modal instead
    document.getElementById('searchModalOverlay')?.classList.add('active');
    document.getElementById('searchModalInput')?.focus();
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSearchModal);
} else {
    initSearchModal();
}