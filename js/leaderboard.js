window.renderLeaderboard = async function() {
  const isMock = !window.RELEAF_CONFIG || window.RELEAF_CONFIG.firebase.apiKey === "YOUR_FIREBASE_API_KEY";
  let lbData = [];

  if (isMock) {
    const mockLb = JSON.parse(localStorage.getItem('releaf_mock_lb') || '{}');
    // Ensure current mock user is in there
    if (window.app.currentUser) {
      mockLb[window.app.currentUser.uid] = {
        displayName: window.app.currentUser.displayName,
        xp: window.app.currentUser.xp,
        level: window.app.currentUser.level,
        co2Saved: window.app.currentUser.totalCO2Saved
      };
    }
    // Add some dummy users
    mockLb['dummy1'] = { displayName: 'Greta T.', xp: 1200, level: 5 };
    mockLb['dummy2'] = { displayName: 'David A.', xp: 850, level: 4 };
    mockLb['dummy3'] = { displayName: 'Jane Goodall', xp: 2100, level: 6 };

    for (const uid in mockLb) {
      lbData.push({ uid, ...mockLb[uid] });
    }
  } else {
    try {
      const db = firebase.database();
      const snapshot = await db.ref('leaderboard/global').orderByChild('xp').once('value');
      snapshot.forEach(child => {
        lbData.push({ uid: child.key, ...child.val() });
      });
      // orderByChild sorts ascending, we want descending
      lbData.reverse();
    } catch (err) {
      console.error("Leaderboard DB error:", err);
      document.getElementById('leaderboard-list').innerHTML = '<p style="text-align:center;color:var(--color-danger);">Failed to load leaderboard. Check Firebase DB rules.</p>';
      return;
    }
  }

  // Sort descending
  lbData.sort((a, b) => b.xp - a.xp);

  const podiumContainer = document.getElementById('podium-container');
  const listContainer = document.getElementById('leaderboard-list');
  podiumContainer.innerHTML = '';
  listContainer.innerHTML = '';

  if (lbData.length === 0) {
    listContainer.innerHTML = '<p>No scrolls in the hall yet.</p>';
    return;
  }

  // Render Podium (Top 3)
  // Order: 2, 1, 3 for visual podium
  const top3 = lbData.slice(0, 3);
  const podiumOrder = [
    top3[1] ? { ...top3[1], rank: 2, height: '100px', color: '#A8B5A2' } : null, // Silver
    top3[0] ? { ...top3[0], rank: 1, height: '140px', color: 'var(--color-gold)' } : null, // Gold
    top3[2] ? { ...top3[2], rank: 3, height: '80px', color: '#8B7A5E' } : null // Bronze
  ];

  podiumOrder.forEach(u => {
    if (!u) {
      const empty = document.createElement('div');
      empty.style.width = '30%';
      podiumContainer.appendChild(empty);
      return;
    }
    const col = document.createElement('div');
    col.className = 'flex-col items-center';
    col.style.width = '30%';
    const crest = window.generateProceduralCrest ? window.generateProceduralCrest(u.displayName) : '🌿';
    col.innerHTML = `
      <div style="font-size: 36px; filter: drop-shadow(0 0 10px ${u.color}); margin-bottom: var(--space-xs);">${crest}</div>
      <div style="font-size: var(--text-sm); font-family: var(--font-display); font-weight: bold; text-align: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%; color: var(--color-paper);">${u.displayName}</div>
      <div style="font-size: 0.95rem; font-weight: bold; color: #F5ECD7; text-shadow: 0 1px 4px rgba(0,0,0,0.8);">${u.xp} XP</div>
      <div style="width: 100%; height: ${u.height}; background: #5C3317; border: 2px solid ${u.color}; border-bottom: none; border-radius: 8px 8px 0 0; margin-top: var(--space-sm); display: flex; justify-content: center; padding-top: var(--space-sm); font-family: var(--font-display); font-weight: bold; font-size: 2rem; color: #F5ECD7; text-shadow: 0 1px 3px rgba(0,0,0,0.5); box-shadow: inset 0 5px 10px rgba(0,0,0,0.5);">${u.rank}</div>
    `;
    podiumContainer.appendChild(col);
  });

  // Render Rest (Rank 4+)
  lbData.forEach((u, index) => {
    const rank = index + 1;
    
    // Find my rank
    if (window.app.currentUser && u.uid === window.app.currentUser.uid) {
      const rankSpan = document.getElementById('lb-user-rank');
      if (rankSpan) rankSpan.innerText = rank;
      const xpSpan = document.getElementById('lb-user-xp');
      if (xpSpan) xpSpan.innerText = `${u.xp} XP`;
    }

    if (rank <= 3) return; // Skip podium

    const isMe = window.app.currentUser && u.uid === window.app.currentUser.uid;
    const row = document.createElement('div');
    row.className = 'card flex items-center justify-between';
    row.style.padding = 'var(--space-sm) var(--space-md)';
    row.style.marginBottom = 'var(--space-sm)'; // Add gap between scrolls
    if (isMe) {
      row.style.borderColor = 'var(--color-mint)';
      row.style.boxShadow = 'inset 0 0 60px rgba(126, 200, 160, 0.15), 0 5px 15px rgba(126, 200, 160, 0.2)';
    }

    const crest = window.generateProceduralCrest ? window.generateProceduralCrest(u.displayName) : '🌿';
    row.innerHTML = `
      <div class="flex items-center gap-md">
        <span style="font-family: var(--font-display); font-size: var(--text-xl); font-weight: bold; width: 30px; text-align: center; color: #8B7A5E;">${rank}</span>
        <div style="font-size: 24px; filter: drop-shadow(0 0 2px var(--color-gold));">${crest}</div>
        <div>
          <div style="font-weight: bold; font-family: var(--font-display); font-size: var(--text-lg);">${u.displayName}</div>
          <div style="font-size: var(--text-xs); color: #8B7A5E; font-style: italic;">Level ${u.level}</div>
        </div>
      </div>
      <div style="font-family: var(--font-display); font-weight: bold; font-size: var(--text-lg); color: var(--color-wax); text-shadow: 0 0 1px rgba(27, 67, 50, 0.5);">${u.xp} XP</div>
    `;
    listContainer.appendChild(row);
  });
};
