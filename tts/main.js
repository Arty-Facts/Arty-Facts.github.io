const statusEl = document.getElementById("status");

/* pdf.js worker */
pdfjsLib.GlobalWorkerOptions.workerSrc =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
const formEl = document.getElementById("ttsForm");
const textInput = document.getElementById("textInput");
const synthBtn = document.getElementById("synthesizeBtn");
const synthLabelDefault = synthBtn.querySelector(".default");
const synthLabelLoading = synthBtn.querySelector(".loading");
const clipsEl = document.getElementById("clips");
const speedInput = document.getElementById("speedInput");
const speedValue = document.getElementById("speedValue");
const languageWrapper = document.getElementById("languageWrapper");
const voiceWrapper = document.getElementById("voiceWrapper");
const languageSelect = document.getElementById("languageSelect");
const voiceSelect = document.getElementById("voiceSelect");
const voiceLabel = document.getElementById("voiceLabel");
const voiceDetails = document.getElementById("voiceDetails");
const pdfDrop = document.getElementById("pdfDrop");
const pdfFile = document.getElementById("pdfFile");
const pdfUrl = document.getElementById("pdfUrl");
const pdfUrlBtn = document.getElementById("pdfUrlBtn");
const pdfText = document.getElementById("pdfText");
const pdfReadBtn = document.getElementById("pdfReadBtn");

const DEFAULT_MODEL_ID = "kokoro-en";
const MODEL_MANIFEST_PATH = "./models/manifest.json";

const SHERPA_TTS_SPEAKERS = [
  {
    id: 0,
    modelId: "sv-lisa",
    name: "Lisa",
    language: "Swedish",
    description: "Official sherpa-onnx VITS voice · recorded by Lisa from the NST dataset",
    docs: "https://k2-fsa.github.io/sherpa/onnx/tts/all/Swedish/vits-piper-sv_SE-lisa-medium.html"
  },
  {
    id: 0,
    modelId: "sv-nst",
    name: "Anders",
    language: "Swedish",
    description: "National Library of Sweden voice model (NST collection)",
    docs: "https://k2-fsa.github.io/sherpa/onnx/tts/all/Swedish/vits-piper-sv_SE-nst-medium.html"
  },
  { id: 0, modelId: "kokoro-en", name: "AF (American female)", language: "English (American)", description: "Kokoro default American female", docs: "https://k2-fsa.github.io/sherpa/onnx/tts/all/English/kokoro-en-v0_19.html" },
  { id: 1, modelId: "kokoro-en", name: "Bella", language: "English (American)", description: "Kokoro American female", docs: "https://k2-fsa.github.io/sherpa/onnx/tts/all/English/kokoro-en-v0_19.html" },
  { id: 2, modelId: "kokoro-en", name: "Nicole", language: "English (American)", description: "Kokoro American female", docs: "https://k2-fsa.github.io/sherpa/onnx/tts/all/English/kokoro-en-v0_19.html" },
  { id: 3, modelId: "kokoro-en", name: "Sarah", language: "English (American)", description: "Kokoro American female", docs: "https://k2-fsa.github.io/sherpa/onnx/tts/all/English/kokoro-en-v0_19.html" },
  { id: 4, modelId: "kokoro-en", name: "Sky", language: "English (American)", description: "Kokoro American female", docs: "https://k2-fsa.github.io/sherpa/onnx/tts/all/English/kokoro-en-v0_19.html" },
  { id: 5, modelId: "kokoro-en", name: "Adam", language: "English (American)", description: "Kokoro American male", docs: "https://k2-fsa.github.io/sherpa/onnx/tts/all/English/kokoro-en-v0_19.html" },
  { id: 6, modelId: "kokoro-en", name: "Michael", language: "English (American)", description: "Kokoro American male", docs: "https://k2-fsa.github.io/sherpa/onnx/tts/all/English/kokoro-en-v0_19.html" },
  { id: 7, modelId: "kokoro-en", name: "Emma", language: "English (British)", description: "Kokoro British female", docs: "https://k2-fsa.github.io/sherpa/onnx/tts/all/English/kokoro-en-v0_19.html" },
  { id: 8, modelId: "kokoro-en", name: "Isabella", language: "English (British)", description: "Kokoro British female", docs: "https://k2-fsa.github.io/sherpa/onnx/tts/all/English/kokoro-en-v0_19.html" },
  { id: 9, modelId: "kokoro-en", name: "George", language: "English (British)", description: "Kokoro British male", docs: "https://k2-fsa.github.io/sherpa/onnx/tts/all/English/kokoro-en-v0_19.html" },
  { id: 10, modelId: "kokoro-en", name: "Lewis", language: "English (British)", description: "Kokoro British male", docs: "https://k2-fsa.github.io/sherpa/onnx/tts/all/English/kokoro-en-v0_19.html" }
];

