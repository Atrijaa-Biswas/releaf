// Firebase Initialization
let auth, db;
let isMockMode = false;

document.addEventListener('DOMContentLoaded', () => {
  const config = window.RELEAF_CONFIG;
  if (!config || config.firebase.apiKey === "YOUR_FIREBASE_API_KEY") {
    if (window.app.debug) window.app.debug('Using mock auth/DB mode because Firebase keys are placeholders.');
    isMockMode = true;
    initMockAuth();
  } else {
    firebase.initializeApp(config.firebase);
    auth = firebase.auth();
    db = firebase.database();
    
    auth.onAuthStateChanged(user => {
      if (user) {
        handleUserLogin(user);
      } else {
        handleUserLogout();
      }
    });

    const showError = (error) => {
      const errEl = document.getElementById('auth-error');
      errEl.innerText = error.message || error;
      errEl.style.display = 'block';
    };

    document.getElementById('btn-google-login').addEventListener('click', () => {
      document.getElementById('auth-error').style.display = 'none';
      const provider = new firebase.auth.GoogleAuthProvider();
      auth.signInWithPopup(provider).catch(showError);
    });

    document.getElementById('btn-email-signup').addEventListener('click', () => {
      document.getElementById('auth-error').style.display = 'none';
      const email = document.getElementById('auth-email').value;
      const pass = document.getElementById('auth-password').value;
      if (!email || !pass) return showError("Please enter email and password");
      auth.createUserWithEmailAndPassword(email, pass).catch(showError);
    });

    document.getElementById('btn-email-signin').addEventListener('click', () => {
      document.getElementById('auth-error').style.display = 'none';
      const email = document.getElementById('auth-email').value;
      const pass = document.getElementById('auth-password').value;
      if (!email || !pass) return showError("Please enter email and password");
      auth.signInWithEmailAndPassword(email, pass).catch(showError);
    });

    document.getElementById('btn-logout').addEventListener('click', () => {
      auth.signOut();
    });
  }
});

// Mock Auth fallback for development without keys
function initMockAuth() {
  const mockUserStr = localStorage.getItem('releaf_mock_user');
  if (mockUserStr) {
    handleUserLogin(JSON.parse(mockUserStr), true);
  } else {
    handleUserLogout();
  }

  const setupMockLogin = (btnId) => {
    document.getElementById(btnId)?.addEventListener('click', () => {
      const mockUser = {
        uid: 'mock_user_123',
        displayName: 'Eco Warrior',
        photoURL: 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs='
      };
      localStorage.setItem('releaf_mock_user', JSON.stringify(mockUser));
      handleUserLogin(mockUser, true);
    });
  };

  setupMockLogin('btn-google-login');
  setupMockLogin('btn-email-signin');
  setupMockLogin('btn-email-signup');

  document.getElementById('btn-logout').addEventListener('click', () => {
    localStorage.removeItem('releaf_mock_user');
    handleUserLogout();
  });
}

const LEVEL_THRESHOLDS = [0, 100, 300, 600, 1000, 1500];
const LEVEL_TITLES = ['Seedling', 'Sprout', 'Sapling', 'Grove Keeper', 'Forest Guardian', 'Earth Champion'];

function getLevelInfo(xp) {
  let level = 1;
  let title = LEVEL_TITLES[0];
  let xpNeeded = LEVEL_THRESHOLDS[1];
  let currentLevelBaseXP = 0;

  for (let i = 0; i < LEVEL_THRESHOLDS.length; i++) {
    if (xp >= LEVEL_THRESHOLDS[i]) {
      level = i + 1;
      title = LEVEL_TITLES[i] || 'Earth Champion';
      currentLevelBaseXP = LEVEL_THRESHOLDS[i];
      xpNeeded = LEVEL_THRESHOLDS[i + 1] || xp; // max level
    }
  }

  return { level, title, xpNeeded, currentLevelBaseXP };
}

