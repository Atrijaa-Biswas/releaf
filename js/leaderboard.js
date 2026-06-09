window.renderLeaderboard = async function() {
  const isMock = !window.RELEAF_CONFIG || window.RELEAF_CONFIG.firebase.apiKey === "YOUR_FIREBASE_API_KEY";
  let lbData = [];

  if (isMock) {
    const mockLb = JSON.parse(localStorage.getItem('releaf_mock_lb') || '{}');
    // Ensure current mock user is in there
    if (window.app.currentUser) {
      mockLb[window.app.currentUser.uid] = {
        displayName: window.app.currentUser.displayName,
        photoURL: window.app.currentUser.photoURL,
        xp: window.app.currentUser.xp,
        level: window.app.currentUser.level,
        co2Saved: window.app.currentUser.totalCO2Saved
      };
    }
    // Add some dummy users
    mockLb['dummy1'] = { displayName: 'Greta T.', xp: 1200, photoURL: 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=', level: 5 };
    mockLb['dummy2'] = { displayName: 'David A.', xp: 850, photoURL: 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=', level: 4 };
    mockLb['dummy3'] = { displayName: 'Jane Goodall', xp: 2100, photoURL: 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=', level: 6 };

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
    listContainer.innerHTML = '<p>No data yet.</p>';
    return;
  }

  // Render Podium (Top 3)
  // Order: 2, 1, 3 for visual podium
  const top3 = lbData.slice(0, 3);
  const podiumOrder = [
    top3[1] ? { ...top3[1], rank: 2, height: '100px', color: '#C0C0C0' } : null,
    top3[0] ? { ...top3[0], rank: 1, height: '140px', color: 'var(--color-gold)' } : null,
    top3[2] ? { ...top3[2], rank: 3, height: '80px', color: '#CD7F32' } : null
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
    col.innerHTML = `
      <img src="${u.photoURL}" style="width: 48px; height: 48px; border-radius: 50%; border: 3px solid ${u.color}; margin-bottom: var(--space-xs);">
      <div style="font-size: var(--text-xs); font-weight: bold; text-align: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%;">${u.displayName}</div>
      <div style="font-size: var(--text-xs); color: var(--color-text-muted);">${u.xp} XP</div>
      <div style="width: 100%; height: ${u.height}; background: ${u.color}; border-radius: var(--radius-sm) var(--radius-sm) 0 0; margin-top: var(--space-sm); display: flex; justify-content: center; padding-top: var(--space-sm); font-weight: bold; color: white;">${u.rank}</div>
    `;
    podiumContainer.appendChild(col);
  });

  // Render Rest (Rank 4+)
  lbData.forEach((u, index) => {
    const rank = index + 1;
    
    // Find my rank
    if (window.app.currentUser && u.uid === window.app.currentUser.uid) {
      document.getElementById('my-rank-num').innerText = rank;
    }

    if (rank <= 3) return; // Skip podium

    const isMe = window.app.currentUser && u.uid === window.app.currentUser.uid;
    const row = document.createElement('div');
    row.className = 'card flex items-center justify-between';
    row.style.padding = 'var(--space-sm) var(--space-md)';
    if (isMe) {
      row.style.borderLeft = '4px solid var(--color-accent)';
      row.style.background = 'var(--color-bg)';
    }

    row.innerHTML = `
      <div class="flex items-center gap-sm">
        <span style="font-weight: bold; width: 24px; text-align: center;">${rank}</span>
        <img src="${u.photoURL}" style="width: 32px; height: 32px; border-radius: 50%;">
        <div>
          <div style="font-weight: bold;">${u.displayName}</div>
          <div style="font-size: var(--text-xs); color: var(--color-text-muted);">Level ${u.level}</div>
        </div>
      </div>
      <div style="font-weight: bold; color: var(--color-primary);">${u.xp} XP</div>
    `;
    listContainer.appendChild(row);
  });
};