const MODEL_DEFINITIONS = {
  "common": {
    id: "common",
    type: "shared-data",
    dir: "common",
  },
  "sv-lisa": {
    id: "sv-lisa",
    label: "Swedish · Lisa",
    type: "local",
    dir: "vits-piper-sv_SE-lisa-medium",
    modelFile: "sv_SE-lisa-medium.onnx",
    tokensFile: "tokens.txt",
    sharedDataDir: "common/espeak-ng-data",
    mountDependencies: ["common"],
    speakerHint: 1,
  },
  "sv-nst": {
    id: "sv-nst",
    label: "Swedish · NST",
    type: "local",
    dir: "vits-piper-sv_SE-nst-medium",
    modelFile: "sv_SE-nst-medium.onnx",
    tokensFile: "tokens.txt",
    sharedDataDir: "common/espeak-ng-data",
    mountDependencies: ["common"],
  },
  "kokoro-en": {
    id: "kokoro-en",
    label: "English · Kokoro",
    type: "kokoro",
    dir: "kokoro-int8-en-v0_19",
    modelFile: "model.int8.onnx",
    modelParts: ["model.int8.onnx.0", "model.int8.onnx.1"],
    voicesFile: "voices.bin",
    tokensFile: "tokens.txt",
    sharedDataDir: "common/espeak-ng-data",
    mountDependencies: ["common"],
  },
};

let ttsInstance = null;
let audioCtx = null;
let clipIndex = 1;
let allVoices = [];
let voiceByKey = new Map();
let currentVoiceKey = null;
let activeModelId = null;
let modelSwitchPromise = Promise.resolve();
const mountedModels = new Set();
const modelMountPromises = new Map();
let manifestCache = null;
let moduleBootstrapped = false;

function updateStatus(message, tone = "info") {
  statusEl.textContent = message;
  statusEl.dataset.tone = tone;
}

function setButtonBusy(isBusy) {
  synthBtn.disabled = isBusy || !ttsInstance;
  synthLabelDefault.toggleAttribute("hidden", isBusy);
  synthLabelLoading.toggleAttribute("hidden", !isBusy);
  pdfReadBtn.disabled = isBusy || !ttsInstance || !pdfText.value.trim();
}

function ensureAudioContext(sampleRate) {
  if (!audioCtx) {
    audioCtx = new AudioContext({ sampleRate });
  }
  return audioCtx;
}

function createVoiceKey(modelId, id) {
  return `${modelId}:${id}`;
}

function normalizeVoices(raw) {
  if (!Array.isArray(raw)) {
    return [];
  }

  const voices = [];
  const seen = new Set();

  raw.forEach((entry) => {
    const modelId = entry?.modelId ?? DEFAULT_MODEL_ID;
    if (!MODEL_DEFINITIONS[modelId]) {
      console.warn(`Skipping voice with unknown modelId ${modelId}`);
      return;
    }

    const id = Number.parseInt(entry.id, 10);
    if (!Number.isInteger(id) || id < 0) {
      console.warn(`Skipping voice with invalid speaker id ${entry?.id}`);
      return;
    }

    const key = createVoiceKey(modelId, id);
    if (seen.has(key)) {
      return;
    }

    voices.push({
      key,
      modelId,
      id,
      name: entry.name ?? `Voice ${id}`,
      language: entry.language ?? "Unknown",
      description: entry.description ?? "",
      docs: entry.docs ?? entry.documentation ?? "",
      datasetSpeaker: entry.datasetSpeaker ?? entry.datasetId ?? null,
    });
    seen.add(key);
  });

  if (!voices.length) {
    voices.push({
      key: createVoiceKey(DEFAULT_MODEL_ID, 0),
      modelId: DEFAULT_MODEL_ID,
      id: 0,
      name: "Voice 0",
      language: "English (British)",
      description: "Default speaker",
      docs: "",
      datasetSpeaker: null,
    });
  }

  return voices;
}

