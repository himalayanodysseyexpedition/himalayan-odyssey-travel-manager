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
    open: false,
    sessionActive: false,
    starting: false,
    speaking: false,
    isGreeting: false,
    restartTimer: null
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
    #hoe-voice-assistant .hoe-voice-title{font:600 17px/1.25 Georgia,serif;margin:0;color:#fff!important;-webkit-text-fill-color:#fff!important;opacity:1!important}
    #hoe-voice-assistant .hoe-voice-subtitle{margin:6px 0 0;color:#b9c3ce;font-size:11px;line-height:1.5}
    #hoe-voice-assistant .hoe-voice-close{width:30px;height:30px;flex:0 0 30px;border:1px solid rgba(255,255,255,.2);border-radius:50%;background:transparent;color:#fff;font-size:19px;line-height:1;cursor:pointer}
    #hoe-voice-assistant .hoe-voice-chat{display:flex;flex-direction:column;gap:9px;max-height:34vh;overflow:auto;margin:13px 0 8px;padding:2px 3px 7px;overscroll-behavior:contain;scrollbar-width:thin}
    #hoe-voice-assistant .hoe-voice-message{max-width:92%;padding:10px 12px;border:1px solid rgba(255,255,255,.1);border-radius:15px;font-size:12px;line-height:1.55;white-space:pre-wrap;overflow-wrap:anywhere}
    #hoe-voice-assistant .hoe-voice-message.is-user{align-self:flex-end;background:rgba(218,232,242,.16);border-bottom-right-radius:5px;color:#fff}
    #hoe-voice-assistant .hoe-voice-message.is-assistant{align-self:flex-start;background:rgba(255,255,255,.075);border-bottom-left-radius:5px;color:#f4f6f8}
    #hoe-voice-assistant .hoe-voice-results{display:grid;gap:8px;margin-top:10px}
    #hoe-voice-assistant .hoe-voice-results-label{margin:5px 0 0;color:#d4b779;font-size:10px;font-weight:700;letter-spacing:.08em;text-transform:uppercase}
    #hoe-voice-assistant .hoe-voice-result-card{display:flex;gap:9px;align-items:stretch;padding:8px;border:1px solid rgba(255,255,255,.13);border-radius:13px;background:rgba(7,14,22,.55);min-width:0}
    #hoe-voice-assistant .hoe-voice-result-card img{width:72px;height:76px;flex:0 0 72px;object-fit:cover;border-radius:9px;background:rgba(255,255,255,.08)}
    #hoe-voice-assistant .hoe-voice-result-copy{min-width:0;display:flex;flex:1;flex-direction:column;align-items:flex-start}
    #hoe-voice-assistant .hoe-voice-result-title{margin:0 0 4px;color:#fff;font-size:11px;font-weight:700;line-height:1.35}
    #hoe-voice-assistant .hoe-voice-result-meta{margin:0 0 5px;color:#e2c98e;font-size:10px;line-height:1.35}
    #hoe-voice-assistant .hoe-voice-result-summary{margin:0 0 7px;color:#c0cbd6;font-size:10px;line-height:1.4}
    #hoe-voice-assistant .hoe-voice-result-link{margin-top:auto;color:#fff;font-size:10px;font-weight:700;text-decoration:underline;text-underline-offset:3px}
    #hoe-voice-assistant .hoe-voice-panel{width:min(calc(100vw - 32px),390px);max-height:78vh;overflow:hidden}
    #hoe-voice-assistant .hoe-voice-status{min-height:42px;margin:17px 0 12px;padding:11px 12px;border-radius:12px;background:rgba(255,255,255,.08);color:#e4eaf0;font-size:12px;line-height:1.5}
    #hoe-voice-assistant .hoe-voice-controls{display:flex;align-items:center;justify-content:flex-start;gap:12px}
    #hoe-voice-assistant .hoe-voice-languages{display:flex;gap:5px}
    #hoe-voice-assistant .hoe-voice-language{min-height:34px;padding:0 11px;border:1px solid rgba(255,255,255,.22);border-radius:999px;background:transparent;color:#dce4ed;font-size:11px;cursor:pointer}
    #hoe-voice-assistant .hoe-voice-language[aria-pressed="true"]{background:#f2f5f8;color:#101820;border-color:#f2f5f8;font-weight:700}
    #hoe-voice-assistant.is-listening .hoe-voice-status{border:1px solid rgba(231,185,185,.5);box-shadow:0 0 0 4px rgba(231,185,185,.07)}
    #hoe-voice-assistant .hoe-voice-help{display:block;margin-top:12px;color:#aebbc8;font-size:10px;line-height:1.5;text-align:center}
    #hoe-voice-assistant .hoe-voice-whatsapp{display:block;margin-top:11px;color:#fff;text-align:center;font-size:11px;text-decoration:underline;text-underline-offset:3px}
    @media(prefers-reduced-motion:reduce){#hoe-voice-assistant .hoe-voice-status{box-shadow:none!important}}
  `;
  document.head.appendChild(style);

  const root = document.createElement("div");
  root.id = "hoe-voice-assistant";
  root.innerHTML = `
    <section class="hoe-voice-panel" aria-label="Voice travel assistant">
      <div class="hoe-voice-top">
        <div><h2 class="hoe-voice-title" style="color:#fff!important;-webkit-text-fill-color:#fff!important;opacity:1!important">Talk to Himalayan Odyssey</h2><p class="hoe-voice-subtitle">Ask about Spiti, Kinnaur, itineraries and trip planning.</p></div>
        <button class="hoe-voice-close" type="button" aria-label="Close voice assistant">×</button>
      </div>
      <div class="hoe-voice-chat" id="hoeVoiceChat" role="log" aria-live="polite"><div class="hoe-voice-message is-assistant">नमस्कार! मैं आपकी यात्रा में मदद के लिए तैयार हूँ।</div></div><p class="hoe-voice-status" id="hoeVoiceStatus" role="status" aria-live="polite">वॉइस असिस्टेंट खुलते ही बातचीत शुरू हो जाएगी।</p>
      <div class="hoe-voice-controls">
        <div class="hoe-voice-languages" aria-label="Choose conversation language">
          <button class="hoe-voice-language" type="button" data-lang="hi-IN" aria-pressed="true">हिन्दी</button>
          <button class="hoe-voice-language" type="button" data-lang="en-IN" aria-pressed="false">English</button>
        </div>

      </div>
      <span class="hoe-voice-help">वॉइस असिस्टेंट खुलने पर सुनना शुरू करता है। बातचीत समाप्त करने के लिए इसे बंद करें।</span>
      <a class="hoe-voice-whatsapp" href="https://wa.me/${WHATSAPP}" target="_blank" rel="noopener">Talk to our team on WhatsApp</a>
    </section>
    <button class="hoe-voice-launch" type="button" aria-label="Open voice travel assistant" aria-expanded="false">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="2" width="6" height="13" rx="3"></rect><path d="M5 10v2a7 7 0 0 0 14 0v-2M12 19v3m-4 0h8"></path></svg>
    </button>`;
  document.body.appendChild(root);

  const status = root.querySelector("#hoeVoiceStatus");
  const chatFeed = root.querySelector("#hoeVoiceChat");
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
  function prepareSpeechText(message) {
    if (state.language !== "hi-IN") return String(message || "");
    const pronunciations = [
      ["Himalayan Odyssey Expedition","हिमालयन ओडिसी एक्सपेडिशन"],
      ["Himalayan Odyssey","हिमालयन ओडिसी"],
      ["Winter Spiti Valley","विंटर स्पीति वैली"],
      ["Spiti Valley","स्पीति वैली"],["Winter Spiti","विंटर स्पीति"],
      ["Key Monastery","की मोनेस्ट्री"],["Chicham Bridge","चिचम ब्रिज"],["Hatu Peak","हाटू पीक"],
      ["Kinnaur","किन्नौर"],["Narkanda","नारकंडा"],["Chitkul","छितकुल"],["Sangla","सांगला"],
      ["Kalpa","कल्पा"],["Tabo","ताबो"],["Kaza","काज़ा"],["Kibber","किब्बर"],
      ["Shimla","शिमला"],["Manali","मनाली"],["Kasol","कसोल"],["Jibhi","जिभी"],["Spiti","स्पीति"]
    ];
    let spoken = String(message || "");
    pronunciations.forEach(([from,to]) => { spoken = spoken.replace(new RegExp(from,"gi"),to); });
    return spoken.replace(/₹\s*/g," रुपये ").replace(/\s{2,}/g," ").trim();
  }
  function selectSpeechVoice() {
    if (!("speechSynthesis" in window)) return null;
    const voices = window.speechSynthesis.getVoices() || [];
    const wanted = state.language.toLowerCase();
    return voices.find(item => String(item.lang || "").toLowerCase() === wanted) ||
      voices.find(item => String(item.lang || "").toLowerCase().startsWith(wanted.slice(0,2))) || null;
  }
  function speak(message, replaceCurrent = true, afterSpeech = null) {
    const resumeConversation = () => {
      if (typeof afterSpeech === "function") afterSpeech();
      else if (state.sessionActive) scheduleListening(350);
    };
    if (!("speechSynthesis" in window) || typeof SpeechSynthesisUtterance === "undefined") {
      setStatus("Voice playback is not supported in this browser. You can still use the chat or WhatsApp.");
      resumeConversation();
      return;
    }
    if (replaceCurrent && (window.speechSynthesis.speaking || window.speechSynthesis.pending)) {
      window.speechSynthesis.cancel();
    }
    const utterance = new SpeechSynthesisUtterance(prepareSpeechText(message));
    utterance.lang = state.language;
    const voiceChoice = selectSpeechVoice();
    if (voiceChoice) utterance.voice = voiceChoice;
    utterance.rate = state.language === "hi-IN" ? 0.92 : 1.0;
    utterance.pitch = 1.02;
    utterance.volume = 1;
    let completed = false;
    const finishSpeech = () => {
      if (completed) return;
      completed = true;
      state.speaking = false;
      setStatus(state.language === "hi-IN" ? "अगला सवाल सुनने के लिए तैयार हूँ…" : "Ready for your next question…");
      resumeConversation();
    };
    utterance.onstart = () => {
      state.speaking = true;
      setStatus(state.language === "hi-IN" ? "जवाब सुनिए…" : "Himalayan Odyssey is speaking…");
    };
    utterance.onend = finishSpeech;
    utterance.onerror = event => {
      setStatus(event && event.error === "not-allowed"
        ? "Please allow spoken audio in your browser settings."
        : "Voice playback could not start. I will keep the conversation open.");
      finishSpeech();
    };
    window.speechSynthesis.resume();
    window.speechSynthesis.speak(utterance);
  }
  function setBusy(busy) {
    state.busy = busy;
    root.classList.toggle("is-listening", state.listening);
  }
  function appendChatMessage(role, text) {
    const bubble = document.createElement("div");
    bubble.className = "hoe-voice-message " + (role === "user" ? "is-user" : "is-assistant");
    bubble.textContent = text || "";
    chatFeed.appendChild(bubble);
    chatFeed.scrollTop = chatFeed.scrollHeight;
    return bubble;
  }
  function addResultCard(container,title,meta,summary,imageUrl,href,actionLabel) {
    const card = document.createElement("article");
    card.className = "hoe-voice-result-card";
    if (imageUrl) {
      const image = document.createElement("img");
      image.src = imageUrl; image.alt = title; image.loading = "lazy"; image.referrerPolicy = "no-referrer";
      image.onerror = () => image.remove();
      card.appendChild(image);
    }
    const copy = document.createElement("div"); copy.className = "hoe-voice-result-copy";
    const heading = document.createElement("h3"); heading.className = "hoe-voice-result-title";
    heading.textContent = title || "Himalayan Odyssey"; copy.appendChild(heading);
    if (meta) { const line = document.createElement("p"); line.className = "hoe-voice-result-meta"; line.textContent = meta; copy.appendChild(line); }
    if (summary) { const desc = document.createElement("p"); desc.className = "hoe-voice-result-summary"; desc.textContent = summary; copy.appendChild(desc); }
    const link = document.createElement("a"); link.className = "hoe-voice-result-link";
    link.href = href; link.target = "_blank"; link.rel = "noopener noreferrer"; link.textContent = actionLabel || "View details";
    copy.appendChild(link); card.appendChild(copy); container.appendChild(card);
  }
  function renderRecommendations(parent,recommendations) {
    if (!recommendations) return;
    const results = document.createElement("div"); results.className = "hoe-voice-results";
    const safeInternalUrl = value => {
      const url = String(value || "");
      return url.startsWith("/") && !url.startsWith("//") ? url : "";
    };
    const whatsapp = text => "https://wa.me/" + WHATSAPP + "?text=" + encodeURIComponent(text);
    const destinations = Array.isArray(recommendations.destinations) ? recommendations.destinations : [];
    const packages = Array.isArray(recommendations.packages) ? recommendations.packages : [];
    const departures = Array.isArray(recommendations.group_departures) ? recommendations.group_departures : [];
    if (destinations.length) {
      const label = document.createElement("p"); label.className = "hoe-voice-results-label";
      label.textContent = state.language === "hi-IN" ? "संबंधित जगहें" : "Related destinations"; results.appendChild(label);
      destinations.forEach(item => addResultCard(
        results,item.title,item.tagline || "",
        state.language === "hi-IN" ? "इस जगह के टूर और यात्रा की जानकारी देखें।" : "Explore tours and travel details for this destination.",
        item.image_url,safeInternalUrl(item.link_url) || whatsapp("Namaste, please share tour details for " + item.title + "."),
        state.language === "hi-IN" ? "डेस्टिनेशन देखें" : "Explore destination"
      ));
    }
    if (packages.length) {
      const label = document.createElement("p"); label.className = "hoe-voice-results-label";
      label.textContent = state.language === "hi-IN" ? "आपके लिए टूर पैकेज" : "Matching tour packages"; results.appendChild(label);
      packages.forEach(item => {
        const price = item.price_per_person === null || item.price_per_person === undefined ? "" :
          (state.language === "hi-IN" ? "₹" : "₹") + Number(item.price_per_person).toLocaleString("en-IN") + (state.language === "hi-IN" ? " प्रति व्यक्ति" : " per person");
        const meta = [item.duration,price].filter(Boolean).join(" · ");
        addResultCard(results,item.name,meta,item.summary || (state.language === "hi-IN" ? "इस पैकेज की पूरी जानकारी के लिए पूछें।" : "Ask us for the full package itinerary."),
          item.image_url,whatsapp("Namaste, I want details for the " + item.name + " tour package."),
          state.language === "hi-IN" ? "पैकेज की जानकारी लें" : "Ask about this package");
      });
    }
    if (departures.length) {
      const label = document.createElement("p"); label.className = "hoe-voice-results-label";
      label.textContent = state.language === "hi-IN" ? "आगामी ग्रुप टूर" : "Upcoming group tours"; results.appendChild(label);
      departures.forEach(item => {
        const seats = item.max_travellers === null || item.max_travellers === undefined ? "" :
          Math.max(0,Number(item.max_travellers)-Number(item.joined_count||0));
        const dates = [item.start_date,item.end_date].filter(Boolean).join(" – ");
        const price = item.price_per_person === null || item.price_per_person === undefined ? "" : "₹" + Number(item.price_per_person).toLocaleString("en-IN") + " pp";
        const meta = [dates,item.duration,price,seats === "" ? "" : (state.language === "hi-IN" ? seats + " सीट बाकी" : seats + " seats left")].filter(Boolean).join(" · ");
        addResultCard(results,item.title + (item.destination ? " · " + item.destination : ""),meta,item.highlights || "",
          "",whatsapp("Namaste, please share availability and details for " + item.title + " starting " + item.start_date + "."),
          state.language === "hi-IN" ? "ग्रुप टूर पूछें" : "Enquire about group tour");
      });
    }
    if (results.childElementCount) { parent.appendChild(results); chatFeed.scrollTop = chatFeed.scrollHeight; }
  }
  async function askAssistant(transcript) {
    appendChatMessage("user",transcript);
    state.messages.push({role:"user",content:transcript});
    state.messages = state.messages.slice(-12);
    setBusy(true);
    setStatus(state.language === "hi-IN" ? "आपका सवाल समझ रहा हूँ…" : "Preparing your answer…");
    const controller = new AbortController();
    const requestTimeout = window.setTimeout(() => controller.abort(),18000);
    try {
      const response = await fetch(SUPABASE_URL + "/functions/v1/ai-travel-assistant",{
        method:"POST",
        headers:{"Content-Type":"application/json","apikey":SUPABASE_KEY},
        body:JSON.stringify({action:"chat",messages:state.messages,language:state.language}),
        signal:controller.signal
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.reply) throw new Error(result.message || "The assistant is unavailable right now.");
      state.messages.push({role:"assistant",content:result.reply});
      state.messages = state.messages.slice(-12);
      const responseBubble = appendChatMessage("assistant",result.reply);
      renderRecommendations(responseBubble,result.recommendations);
      speak(result.reply);
    } catch (error) {
      const message = error && error.name === "AbortError"
        ? (state.language === "hi-IN" ? "जवाब आने में ज़्यादा समय लगा। कृपया फिर से पूछें।" : "The reply took too long. Please try again.")
        : (error && error.message ? error.message : "I couldn't connect. Please try again.");
      appendChatMessage("assistant",message); setStatus(message);
      if ("speechSynthesis" in window) speak(message);
    } finally { window.clearTimeout(requestTimeout); setBusy(false); }
  }
  function clearRestartTimer() {
    if (state.restartTimer) window.clearTimeout(state.restartTimer);
    state.restartTimer = null;
  }

  function scheduleListening(delay = 350) {
    if (!state.sessionActive || state.busy || state.speaking || state.isGreeting || state.starting || state.listening) return;
    clearRestartTimer();
    state.restartTimer = window.setTimeout(() => {
      state.restartTimer = null;
      startListening();
    }, delay);
  }

  function startListening() {
    if (!state.sessionActive || state.busy || state.speaking || state.isGreeting || state.starting || state.listening) return;
    if (!Recognition) {
      state.sessionActive = false;
      setStatus("This browser does not support automatic voice recognition. Please use Chrome or contact us on WhatsApp.");
      return;
    }
    clearRestartTimer();
    const recognition = createRecognition();
    state.recognition = recognition;
    state.starting = true;
    try {
      // Called directly from the launcher click on first use so the browser can
      // request microphone permission within the user's activation.
      recognition.start();
    } catch (error) {
      state.starting = false;
      setStatus(state.language === "hi-IN"
        ? "माइक्रोफ़ोन शुरू नहीं हो पाया। अनुमति जाँचकर दोबारा वॉइस असिस्टेंट खोलें।"
        : "The microphone could not start. Check permission and reopen the voice assistant.");
      scheduleListening(900);
    }
  }

  function createRecognition() {
    if (!Recognition) return null;
    const recognition = new Recognition();
    let receivedResult = false;
    let listenWatchdog = null;
    const clearListenWatchdog = () => {
      if (listenWatchdog) window.clearTimeout(listenWatchdog);
      listenWatchdog = null;
    };
    const resetListeningUI = () => {
      clearListenWatchdog();
      state.starting = false;
      state.listening = false;
      root.classList.remove("is-listening");
    };
    recognition.lang = state.language;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.continuous = false;
    recognition.onstart = () => {
      state.starting = false;
      state.listening = true;
      root.classList.add("is-listening");

      // The greeting is spoken directly from the launch tap. If recognition
      // starts while it is playing, stop capture so the assistant does not hear itself.
      if (state.isGreeting) {
        resetListeningUI();
        try { recognition.stop(); } catch (_) {}
        return;
      }

      setStatus(state.language === "hi-IN" ? "सुन रहा हूँ… बोलिए।" : "Listening… speak now.");
      clearListenWatchdog();
      listenWatchdog = window.setTimeout(() => {
        if (!state.sessionActive || receivedResult || !state.listening) return;
        setStatus(state.language === "hi-IN"
          ? "मैं फिर से सुन रहा हूँ… बोलिए।"
          : "I am still here. Please speak when ready.");
        try { recognition.stop(); } catch (_) {}
        resetListeningUI();
        scheduleListening(300);
      }, 12000);
    };
    recognition.onresult = event => {
      receivedResult = true;
      clearListenWatchdog();
      const transcript = Array.from(event.results || [])
        .slice(event.resultIndex || 0)
        .map(result => result && result[0] ? String(result[0].transcript || "") : "")
        .join(" ").trim();
      resetListeningUI();
      if (transcript) askAssistant(transcript);
      else {
        setStatus(state.language === "hi-IN" ? "आवाज़ साफ़ नहीं आई। फिर से बोलिए।" : "I couldn't hear that clearly. Please try again.");
        scheduleListening(300);
      }
    };
    recognition.onerror = event => {
      resetListeningUI();
      if (event.error === "not-allowed" || event.error === "service-not-allowed") {
        state.sessionActive = false;
        setStatus(state.language === "hi-IN"
          ? "माइक्रोफ़ोन की अनुमति नहीं मिली। ब्राउज़र सेटिंग्स में माइक्रोफ़ोन की अनुमति दें।"
          : "Microphone access is blocked. Allow microphone access in your browser settings.");
        return;
      }
      if (!state.sessionActive || event.error === "aborted") return;
      if (event.error === "network") {
        setStatus(state.language === "hi-IN" ? "कनेक्शन जाँच रहा हूँ… फिर से सुनूँगा।" : "Checking the connection. I will listen again.");
        scheduleListening(1400);
        return;
      }
      setStatus(state.language === "hi-IN" ? "जी, फिर से सुन रहा हूँ। बोलिए।" : "Ready to listen again. Please speak.");
      scheduleListening(350);
    };
    recognition.onnomatch = () => {
      setStatus(state.language === "hi-IN" ? "मैं समझ नहीं पाया। कृपया दोबारा बोलें।" : "I couldn't understand that. Please say it again.");
    };
    recognition.onend = () => {
      const hadResult = receivedResult;
      resetListeningUI();
      if (!state.sessionActive || state.busy || state.speaking || state.isGreeting) return;
      if (!hadResult) {
        setStatus(state.language === "hi-IN" ? "मैं सुनने के लिए तैयार हूँ…" : "Ready to listen…");
      }
      scheduleListening(350);
    };
    return recognition;
  }

  function stopVoiceSession() {
    state.sessionActive = false;
    state.starting = false;
    state.listening = false;
    state.isGreeting = false;
    clearRestartTimer();
    root.classList.remove("is-listening");
    if (state.recognition) {
      try { state.recognition.stop(); } catch (_) {}
      state.recognition = null;
    }
    stopSpeech();
  }
 
  launcher.addEventListener("click", () => {
    const opening = !state.open;
    setOpen(opening);
    if (opening) {
      state.sessionActive = Boolean(Recognition);
      state.isGreeting = false;
      setStatus(state.language === "hi-IN" ? "वॉइस असिस्टेंट शुरू हो रहा है…" : "Starting voice assistant…");

      // Invoke recognition and speech synthesis during the same user tap.
      // This preserves mobile browser user activation for BOTH microphone
      // permission and the welcome audio.
      if (Recognition) startListening();
      state.isGreeting = true;
      const welcome = state.language === "hi-IN"
        ? "नमस्कार, बताइए आज कौन-सी ट्रिप पर चलें?"
        : "Hello! Welcome to Himalayan Odyssey. What would you like to know about Himachal, Spiti, or planning your next trip?";
      try {
        speak(welcome, false, () => {
          state.isGreeting = false;
          if (!Recognition) {
            setStatus(state.language === "hi-IN"
              ? "इस ब्राउज़र में ऑटोमैटिक वॉइस सुनना उपलब्ध नहीं है। Chrome में खोलें या WhatsApp पर संपर्क करें।"
              : "Automatic voice recognition is not supported in this browser. Open this page in Chrome or contact us on WhatsApp.");
            return;
          }
          if (state.sessionActive) {
            setStatus(state.language === "hi-IN" ? "अब बोलिए, मैं सुन रहा हूँ…" : "Go ahead, I am listening…");
            scheduleListening(350);
          }
        });
      } catch (_) {
        state.isGreeting = false;
        setStatus(state.language === "hi-IN"
          ? "वॉइस ग्रीटिंग शुरू नहीं हुई। अब बोलिए…"
          : "The voice greeting could not start. You can speak now.");
        if (state.sessionActive) scheduleListening(350);
      }
    } else {
      stopVoiceSession();
    }
  });

  panelClose.addEventListener("click", () => {
    stopVoiceSession();
    setOpen(false);
  });

  root.querySelectorAll("[data-lang]").forEach(button => {
    button.addEventListener("click", () => {
      state.language = button.dataset.lang;
      root.querySelectorAll("[data-lang]").forEach(item =>
        item.setAttribute("aria-pressed", String(item === button))
      );
      if ("speechSynthesis" in window) stopSpeech();
      if (state.sessionActive) {
        if (state.recognition) {
          try { state.recognition.stop(); } catch (_) {}
        }
        state.starting = false;
        state.listening = false;
        state.speaking = false;
        state.isGreeting = false;
        setStatus(state.language === "hi-IN" ? "भाषा बदल गई है। अब बोलिए।" : "Language changed. Please speak.");
        scheduleListening(350);
      } else {
        setStatus(state.language === "hi-IN" ? "वॉइस असिस्टेंट खुलते ही सुनना शुरू करेगा।" : "Open the voice assistant to start listening.");
      }
    });
  });

})();
