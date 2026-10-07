// ========================================================
// ToolBox Pro - Main Application Entrypoint (script.js)
// Event bindings, PWA Service Worker, Search, Tools Grid
// ========================================================

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Core Theme & Language
  setTheme(AppState.theme);
  setLanguage(AppState.lang);
  AdService.renderBanner();
  renderFullToolsCatalog();
  renderRecentTools();
  updateProUiState();

  // Register Service Worker for PWA (Relative path for GitHub Pages compatibility)
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js').catch((err) => {
        console.log('SW registration note:', err);
      });
    });
  }

  // Bind Navigation Tabs (Bottom Nav & Drawer)
  document.querySelectorAll('[data-tab]').forEach((el) => {
    el.addEventListener('click', () => {
      const tab = el.getAttribute('data-tab');
      switchTab(tab);
    });
  });

  // Bind Open Tool Click handlers
  document.querySelectorAll('[data-open-tool]').forEach((el) => {
    el.addEventListener('click', () => {
      const toolId = el.getAttribute('data-open-tool');
      openToolWorkspace(toolId);
    });
  });

  // Drawer Toggles
  const drawerOpenBtn = document.getElementById('btn-drawer-open');
  const drawerCloseBtn = document.getElementById('btn-drawer-close');
  const drawerBackdrop = document.getElementById('drawer-backdrop');
  if (drawerOpenBtn) drawerOpenBtn.onclick = openDrawer;
  if (drawerCloseBtn) drawerCloseBtn.onclick = closeDrawer;
  if (drawerBackdrop) drawerBackdrop.onclick = closeDrawer;

  // Header Pro Crown Click
  const headerProBtn = document.getElementById('btn-header-pro');
  if (headerProBtn) headerProBtn.onclick = () => switchTab('premium');

  // Drawer Upgrade Button
  const drawerUpgradeBtn = document.getElementById('btn-drawer-upgrade');
  if (drawerUpgradeBtn) drawerUpgradeBtn.onclick = () => switchTab('premium');

  // Quick Theme Toggle in Header
  const quickThemeBtn = document.getElementById('btn-quick-theme');
  if (quickThemeBtn) {
    quickThemeBtn.onclick = () => {
      const nextTheme = AppState.theme === 'light' ? 'dark' : 'light';
      setTheme(nextTheme);
    };
  }

  // Segmented Language & Theme in Drawer
  document.querySelectorAll('.segment-btn[data-lang]').forEach((btn) => {
    btn.onclick = () => setLanguage(btn.getAttribute('data-lang'));
  });

  document.querySelectorAll('.segment-theme-btn[data-theme-val]').forEach((btn) => {
    btn.onclick = () => setTheme(btn.getAttribute('data-theme-val'));
  });

  // Settings Selects
  const langSelect = document.getElementById('select-settings-lang');
  if (langSelect) {
    langSelect.onchange = (e) => setLanguage(e.target.value);
  }

  const themeSelect = document.getElementById('select-settings-theme');
  if (themeSelect) {
    themeSelect.onchange = (e) => setTheme(e.target.value);
  }

  // Search in Home
  const searchInput = document.getElementById('home-search-input');
  const searchClear = document.getElementById('home-search-clear');
  const searchResults = document.getElementById('home-search-results');
  const quickActions = document.getElementById('home-quick-actions-section');

  if (searchInput) {
    searchInput.oninput = (e) => {
      const q = e.target.value.toLowerCase().trim();
      if (!q) {
        searchClear.classList.add('hidden');
        searchResults.classList.add('hidden');
        quickActions.classList.remove('hidden');
        return;
      }
      searchClear.classList.remove('hidden');
      searchResults.classList.remove('hidden');
      quickActions.classList.add('hidden');

      const matches = ALL_TOOLS.filter((t) => {
        const title = getToolTitle(t.id).toLowerCase();
        const desc = getToolDesc(t.id).toLowerCase();
        return title.includes(q) || desc.includes(q) || t.id.includes(q);
      });

      searchResults.innerHTML = '';
      if (matches.length === 0) {
        searchResults.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:20px; color:var(--text-muted);">No tools found matching "${q}"</div>`;
      } else {
        matches.forEach((tool) => {
          searchResults.appendChild(createToolCard(tool));
        });
      }
    };
  }

  if (searchClear) {
    searchClear.onclick = () => {
      searchInput.value = '';
      searchClear.classList.add('hidden');
      searchResults.classList.add('hidden');
      quickActions.classList.remove('hidden');
    };
  }

  // Category Filter Pills on Tools Screen
  document.querySelectorAll('.cat-pill[data-cat]').forEach((pill) => {
    pill.onclick = () => {
      document.querySelectorAll('.cat-pill').forEach((p) => p.classList.remove('active'));
      pill.classList.add('active');
      const cat = pill.getAttribute('data-cat');
      renderFullToolsCatalog(cat);
    };
  });

  // Tool Workspace Back Button
  const wsBackBtn = document.getElementById('btn-tool-back');
  if (wsBackBtn) wsBackBtn.onclick = closeWorkspace;

  // Clear Recents Button
  const clearRecentsBtn = document.getElementById('btn-clear-recents');
  if (clearRecentsBtn) {
    clearRecentsBtn.onclick = () => {
      AppState.recentTools = [];
      localStorage.removeItem('tb_recents');
      renderRecentTools();
      showToast('Recently used tools cleared', 'info');
    };
  }

  // Backup & Restore Buttons
  const backupBtn = document.getElementById('btn-backup-data');
  if (backupBtn) backupBtn.onclick = exportBackupJSON;

  const restoreTrigger = document.getElementById('btn-restore-data-trigger');
  const restoreInput = document.getElementById('input-restore-file');
  if (restoreTrigger && restoreInput) {
    restoreTrigger.onclick = () => restoreInput.click();
    restoreInput.onchange = (e) => {
      if (e.target.files[0]) restoreBackupJSON(e.target.files[0]);
    };
  }

  // Clear All Data
  const clearAllBtn = document.getElementById('btn-clear-all-data');
  if (clearAllBtn) {
    clearAllBtn.onclick = () => {
      if (confirm('Clear all local saved data (expenses, QR history, recents)?')) {
        localStorage.clear();
        AppState.recentTools = [];
        AppState.isPro = false;
        renderRecentTools();
        updateProUiState();
        showToast('All local application data cleared', 'info');
      }
    };
  }

  // Privacy Policy Modal
  const privacyTrigger = document.getElementById('btn-open-privacy');
  const privacyModal = document.getElementById('modal-privacy');
  const privacyClose = document.getElementById('btn-close-privacy');
  const privacyDismiss = document.getElementById('btn-dismiss-privacy');
  if (privacyTrigger) privacyTrigger.onclick = () => privacyModal.classList.remove('hidden');
  if (privacyClose) privacyClose.onclick = () => privacyModal.classList.add('hidden');
  if (privacyDismiss) privacyDismiss.onclick = () => privacyModal.classList.add('hidden');

  // Terms of Service Modal
  const termsTrigger = document.getElementById('btn-open-terms');
  if (termsTrigger) {
    termsTrigger.onclick = () => {
      alert('ToolBox Pro is open-source and local-first. You own all documents and data processed by this utility.');
    };
  }

  // Share Web App
  const shareAppBtn = document.getElementById('btn-share-app');
  if (shareAppBtn) {
    shareAppBtn.onclick = () => {
      if (navigator.share) {
        navigator.share({
          title: APP_NAME,
          text: 'Check out ToolBox Pro - Complete Mobile Utility App with PDF Text Editor!',
          url: window.location.href
        }).catch(() => {});
      } else {
        navigator.clipboard.writeText(window.location.href);
        showToast('App link copied to clipboard!', 'success');
      }
    };
  }

  // Pro Toggle (Demo toggle to experience Pro mode)
  const toggleProBtn = document.getElementById('btn-toggle-pro-status');
  if (toggleProBtn) {
    toggleProBtn.onclick = () => {
      AppState.isPro = !AppState.isPro;
      localStorage.setItem('tb_is_pro', AppState.isPro);
      updateProUiState();
      AdService.renderBanner();
      showToast(
        AppState.isPro
          ? '🌟 Pro Mode Activated! Enjoy ad-free premium features.'
          : 'Pro Mode Deactivated.',
        'success'
      );
    };
  }
});