function populateLanguageSelect(activeLanguage) {
  if (!allVoices.length) {
    languageWrapper.hidden = true;
    voiceWrapper.hidden = true;
    return;
  }

  const languages = Array.from(new Set(allVoices.map((voice) => voice.language))).sort((a, b) => a.localeCompare(b));

  languageWrapper.hidden = languages.length <= 1;
  languageSelect.innerHTML = "";
  languages.forEach((language) => {
    const option = document.createElement("option");
    option.value = language;
    option.textContent = language;
    languageSelect.append(option);
  });

  const resolvedLanguage = activeLanguage && languages.includes(activeLanguage) ? activeLanguage : languages[0];
  languageSelect.value = resolvedLanguage;
  populateVoiceSelect(resolvedLanguage);
}

function populateVoiceSelect(language) {
  const voices = allVoices.filter((voice) => voice.language === language);
  voiceWrapper.hidden = voices.length <= 1;
  voiceSelect.innerHTML = "";

  voices.forEach((voice) => {
    const option = document.createElement("option");
    option.value = voice.key;
    option.textContent = voice.name;
    option.dataset.modelId = voice.modelId;
    option.dataset.voiceId = voice.id;
    voiceSelect.append(option);
  });

  if (!voices.length) {
    voiceDetails.hidden = true;
    voiceDetails.textContent = "";
    return;
  }

  const matching = voices.some((voice) => voice.key === currentVoiceKey);
  const nextKey = matching ? currentVoiceKey : voices[0].key;
  voiceSelect.value = nextKey;
  setActiveVoice(nextKey, moduleBootstrapped);
}

function updateVoiceDetails(voice) {
  if (!voice) {
    voiceDetails.hidden = true;
    voiceDetails.textContent = "";
    return;
  }

  const model = MODEL_DEFINITIONS[voice.modelId];
  const parts = [
    `Speaker ID ${voice.id}`,
    model?.label ?? voice.language,
  ];

  if (voice.datasetSpeaker != null) {
    parts.push(`Dataset speaker ${voice.datasetSpeaker}`);
  }

  if (voice.description) {
    parts.push(voice.description);
  }

  voiceDetails.hidden = false;
  voiceDetails.textContent = `${voice.name} · ${parts.join(" · ")}`;

  if (voice.docs) {
    const separator = document.createTextNode(" · ");
    const link = document.createElement("a");
    link.href = voice.docs;
    link.target = "_blank";
    link.rel = "noreferrer";
    link.textContent = "Documentation";
    voiceDetails.append(separator, link);
  }
}

function setActiveVoice(voiceKey, allowModelSwitch = moduleBootstrapped) {
  const voice = voiceByKey.get(voiceKey);
  if (!voice) {
    updateVoiceDetails(null);
    return;
  }

  currentVoiceKey = voiceKey;
  updateVoiceDetails(voice);

  if (allowModelSwitch) {
    queueModelSwitch(voice.modelId).catch((error) => {
      console.error(error);
      updateStatus("Failed to load the selected voice model", "error");
    });
  }
}

function renderClip(audio, text, voice, speed) {
  const durationSeconds = audio.samples.length / audio.sampleRate;
  const clip = document.createElement("article");
  clip.className = "clip";

  const header = document.createElement("div");
  header.className = "clip__meta";

  const title = document.createElement("p");
  title.className = "clip__title";
  const voiceName = voice?.name ?? `Speaker ${voice?.id ?? 0}`;
  const voiceLanguage = voice?.language ? ` (${voice.language})` : "";
  title.textContent = `${clipIndex.toString().padStart(2, "0")}. ${voiceName}${voiceLanguage} @ ${speed.toFixed(1)}×`;

  const time = document.createElement("p");
  time.className = "clip__time";
  time.textContent = `${durationSeconds.toFixed(2)}s`;

  header.append(title, time);

  const audioEl = document.createElement("audio");
  audioEl.controls = true;
  audioEl.src = URL.createObjectURL(toWav(audio.samples, audio.sampleRate));

  const body = document.createElement("p");
  body.className = "clip__text";
  body.textContent = text.length > 140 ? `${text.slice(0, 137)}…` : text;

  const actions = document.createElement("div");
  actions.className = "clip__actions";

  const downloadBtn = document.createElement("button");
  downloadBtn.type = "button";
  downloadBtn.textContent = "Download WAV";
  downloadBtn.addEventListener("click", () => {
    const blob = toWav(audio.samples, audio.sampleRate);
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `tts-${clipIndex.toString().padStart(2, "0")}.wav`;
    link.click();
    URL.revokeObjectURL(link.href);
  });

  const removeBtn = document.createElement("button");
  removeBtn.type = "button";
  removeBtn.textContent = "Remove";
  removeBtn.addEventListener("click", () => clip.remove());

  actions.append(downloadBtn, removeBtn);

  clip.append(header, audioEl, body, actions);
  clipsEl.prepend(clip);
  clipIndex += 1;
}

