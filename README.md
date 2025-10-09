
## Elo Calculator

Lightweight, single‑page Elo rating calculator. All logic runs in your browser; no frameworks, no tracking.

### Try it

Open: https://arty-facts.github.io/

Enter two ratings (winner first, loser second) and optionally a K‑factor (defaults to 32), then press Enter or click Compute.

You can also type or paste a command style input into any field:

```
/elo 1500 1400 24
```

### Formula

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

### Offline / Install (PWA)

The calculator is a Progressive Web App:

- Opens offline after first visit (core assets cached by `sw.js`).
- Installable (Add to Home Screen) on mobile & desktop browsers supporting PWA.
- Standalone display theme with app icon.

To test offline locally:
1. Run a local server (e.g. `python3 -m http.server`).
2. Visit http://localhost:8000/ once (so assets cache).
3. Go offline and refresh — it should still load.

### Development

Core files:

- `index.html` markup
- `style.css` styles
- `app.js` logic + service worker registration
- `sw.js` caching logic
- `manifest.webmanifest` metadata & icons

### License

Public domain / Unlicense. Do whatever you like.