async function handleUserLogin(user, isMock = false) {
  if (window.app.debug) window.app.debug('User logged in:', user.displayName);
  
  // Show navigation, switch to home
  document.getElementById('main-nav').classList.remove('hidden');
  window.app.navigateTo('home-page');

  // Fetch or create user document
  let userData;
  if (isMockMode) {
    userData = JSON.parse(localStorage.getItem('releaf_user_data')) || createDefaultUserData(user);
    localStorage.setItem('releaf_user_data', JSON.stringify(userData));
  } else {
    try {
      const userRef = db.ref('users/' + user.uid);
      const snapshot = await userRef.once('value');
      if (!snapshot.exists()) {
        userData = createDefaultUserData(user);
        await userRef.set(userData);
      } else {
        userData = snapshot.val();
        // Check and update streak logic here based on lastActive
        userData = checkAndUpdateStreak(userData);
        await userRef.update({ streak: userData.streak, lastActive: new Date().toISOString() });
      }
    } catch (err) {
      console.error("Firebase DB Error:", err);
      alert("Firebase Database Error: " + err.message + "\\n(Please set your Realtime Database rules to true for testing)");
      userData = createDefaultUserData(user); // Fallback to local
    }
  }

  window.app.currentUser = {
    uid: user.uid,
    email: user.email || '',
    ...userData
  };
  
  if (window.initTree) {
    window.initTree();
  }
  
  updateUIWithUserData();
}

function handleUserLogout() {
  window.app.currentUser = null;
  document.getElementById('main-nav').classList.add('hidden');
  window.app.navigateTo('landing-page');
}

function createDefaultUserData(user) {
  // If user signed up with email/pass, displayName and photoURL might be null
  const defaultName = user.email ? user.email.split('@')[0] : 'Eco Warrior';
  return {
    displayName: user.displayName || defaultName,
    photoURL: user.photoURL || 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=',
    xp: 0,
    level: 1,
    streak: 0,
    lastActive: new Date().toISOString(),
    totalCO2Saved: 0.0,
    completedChallenges: {},
    badges: {},
    weeklyXP: 0,
    season: 3
  };
}

function checkAndUpdateStreak(userData) {
  const last = new Date(userData.lastActive);
  const now = new Date();
  const diffTime = Math.abs(now - last);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
  
  // Simple streak logic
  if (diffDays === 1 || diffDays === 0) { // Same day or next day
    // Do nothing on login, streak increments on first challenge of day
  } else if (diffDays > 1) {
    userData.streak = 0; // Broke streak
  }
  return userData;
}

window.updateUserDataAfterChallenge = async function(challenge) {
  const user = window.app.currentUser;
  const today = new Date().toISOString().split('T')[0];
  
  if (!user.completedChallenges) {
    user.completedChallenges = {};
  }
  
  if (!user.completedChallenges[today]) {
    user.completedChallenges[today] = {};
    user.streak = (user.streak || 0) + 1; // Increment streak on first challenge of the day
  }
  
  user.completedChallenges[today][challenge.id] = true;
  user.xp = (user.xp || 0) + challenge.xp;
  user.weeklyXP = (user.weeklyXP || 0) + challenge.xp;
  user.totalCO2Saved = (user.totalCO2Saved || 0) + challenge.co2;

  const levelInfo = getLevelInfo(user.xp);
  
  if (levelInfo.level > user.level) {
    if (window.triggerLevelUpPortalFX) {
      window.triggerLevelUpPortalFX(levelInfo.title);
    }
  }
  
  user.level = levelInfo.level;
  
  // To ensure UI sees the change, we assign the mutated object back
  window.app.currentUser = user;

  if (isMockMode) {
    localStorage.setItem('releaf_user_data', JSON.stringify(user));
    // Also mock global leaderboard update
    let mockLb = JSON.parse(localStorage.getItem('releaf_mock_lb') || '{}');
    mockLb[user.uid] = { displayName: user.displayName, xp: user.xp, photoURL: user.photoURL, level: user.level, co2Saved: user.totalCO2Saved };
    localStorage.setItem('releaf_mock_lb', JSON.stringify(mockLb));
  } else {
    try {
      // Update Firebase
      const updates = {};
      updates['users/' + user.uid] = user;
      updates['leaderboard/global/' + user.uid] = {
        displayName: user.displayName,
        photoURL: user.photoURL,
        xp: user.xp,
        co2Saved: user.totalCO2Saved,
        level: user.level
      };
      updates['leaderboard/weekly/' + user.uid] = {
        displayName: user.displayName,
        photoURL: user.photoURL,
        weeklyXP: user.weeklyXP
      };
      await db.ref().update(updates);
    } catch (err) {
      console.error("Firebase DB Update Error:", err);
      alert("Failed to save progress: " + err.message);
    }
  }

  updateUIWithUserData();
  
  // Living tree logic
  if (window.sproutLeaf) {
    window.sproutLeaf();
  }
  
  if (window.treeState && window.getStageFromXP) {
    const newStage = window.getStageFromXP(user.xp);
    if (newStage > window.treeState.stage) {
      if (window.transitionToStage) window.transitionToStage(newStage);
    }
  }
};

