# 🌿 ReLeaf: The Enchanted Forest Portal

ReLeaf is a gamified, immersive web application designed to help users track and reduce their carbon footprint through daily "eco-missions". It transforms the mundane task of habit tracking into an interactive journey through an ancient, magical forest.

## ✨ Features

- **Interactive Parallax Environment:** A deep, 5-layer SVG forest background that reacts to mouse movement and device tilt, complete with dynamic lighting and ambient animations.
- **Ancient Material UI:** A meticulously crafted design system utilizing parchment scroll textures, wax seal buttons, carved wood accents, and glowing inkwell inputs.
- **Living Tree Progress:** As you earn XP by completing trials, your personal "Tree of Life" physically grows and evolves through multiple stages of life.
- **The Oracle (AI Eco Coach):** Powered by Groq's LLaMA-3.1 API, the Oracle generates personalized weekly quests based on your habits and answers environmental questions in a thematic, immersive tone.
- **Procedural Heraldic Crests:** Replaces standard avatars with unique, procedurally generated animal crests (Stag, Owl, Fox, etc.) based on your username.
- **Hall of Champions:** A global leaderboard highlighting the top environmental stewards with a physical podium display.
- **Micro-interactions:** Magical touches including morning mist on load, ink ripples when typing, and auditory cues for actions.

## 🚀 Getting Started

### Prerequisites
- A modern web browser.
- (Optional) Firebase project credentials for persistent data and authentication.
- (Optional) Groq API Key for the AI Oracle features.

*Note: If no API keys are provided, ReLeaf will automatically fall back to a fully functional **Mock Mode**, allowing you to experience the UI, challenges, and animations without any setup.*

### Local Development

1. Clone the repository:
   ```bash
   git clone https://github.com/your-repo/releaf.git
   cd releaf
   ```
2. Serve the directory using any static file server:
   ```bash
   npx http-server .
   # or
   python -m http.server 8080
   ```
3. Open `http://localhost:8080` in your browser.

### Configuration (Environment Variables)

To connect ReLeaf to your own Firebase and Groq instances, copy the template and provide your keys:

1. Update `js/config.js` (or inject them via the Docker entrypoint):
   - `FIREBASE_API_KEY`
   - `FIREBASE_AUTH_DOMAIN`
   - `FIREBASE_PROJECT_ID`
   - `FIREBASE_STORAGE_BUCKET`
   - `FIREBASE_MESSAGING_SENDER_ID`
   - `FIREBASE_APP_ID`
   - `GROQ_API_KEY`

### Docker Deployment

ReLeaf comes with a lightweight Nginx Dockerfile that automatically injects environment variables into the static frontend at runtime.

1. Build the image:
   ```bash
   docker build -t releaf-app .
   ```
2. Run the container:
   ```bash
   docker run -p 8080:8080 \
     -e FIREBASE_API_KEY="your_key" \
     -e GROQ_API_KEY="your_key" \
     releaf-app
   ```

## 🛠️ Architecture

- **Frontend:** Pure HTML, CSS, and Vanilla JavaScript (No heavy frameworks).
- **Styling:** Custom CSS implementing the "Candlelight and Moonlight" palette with advanced CSS variables and flex/grid layouts.
- **Backend:** Firebase Authentication and Realtime Database.
- **AI Integration:** Direct REST calls to Groq's OpenAI-compatible API endpoints.
- **Hosting:** Dockerized Nginx with an `entrypoint.sh` script for runtime configuration.

## 🎨 Design Philosophy
*"The app does not look like software. It looks like an illuminated manuscript that came alive."*

ReLeaf rejects standard flat design in favor of tactile, physical elements. Buttons depress like stamped wax, text shadows simulate ink bleeding into parchment, and the interface is integrated directly into the woodland scene.