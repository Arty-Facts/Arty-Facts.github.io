# Arty-Tools by Arty-Facts

Minimal, privacy-friendly web tools. All logic runs in your browser; no frameworks, no tracking.

## 🚀 Try it

**Live:** https://arty-facts.github.io/

The landing page lists all available webapps. Each app is fully modular, with its own HTML, CSS, and JS.

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

## 🛠️ Structure

- `index.html`, `style.css`, `app.js` — Root landing page
- `/elo/` — Elo Calculator app (with its own `index.html`, `style.css`, `app.js`, etc)

Each app is self-contained and easy to extend. Add new apps by creating a new folder with separate HTML, CSS, and JS.

## 📏 Elo Calculator Formula

Expected score for player A:

```
Ea = 1 / (1 + 10^((Rb - Ra)/400))
```

Rating update (win/loss):

```
R'a = Ra + K * (Sa - Ea)
R'b = Rb + K * (Sb - Eb)
```

Where Sa = 1, Sb = 0 for a decisive win.

## 🪪 License

MIT License. See `LICENSE` file for details.