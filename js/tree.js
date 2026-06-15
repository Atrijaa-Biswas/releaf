/**
 * ReLeaf - The Living Tree
 * Handles rendering, animating, and transitioning the central SVG tree.
 */

window.treeState = {
  stage: 1,
  dynamicLeaves: [],
  earnedBadgeElements: []
};

// SVG paths for badges
const BADGE_ELEMENTS = {
  'first-leaf': { path: '<path d="M0,0 Q-10,-10 0,-20 Q10,-10 0,0" fill="#FFD700" style="filter: drop-shadow(0 0 8px #FFD700)"/>', x: 200, y: 300, animation: 'gentle-sway', name: 'First Leaf' },
  'streak-starter': { path: '<path d="M0,0 L-5,-10 L0,-15 L5,-10 Z" fill="#FF4081" style="filter: drop-shadow(0 0 10px #FF4081)"/>', x: 280, y: 400, animation: 'flame-flicker', name: 'Streak Starter' },
  'meal-hero': { path: '<circle cx="0" cy="0" r="6" fill="#FF4081" style="filter: drop-shadow(0 0 10px #FF4081)"/>', x: 380, y: 250, animation: 'slow-pendulum', name: 'Meal Hero' },
  'pedal-power': { path: '<circle cx="0" cy="0" r="8" fill="#00E676" style="filter: drop-shadow(0 0 10px #00E676)"/>', x: 350, y: 400, animation: 'subtle-bounce', name: 'Pedal Power' },
  'energy-saver': { path: '<path d="M-5,0 L5,-10 L0,-10 L5,-20 L-5,-10 L0,-10 Z" fill="#FFD700" style="filter: drop-shadow(0 0 8px #FFD700)"/>', x: 280, y: 280, animation: 'spark-pulse', name: 'Energy Saver' },
  'green-shopper': { path: '<rect x="-6" y="-8" width="12" height="16" fill="#00F5FF" style="filter: drop-shadow(0 0 8px #00F5FF)"/>', x: 220, y: 320, animation: 'bag-sway', name: 'Green Shopper' },
  'community-spirit': { path: '<circle cx="-5" cy="-10" r="4" fill="#B2FF59"/><circle cx="5" cy="-10" r="4" fill="#B2FF59"/>', x: 200, y: 400, animation: 'figure-wave', name: 'Community Spirit' },
  'week-warrior': { path: '<path d="M0,0 L-8,-15 L0,-25 L8,-15 Z" fill="#FF4081" style="filter: drop-shadow(0 0 15px #FF4081)"/>', x: 280, y: 400, animation: 'large-flicker', name: 'Week Warrior' },
  'carbon-cutter': { path: '<path d="M-2,-20 L2,-20 L2,0 L-2,0 Z" fill="#00F5FF" style="filter: drop-shadow(0 0 10px #00F5FF)"/><circle cx="0" cy="-20" r="2" fill="#00E676"/>', x: 450, y: 400, animation: 'blade-spin', name: 'Carbon Cutter' },
  'challenge-champion': { path: '<polygon points="0,-10 3,-3 10,-3 4,2 6,9 0,5 -6,9 -4,2 -10,-3 -3,-3" fill="#FFD700" style="filter: drop-shadow(0 0 12px #FFD700)"/>', x: 300, y: 260, animation: 'star-pulse', name: 'Challenge Champion' },
  'plant-parent': { path: '<rect x="-5" y="-10" width="10" height="10" fill="#1B2A47"/><circle cx="0" cy="-15" r="5" fill="#00E676" style="filter: drop-shadow(0 0 8px #00E676)"/>', x: 330, y: 400, animation: 'leaf-sway', name: 'Plant Parent' },
  'iron-cyclist': { path: '<circle cx="0" cy="0" r="8" fill="#00F5FF" style="filter: drop-shadow(0 0 10px #00F5FF)"/>', x: 350, y: 400, animation: 'glow-pulse', name: 'Iron Cyclist' },
  'plant-based-pioneer': { path: '<circle cx="-5" cy="-5" r="6" fill="#B2FF59" style="filter: drop-shadow(0 0 10px #B2FF59)"/><circle cx="5" cy="-5" r="5" fill="#00E676"/>', x: 250, y: 400, animation: 'gentle-grow', name: 'Plant-Based Pioneer' },
  'zero-waste-hero': { path: '<path d="M-5,0 L0,-10 L5,0 Z" fill="none" stroke="#00F5FF" stroke-width="2" style="filter: drop-shadow(0 0 8px #00F5FF)"/>', x: 310, y: 350, animation: 'symbol-spin', name: 'Zero Waste Hero' },
  'streak-master': { path: '<path d="M0,0 Q-10,-10 0,-20 Q10,-10 0,0" fill="#FF4081" style="filter: drop-shadow(0 0 15px #FF4081)"/>', x: 300, y: 80, animation: 'feather-drift', name: 'Streak Master' },
  'century-club': { path: '<path d="M-10,0 A10,10 0 0,1 10,0 Z" fill="#E0F7FA" style="filter: drop-shadow(0 0 10px #E0F7FA)"/>', x: 200, y: 150, animation: 'cloud-float', name: 'Century Club' },
  'mission-master': { path: '<polygon points="0,-10 2,-2 10,0 2,2 0,10 -2,2 -10,0 -2,-2" fill="#00E676" style="filter: drop-shadow(0 0 12px #00E676)"/>', x: 400, y: 180, animation: 'compass-rotate', name: 'Mission Master' },
  'earth-champion': { path: '<path d="M-15,0 L-10,-10 L-5,-5 L0,-15 L5,-5 L10,-10 L15,0 Z" fill="#FFD700" style="filter: drop-shadow(0 0 20px #FFD700)"/>', x: 300, y: 50, animation: 'crown-shimmer', name: 'Earth Champion' },
  'season-legend': { path: '<rect x="-5" y="-10" width="10" height="10" fill="#FFD700"/><path d="M-5,-5 L-10,-5 L-10,-10 L-5,-10" fill="none" stroke="#FFD700" style="filter: drop-shadow(0 0 15px #FFD700)"/>', x: 400, y: 100, animation: 'trophy-glow', name: 'Season Legend' },
  'releaf-royalty': { path: '<circle cx="300" cy="200" r="180" fill="none" stroke="rgba(0, 245, 255, 0.2)" stroke-width="10" style="filter: drop-shadow(0 0 20px rgba(0, 245, 255, 0.5))"/>', x: 0, y: 0, animation: 'aurora-rotate', name: 'ReLeaf Royalty' }
};

