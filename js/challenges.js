/**
 * Hardcoded challenges data
 */
window.CHALLENGES_DATA = [
  // Transport
  { id: 't1', category: 'Transport', icon: '🚗', difficulty: 'Medium', title: 'Cycled to work or school', xp: 40, co2: 2.1 },
  { id: 't2', category: 'Transport', icon: '🚗', difficulty: 'Medium', title: 'Used public transport instead of driving', xp: 30, co2: 1.5 },
  { id: 't3', category: 'Transport', icon: '🚗', difficulty: 'Easy', title: 'Carpooled with at least one other person', xp: 25, co2: 1.2 },
  { id: 't4', category: 'Transport', icon: '🚗', difficulty: 'Easy', title: 'Walked instead of taking a vehicle', xp: 20, co2: 0.8 },
  { id: 't5', category: 'Transport', icon: '🚗', difficulty: 'Hard', title: 'Avoided a flight by choosing train or video call', xp: 80, co2: 18.0 },
  // Food
  { id: 'f1', category: 'Food', icon: '🥗', difficulty: 'Medium', title: 'Had a fully meatless day', xp: 35, co2: 3.3 },
  { id: 'f2', category: 'Food', icon: '🥗', difficulty: 'Easy', title: 'Cooked with local or seasonal produce', xp: 20, co2: 0.9 },
  { id: 'f3', category: 'Food', icon: '🥗', difficulty: 'Easy', title: 'Brought a zero-waste lunch (no packaging)', xp: 15, co2: 0.4 },
  { id: 'f4', category: 'Food', icon: '🥗', difficulty: 'Easy', title: 'Avoided food waste — ate all leftovers', xp: 15, co2: 0.5 },
  { id: 'f5', category: 'Food', icon: '🥗', difficulty: 'Easy', title: 'Chose plant-based milk over dairy', xp: 10, co2: 0.6 },
  // Energy
  { id: 'e1', category: 'Energy', icon: '⚡', difficulty: 'Easy', title: 'Turned off all unused lights and devices', xp: 15, co2: 0.7 },
  { id: 'e2', category: 'Energy', icon: '⚡', difficulty: 'Easy', title: 'Took a cold or short shower', xp: 10, co2: 0.3 },
  { id: 'e3', category: 'Energy', icon: '⚡', difficulty: 'Easy', title: 'Line-dried clothes instead of using a dryer', xp: 20, co2: 1.8 },
  { id: 'e4', category: 'Energy', icon: '⚡', difficulty: 'Medium', title: 'Kept heating/cooling off for the day', xp: 25, co2: 2.4 },
  { id: 'e5', category: 'Energy', icon: '⚡', difficulty: 'Easy', title: 'Used a reusable bag for all shopping', xp: 10, co2: 0.2 },
  // Shopping
  { id: 's1', category: 'Shopping', icon: '🛍️', difficulty: 'Hard', title: 'Bought something second-hand instead of new', xp: 50, co2: 5.0 },
  { id: 's2', category: 'Shopping', icon: '🛍️', difficulty: 'Easy', title: 'Refused a plastic bag at checkout', xp: 10, co2: 0.1 },
  { id: 's3', category: 'Shopping', icon: '🛍️', difficulty: 'Hard', title: 'Repaired an item instead of replacing it', xp: 45, co2: 4.2 },
  { id: 's4', category: 'Shopping', icon: '🛍️', difficulty: 'Medium', title: 'Avoided single-use plastics all day', xp: 20, co2: 0.8 },
  { id: 's5', category: 'Shopping', icon: '🛍️', difficulty: 'Easy', title: 'Chose a product with minimal or recycled packaging', xp: 15, co2: 0.6 },
  // Community
  { id: 'c1', category: 'Community', icon: '🌳', difficulty: 'Hard', title: 'Planted something (seed, sapling, herb)', xp: 60, co2: 2.0 },
  { id: 'c2', category: 'Community', icon: '🌳', difficulty: 'Medium', title: 'Picked up litter in your neighbourhood', xp: 30, co2: 0.5 },
  { id: 'c3', category: 'Community', icon: '🌳', difficulty: 'Easy', title: 'Shared a green tip or challenge with a friend', xp: 15, co2: 0.0 },
  { id: 'c4', category: 'Community', icon: '🌳', difficulty: 'Medium', title: 'Attended or hosted an eco-related event', xp: 40, co2: 0.0 },
  { id: 'c5', category: 'Community', icon: '🌳', difficulty: 'Hard', title: 'Donated to or volunteered with an environmental cause', xp: 50, co2: 0.0 }
];

