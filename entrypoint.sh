#!/bin/sh

# Write config.js from environment variables injected by Cloud Run
cat > /usr/share/nginx/html/js/config.js <<EOF
window.RELEAF_CONFIG = {
  firebase: {
    apiKey: "${FIREBASE_API_KEY}",
    authDomain: "${FIREBASE_AUTH_DOMAIN}",
    projectId: "${FIREBASE_PROJECT_ID}",
    storageBucket: "${FIREBASE_STORAGE_BUCKET}",
    messagingSenderId: "${FIREBASE_MESSAGING_SENDER_ID}",
    appId: "${FIREBASE_APP_ID}"
  },
  groqApiKey: "${GROQ_API_KEY}"
  env: {
    DEBUG: true
  }
};
EOF

# Start nginx normally
nginx -g "daemon off;"