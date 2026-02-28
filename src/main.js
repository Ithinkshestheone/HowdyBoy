let currentTheme = localStorage.getItem('theme') || 'pipboy';
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

// Theme Configs
const themes = {
  pipboy: {
    title: 'PIP-BOY 3000',
    subtitle: 'VAULT-TEC INDUSTRIES',
    searchPlaceholder: 'SEARCHING DATABASE...',
    emptyText: 'NO DATA FOUND',
    footerText: 'VAULT-TEC OS v4.0',
    footerDate: 'EST. 2077',
    logoIcon: 'radio',
    searchIcon: 'terminal',
    statusIcon: 'cpu',
    footerIcon: 'shield-check',
    closeIcon: 'power',
    btnClass: 'pip-button',
    statusText: 'SYSTEM ACTIVE'
  },
  echo: {
    title: 'ECHO DEVICE v2.0',
    subtitle: 'DAHL CORPORATION',
    searchPlaceholder: 'SCANNING FOR ECHO LOGS...',
    emptyText: 'NO ECHO DATA DETECTED',
    footerText: 'ECHO-NET INTERFACE',
    footerDate: 'PANDORA - 2853',
    logoIcon: 'zap',
    searchIcon: 'search',
    statusIcon: 'activity',
    footerIcon: 'database',
    closeIcon: 'x-circle',
    btnClass: 'echo-button',
    statusText: 'HOLOGRAPHIC LINK ESTABLISHED'
  }
};

// Initialize
async function init() {
  try {
    const response = await fetch('./src/data/games.json');
    games = await response.json();
    applyTheme(currentTheme);
    renderCategories();
    updateFilters();
    lucide.createIcons();
  } catch (error) {
    console.error('Failed to load games:', error);
  }
}

function applyTheme(theme) {
  currentTheme = theme;
  localStorage.setItem('theme', theme);
  document.body.className = `min-h-screen theme-${theme}`;
  
  const config = themes[theme];
  
  // Update Text
  document.getElementById('app-title').textContent = config.title;
  document.getElementById('app-subtitle').textContent = config.subtitle;
  document.getElementById('search-input').placeholder = config.searchPlaceholder;
  document.getElementById('empty-text').textContent = config.emptyText;
  document.getElementById('footer-text').textContent = config.footerText;
  document.getElementById('footer-date').textContent = config.footerDate;
  document.getElementById('status-text').textContent = config.statusText;
  
  // Update Icons
  document.getElementById('logo-icon').setAttribute('data-lucide', config.logoIcon);
  document.getElementById('search-icon').setAttribute('data-lucide', config.searchIcon);
  document.getElementById('status-icon').setAttribute('data-lucide', config.statusIcon);
  document.getElementById('footer-icon').setAttribute('data-lucide', config.footerIcon);
  document.getElementById('close-icon').setAttribute('data-lucide', config.closeIcon);
  
  lucide.createIcons();
  renderCategories();
  renderGames();
}

