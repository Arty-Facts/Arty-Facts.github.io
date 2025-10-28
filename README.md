# Arty-Tools by Arty-Facts

Minimal, privacy-friendly web tools. All logic runs in your browser; no frameworks, no tracking.

## 🚀 Try it

**Live:** https://arty-facts.github.io/

The landing page lists all available tools.

### Available Apps

- **Elo Calculator** ([/elo/](https://arty-facts.github.io/elo/)) — Update Elo ratings after a match. PWA, offline-ready.

## 📱 PWA & Offline

- Each app can be installed as a Progressive Web App (PWA).
- Works offline after first visit (core assets cached by service worker).
- Installable (Add to Home Screen) on mobile & desktop browsers supporting PWA.

To test offline locally:
1. Run a local server (e.g. `python3 -m http.server`).
2. Visit http://localhost:8000/ once (so assets cache).
3. Go offline and refresh — it should still load.

## 🪪 License
MIT License. See `LICENSE` file for details.