window.initTree = function () {
  const user = window.app.currentUser;
  if (!user) return;

  if (user.treeState) {
    window.treeState = user.treeState;
  } else {
    // Initialize defaults based on current user xp
    window.treeState.stage = getStageFromXP(user.xp);
  }

  setStage(window.treeState.stage);

  // Re-render dynamic leaves
  const leafLayer = document.getElementById('layer-leaves-dynamic');
  if (leafLayer) {
    leafLayer.innerHTML = '';
    window.treeState.dynamicLeaves.forEach(leaf => {
      const el = createLeafElement(leaf.x, leaf.y, leaf.color, leaf.angle);
      // Remove the spring animation class so they just appear
      el.classList.remove('pop-in-spring');
      el.style.transform = `translate(${leaf.x}px, ${leaf.y}px) rotate(${leaf.angle}deg)`;
      leafLayer.appendChild(el);
    });
  }

  // Re-render badges
  const badgeLayer = document.getElementById('layer-badge-elements');
  if (badgeLayer) {
    badgeLayer.innerHTML = '';
    window.treeState.earnedBadgeElements.forEach(id => {
      addBadgeElementDOM(id);
    });
  }
};

window.getStageFromXP = function (xp) {
  if (xp < 200) return 1;
  if (xp < 500) return 2;
  if (xp < 1000) return 3;
  if (xp < 2000) return 4;
  if (xp < 3500) return 5;
  return 6;
};