function updateUIWithUserData() {
  const user = window.app.currentUser;
  if (!user) return;

  // Home Page
  document.getElementById('home-greeting').innerText = `Greetings, ${user.displayName.split(' ')[0]}`;
  document.getElementById('home-streak').innerText = `🔥 ${user.streak} day streak`;
  document.getElementById('home-xp-badge').innerText = `${user.xp} XP`;
  
  const levelInfo = getLevelInfo(user.xp);
  document.getElementById('home-level-title').innerText = levelInfo.title;
  document.getElementById('home-xp-text').innerText = `${user.xp} / ${levelInfo.xpNeeded} XP`;
  
  const ring = document.getElementById('home-xp-ring');
  if (ring) {
    const circumference = 565.48; // 2 * pi * 90
    const progressXP = user.xp - levelInfo.currentLevelBaseXP;
    const levelTotalXP = levelInfo.xpNeeded - levelInfo.currentLevelBaseXP;
    const percentage = levelTotalXP === 0 ? 1 : Math.min(progressXP / levelTotalXP, 1);
    const offset = circumference - (percentage * circumference);
    setTimeout(() => {
      ring.style.strokeDashoffset = offset;
    }, 100);
  }

  // Profile Page
  const profileNameEl = document.getElementById('profile-name');
  if (profileNameEl) profileNameEl.innerText = user.displayName;
  
  const profileCrestEl = document.getElementById('profile-crest');
  if (profileCrestEl && window.generateProceduralCrest) {
    profileCrestEl.innerText = window.generateProceduralCrest(user.displayName);
  }

  const profileLevelEl = document.getElementById('profile-level');
  if (profileLevelEl) profileLevelEl.innerText = levelInfo.title;
  
  let totalChallenges = 0;
  for (const date in user.completedChallenges) {
    totalChallenges += Object.keys(user.completedChallenges[date]).length;
  }
  document.getElementById('stat-challenges').innerText = totalChallenges;
  document.getElementById('stat-co2').innerText = (user.totalCO2Saved || 0).toFixed(1);
  document.getElementById('stat-streak').innerText = user.streak || 0;

  const chroniclesContent = document.getElementById('chronicles-content');
  if (chroniclesContent) {
    if (totalChallenges > 0) {
      chroniclesContent.innerHTML = `<p style="font-family: var(--font-body); color: #1C1C1E; font-size: var(--text-base); text-align: left; line-height: 1.6; font-style: normal; text-shadow: none;">"This week, you cycled twice, skipped meat three times, and saved ${(user.totalCO2Saved || 0).toFixed(1)} kg of CO₂ — a quiet but steady week for the forest."</p>`;
    } else {
      chroniclesContent.innerHTML = `
        <div style="font-size: 40px; margin-bottom: 8px;">✒️</div>
        Your story is just beginning. Complete your first Trial to write your first Chronicle.
      `;
    }
  }
}

window.renderHome = function() {
  updateUIWithUserData();
  // Fetch tip if not loaded
  if (window.fetchDailyTip) window.fetchDailyTip();
  
  // Render featured challenges (first 3 not done today)
  const grid = document.getElementById('home-featured-challenges');
  if (!grid) return;
  grid.innerHTML = '';
  
  const today = new Date().toISOString().split('T')[0];
  const userCompleted = window.app.currentUser?.completedChallenges?.[today] || {};
  
  // Quick algorithm: pick 3 challenges
  // In a real app, maybe pick randomly or based on history. Here we pick the first 3.
  const featured = window.CHALLENGES_DATA ? window.CHALLENGES_DATA.slice(0, 3) : [];
  
  featured.forEach(c => {
    const isCompleted = !!userCompleted[c.id];
    const card = document.createElement('div');
    card.className = 'card flex-col justify-between';
    if (isCompleted) {
      card.style.opacity = '0.6';
    }
    card.innerHTML = `
      <div>
        <h3 style="font-size: var(--text-base); margin-bottom: var(--space-xs);">${c.title}</h3>
        <span class="chip" style="background: var(--color-primary); color: white;">+${c.xp} XP</span>
      </div>
    `;
    grid.appendChild(card);
  });
};
