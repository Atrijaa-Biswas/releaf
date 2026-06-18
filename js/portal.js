// js/portal.js
document.addEventListener('DOMContentLoaded', () => {
  initParallax();
  initMist();
  initInkwellInputs();
  
  // Add button click sounds globally
  document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('mousedown', () => {
      // Very simple synth thud as placeholder for actual audio file
      playThud();
    });
  });
});

function playThud() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(100, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
    
    gain.gain.setValueAtTime(1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.1);
  } catch (e) {
    console.log('Audio context not supported');
  }
}

function initParallax() {
  const layers = document.querySelectorAll('.parallax-layer');
  
  // Mouse movement
  window.addEventListener('mousemove', (e) => {
    const x = (e.clientX - window.innerWidth / 2);
    const y = (e.clientY - window.innerHeight / 2);

    layers.forEach(layer => {
      const speed = parseFloat(layer.getAttribute('data-speed'));
      const xOffset = -(x * speed);
      const yOffset = -(y * speed);
      layer.style.transform = `translate(${xOffset}px, ${yOffset}px)`;
    });
  });

  // Device orientation (for mobile)
  window.addEventListener('deviceorientation', (e) => {
    if (!e.gamma || !e.beta) return;
    const x = e.gamma * 2; 
    const y = (e.beta - 45) * 2;

    layers.forEach(layer => {
      const speed = parseFloat(layer.getAttribute('data-speed'));
      const xOffset = -(x * speed);
      const yOffset = -(y * speed);
      layer.style.transform = `translate(${xOffset}px, ${yOffset}px)`;
    });
  });

  // Setup Layer 5
  const lightLayer = document.getElementById('layer-light');
  if(lightLayer) {
    for(let i=0; i<15; i++) {
      const particle = document.createElement('div');
      particle.style.position = 'absolute';
      particle.style.left = `${Math.random() * 100}%`;
      particle.style.top = `${Math.random() * 100}%`;
      particle.style.width = '4px';
      particle.style.height = '4px';
      particle.style.background = '#C9922A';
      particle.style.borderRadius = '50%';
      particle.style.boxShadow = '0 0 10px 4px rgba(201, 146, 42, 0.8)';
      const dur = 3 + Math.random() * 4;
      const del = Math.random() * 5;
      particle.style.animation = `flicker ${dur}s infinite alternate ${del}s`;
      lightLayer.appendChild(particle);
    }
  }
}

function initMist() {
  const mist = document.getElementById('morning-mist');
  if (mist) {
    mist.classList.add('active');
    setTimeout(() => {
      mist.classList.add('clearing');
      setTimeout(() => {
        mist.classList.remove('active', 'clearing');
      }, 3000);
    }, 1000);
  }
}

function initInkwellInputs() {
  const inputs = document.querySelectorAll('input');
  inputs.forEach(input => {
    input.addEventListener('input', () => {
      input.classList.remove('ink-ripple');
      void input.offsetWidth; 
      input.classList.add('ink-ripple');
    });
  });
}

window.triggerChallengeCompletePortalFX = function() {
  const moth = document.getElementById('moth-container');
  const owlAudio = document.getElementById('audio-owl');

  if (moth) {
    moth.classList.remove('fly-across');
    void moth.offsetWidth;
    moth.classList.add('fly-across');
  }

  if (owlAudio) {
    owlAudio.volume = 0.3;
    owlAudio.play().catch(e => console.log('Audio play prevented', e));
  }
};

window.triggerLevelUpPortalFX = function(levelTitle) {
  const card = document.getElementById('level-up-card');
  const title = document.getElementById('level-up-title');
  if(card && title) {
    title.innerText = `New Dawn: ${levelTitle}`;
    card.classList.add('visible');
    setTimeout(() => {
      card.classList.remove('visible');
    }, 4000);
  }
};

window.generateProceduralCrest = function(seedString) {
  if(!seedString) return '🌿';
  let hash = 0;
  for (let i = 0; i < seedString.length; i++) {
    hash = seedString.charCodeAt(i) + ((hash << 5) - hash);
  }
  const crests = ['🦌', '🦉', '🦊', '🦅', '🐺'];
  const index = Math.abs(hash) % crests.length;
  return crests[index];
};
