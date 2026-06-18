#!/bin/sh

mkdir -p /usr/share/nginx/html/js

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
  groq: {
    apiKey: "${GROQ_API_KEY}"
  },
  env: {
    DEBUG: true
  }
};
EOF

nginx -g "daemon off;"