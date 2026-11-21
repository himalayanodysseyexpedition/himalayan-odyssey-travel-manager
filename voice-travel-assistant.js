(() => {
  "use strict";

  const SUPABASE_URL = "https://ynkoiuyjevclypumnyes.supabase.co";
  const SUPABASE_KEY = "sb_publishable_Y4JRhHCbljrd5catiUimJw_tr10Qvk-";
  const WHATSAPP = "919816929669";
  const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const isMobile = window.matchMedia("(max-width: 760px)").matches;
  if (!isMobile || document.getElementById("hoe-voice-assistant")) return;

  const state = {
    language: "hi-IN",
    messages: [],
    recognition: null,
    listening: false,
    busy: false,
    open: false
  };

  const style = document.createElement("style");
  style.id = "hoe-voice-assistant-styles";
  style.textContent = `
    #hoe-voice-assistant{position:fixed;right:16px;bottom:calc(88px + env(safe-area-inset-bottom));z-index:9998;font-family:Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:#f7f9fc}
    #hoe-voice-assistant *{box-sizing:border-box}
    #hoe-voice-assistant .hoe-voice-launch{width:58px;height:58px;border:1px solid rgba(255,255,255,.48);border-radius:50%;background:rgba(13,20,29,.94);color:#fff;box-shadow:0 10px 30px rgba(0,0,0,.28);display:grid;place-items:center;cursor:pointer;backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px)}
    #hoe-voice-assistant .hoe-voice-launch svg{width:25px;height:25px}
    #hoe-voice-assistant .hoe-voice-panel{display:none;width:min( min( calc(100vw - 32px), 350px), 350px);margin-bottom:12px;padding:19px;border:1px solid rgba(255,255,255,.17);border-radius:22px;background:rgba(13,20,29,.96);box-shadow:0 20px 55px rgba(0,0,0,.38);backdrop-filter:blur(22px);-webkit-backdrop-filter:blur(22px)}
    #hoe-voice-assistant.is-open .hoe-voice-panel{display:block}
    #hoe-voice-assistant .hoe-voice-top{display:flex;align-items:flex-start;justify-content:space-between;gap:12px}
    #hoe-voice-assistant .hoe-voice-title{font:600 17px/1.25 Georgia,serif;margin:0;color:#fff}
    #hoe-voice-assistant .hoe-voice-subtitle{margin:6px 0 0;color:#b9c3ce;font-size:11px;line-height:1.5}
    #hoe-voice-assistant .hoe-voice-close{width:30px;height:30px;flex:0 0 30px;border:1px solid rgba(255,255,255,.2);border-radius:50%;background:transparent;color:#fff;font-size:19px;line-height:1;cursor:pointer}
    #hoe-voice-assistant .hoe-voice-status{min-height:42px;margin:17px 0 12px;padding:11px 12px;border-radius:12px;background:rgba(255,255,255,.08);color:#e4eaf0;font-size:12px;line-height:1.5}
    #hoe-voice-assistant .hoe-voice-controls{display:flex;align-items:center;justify-content:space-between;gap:12px}
    #hoe-voice-assistant .hoe-voice-languages{display:flex;gap:5px}
    #hoe-voice-assistant .hoe-voice-language{min-height:34px;padding:0 11px;border:1px solid rgba(255,255,255,.22);border-radius:999px;background:transparent;color:#dce4ed;font-size:11px;cursor:pointer}
    #hoe-voice-assistant .hoe-voice-language[aria-pressed="true"]{background:#f2f5f8;color:#101820;border-color:#f2f5f8;font-weight:700}
    #hoe-voice-assistant .hoe-voice-mic{width:62px;height:62px;flex:0 0 62px;border:0;border-radius:50%;background:#f2f5f8;color:#101820;display:grid;place-items:center;cursor:pointer;box-shadow:0 6px 20px rgba(0,0,0,.24)}
    #hoe-voice-assistant .hoe-voice-mic svg{width:25px;height:25px}
    #hoe-voice-assistant .hoe-voice-mic[disabled]{opacity:.48;cursor:wait}
    #hoe-voice-assistant.is-listening .hoe-voice-mic{background:#e7b9b9;color:#391313;animation:hoe-voice-pulse 1.35s ease-in-out infinite}
    #hoe-voice-assistant .hoe-voice-help{display:block;margin-top:12px;color:#aebbc8;font-size:10px;line-height:1.5;text-align:center}
    #hoe-voice-assistant .hoe-voice-whatsapp{display:block;margin-top:11px;color:#fff;text-align:center;font-size:11px;text-decoration:underline;text-underline-offset:3px}
    @keyframes hoe-voice-pulse{50%{box-shadow:0 0 0 9px rgba(231,185,185,.13)}}
    @media(prefers-reduced-motion:reduce){#hoe-voice-assistant .hoe-voice-mic{animation:none!important}}
  `;
  document.head.appendChild(style);

  const root = document.createElement("div");
  root.id = "hoe-voice-assistant";
  root.innerHTML = `
    <section class="hoe-voice-panel" aria-label="Voice travel assistant">
      <div class="hoe-voice-top">
        <div><h2 class="hoe-voice-title">Talk to Himalayan Odyssey</h2><p class="hoe-voice-subtitle">Ask about Spiti, Kinnaur, itineraries and trip planning.</p></div>
        <button class="hoe-voice-close" type="button" aria-label="Close voice assistant">×</button>
      </div>
      <p class="hoe-voice-status" id="hoeVoiceStatus" role="status" aria-live="polite">Tap the microphone and ask your travel question.</p>
      <div class="hoe-voice-controls">
        <div class="hoe-voice-languages" aria-label="Choose conversation language">
          <button class="hoe-voice-language" type="button" data-lang="hi-IN" aria-pressed="true">हिन्दी</button>
          <button class="hoe-voice-language" type="button" data-lang="en-IN" aria-pressed="false">English</button>
        </div>
        <button class="hoe-voice-mic" type="button" id="hoeVoiceMic" aria-label="Start speaking">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="2" width="6" height="13" rx="3"></rect><path d="M5 10v2a7 7 0 0 0 14 0v-2M12 19v3m-4 0h8"></path></svg>
        </button>
      </div>
      <span class="hoe-voice-help">Your microphone is used only after you tap it. No chat transcript is displayed.</span>
      <a class="hoe-voice-whatsapp" href="https://wa.me/${WHATSAPP}" target="_blank" rel="noopener">Talk to our team on WhatsApp</a>
    </section>
    <button class="hoe-voice-launch" type="button" aria-label="Open voice travel assistant" aria-expanded="false">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="2" width="6" height="13" rx="3"></rect><path d="M5 10v2a7 7 0 0 0 14 0v-2M12 19v3m-4 0h8"></path></svg>
    </button>`;
  document.body.appendChild(root);

  const status = root.querySelector("#hoeVoiceStatus");
  const mic = root.querySelector("#hoeVoiceMic");
  const launcher = root.querySelector(".hoe-voice-launch");
  const panelClose = root.querySelector(".hoe-voice-close");

  function setStatus(message) { status.textContent = message; }
  function setOpen(open) {
    state.open = open;
    root.classList.toggle("is-open", open);
    launcher.setAttribute("aria-expanded", String(open));
    launcher.setAttribute("aria-label", open ? "Close voice travel assistant" : "Open voice travel assistant");
  }
  function stopSpeech() {
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
  }
  function speak(message) {
    if (!("speechSynthesis" in window)) {
      setStatus(message + " (Voice playback is not supported in this browser.)");
      return;
    }
    stopSpeech();
    const utterance = new SpeechSynthesisUtterance(message);
    utterance.lang = state.language;
    utterance.rate = 0.96;
    utterance.pitch = 1;
    utterance.onstart = () => setStatus("Himalayan Odyssey is speaking…");
    utterance.onend = () => setStatus("Tap the microphone to ask another question.");
    utterance.onerror = () => setStatus("Reply received. Tap the microphone to continue.");
    window.speechSynthesis.speak(utterance);
  }
  function setBusy(busy) {
    state.busy = busy;
    mic.disabled = busy;
    root.classList.toggle("is-listening", state.listening);
  }
  async function askAssistant(transcript) {
    state.messages.push({ role: "user", content: transcript });
    state.messages = state.messages.slice(-12);
    setBusy(true);
    setStatus("Thinking about your trip…");
    try {
      const response = await fetch(SUPABASE_URL + "/functions/v1/ai-travel-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json", "apikey": SUPABASE_KEY },
        body: JSON.stringify({ action: "chat", messages: state.messages })
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.reply) throw new Error(result.message || "The assistant is unavailable right now.");
      state.messages.push({ role: "assistant", content: result.reply });
      state.messages = state.messages.slice(-12);
      speak(result.reply);
    } catch (error) {
      const message = error && error.message ? error.message : "I couldn't connect. Please try again.";
      setStatus(message);
      if ("speechSynthesis" in window) speak(message);
    } finally {
      setBusy(false);
    }
  }
  function createRecognition() {
    if (!Recognition) return null;
    const recognition = new Recognition();
    recognition.lang = state.language;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.continuous = false;
    recognition.onstart = () => {
      state.listening = true;
      root.classList.add("is-listening");
      mic.setAttribute("aria-label", "Listening");
      setStatus(state.language === "hi-IN" ? "सुन रहा हूँ… अब बोलिए।" : "Listening… speak now.");
    };
    recognition.onresult = event => {
      const transcript = event.results && event.results[0] && event.results[0][0]
        ? String(event.results[0][0].transcript || "").trim() : "";
      state.listening = false;
      root.classList.remove("is-listening");
      mic.setAttribute("aria-label", "Start speaking");
      if (transcript) askAssistant(transcript);
      else setStatus("I couldn't hear that clearly. Tap the microphone and try again.");
    };
    recognition.onerror = event => {
      state.listening = false;
      root.classList.remove("is-listening");
      mic.setAttribute("aria-label", "Start speaking");
      const errors = {
        "not-allowed": "Microphone permission is blocked. Allow microphone access in your browser settings.",
        "service-not-allowed": "Speech recognition is unavailable in this browser. Use WhatsApp to contact our team.",
        "network": "Speech recognition needs an internet connection. Please try again."
      };
      setStatus(errors[event.error] || "I couldn't hear that. Please tap the microphone and try again.");
    };
    recognition.onend = () => {
      state.listening = false;
      root.classList.remove("is-listening");
      mic.setAttribute("aria-label", "Start speaking");
    };
    return recognition;
  }

  launcher.addEventListener("click", () => setOpen(!state.open));
  panelClose.addEventListener("click", () => {
    if (state.recognition && state.listening) state.recognition.stop();
    stopSpeech();
    setOpen(false);
  });
  root.querySelectorAll("[data-lang]").forEach(button => {
    button.addEventListener("click", () => {
      state.language = button.dataset.lang;
      root.querySelectorAll("[data-lang]").forEach(item => item.setAttribute("aria-pressed", String(item === button)));
      if (state.recognition && state.listening) state.recognition.stop();
      setStatus(state.language === "hi-IN" ? "माइक्रोफ़ोन दबाएँ और अपना सवाल पूछें।" : "Tap the microphone and ask your question.");
    });
  });
  mic.addEventListener("click", () => {
    if (state.busy) return;
    stopSpeech();
    if (!Recognition) {
      const message = "Voice recognition is not supported by this browser. Please open this website in Safari or Chrome, or contact our team on WhatsApp.";
      setStatus(message);
      return;
    }
    if (state.listening && state.recognition) {
      state.recognition.stop();
      return;
    }
    state.recognition = createRecognition();
    try { state.recognition.start(); }
    catch (_) { setStatus("Microphone is starting. Please tap again in a moment."); }
  });
})();
