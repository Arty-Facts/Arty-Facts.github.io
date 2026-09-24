# Text to Speech (sherpa-onnx)

Offline text-to-speech that runs entirely in your browser via
[sherpa-onnx](https://github.com/k2-fsa/sherpa-onnx) WebAssembly. No backend,
no network after the first load, no build step — plain HTML/CSS/JS.

## ✨ Features

- **Kokoro English voices** (v0.19, int8) — 11 speakers (American + British), high quality
- **Swedish Piper VITS voices** — Lisa (NST) + Anders (NST)
- Language + voice pickers, speed control
- Generate, play, and download WAV clips
- Read PDFs aloud — extract text from an uploaded PDF (or a CORS-enabled PDF URL) and synthesize it
- Models lazy-mounted into the Emscripten filesystem on demand

## 📂 Project Structure

```
tts/
├── index.html               # UI markup & script loading order
├── main.js                  # UI logic & sherpa-onnx integration
├── style.css                # Frosted-glass UI
├── common/                  # Shared espeak-ng-data (phonemization)
├── models/
│   ├── manifest.json        # File lists for lazy FS mounting
│   ├── kokoro-int8-en-v0_19/    # English Kokoro model (11 voices)
│   ├── vits-piper-sv_SE-lisa-medium/
│   └── vits-piper-sv_SE-nst-medium/
└── vendor/                  # sherpa-onnx WASM (JS + .wasm)
```

## 🗣 Voices

| Voice | Language | Model | Speaker ID |
|-------|----------|-------|-----------|
| Lisa | Swedish | Piper VITS | 0 |
| Anders | Swedish | Piper VITS | 0 |
| AF (default) | English (US) | Kokoro | 0 |
| Bella / Nicole / Sarah / Sky | English (US) | Kokoro | 1–4 |
| Adam / Michael | English (US) | Kokoro | 5–6 |
| Emma / Isabella | English (UK) | Kokoro | 7–8 |
| George / Lewis | English (UK) | Kokoro | 9–10 |

## 🧪 Local preview

Open directly or serve over HTTP (recommended for large `.wasm` streaming):

```bash
# From the repository root
python3 -m http.server 8080
```

Then visit `http://localhost:8080/tts/`.

> First load fetches the model files (~140 MB for Kokoro, ~63 MB per Swedish
> voice). After that, everything runs offline.

## ➕ Adding a model

1. Download model files into `tts/models/<dir>/` (e.g. a Piper VITS voice or
   another Kokoro language).
2. Add its file list to `models/manifest.json`.
3. Register it in `MODEL_DEFINITIONS` in `main.js` (`type: "kokoro"` or
   `"local"`), then add speaker entries to `SHERPA_TTS_SPEAKERS` with matching
   `modelId`.
4. For Piper VITS models, set `sharedDataDir: "common/espeak-ng-data"` and
   `mountDependencies: ["common"]` to reuse the shared pronunciation data.

## ⚖️ License

App code inherits the repo MIT license. Bundled sherpa-onnx artifacts and
models follow their upstream licenses (sherpa-onnx: Apache-2.0; Kokoro:
Apache-2.0; Piper voices: their respective licenses).