window.setStage = function (stageNum) {
  const svg = document.getElementById('living-tree');
  if (!svg) return;
  svg.className = `stage-${stageNum}`;

  // Adjust viewBox so early stages are zoomed in, removing empty vertical space
  const cx = 300, cy = 400;
  if (stageNum === 1) {
    svg.setAttribute('viewBox', `${cx - 100} ${cy - 120} 200 170`);
  } else if (stageNum === 2) {
    svg.setAttribute('viewBox', `${cx - 150} ${cy - 200} 300 250`);
  } else if (stageNum === 3) {
    svg.setAttribute('viewBox', `${cx - 200} ${cy - 280} 400 330`);
  } else if (stageNum === 4) {
    svg.setAttribute('viewBox', `${cx - 250} ${cy - 350} 500 400`);
  } else {
    svg.setAttribute('viewBox', `0 0 600 500`);
  }

  drawStage(stageNum);
};

window.transitionToStage = function (newStage) {
  if (newStage === window.treeState.stage) return; // No change

  const svg = document.getElementById('living-tree');
  if (!svg) return;

  // 1. Particle explosion
  burstParticles(300, 250, true);

  // 2. Fade out current stage
  svg.style.transition = 'opacity 600ms ease-in, transform 600ms ease-in';
  svg.style.opacity = '0';
  svg.style.transform = 'scale(0.97)';

  setTimeout(() => {
    // 3. Flash
    const flash = document.getElementById('flash-overlay');
    if (flash) {
      flash.classList.add('active');
      setTimeout(() => flash.classList.remove('active'), 400);
    }

    // Update stage drawing
    setStage(newStage);
    window.treeState.stage = newStage;
    syncTreeState();

    // 4. Fade in
    svg.style.transition = 'opacity 800ms ease-out, transform 800ms ease-out';
    svg.style.opacity = '1';
    svg.style.transform = 'scale(1)';

    // 5. Level Up Overlay
    showLevelUpCard(newStage);

  }, 600);
};

window.sproutLeaf = function () {
  const leafLayer = document.getElementById('layer-leaves-dynamic');
  if (!leafLayer) return;

  // Cap dynamic leaves to avoid SVG getting too heavy
  if (window.treeState.dynamicLeaves.length > 80) return;

  const tips = getBranchTips(window.treeState.stage);
  const tip = tips[Math.floor(Math.random() * tips.length)];
  const colors = ['#00E676', '#00F5FF', '#B2FF59', '#69F0AE'];
  const color = colors[Math.floor(Math.random() * colors.length)];
  const angle = (Math.random() * 80) - 40; // -40 to 40

  const leafEl = createLeafElement(tip.x, tip.y, color, angle);
  leafLayer.appendChild(leafEl);

  // Burst
  burstParticles(tip.x, tip.y);

  // Save
  window.treeState.dynamicLeaves.push({ x: tip.x, y: tip.y, color, angle });
  syncTreeState();
};

window.addBadgeElement = function (badgeId) {
  if (!BADGE_ELEMENTS[badgeId]) return;
  if (window.treeState.earnedBadgeElements.includes(badgeId)) return;

  window.treeState.earnedBadgeElements.push(badgeId);
  syncTreeState();

  const el = addBadgeElementDOM(badgeId);
  if (el) {
    el.classList.add('pop-in-spring');
  }
};