function playAudio(audio) {
  const ctx = ensureAudioContext(audio.sampleRate);
  const buffer = ctx.createBuffer(1, audio.samples.length, audio.sampleRate);
  buffer.copyToChannel(audio.samples, 0);

  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.connect(ctx.destination);
  source.start();
}

function toWav(floatSamples, sampleRate) {
  const length = floatSamples.length;
  const dataBuffer = new ArrayBuffer(44 + length * 2);
  const view = new DataView(dataBuffer);
  const samples = new Int16Array(length);

  for (let i = 0; i < length; i += 1) {
    const clamped = Math.max(-1, Math.min(1, floatSamples[i]));
    samples[i] = clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff;
  }

  let offset = 0;
  const writeString = (str) => {
    for (let i = 0; i < str.length; i += 1) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
    offset += str.length;
  };

  writeString("RIFF");
  view.setUint32(offset, 36 + samples.length * 2, true); offset += 4;
  writeString("WAVE");
  writeString("fmt ");
  view.setUint32(offset, 16, true); offset += 4;
  view.setUint16(offset, 1, true); offset += 2;
  view.setUint16(offset, 1, true); offset += 2;
  view.setUint32(offset, sampleRate, true); offset += 4;
  view.setUint32(offset, sampleRate * 2, true); offset += 4;
  view.setUint16(offset, 2, true); offset += 2;
  view.setUint16(offset, 16, true); offset += 2;
  writeString("data");
  view.setUint32(offset, samples.length * 2, true); offset += 4;

  for (let i = 0; i < samples.length; i += 1, offset += 2) {
    view.setInt16(offset, samples[i], true);
  }

  return new Blob([dataBuffer], { type: "audio/wav" });
}

async function loadModelManifest() {
  if (manifestCache) {
    return manifestCache;
  }

  const response = await fetch(MODEL_MANIFEST_PATH);
  if (!response.ok) {
    throw new Error(`Unable to load model manifest (${response.status})`);
  }

  manifestCache = await response.json();
  return manifestCache;
}

function ensureDirectory(pathname) {
  if (!pathname) {
    return;
  }

  const fs = Module.FS ?? (typeof FS !== "undefined" ? FS : null);
  if (!fs) {
    console.warn("Emscripten FS API unavailable; cannot ensure directory", pathname);
    return;
  }

  const normalized = pathname.startsWith("/") ? pathname : `/${pathname}`;
  const segments = normalized.split("/").filter(Boolean);
  let current = "";

  segments.forEach((segment) => {
    current = current ? `${current}/${segment}` : `/${segment}`;

    try {
      fs.lookupPath(current);
    } catch (lookupError) {
      try {
        fs.mkdir(current);
      } catch (mkdirError) {
        const message = String(mkdirError ?? "");
        if (!message.includes("File exists") && !message.includes("EEXIST")) {
          console.warn(`Failed to create directory ${current}`, mkdirError);
        }
      }
    }
  });
}