function updateProUiState() {
  const btn = document.getElementById('btn-toggle-pro-status');
  const text = document.getElementById('btn-pro-status-text');
  const crownBadge = document.getElementById('btn-header-pro');

  if (AppState.isPro) {
    if (text) text.textContent = translations[AppState.lang].deactivatePro || 'Deactivate Pro Mode (Demo)';
    if (crownBadge) crownBadge.style.boxShadow = '0 0 10px rgba(245, 158, 11, 0.6)';
  } else {
    if (text) text.textContent = translations[AppState.lang].activatePro || 'Activate Pro Mode';
    if (crownBadge) crownBadge.style.boxShadow = '';
  }
}

// Render Tool Card Component
function createToolCard(tool) {
  const card = document.createElement('div');
  card.className = `tool-card ${tool.featured ? 'featured-card' : ''}`;
  card.onclick = () => openToolWorkspace(tool.id);

  const ribbon = tool.featured
    ? `<div class="featured-ribbon">${translations[AppState.lang].starFeature || 'CORE FEATURE'}</div>`
    : '';

  card.innerHTML = `
    ${ribbon}
    <div class="tool-card-top">
      <div class="tool-icon-box ${tool.accent}">
        <span style="font-size:1.4rem;">${tool.emoji}</span>
      </div>
      <span class="tool-category-badge">${tool.category.toUpperCase()}</span>
    </div>
    <h4 class="tool-title">${getToolTitle(tool.id)}</h4>
    <p class="tool-desc">${getToolDesc(tool.id)}</p>
    <div class="tool-card-footer">
      <span class="tool-action-link">${translations[AppState.lang].openTool || 'Open Tool →'}</span>
    </div>
  `;
  return card;
}

// Render All 24 Tools in the "All Tools" View
function renderFullToolsCatalog(filterCategory = 'all') {
  const grid = document.getElementById('full-tools-grid');
  if (!grid) return;
  grid.innerHTML = '';

  const filtered = filterCategory === 'all'
    ? ALL_TOOLS
    : ALL_TOOLS.filter((t) => t.category === filterCategory);

  filtered.forEach((tool) => {
    grid.appendChild(createToolCard(tool));
  });
}

window.renderFullToolsCatalog = renderFullToolsCatalog;
