let chatHistory = [
  { role: 'model', parts: [{ text: "Hello! I'm your AI Eco Coach. How can I help you reduce your footprint today?" }] }
];

async function callGemini(promptText, useHistory = false) {
  const config = window.RELEAF_CONFIG;
  const isMock = !config || config.gemini.apiKey === "YOUR_GEMINI_API_KEY";

  if (isMock) {
    if (window.app.debug) window.app.debug('Mocking Gemini response');
    return new Promise(resolve => setTimeout(() => {
      if (promptText.includes('tip for today')) {
        resolve("Turn off the tap while brushing your teeth to save up to 8 gallons of water a day!");
      } else if (promptText.includes('3 personalized eco missions')) {
        resolve(`[
          { "title": "Meatless Monday", "description": "Skip meat for all meals today.", "xp": 50, "category": "Food" },
          { "title": "Vampire Power", "description": "Unplug 3 devices not in use.", "xp": 30, "category": "Energy" },
          { "title": "Walk the Block", "description": "Walk to a nearby store instead of driving.", "xp": 40, "category": "Transport" }
        ]`);
      } else {
        resolve("That's a great question! Since I'm in mock mode, I don't have the real answer, but keeping up with your daily challenges is the best way to reduce your footprint.");
      }
    }, 1000));
  }

  // Real Gemini Call using REST API
  const apiKey = config.gemini.apiKey;
  // Use gemini-1.5-flash as default, prompt asks for gemini-pro but standard REST is fine.
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  let contents = [];
  if (useHistory) {
    contents = [...chatHistory, { role: 'user', parts: [{ text: promptText }] }];
  } else {
    contents = [{ role: 'user', parts: [{ text: promptText }] }];
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents })
    });
    const data = await response.json();
    if (data.candidates && data.candidates[0]) {
      const text = data.candidates[0].content.parts[0].text;
      if (useHistory) {
        chatHistory.push({ role: 'user', parts: [{ text: promptText }] });
        chatHistory.push({ role: 'model', parts: [{ text }] });
      }
      return text;
    }
    throw new Error('No candidate returned');
  } catch (err) {
    console.error('Gemini API Error:', err);
    return "I'm having trouble connecting to my AI brain right now. Try again later!";
  }
}

window.fetchDailyTip = async function() {
  const tipEl = document.getElementById('home-daily-tip');
  if (!tipEl || tipEl.dataset.loaded) return;

  tipEl.innerText = "Thinking of a tip...";
  const prompt = "You are the ReLeaf eco coach. Give one practical, encouraging eco tip for today in 2 sentences maximum. Be specific, positive, and actionable.";
  const tip = await callGemini(prompt);
  tipEl.innerText = tip;
  tipEl.dataset.loaded = 'true';
};

window.renderCoach = async function() {
  const missionsContainer = document.getElementById('missions-container');
  if (missionsContainer.dataset.loaded) return;

  missionsContainer.innerHTML = '<div class="card" style="grid-column: 1 / -1; text-align: center;">Analyzing your habits to generate missions...</div>';
  
  const user = window.app.currentUser;
  let historyStr = 'None yet';
  if (user && user.completedChallenges) {
    // Collect titles of recently completed challenges
    historyStr = "Various completed challenges."; // Simplified for prompt
  }

  const prompt = `You are the ReLeaf eco coach. Based on the user's recent completed challenges: [${historyStr}], generate exactly 3 personalized eco missions for this week that target areas they haven't focused on. Return ONLY a JSON array with no markdown formatting (no \`\`\`json), no preamble: [{"title": "string", "description": "string", "xp": number, "category": "string"}]`;

  const responseText = await callGemini(prompt);
  
  try {
    // Clean potential markdown from Gemini
    const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    const missions = JSON.parse(cleanJson);
    
    missionsContainer.innerHTML = '';
    missions.forEach(m => {
      const card = document.createElement('div');
      card.className = 'card flex-col justify-between';
      card.innerHTML = `
        <div>
          <h3 style="font-size: var(--text-lg); margin-bottom: var(--space-xs);">${m.title}</h3>
          <p style="color: var(--color-text-muted); font-size: var(--text-sm); margin-bottom: var(--space-md);">${m.description}</p>
        </div>
        <div class="flex justify-between items-center">
          <span class="chip" style="background: var(--color-primary); color: white;">+${m.xp} XP</span>
          <button class="btn btn-secondary" style="padding: var(--space-xs) var(--space-sm); font-size: var(--text-xs);">Accept</button>
        </div>
      `;
      missionsContainer.appendChild(card);
    });
    missionsContainer.dataset.loaded = 'true';
  } catch (e) {
    console.error('Failed to parse missions', e);
    missionsContainer.innerHTML = '<div class="card" style="grid-column: 1 / -1; text-align: center; color: var(--color-danger);">Failed to load missions. Please try again.</div>';
  }
};

// Chat functionality
document.addEventListener('DOMContentLoaded', () => {
  const sendBtn = document.getElementById('btn-chat-send');
  const input = document.getElementById('chat-input');
  const windowEl = document.getElementById('chat-window');

  async function sendMessage(text) {
    if (!text.trim()) return;

    // Append User message
    const userMsg = document.createElement('div');
    userMsg.className = 'chat-bubble chat-user';
    userMsg.innerText = text;
    windowEl.appendChild(userMsg);
    input.value = '';
    windowEl.scrollTop = windowEl.scrollHeight;

    // Typing indicator
    const typing = document.createElement('div');
    typing.className = 'chat-bubble chat-bot';
    typing.innerText = '...';
    windowEl.appendChild(typing);
    windowEl.scrollTop = windowEl.scrollHeight;

    // Call Gemini
    let contextPrompt = `You are ReLeaf's eco coach. The user is trying to reduce their carbon footprint through daily green challenges. Be encouraging, specific, and practical. Keep responses under 150 words unless asked for more. User says: ${text}`;
    
    const reply = await callGemini(contextPrompt, true);
    
    // Replace typing with response
    windowEl.removeChild(typing);
    const botMsg = document.createElement('div');
    botMsg.className = 'chat-bubble chat-bot';
    botMsg.innerText = reply;
    windowEl.appendChild(botMsg);
    windowEl.scrollTop = windowEl.scrollHeight;
  }

  sendBtn?.addEventListener('click', () => sendMessage(input.value));
  input?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage(input.value);
  });

  document.querySelectorAll('.chat-quick-prompt').forEach(btn => {
    btn.addEventListener('click', (e) => {
      sendMessage(e.target.innerText);
    });
  });

  document.getElementById('btn-refresh-missions')?.addEventListener('click', () => {
    document.getElementById('missions-container').dataset.loaded = '';
    window.renderCoach();
  });
});