async function ensureModelMounted(model) {
  if ((model.type !== "local" && model.type !== "shared-data" && model.type !== "kokoro") || mountedModels.has(model.id)) {
    return;
  }

  if (modelMountPromises.has(model.id)) {
    return modelMountPromises.get(model.id);
  }

  const fs = Module.FS ?? (typeof FS !== "undefined" ? FS : null);
  if (!fs) {
    throw new Error("Emscripten FS API unavailable; cannot mount models");
  }

  const promise = (async () => {
    if (Array.isArray(model.mountDependencies)) {
      for (const dependencyId of model.mountDependencies) {
        const dependency = MODEL_DEFINITIONS[dependencyId];
        if (!dependency) {
          console.warn(`Unknown mount dependency ${dependencyId} for model ${model.id}`);
          continue;
        }
        await ensureModelMounted(dependency);
      }
    }

    const manifest = await loadModelManifest();
    const fileList = manifest[model.dir];
    if (!fileList) {
      throw new Error(`Manifest entry missing for ${model.dir}`);
    }

    ensureDirectory("/models");
    ensureDirectory(`/models/${model.dir}`);

    const baseVirtual = `/models/${model.dir}`;
    const baseHttp = model.type === "shared-data" ? `./${model.dir}` : `./models/${model.dir}`;

    const pathExists = (path) => {
      try {
        fs.lookupPath(path);
        return true;
      } catch (error) {
        return false;
      }
    };

    const createPreloadedFile = typeof Module.FS_createPreloadedFile === "function"
      ? Module.FS_createPreloadedFile.bind(Module)
      : null;

    const mountFile = async (relativePath) => {
      const segments = relativePath.split("/");
      const fileName = segments.pop();
      const parentDir = segments.length ? `${baseVirtual}/${segments.join("/")}` : baseVirtual;
      ensureDirectory(parentDir);

      const targetPath = `${parentDir}/${fileName}`;
      if (pathExists(targetPath)) {
        return;
      }

      const url = `${baseHttp}/${relativePath}`;

      if (createPreloadedFile) {
        await new Promise((resolve, reject) => {
          try {
            createPreloadedFile(parentDir, fileName, url, true, false, resolve, (error) => {
              const message = String(error ?? "");
              if (message.includes("File exists")) {
                resolve();
                return;
              }
              reject(error);
            });
          } catch (error) {
            const message = String(error ?? "");
            if (message.includes("File exists")) {
              resolve();
            } else {
              reject(error);
            }
          }
        });
        return;
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch ${url} (${response.status})`);
      }

      const buffer = await response.arrayBuffer();
      const data = new Uint8Array(buffer);

      try {
        fs.writeFile(targetPath, data, { encoding: "binary" });
      } catch (error) {
        const message = String(error ?? "");
        if (!message.includes("File exists")) {
          throw error;
        }
      }
    };

    const maxConcurrency = createPreloadedFile ? 64 : 8;
    const inflight = new Set();

    for (const relativePath of fileList) {
      const task = mountFile(relativePath);
      inflight.add(task);
      task.finally(() => inflight.delete(task));

      if (inflight.size >= maxConcurrency) {
        await Promise.race(inflight);
      }
    }

    await Promise.all(inflight);

    mountedModels.add(model.id);
  })();

  modelMountPromises.set(model.id, promise);

  try {
    await promise;
  } finally {
    modelMountPromises.delete(model.id);
  }
}

function concatModelParts(model) {
  if (!model.modelParts || !model.modelParts.length) return;
  const fs = Module.FS ?? (typeof FS !== "undefined" ? FS : null);
  if (!fs) throw new Error("Emscripten FS API unavailable; cannot join model parts");

  const base = `/models/${model.dir}`;
  const target = `${base}/${model.modelFile}`;
  try {
    fs.lookupPath(target);
    return; // already joined
  } catch (e) {
    /* not joined yet */
  }

  const chunks = model.modelParts.map((part) => fs.readFile(`${base}/${part}`, { encoding: "binary" }));
  const total = chunks.reduce((n, c) => n + c.length, 0);
  const merged = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    merged.set(chunk, offset);
    offset += chunk.length;
  }
  fs.writeFile(target, merged, { encoding: "binary" });
}

function buildConfigForModel(model) {
  const base = `/models/${model.dir}`;
  const dataDir = model.sharedDataDir ? `/models/${model.sharedDataDir}` : "";

  const config = {
    offlineTtsModelConfig: {
      offlineTtsVitsModelConfig: {
        model: "",
        lexicon: "",
        tokens: "",
        dataDir: "",
        noiseScale: 0.667,
        noiseScaleW: 0.8,
        lengthScale: 1.0,
      },
      offlineTtsMatchaModelConfig: {
        acousticModel: "",
        vocoder: "",
        lexicon: "",
        tokens: "",
        noiseScale: 0.667,
        lengthScale: 1.0,
        dataDir: "",
      },
      offlineTtsKokoroModelConfig: {
        model: "",
        voices: "",
        tokens: "",
        dataDir: "",
        lengthScale: 1.0,
        lexicon: "",
        lang: "",
      },
      offlineTtsKittenModelConfig: {
        model: "",
        voices: "",
        tokens: "",
        dataDir: "",
        lengthScale: 1.0,
      },
      offlineTtsZipVoiceModelConfig: {
        tokens: "",
        textModel: "",
        flowMatchingModel: "",
        vocoder: "",
        dataDir: "",
        pinyinDict: "",
        featScale: 0.1,
        tShift: 0.5,
        targetRMS: 0.1,
        guidanceScale: 1.0,
      },
      numThreads: 1,
      debug: 0,
      provider: "cpu",
    },
    ruleFsts: "",
    ruleFars: "",
    maxNumSentences: 1,
    silenceScale: 0.2,
  };

  if (model.type === "kokoro") {
    config.offlineTtsModelConfig.offlineTtsKokoroModelConfig = {
      model: `${base}/${model.modelFile}`,
      voices: `${base}/${model.voicesFile}`,
      tokens: `${base}/${model.tokensFile}`,
      dataDir,
      lengthScale: 1.0,
      lexicon: "",
      lang: "",
    };
  } else {
    config.offlineTtsModelConfig.offlineTtsVitsModelConfig = {
      model: `${base}/${model.modelFile}`,
      lexicon: "",
      tokens: `${base}/${model.tokensFile}`,
      dataDir,
      noiseScale: 0.667,
      noiseScaleW: 0.8,
      lengthScale: 1.0,
    };
  }

  return config;
}

function queueModelSwitch(modelId) {
  modelSwitchPromise = modelSwitchPromise.then(() => switchModelInternal(modelId));
  return modelSwitchPromise;
}

async function switchModelInternal(modelId) {
  if (activeModelId === modelId && ttsInstance) {
    return;
  }

  const model = MODEL_DEFINITIONS[modelId];
  if (!model) {
    throw new Error(`Unknown model ${modelId}`);
  }

  setButtonBusy(true);
  updateStatus(`Loading ${model.label}…`, "info");

  if (ttsInstance) {
    try {
      ttsInstance.free();
    } catch (error) {
      console.warn("Failed to free previous TTS instance", error);
    }
    ttsInstance = null;
  }

  try {
    await ensureModelMounted(model);
    if (model.modelParts) concatModelParts(model);
    const config = model.type === "embedded" ? null : buildConfigForModel(model);
    ttsInstance = config ? createOfflineTts(Module, config) : createOfflineTts(Module);
    activeModelId = modelId;
    setButtonBusy(false);
    updateStatus(`${model.label} ready. Type something and click Synthesize!`, "success");
  } catch (error) {
    activeModelId = null;
    console.error(error);
    updateStatus(`Failed to initialize ${model.label}`, "error");
    throw error;
  }
}

function initializeVoiceCatalog() {
  const normalized = normalizeVoices(SHERPA_TTS_SPEAKERS);
  allVoices = normalized;
  voiceByKey = new Map(normalized.map((voice) => [voice.key, voice]));
  voiceLabel.textContent = "Voice";
  populateLanguageSelect(languageSelect.value);
}

speedInput.addEventListener("input", () => {
  speedValue.textContent = `${Number(speedInput.value).toFixed(1)}×`;
});

languageSelect.addEventListener("change", () => {
  populateVoiceSelect(languageSelect.value);
});

voiceSelect.addEventListener("change", () => {
  setActiveVoice(voiceSelect.value);
});


async function synthesizeText(text) {
  const selectedVoice = voiceByKey.get(voiceSelect.value);
  if (!selectedVoice) {
    updateStatus("Choose a voice before synthesizing", "warn");
    return false;
  }

  try {
    await queueModelSwitch(selectedVoice.modelId);
  } catch (error) {
    console.error(error);
    return false;
  }

  if (!ttsInstance) {
    updateStatus("Please wait for the engine to finish loading", "warn");
    return false;
  }

  text = (text || "").trim();
  if (!text) {
    updateStatus("Enter something to synthesize first", "warn");
    return false;
  }

  if (selectedVoice.id < 0 || selectedVoice.id >= ttsInstance.numSpeakers) {
    updateStatus(`Voice must be between 0 and ${ttsInstance.numSpeakers - 1}`, "warn");
    return false;
  }

  const speed = Number(speedInput.value);

  setButtonBusy(true);
  updateStatus("Generating audio… this usually takes a few seconds", "info");

  try {
    const audio = ttsInstance.generate({ text, sid: selectedVoice.id, speed });
    renderClip(audio, text, selectedVoice, speed);
    updateStatus("Done! You can synthesize another sentence", "success");
    return true;
  } catch (err) {
    console.error(err);
    updateStatus("Something went wrong while generating audio", "error");
    return false;
  } finally {
    setButtonBusy(false);
  }
}

formEl.addEventListener("submit", async (event) => {
  event.preventDefault();
  const ok = await synthesizeText(textInput.value);
  if (ok) textInput.focus();
});

/* ---------- PDF reading ---------- */
function pdfLoadedState() {
  pdfReadBtn.disabled = !pdfText.value.trim() || !ttsInstance;
}

async function loadPdf(bytes, name) {
  const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(bytes) }).promise;
  if (pdf.numPages === 0) throw new Error("PDF has no pages");

  let out = "";
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const tc = await page.getTextContent();
    let pageText = "";
    for (const item of tc.items) {
      if (!item.str) continue;
      if (pageText && !/\s$/.test(pageText)) pageText += " ";
      pageText += item.str;
      if (item.hasEOL) pageText += "\n";
    }
    out += `\n--- Page ${i} ---\n${pageText.trim()}\n`;
  }

  pdfText.value = out.trim();
  pdfLoadedState();
  updateStatus(`PDF loaded: ${pdf.numPages} page(s). Select a part and press "Read this text".`, "success");
}

pdfDrop.addEventListener("click", () => pdfFile.click());
pdfDrop.addEventListener("dragover", (e) => { e.preventDefault(); pdfDrop.classList.add("drag"); });
pdfDrop.addEventListener("dragleave", () => pdfDrop.classList.remove("drag"));
pdfDrop.addEventListener("drop", async (e) => {
  e.preventDefault();
  pdfDrop.classList.remove("drag");
  const f = e.dataTransfer.files[0];
  if (!f) return;
  try {
    updateStatus("Extracting PDF text…", "info");
    await loadPdf(await f.arrayBuffer(), f.name);
  } catch (err) {
    console.error(err);
    updateStatus("PDF error: " + err.message, "error");
  }
});

pdfFile.addEventListener("change", async (e) => {
  const f = e.target.files[0];
  if (!f) return;
  try {
    updateStatus("Extracting PDF text…", "info");
    await loadPdf(await f.arrayBuffer(), f.name);
  } catch (err) {
    console.error(err);
    updateStatus("PDF error: " + err.message, "error");
  }
});

pdfUrlBtn.addEventListener("click", async () => {
  const url = pdfUrl.value.trim();
  if (!url) { updateStatus("Paste a PDF URL first", "warn"); return; }
  try {
    updateStatus("Fetching PDF…", "info");
    const res = await fetch(url, { mode: "cors" });
    if (!res.ok) throw new Error("HTTP " + res.status);
    await loadPdf(await res.arrayBuffer(), url.split("/").pop() || "document.pdf");
  } catch (err) {
    console.error(err);
    updateStatus("Could not fetch that PDF URL — it may block cross-origin access. Download it and drag-drop instead. (" + err.message + ")", "error");
  }
});

pdfReadBtn.addEventListener("click", () => synthesizeText(pdfText.value));
pdfText.addEventListener("input", pdfLoadedState);

speedValue.textContent = `${Number(speedInput.value).toFixed(1)}×`;
initializeVoiceCatalog();

window.Module = {
  locateFile(path) {
    if (path.endsWith(".wasm") || path.endsWith(".js")) {
      return `./vendor/${path}`;
    }
    if (path.endsWith(".data")) {
      // Skip embedded data file - we only use local models
      console.log("Skipping embedded data file:", path);
      return "";
    }
    return path;
  },
  noInitialRun: true,
  noExitRuntime: true,
  preRun: [],
  setStatus(message) {
    if (message && !/Running/.test(message)) {
      updateStatus(message, "info");
    }
  },
  async onRuntimeInitialized() {
    try {
      moduleBootstrapped = true;
      const initialVoice = currentVoiceKey ? voiceByKey.get(currentVoiceKey) : null;
      const initialModelId = initialVoice ? initialVoice.modelId : DEFAULT_MODEL_ID;
      await queueModelSwitch(initialModelId);
      setButtonBusy(false);
    } catch (error) {
      console.error(error);
      updateStatus("Failed to initialize sherpa-onnx TTS", "error");
    }
  },
};
