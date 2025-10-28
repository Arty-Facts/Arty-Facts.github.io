# Elo Calculator

A simple, privacy-friendly Elo rating calculator. All logic runs in your browser. No tracking, no frameworks.

## Features
- Update Elo ratings after a match
- PWA: installable, offline-ready
- Responsive, dark-mode UI

## Usage
1. Enter winner and loser ratings, and optionally a K-factor (defaults to 32).
2. Click Compute to see the new ratings and expected win probability.

## Formula
```
Ea = 1 / (1 + 10^((Rb - Ra)/400))
R'a = Ra + K * (Sa - Ea)
R'b = Rb + K * (Sb - Eb)
```
Where Sa = 1, Sb = 0 for a decisive win.

## PWA/Offline
- Works offline after first visit (assets cached by service worker)
- Installable on mobile & desktop

## Development
- `index.html`, `style.css`, `app.js` — main app
- `manifest.webmanifest`, `sw.js`, icons — PWA support

## License
MIT License. See `LICENSE` file for details.
