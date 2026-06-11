# ReLeaf

**Gamified Carbon Footprint Reduction**

Every choice leaves a mark. Make yours green.

## Overview
ReLeaf is a Progressive Web App (PWA) that turns everyday eco-friendly choices into a rewarding game. Users complete daily sustainability challenges to earn XP, level up, and compete on a live leaderboard. An integrated AI coach (powered by Gemini) provides personalized weekly missions and tips.

## Approach
*   **Architecture:** Single Page Application (SPA) / Progressive Web App (PWA)
*   **Tech Stack:** Vanilla HTML, CSS, JavaScript
*   **Authentication & Database:** Firebase Auth (Google Sign-In) and Firebase Realtime Database
*   **AI Integration:** Groq API for AI Coach and personalized weekly missions
*   **Data Visualization:** Google Charts for tracking carbon footprint reduction

## Project Structure
*   `index.html`: Main SPA app shell
*   `css/style.css`: Design system and global styles
*   `js/`: JavaScript modules for routing, auth, challenges, leaderboard, Gemini, and charts
*   `sw.js` & `manifest.json`: PWA offline support and installation

## External Services Used
*   **Firebase Auth:** For secure Google Sign-In.
*   **Firebase Realtime Database:** For syncing user progress, completed challenges, and live leaderboards.
*   **Groq API (Llama 3):** To act as the "Eco Coach", generating weekly personalized missions based on the user's past completed challenges, and answering questions in the chat.
*   **Google Charts:** To visualize CO2 saved over time and by category.
*   **Google Translate API:** For embedded language switching (widget).

## Local Development Setup
1. Clone this repository.
2. Duplicate `js/config.example.js` and rename it to `js/config.js`.
3. Fill in your Firebase configuration and Groq API key in `js/config.js`.
4. Run a local web server (e.g., using `npx serve` or Python's `http.server`).
   ```bash
   npx serve .
   ```
5. **Note on API Keys:** `js/config.js` is added to `.gitignore` to prevent accidentally committing your Firebase and Groq API keys to GitHub.

## Deployment

This repository includes a `Dockerfile` and `nginx.conf` pre-configured for Google Cloud Run (which expects apps to listen on port 8080).

1. Ensure your `js/config.js` is properly filled out locally (it will be bundled into the Docker image).
2. Install the [Google Cloud CLI](https://cloud.google.com/sdk/docs/install) and authenticate.
3. Deploy directly using Cloud Build:
   ```bash
   gcloud run deploy releaf-app --source . --port 8080 --allow-unauthenticated
   ```
4. **IMPORTANT**: After deployment, copy the URL Cloud Run gives you (e.g., `https://releaf-app-xxxxx.run.app`).
5. Go to your Firebase Console > Authentication > Settings > Authorized domains and add that Cloud Run URL so Google Sign-In is allowed!

## Assumptions
*   **Connectivity:** While the app has a service worker for basic offline caching of the UI, an active internet connection is assumed for Firebase syncing and Gemini API calls. (Challenges completed offline will be stored locally and synced later).
*   **CO₂ Data:** The CO₂ savings attached to challenges are estimates based on published global averages and are intended for gamification purposes.