function addBadgeElementDOM(badgeId) {
  const badgeLayer = document.getElementById('layer-badge-elements');
  if (!badgeLayer) return null;
  const def = BADGE_ELEMENTS[badgeId];
  if (!def) return null;

  const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  g.innerHTML = def.path;
  g.setAttribute('transform', `translate(${def.x}, ${def.y})`);
  g.style.animation = `${def.animation} infinite alternate`;
  g.style.cursor = 'pointer';

  g.addEventListener('mouseenter', (e) => showTooltip(e, def.name));
  g.addEventListener('mouseleave', hideTooltip);

  badgeLayer.appendChild(g);
  return g;
}

window.burstParticles = function (x, y, isGold = false) {
  const layer = document.getElementById('layer-effects');
  if (!layer) return;

  const count = isGold ? 30 : 12;

  for (let i = 0; i < count; i++) {
    const angle = (i / count) * 2 * Math.PI + (Math.random() * 0.5);
    const distance = 30 + Math.random() * 50;
    const dx = Math.cos(angle) * distance;
    const dy = Math.sin(angle) * distance;
    const duration = 600 + Math.random() * 300;

    let colors = ['#00E676', '#00F5FF', '#B2FF59'];
    if (isGold) colors = ['#FFD700', '#FF4081', '#00F5FF'];

    const color = colors[Math.floor(Math.random() * colors.length)];

    const particle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    particle.setAttribute('cx', x);
    particle.setAttribute('cy', y);
    particle.setAttribute('r', 2 + Math.random() * 4);
    particle.setAttribute('fill', color);
    particle.style.filter = `drop-shadow(0 0 8px ${color})`;
    particle.style.transition = `transform ${duration}ms ease-out, opacity ${duration}ms ease-out`;

    layer.appendChild(particle);

    requestAnimationFrame(() => {
      particle.style.transform = `translate(${dx}px, ${dy}px) rotate(${Math.random() * 360}deg)`;
      particle.style.opacity = '0';
    });

    setTimeout(() => particle.remove(), duration + 50);
  }
};

window.syncTreeState = function () {
  const user = window.app.currentUser;
  if (!user) return;

  user.treeState = window.treeState;

  if (window.isMockMode) {
    localStorage.setItem('releaf_user_data', JSON.stringify(user));
  } else if (window.db) {
    window.db.ref('users/' + user.uid).update({ treeState: window.treeState });
  }
};

function createLeafElement(x, y, color, angle) {
  const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  g.classList.add('pop-in-spring');
  g.style.transformOrigin = '0px 0px';
  g.style.transform = `translate(${x}px, ${y}px) rotate(${angle}deg)`;

  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', 'M 0 0 C -8 -8 -10 -18 0 -22 C 10 -18 8 -8 0 0 Z');
  path.setAttribute('fill', color);

  // Add gentle breeze settle animation
  path.style.animation = 'gentle-sway 2s ease-in-out infinite alternate';
  path.style.transformOrigin = '0px 0px';
  path.style.filter = `drop-shadow(0 0 10px ${color})`;

  g.appendChild(path);
  return g;
}

function showLevelUpCard(stage) {
  const card = document.getElementById('level-up-card');
  const levelNames = ['', 'Seedling', 'Sprout', 'Sapling', 'Grove Keeper', 'Forest Guardian', 'Earth Champion'];
  if (card) {
    document.getElementById('level-up-title').innerText = `✨ You've grown to ${levelNames[stage]}! ✨`;
    card.classList.add('visible');
    setTimeout(() => card.classList.remove('visible'), 4000);
  }
}

function showTooltip(e, text) {
  const tooltip = document.getElementById('tree-tooltip');
  if (!tooltip) return;
  const rect = e.target.getBoundingClientRect();
  tooltip.innerHTML = `<span class="tooltip-badge-name">${text}</span>`;
  tooltip.style.left = `${rect.left + window.scrollX}px`;
  tooltip.style.top = `${rect.top + window.scrollY - 30}px`;
  tooltip.classList.add('visible');
}

function hideTooltip() {
  const tooltip = document.getElementById('tree-tooltip');
  if (tooltip) tooltip.classList.remove('visible');
}

