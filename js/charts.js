let chartsLoaded = false;

if (typeof google !== 'undefined') {
  google.charts.load('current', {'packages':['corechart']});
  google.charts.setOnLoadCallback(() => {
    chartsLoaded = true;
    if (document.getElementById('profile-page').classList.contains('active')) {
      window.renderProfile();
    }
  });
}

window.renderProfile = function() {
  // Render Badges
  const badgesGrid = document.getElementById('badges-grid');
  if (badgesGrid && badgesGrid.children.length === 0) {
    const badges = [
      { id: 'b1', name: 'First Leaf', cond: 'Complete 1 challenge', rarity: 'Common', icon: '🍃' },
      { id: 'b2', name: 'Streak Starter', cond: '3-day streak', rarity: 'Common', icon: '🔥' },
      { id: 'b3', name: 'Carbon Cutter', cond: 'Save 10 kg CO₂', rarity: 'Rare', icon: '✂️' },
      { id: 'b4', name: 'Earth Champion', cond: 'Reach max level', rarity: 'Legendary', icon: '🌍' }
    ];

    const user = window.app.currentUser;
    const earnedBadges = user ? user.badges || {} : {};

    badgesGrid.innerHTML = '';
    badges.forEach(b => {
      const isEarned = true; // Mocking all as earned for display purposes unless logic added
      let borderCol = 'var(--color-border)';
      if (b.rarity === 'Rare') borderCol = 'var(--color-accent)';
      if (b.rarity === 'Legendary') borderCol = 'var(--color-gold)';

      const card = document.createElement('div');
      card.className = 'card flex-col justify-center';
      card.style.padding = 'var(--space-sm)';
      card.style.border = `3px solid ${borderCol}`;
      card.style.minHeight = '80px';
      
      card.innerHTML = `
        <div class="flex items-center gap-sm" style="margin-bottom: 4px;">
          <div class="badge-medallion badge-${b.rarity.toLowerCase()}" style="font-size: var(--text-xl); flex-shrink: 0; width: 40px; height: 40px;">${b.icon}</div>
          <div style="font-weight: bold; font-family: var(--font-display); font-size: var(--text-base); color: #1C1C1E; line-height: 1.1;">${b.name}</div>
        </div>
        <div style="font-size: var(--text-xs); color: #3B1F0A; font-style: italic;">${b.cond}</div>
      `;
      badgesGrid.appendChild(card);
    });
  }

  // Render Charts
  if (chartsLoaded && window.app.currentUser) {
    drawCharts();
  }
};

function drawCharts() {
  const lineContainer = document.getElementById('chart-line');
  const donutContainer = document.getElementById('chart-donut');

  if (!lineContainer || !donutContainer) return;

  // Mock data for Line Chart (CO2 saved per week)
  const lineData = google.visualization.arrayToDataTable([
    ['Week', 'CO₂ Saved (kg)'],
    ['W1',  2.5],
    ['W2',  4.2],
    ['W3',  3.8],
    ['W4',  5.1],
    ['W5',  7.0],
    ['W6',  6.5],
    ['W7',  8.2],
    ['W8',  10.0]
  ]);

  const lineOptions = {
    title: 'CO₂ Saved Over Time',
    curveType: 'function',
    legend: { position: 'bottom' },
    colors: ['#52B788'],
    backgroundColor: 'transparent',
    chartArea: { width: '85%', height: '70%' },
    hAxis: { textStyle: { color: '#6B7280' } },
    vAxis: { textStyle: { color: '#6B7280' } }
  };

  const lineChart = new google.visualization.LineChart(lineContainer);
  lineChart.draw(lineData, lineOptions);

  // Mock data for Donut Chart (Category breakdown)
  const donutData = google.visualization.arrayToDataTable([
    ['Category', 'CO₂ Saved'],
    ['Transport', 40],
    ['Food',      30],
    ['Energy',    20],
    ['Shopping',  10]
  ]);

  const donutOptions = {
    title: 'Savings by Category',
    pieHole: 0.4,
    colors: ['#1B4332', '#52B788', '#D8F3DC', '#F4A261'],
    backgroundColor: 'transparent',
    chartArea: { width: '90%', height: '80%' },
    legend: { position: 'bottom' }
  };

  const donutChart = new google.visualization.PieChart(donutContainer);
  donutChart.draw(donutData, donutOptions);
}

// Redraw charts on resize
window.addEventListener('resize', () => {
  if (document.getElementById('profile-page').classList.contains('active')) {
    if (chartsLoaded) drawCharts();
  }
});
