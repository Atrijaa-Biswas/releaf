let chatHistory = [
  { role: 'assistant', content: "Hello! I'm your AI Eco Coach. How can I help you reduce your footprint today?" }
];

async function callGemini(promptText, useHistory = false) {
  const config = window.RELEAF_CONFIG;
  const isMock = !config || config.gemini.apiKey === "YOUR_GEMINI_API_KEY" || config.gemini.apiKey.startsWith("AIzaSy");

  if (isMock) {
    if (window.app.debug) window.app.debug('Mocking AI response');
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

  // Real Call using Groq REST API
  const apiKey = config.gemini.apiKey;
  const url = `https://api.groq.com/openai/v1/chat/completions`;

  let messages = [];
  if (useHistory) {
    messages = [...chatHistory, { role: 'user', content: promptText }];
  } else {
    messages = [{ role: 'user', content: promptText }];
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({ 
        model: 'llama-3.1-8b-instant',
        messages: messages
      })
    });
    
    const data = await response.json();
    if (data.choices && data.choices[0]) {
      const text = data.choices[0].message.content;
      if (useHistory) {
        chatHistory.push({ role: 'user', content: promptText });
        chatHistory.push({ role: 'assistant', content: text });
      }
      return text;
    }
    throw new Error('No candidate returned');
  } catch (err) {
    console.error('Groq API Error:', err);
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
          <p style="color: #3B2A1A; font-size: 0.9rem; margin-bottom: var(--space-md);">${m.description}</p>
        </div>
        <div class="flex justify-between items-center">
          <span class="chip" style="background: var(--color-gold); color: #7A4F00; font-style: normal; font-weight: bold; font-size: 0.8rem;">+${m.xp} XP</span>
          <button class="btn btn-secondary accept-btn" style="padding: var(--space-xs) var(--space-sm); font-size: var(--text-xs);">Accept</button>
        </div>
      `;
      const btn = card.querySelector('.accept-btn');
      btn.addEventListener('click', () => {
        const id = 'ai_' + Date.now() + Math.floor(Math.random() * 1000);
        window.CHALLENGES_DATA.unshift({
          id: id,
          category: m.category || 'AI Mission',
          icon: '🤖',
          difficulty: 'Medium',
          title: m.title,
          xp: m.xp || 20,
          co2: 1.0
        });
        
        btn.innerText = 'Accepted ✓';
        btn.disabled = true;
        btn.classList.remove('btn-secondary');
        btn.classList.add('btn-primary');

        if (window.renderChallenges) {
          window.renderChallenges();
        }
      });
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