function getBranchTips(stage) {
  // Returns array of {x, y} relative to SVG viewBox (600x500)
  // Hardcoded approximate branch tips for each stage
  const tips = [];
  const cx = 300, cy = 400; // base of tree
  if (stage <= 1) {
    tips.push({ x: cx, y: cy - 60 });
  } else if (stage === 2) {
    tips.push({ x: cx - 40, y: cy - 120 }, { x: cx + 40, y: cy - 120 }, { x: cx, y: cy - 150 });
  } else if (stage === 3) {
    tips.push({ x: cx - 70, y: cy - 180 }, { x: cx + 70, y: cy - 180 }, { x: cx - 20, y: cy - 200 }, { x: cx + 20, y: cy - 200 }, { x: cx, y: cy - 220 });
  } else if (stage === 4) {
    tips.push({ x: cx - 120, y: cy - 200 }, { x: cx + 120, y: cy - 200 }, { x: cx - 80, y: cy - 240 }, { x: cx + 80, y: cy - 240 }, { x: cx, y: cy - 280 });
  } else {
    // Stages 5 & 6 have huge canopies
    for (let i = 0; i < 15; i++) {
      tips.push({
        x: cx + (Math.random() * 300 - 150),
        y: cy - 150 - (Math.random() * 150)
      });
    }
  }
  return tips;
}

