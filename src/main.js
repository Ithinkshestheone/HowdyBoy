// Nexus Games - Vanilla JS Implementation
let games = [];
let filteredGames = [];
let currentCategory = 'All';
let searchQuery = '';

// DOM Elements
const gamesGrid = document.getElementById('games-grid');
const categoriesContainer = document.getElementById('categories-container');
const searchInput = document.getElementById('search-input');
const clearSearchBtn = document.getElementById('clear-search');
const searchHeader = document.getElementById('search-header');
const searchTermDisplay = document.getElementById('search-term');
const resultsCountDisplay = document.getElementById('results-count');
const emptyState = document.getElementById('empty-state');
const gameModal = document.getElementById('game-modal');
const gameIframe = document.getElementById('game-iframe');
const modalTitle = document.getElementById('modal-title');
const modalCategory = document.getElementById('modal-category');
const modalId = document.getElementById('modal-id');
const modalExternal = document.getElementById('modal-external');

// Initialize
async function init() {
  try {
    const response = await fetch('./src/data/games.json');
    games = await response.json();
    renderCategories();
    updateFilters();
    lucide.createIcons();
  } catch (error) {
    console.error('Failed to load games:', error);
  }
}

function renderCategories() {
  const categories = ['All', ...new Set(games.map(g => g.category))];
  categoriesContainer.innerHTML = categories.map(cat => `
    <button
      onclick="setCategory('${cat}')"
      class="category-btn px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
        currentCategory === cat
          ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
          : 'bg-white text-black/60 hover:bg-black/5 border border-black/5'
      }"
      data-category="${cat}"
    >
      ${cat}
    </button>
  `).join('');
}

window.setCategory = (category) => {
  currentCategory = category;
  renderCategories();
  updateFilters();
};

function updateFilters() {
  searchQuery = searchInput.value.toLowerCase();
  
  filteredGames = games.filter(game => {
    const matchesSearch = game.title.toLowerCase().includes(searchQuery);
    const matchesCategory = currentCategory === 'All' || game.category === currentCategory;
    return matchesSearch && matchesCategory;
  });

  // Update UI elements
  if (searchQuery) {
    clearSearchBtn.classList.remove('hidden');
    searchHeader.classList.remove('hidden');
    searchTermDisplay.textContent = searchQuery;
    resultsCountDisplay.textContent = `${filteredGames.length} games found`;
  } else {
    clearSearchBtn.classList.add('hidden');
    searchHeader.classList.add('hidden');
  }

  renderGames();
}

function renderGames() {
  if (filteredGames.length === 0) {
    gamesGrid.classList.add('hidden');
    emptyState.classList.remove('hidden');
  } else {
    gamesGrid.classList.remove('hidden');
    emptyState.classList.add('hidden');
    
    gamesGrid.innerHTML = filteredGames.map(game => `
      <div
        onclick="openGame('${game.id}')"
        class="group bg-white rounded-2xl overflow-hidden border border-black/5 shadow-sm hover:shadow-xl transition-all cursor-pointer transform hover:-translate-y-1"
      >
        <div class="aspect-[4/3] overflow-hidden relative">
          <img
            src="${game.thumbnail}"
            alt="${game.title}"
            class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            referrerpolicy="no-referrer"
          />
          <div class="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <div class="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg">
              <i data-lucide="gamepad-2" class="w-6 h-6 text-emerald-500"></i>
            </div>
          </div>
          <div class="absolute top-3 left-3">
            <span class="px-2 py-1 bg-white/90 backdrop-blur-sm rounded-lg text-[10px] font-bold uppercase tracking-wider text-black/60 border border-black/5">
              ${game.category}
            </span>
          </div>
        </div>
        <div class="p-4">
          <h3 class="font-bold text-lg mb-1 group-hover:text-emerald-600 transition-colors">${game.title}</h3>
          <p class="text-black/50 text-sm line-clamp-2 leading-relaxed">${game.description}</p>
        </div>
      </div>
    `).join('');
    
    lucide.createIcons();
  }
}

window.openGame = (id) => {
  const game = games.find(g => g.id === id);
  if (!game) return;

  modalTitle.textContent = game.title;
  modalCategory.textContent = game.category;
  modalId.textContent = `ID: ${game.id.toUpperCase()}`;
  modalExternal.href = game.iframeUrl;
  gameIframe.src = game.iframeUrl;
  
  gameModal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
};

function closeModal() {
  gameModal.classList.add('hidden');
  gameIframe.src = '';
  document.body.style.overflow = 'auto';
}

// Event Listeners
searchInput.addEventListener('input', updateFilters);
clearSearchBtn.addEventListener('click', () => {
  searchInput.value = '';
  updateFilters();
});

document.getElementById('close-modal-btn').addEventListener('click', closeModal);
document.getElementById('close-modal-x').addEventListener('click', closeModal);
document.getElementById('logo').addEventListener('click', () => {
  searchInput.value = '';
  currentCategory = 'All';
  renderCategories();
  updateFilters();
});

// Close modal on background click
gameModal.addEventListener('click', (e) => {
  if (e.target === gameModal) closeModal();
});

// Start the app
init();
