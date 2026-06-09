/**
 * Debug utility that only logs if DEBUG is true in config
 * @param {...any} args - arguments to log
 */
function debug(...args) {
  if (window.RELEAF_CONFIG && window.RELEAF_CONFIG.env && window.RELEAF_CONFIG.env.DEBUG) {
    console.log('[ReLeaf]', ...args);
  }
}

/**
 * Handle SPA routing
 * @param {string} targetId - ID of the page section to show
 */
function navigateTo(targetId) {
  // Hide all pages
  document.querySelectorAll('section.page').forEach(page => {
    page.classList.remove('active');
  });
  
  // Show target page
  const targetPage = document.getElementById(targetId);
  if (targetPage) {
    targetPage.classList.add('active');
  }

  // Update nav active state
  document.querySelectorAll('.nav-item').forEach(nav => {
    if (nav.dataset.target === targetId) {
      nav.classList.add('active');
    } else {
      nav.classList.remove('active');
    }
  });

  // Specific page initialization logic
  if (targetId === 'home-page') {
    if (window.renderHome) window.renderHome();
  } else if (targetId === 'challenges-page') {
    if (window.renderChallenges) window.renderChallenges();
  } else if (targetId === 'coach-page') {
    if (window.renderCoach) window.renderCoach();
  } else if (targetId === 'leaderboard-page') {
    if (window.renderLeaderboard) window.renderLeaderboard();
  } else if (targetId === 'profile-page') {
    if (window.renderProfile) window.renderProfile();
  }

  window.scrollTo(0, 0);
  debug('Navigated to', targetId);
}

/**
 * Initialize event listeners for navigation
 */
function initNavigation() {
  document.querySelectorAll('.nav-item').forEach(navItem => {
    navItem.addEventListener('click', (e) => {
      const targetId = e.currentTarget.dataset.target;
      navigateTo(targetId);
    });
  });
}

/**
 * Main application initialization
 */
document.addEventListener('DOMContentLoaded', () => {
  debug('App init');
  initNavigation();
  
  // Expose to window for other modules
  window.app = {
    navigateTo,
    debug,
    currentUser: null // Set by auth.js
  };
});
