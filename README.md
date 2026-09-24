# Arty-Tools by Arty-Facts

Minimal, privacy-friendly web tools. All logic runs in your browser; no frameworks, no tracking.

## 🚀 Try it

**Live:** https://arty-facts.github.io/

The landing page lists all available tools.

### Available Apps

- **Elo Calculator** ([/elo/](https://arty-facts.github.io/elo/)) — Update Elo ratings after a match. PWA, offline-ready.
- **Offline TTS (sherpa-onnx)** ([/tts-sherpa/](https://arty-facts.github.io/tts-sherpa/)) — Browser-based text-to-speech powered by sherpa-onnx WebAssembly. No backend required.
- **LEGO Booklet Maker** ([/lego_booklet/](https://arty-facts.github.io/lego_booklet/)) — Turn a LEGO instructions PDF into a 2-up A4 duplex booklet. Runs entirely in the browser.
- **Poster Mosaic** ([/poster_mosaic/](https://arty-facts.github.io/poster_mosaic/)) — Tile one PDF page into an A4 print mosaic (e.g. A0 → 4×4 A4). Runs entirely in the browser.

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