function renderCategories() {
  const categoryCounts = games.reduce((acc, game) => {
    acc[game.category] = (acc[game.category] || 0) + 1;
    return acc;
  }, { 'All': games.length });

  const categories = ['All', ...new Set(games.map(g => g.category))];
  const btnClass = themes[currentTheme].btnClass;
  const isPip = currentTheme === 'pipboy';
  
  const headerHtml = isPip 
    ? `<div class="w-full mb-4 text-xl opacity-50 tracking-[0.4em] border-b border-[#1aff1a]/20 pb-1">SELECT_CATEGORY</div>`
    : `<div class="w-full mb-4 text-lg font-bold tracking-widest text-[#00ffff]/40 flex items-center gap-2">
        <i data-lucide="filter" class="w-4 h-4"></i> FILTER_BY_GENRE
      </div>`;

  categoriesContainer.innerHTML = `
    ${headerHtml}
    <div class="flex items-center gap-4 overflow-x-auto pb-2 no-scrollbar w-full">
      ${categories.map(cat => `
        <button
          onclick="setCategory('${cat}')"
          class="${btnClass} px-6 py-2 text-xl font-bold tracking-widest transition-all whitespace-nowrap relative group/btn ${
            currentCategory === cat ? 'active' : ''
          }"
          data-category="${cat}"
        >
          ${cat}
          <span class="ml-2 opacity-40 text-sm align-top">[${categoryCounts[cat]}]</span>
          ${!isPip && currentCategory === cat ? '<div class="absolute -bottom-1 left-0 w-full h-1 bg-[#00ffff] shadow-[0_0_10px_#00ffff]"></div>' : ''}
        </button>
      `).join('')}
    </div>
  `;
  
  if (!isPip) lucide.createIcons();
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
    searchTermDisplay.textContent = searchQuery.toUpperCase();
    resultsCountDisplay.textContent = currentTheme === 'pipboy' 
      ? `[${filteredGames.length} RECORDS FOUND]`
      : `> ${filteredGames.length} ENTRIES LOCATED`;
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
    
    const isPip = currentTheme === 'pipboy';
    const cardClass = isPip 
      ? "bg-[#0a0a0a] border-2 border-[#1aff1a] shadow-[0_0_10px_rgba(26,255,26,0.1)] hover:shadow-[0_0_20px_rgba(26,255,26,0.3)]"
      : "bg-[#050a10] border-2 border-[#00ffff] shadow-[0_0_15px_rgba(0,255,255,0.1)] hover:shadow-[0_0_25px_rgba(0,255,255,0.4)] glitch-hover";
    
    const imgClass = isPip
      ? "grayscale contrast-125 brightness-75 group-hover:brightness-100"
      : "contrast-110 brightness-90 group-hover:brightness-110 hue-rotate-[-10deg] group-hover:hue-rotate-0";

    const overlayClass = isPip ? "bg-[#1aff1a]/20" : "bg-[#00ffff]/10";
    const accentColor = isPip ? "#1aff1a" : "#00ffff";
    const initText = isPip ? "INITIALIZE" : "ACCESS LOG";

    gamesGrid.innerHTML = filteredGames.map(game => `
      <div
        onclick="openGame('${game.id}')"
        class="group ${cardClass} transition-all duration-300 cursor-pointer transform hover:-translate-y-2 overflow-hidden"
      >
        <div class="aspect-[4/3] overflow-hidden relative border-b-2 border-current">
          <img
            src="${game.thumbnail}"
            alt="${game.title}"
            class="w-full h-full object-cover transform ${imgClass} group-hover:scale-110 transition-all duration-700 ease-out"
            referrerpolicy="no-referrer"
          />
          <!-- Overlay -->
          <div class="absolute inset-0 ${overlayClass} opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center backdrop-blur-[1px]">
            <div class="px-4 py-2 border-2 border-current bg-black text-current font-bold text-xl tracking-widest transform scale-75 group-hover:scale-100 transition-transform duration-300">
              ${initText}
            </div>
          </div>
          <!-- Category Tag -->
          <div class="absolute top-3 left-3">
            <span class="px-3 py-1 bg-black border border-current text-xs font-bold uppercase tracking-[0.2em] text-current">
              ${game.category}
            </span>
          </div>
        </div>
        <div class="p-5">
          <h3 class="font-bold text-2xl mb-1 uppercase tracking-tighter group-hover:text-white transition-colors duration-300">${game.title}</h3>
          <p class="opacity-60 text-lg line-clamp-2 leading-none uppercase group-hover:opacity-100 transition-colors duration-300">${game.description}</p>
        </div>
      </div>
    `).join('');
    
    lucide.createIcons();
  }
}

// Theme Toggle Listener
document.getElementById('toggle-theme').addEventListener('click', () => {
  const nextTheme = currentTheme === 'pipboy' ? 'echo' : 'pipboy';
  applyTheme(nextTheme);
});

// Clock Function
function updateClock() {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  const displayMinutes = minutes < 10 ? '0' + minutes : minutes;
  document.getElementById('clock').textContent = `${displayHours}:${displayMinutes} ${ampm}`;
}

setInterval(updateClock, 1000);
updateClock();

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
