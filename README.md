# Arty-Tools by Arty-Facts

Minimal, privacy-friendly web tools. All logic runs in your browser; no frameworks, no tracking.

## 🚀 Try it

**Live:** https://arty-facts.github.io/

The landing page lists all available tools.

### Available Apps

- **Elo Calculator** ([/elo/](https://arty-facts.github.io/elo/)) — Update Elo ratings after a match. PWA, offline-ready.
- **Offline TTS (sherpa-onnx)** ([/tts-sherpa/](https://arty-facts.github.io/tts-sherpa/)) — Browser-based text-to-speech powered by sherpa-onnx WebAssembly. No backend required.
- **LEGO Booklet Maker** ([/lego_booklet/](https://arty-facts.github.io/lego_booklet/)) — Turn a LEGO instructions PDF into a 2-up A4 duplex booklet. Runs entirely in the browser.

## 🔗 URL fetch & CORS

LEGO's PDF servers don't send CORS headers, so pasting a LEGO URL can fail in the
browser. File upload always works. For reliable URL fetch, the app supports an
optional CORS proxy. A free Cloudflare Worker is included at
[`lego_booklet/cors-proxy-worker.js`](lego_booklet/cors-proxy-worker.js) — deploy it
(Cloudflare Dashboard → Workers → Create → paste → Deploy) and paste your worker
URL into the app's "Proxy URL" field.

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