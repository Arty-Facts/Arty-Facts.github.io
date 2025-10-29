const statusEl = document.getElementById("status");
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

const DEFAULT_MODEL_ID = "en-gb-cori";
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
  {
    id: 0,
    modelId: "en-gb-cori",
    name: "Cori",
    language: "English (British)",
    description: "British English voice model from rhasspy/piper-voices",
    docs: "https://k2-fsa.github.io/sherpa/onnx/tts/all/English/vits-piper-en_GB-cori-medium.html"
  },
  {
    id: 0,
    modelId: "en-gb-northern-male",
    name: "John",
    language: "English (British)",
    description: "Northern English male accent voice from rhasspy/piper-voices",
    docs: "https://k2-fsa.github.io/sherpa/onnx/tts/all/English/vits-piper-en_GB-northern_english_male-medium.html"
  },
  {
    id: 0,
    modelId: "en-us-amy",
    name: "Amy",
    language: "English (American)",
    description: "American English female voice from rhasspy/piper-voices",
    docs: "https://k2-fsa.github.io/sherpa/onnx/tts/all/English/vits-piper-en_US-amy-medium.html"
  }
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
    speakerHint: 1,
  },
  "en-gb-cori": {
    id: "en-gb-cori",
    label: "English (British) · Cori",
    type: "local",
    dir: "vits-piper-en_GB-cori-medium",
    modelFile: "en_GB-cori-medium.onnx",
    tokensFile: "tokens.txt",
    sharedDataDir: "common/espeak-ng-data",
    mountDependencies: ["common"],
    speakerHint: 1,
  },
  "en-gb-northern-male": {
    id: "en-gb-northern-male",
    label: "English (British) · Northern Male",
    type: "local",
    dir: "vits-piper-en_GB-northern_english_male-medium",
    modelFile: "en_GB-northern_english_male-medium.onnx",
    tokensFile: "tokens.txt",
    sharedDataDir: "common/espeak-ng-data",
    mountDependencies: ["common"],
    speakerHint: 1,
  },
  "en-us-amy": {
    id: "en-us-amy",
    label: "English (American) · Amy",
    type: "local",
    dir: "vits-piper-en_US-amy-medium",
    modelFile: "en_US-amy-medium.onnx",
    tokensFile: "tokens.txt",
    sharedDataDir: "common/espeak-ng-data",
    mountDependencies: ["common"],
    speakerHint: 1,
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
  if ((model.type !== "local" && model.type !== "shared-data") || mountedModels.has(model.id)) {
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

function buildConfigForModel(model) {
  const base = `/models/${model.dir}`;
  const dataDir = model.sharedDataDir ? `/models/${model.sharedDataDir}` : (model.dataDir ? `${base}/${model.dataDir}` : "");
  return {
    offlineTtsModelConfig: {
      offlineTtsVitsModelConfig: {
        model: `${base}/${model.modelFile}`,
        lexicon: "",
        tokens: `${base}/${model.tokensFile}`,
        dataDir,
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


formEl.addEventListener("submit", async (event) => {
  event.preventDefault();

  const selectedVoice = voiceByKey.get(voiceSelect.value);
  if (!selectedVoice) {
    updateStatus("Choose a voice before synthesizing", "warn");
    return;
  }

  try {
    await queueModelSwitch(selectedVoice.modelId);
  } catch (error) {
    console.error(error);
    return;
  }

  if (!ttsInstance) {
    updateStatus("Please wait for the engine to finish loading", "warn");
    return;
  }

  const text = textInput.value.trim();
  if (!text) {
    updateStatus("Enter something to synthesize first", "warn");
    textInput.focus();
    return;
  }

  if (selectedVoice.id < 0 || selectedVoice.id >= ttsInstance.numSpeakers) {
    updateStatus(`Voice must be between 0 and ${ttsInstance.numSpeakers - 1}`, "warn");
    voiceSelect.focus();
    return;
  }

  const speed = Number(speedInput.value);

  setButtonBusy(true);
  updateStatus("Generating audio… this usually takes a few seconds", "info");

  try {
    const audio = ttsInstance.generate({ text, sid: selectedVoice.id, speed });
    // playAudio(audio);
    renderClip(audio, text, selectedVoice, speed);
    updateStatus("Done! You can synthesize another sentence", "success");
    textInput.focus();
  } catch (err) {
    console.error(err);
    updateStatus("Something went wrong while generating audio", "error");
  } finally {
    setButtonBusy(false);
  }
});

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