let currentFilter = 'all';

/**
 * Renders the challenges grid based on the current filter
 */
window.renderChallenges = function() {
  const grid = document.getElementById('challenges-grid');
  if (!grid) return;
  grid.innerHTML = '';

  const today = new Date().toISOString().split('T')[0];
  const userCompletedToday = window.app.currentUser?.completedChallenges?.[today] || {};

  const filtered = currentFilter === 'all' 
    ? window.CHALLENGES_DATA 
    : window.CHALLENGES_DATA.filter(c => c.category === currentFilter);

  filtered.forEach(c => {
    const isCompleted = !!userCompletedToday[c.id];
    
    // Difficulty color logic
    let diffColor = 'var(--color-accent)'; // easy = green
    if (c.difficulty === 'Medium') diffColor = 'var(--color-gold)';
    if (c.difficulty === 'Hard') diffColor = 'var(--color-danger)';

    const card = document.createElement('div');
    card.className = 'card flex-col justify-between';
    if (isCompleted) {
      card.style.opacity = '0.6';
      card.style.background = 'var(--color-bg)';
    }

    card.innerHTML = `
      <div>
        <div class="flex justify-between items-center" style="margin-bottom: var(--space-sm);">
          <span style="font-size: var(--text-sm); color: var(--color-text-muted);">${c.icon} ${c.category}</span>
          <span class="chip" style="background: ${diffColor}; color: white;">${c.difficulty}</span>
        </div>
        <h3 style="font-size: var(--text-lg); margin-bottom: var(--space-sm);">${c.title}</h3>
        <p style="color: var(--color-accent); font-weight: bold; margin-bottom: var(--space-md);">Saves ~${c.co2} kg CO₂</p>
      </div>
      <div class="flex-col gap-sm">
        <div class="chip" style="align-self: flex-start; background: var(--color-primary); color: white;">+${c.xp} XP</div>
        <button class="btn ${isCompleted ? 'btn-secondary' : 'btn-primary'}" 
                style="width: 100%; margin-top: var(--space-sm);" 
                ${isCompleted ? 'disabled' : `onclick="completeChallenge('${c.id}')"`}>
          ${isCompleted ? 'Done today ✓' : 'Complete ✓'}
        </button>
      </div>
    `;
    grid.appendChild(card);
  });
};

/**
 * Completes a challenge
 * @param {string} challengeId 
 */
window.completeChallenge = async function(challengeId) {
  if (!window.app.currentUser) return alert('Please sign in first');
  
  const challenge = window.CHALLENGES_DATA.find(c => c.id === challengeId);
  if (!challenge) return;

  // Flash UI element or show animation
  if (window.app.debug) window.app.debug('Completing challenge:', challenge.title);
  
  // Call auth function to update user data
  if (window.updateUserDataAfterChallenge) {
    await window.updateUserDataAfterChallenge(challenge);
  }

  if (window.triggerChallengeCompletePortalFX) {
    window.triggerChallengeCompletePortalFX();
  }

  // Re-render
  window.renderChallenges();
  if (window.renderHome) window.renderHome(); // Update home state
};

// Filter initialization
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      // Update active styling
      document.querySelectorAll('.filter-btn').forEach(b => {
        b.classList.remove('btn-primary');
      });
      e.target.classList.add('btn-primary');
      
      currentFilter = e.target.dataset.filter;
      window.renderChallenges();
    });
  });
});