// Massive drawing function for the base SVG structures per stage
function drawStage(stage) {
  // Sky
  const sky = document.getElementById('layer-sky');
  // Ground
  const ground = document.getElementById('layer-ground');
  // Trunk
  const trunk = document.getElementById('layer-trunk');
  // Foliage Base
  const foliage = document.getElementById('layer-foliage-base');

  if (!sky || !ground || !trunk || !foliage) return;

  const cx = 300, cy = 400;

  // Magical Base Colors
  const trunkColor = "#1B2A47"; // Deep magical indigo wood
  const trunkGlow = "drop-shadow(0 0 8px rgba(0, 245, 255, 0.2))";

  const leafDark = "#00BFA5";   // Deep cyan
  const leafMid = "#00E676";    // Neon green
  const leafLight = "#69F0AE";  // Bright lime/mint
  const leafGlow = "drop-shadow(0 0 15px rgba(0, 230, 118, 0.6))";

  if (stage === 1) {
    sky.innerHTML = ``; // Transparent to let ambient CSS background show
    ground.innerHTML = `<ellipse cx="${cx}" cy="${cy}" rx="40" ry="10" fill="#0A1128" style="filter: drop-shadow(0 0 10px rgba(0,0,0,0.8))"/>`;
    trunk.innerHTML = `<path d="M${cx},${cy} Q${cx-10},${cy-30} ${cx},${cy-60}" fill="none" stroke="${leafLight}" stroke-width="3" style="animation: sway 3s infinite alternate ease-in-out; transform-origin: ${cx}px ${cy}px; filter: ${leafGlow};"/>`;
    foliage.innerHTML = `
      <g style="filter: ${leafGlow};">
        <ellipse cx="${cx-8}" cy="${cy-55}" rx="10" ry="6" fill="${leafLight}" transform="rotate(-30, ${cx-8}, ${cy-55})" />
        <ellipse cx="${cx+8}" cy="${cy-55}" rx="10" ry="6" fill="${leafMid}" transform="rotate(30, ${cx+8}, ${cy-55})" />
        <circle cx="${cx-12}" cy="${cy-55}" r="2" fill="#FFFFFF" style="animation: dewdrop-fall 4s infinite; filter: drop-shadow(0 0 5px #fff);" />
      </g>
    `;
  } else if (stage === 2) {
    sky.innerHTML = ``;
    ground.innerHTML = `
      <ellipse cx="${cx}" cy="${cy}" rx="80" ry="15" fill="#0A1128" style="filter: drop-shadow(0 0 15px rgba(0,245,255,0.2))"/>
      <path d="M${cx-20},${cy} L${cx-20},${cy-10} M${cx+20},${cy} L${cx+20},${cy-10}" stroke="${leafLight}" stroke-width="2" style="filter: ${leafGlow}"/>
    `;
    trunk.innerHTML = `
      <g style="filter: ${trunkGlow}">
        <path d="M${cx-6},${cy} L${cx-3},${cy-150} L${cx+3},${cy-150} L${cx+6},${cy} Z" fill="${trunkColor}" />
        <path d="M${cx},${cy-100} Q${cx-40},${cy-120} ${cx-50},${cy-140}" fill="none" stroke="${trunkColor}" stroke-width="4" stroke-linecap="round" style="animation: branch-sway-left 4s infinite alternate" />
        <path d="M${cx},${cy-80} Q${cx+40},${cy-100} ${cx+50},${cy-120}" fill="none" stroke="${trunkColor}" stroke-width="4" stroke-linecap="round" style="animation: branch-sway-right 4.5s infinite alternate" />
      </g>
    `;
    foliage.innerHTML = `
      <g style="filter: ${leafGlow}">
        <circle cx="${cx}" cy="${cy-150}" r="30" fill="${leafMid}" style="animation: leaf-shimmer 5s infinite" />
        <circle cx="${cx-45}" cy="${cy-145}" r="20" fill="${leafDark}" style="animation: leaf-shimmer 5s infinite 1s" />
        <circle cx="${cx+45}" cy="${cy-125}" r="25" fill="${leafLight}" style="animation: leaf-shimmer 5s infinite 2s" />
      </g>
    `;
  } else if (stage === 3) {
    sky.innerHTML = ``;
    ground.innerHTML = `
      <ellipse cx="${cx}" cy="${cy}" rx="120" ry="20" fill="#0A1128" />
      <g style="filter: drop-shadow(0 0 10px rgba(0,245,255,0.5))">
        <path d="M${cx-15},${cy} Q${cx-40},${cy+10} ${cx-60},${cy+5}" fill="none" stroke="#00F5FF" stroke-width="2" style="animation: root-pulse 7s infinite" />
        <path d="M${cx+15},${cy} Q${cx+40},${cy+10} ${cx+60},${cy+5}" fill="none" stroke="#00F5FF" stroke-width="2" style="animation: root-pulse 7s infinite" />
      </g>
    `;
    trunk.innerHTML = `
      <g style="filter: ${trunkGlow}">
        <path d="M${cx-10},${cy} L${cx-5},${cy-220} L${cx+5},${cy-220} L${cx+10},${cy} Z" fill="${trunkColor}" />
        <ellipse cx="${cx}" cy="${cy-100}" rx="4" ry="8" fill="#050B14" />
        <path d="M${cx},${cy-150} Q${cx-60},${cy-160} ${cx-80},${cy-190}" fill="none" stroke="${trunkColor}" stroke-width="6" stroke-linecap="round" />
        <path d="M${cx},${cy-120} Q${cx+60},${cy-140} ${cx+80},${cy-170}" fill="none" stroke="${trunkColor}" stroke-width="6" stroke-linecap="round" />
      </g>
    `;
    foliage.innerHTML = `
      <g style="filter: ${leafGlow}">
        <circle cx="${cx}" cy="${cy-220}" r="60" fill="${leafDark}" />
        <circle cx="${cx-60}" cy="${cy-190}" r="45" fill="${leafMid}" style="animation: leaf-shimmer 4s infinite"/>
        <circle cx="${cx+60}" cy="${cy-180}" r="50" fill="${leafLight}" style="animation: leaf-shimmer 4.5s infinite 1s"/>
        <circle cx="${cx}" cy="${cy-200}" r="40" fill="#B2FF59" style="animation: leaf-shimmer 3s infinite 0.5s"/>
      </g>
    `;
  } else if (stage >= 4) {
    sky.innerHTML = ``;
    if(stage === 6) {
      sky.innerHTML += `
        <circle cx="100" cy="100" r="3" fill="#00F5FF" style="animation: star-twinkle 3s infinite; filter: drop-shadow(0 0 10px #00F5FF)" />
        <circle cx="500" cy="80" r="4" fill="#B2FF59" style="animation: star-twinkle 4s infinite 1s; filter: drop-shadow(0 0 12px #B2FF59)" />
        <circle cx="200" cy="50" r="2" fill="#00E676" style="animation: star-twinkle 2s infinite 0.5s; filter: drop-shadow(0 0 8px #00E676)" />
      `;
    }

    ground.innerHTML = `
      <ellipse cx="${cx}" cy="${cy}" rx="${150 + stage*30}" ry="${30 + stage*5}" fill="#050B14" style="filter: drop-shadow(0 10px 20px #000)"/>
      <g style="filter: drop-shadow(0 0 15px rgba(0,245,255,0.6))">
        <path d="M${cx-50},${cy} Q${cx-100},${cy+20} ${cx-150},${cy+10}" fill="none" stroke="#00F5FF" stroke-width="${stage-2}" style="animation: root-pulse 5s infinite" />
        <path d="M${cx+50},${cy} Q${cx+100},${cy+20} ${cx+150},${cy+10}" fill="none" stroke="#00E676" stroke.width="${stage-2}" style="animation: root-pulse 6s infinite 1s" />
      </g>
    `;
    
    let tW = 15 + stage*5;
    trunk.innerHTML = `
      <g style="filter: drop-shadow(0 0 20px rgba(0, 245, 255, 0.2))">
        <path d="M${cx-tW},${cy} L${cx-tW/2},${cy-300} L${cx+tW/2},${cy-300} L${cx+tW},${cy} Z" fill="${trunkColor}" />
        <path d="M${cx-tW/2},${cy-300} Q${cx-80},${cy-350} ${cx-150},${cy-320}" fill="none" stroke="${trunkColor}" stroke-width="12" stroke-linecap="round" style="animation: branch-sway-left 6s infinite alternate"/>
        <path d="M${cx+tW/2},${cy-280} Q${cx+80},${cy-330} ${cx+160},${cy-290}" fill="none" stroke="${trunkColor}" stroke-width="14" stroke-linecap="round" style="animation: branch-sway-right 7s infinite alternate"/>
        <ellipse cx="${cx}" cy="${cy-150}" rx="10" ry="20" fill="#050B14" style="filter: drop-shadow(0 0 5px #00F5FF)"/>
      </g>
    `;
    
    let cR = 80 + stage*20;
    foliage.innerHTML = `
      <g style="animation: canopy-breathe 6s infinite; filter: ${leafGlow}">
        <ellipse cx="${cx}" cy="${cy-250}" rx="${cR*1.5}" ry="${cR}" fill="${leafDark}" />
        <ellipse cx="${cx-cR/2}" cy="${cy-220}" rx="${cR}" ry="${cR*0.8}" fill="${leafMid}" style="animation: leaf-shimmer 5s infinite" />
        <ellipse cx="${cx+cR/2}" cy="${cy-220}" rx="${cR}" ry="${cR*0.8}" fill="#00F5FF" opacity="0.8" style="animation: leaf-shimmer 6s infinite 1s" />
        <ellipse cx="${cx}" cy="${cy-280}" rx="${cR*0.8}" ry="${cR*0.6}" fill="${leafLight}" style="animation: leaf-shimmer 4s infinite 2s" />
        <circle cx="${cx}" cy="${cy-240}" r="${cR*0.4}" fill="#B2FF59" opacity="0.6" style="filter: blur(20px); animation: star-twinkle 4s infinite;" />
      </g>
    `;
  }
}
