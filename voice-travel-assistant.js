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
    restartTimer: null,
    bootstrap: null,
    enquiry: { kind:"", package:null, departure:null, guests:"", travelDates:"", pickup:"", locations:"", name:"" },
    awaitingField: "",
    packageMatches: []
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
    #hoe-voice-assistant .hoe-voice-result-action{margin-top:auto;min-height:34px;padding:7px 11px;border:1px solid rgba(226,201,142,.72);border-radius:999px;background:rgba(226,201,142,.12);color:#fff;font-size:10px;font-weight:700;cursor:pointer}
    #hoe-voice-assistant .hoe-voice-whatsapp.is-disabled{opacity:.42;pointer-events:none;cursor:not-allowed}
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
      <a class="hoe-voice-whatsapp is-disabled" id="hoeVoiceWhatsapp" href="#" target="_blank" rel="noopener noreferrer" aria-disabled="true">Complete trip details to prepare WhatsApp enquiry</a>
    </section>
    <button class="hoe-voice-launch" type="button" aria-label="Open voice travel assistant" aria-expanded="false">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="2" width="6" height="13" rx="3"></rect><path d="M5 10v2a7 7 0 0 0 14 0v-2M12 19v3m-4 0h8"></path></svg>
    </button>`;
  document.body.appendChild(root);

  const status = root.querySelector("#hoeVoiceStatus");
  const chatFeed = root.querySelector("#hoeVoiceChat");
  const launcher = root.querySelector(".hoe-voice-launch");
  const panelClose = root.querySelector(".hoe-voice-close");
  const whatsappButton = root.querySelector("#hoeVoiceWhatsapp");

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
    state.speaking = true;
    if (state.recognition && (state.listening || state.starting)) {
      try { state.recognition.stop(); } catch (_) {}
      state.listening = false;
      state.starting = false;
      root.classList.remove("is-listening");
    }
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
    try {
      window.speechSynthesis.resume();
      window.speechSynthesis.speak(utterance);
    } catch (_) {
      finishSpeech();
    }
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
  function addResultCard(container,title,meta,summary,imageUrl,href,actionLabel,onSelect = null) {
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
    if (typeof onSelect === "function") {
      const button = document.createElement("button");
      button.type = "button"; button.className = "hoe-voice-result-action";
      button.textContent = actionLabel || "Select";
      button.addEventListener("click", onSelect);
      copy.appendChild(button);
    } else {
      const link = document.createElement("a"); link.className = "hoe-voice-result-link";
      link.href = href; link.target = "_blank"; link.rel = "noopener noreferrer"; link.textContent = actionLabel || "View details";
      copy.appendChild(link);
    }
    card.appendChild(copy); container.appendChild(card);
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
  function enquiryText(hindi, english) {
    return state.language === "hi-IN" ? hindi : english;
  }
  function normaliseSearch(value) {
    return String(value || "").normalize("NFKC").toLocaleLowerCase("en-IN")
      .replace(/[‐-–—]/g, " ").replace(/[^\p{L}\p{N}]+/gu, " ").trim();
  }
  function formatTripDate(value) {
    const match = String(value || "").match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!match) return String(value || "");
    return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]), 12)
      .toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" });
  }
  function formatDepartureDates(item) {
    if (!item) return "";
    const start = formatTripDate(item.start_date);
    const end = formatTripDate(item.end_date);
    return start && end ? start + " to " + end : start || end;
  }
  async function loadAssistantData() {
    try {
      const response = await fetch(SUPABASE_URL + "/functions/v1/ai-travel-assistant", {
        method:"POST",
        headers:{ "Content-Type":"application/json", "apikey":SUPABASE_KEY },
        body:JSON.stringify({ action:"bootstrap" })
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message || "Could not load trip options.");
      state.bootstrap = {
        packages:Array.isArray(data.packages) ? data.packages : [],
        destinations:Array.isArray(data.destinations) ? data.destinations : [],
        group_departures:Array.isArray(data.group_departures) ? data.group_departures : []
      };
      return state.bootstrap;
    } catch (_) {
      state.bootstrap = state.bootstrap || { packages:[], destinations:[], group_departures:[] };
      return state.bootstrap;
    }
  }
  function renderDepartureOptions(departures) {
    if (!departures || !departures.length) return;
    const results = document.createElement("div");
    results.className = "hoe-voice-results";
    const label = document.createElement("p");
    label.className = "hoe-voice-results-label";
    label.textContent = enquiryText("आगामी ग्रुप departures", "Upcoming group departures");
    results.appendChild(label);
    departures.forEach(item => {
      const remaining = item.max_travellers == null ? null : Math.max(0, Number(item.max_travellers) - Number(item.joined_count || 0));
      const meta = [
        formatDepartureDates(item), item.duration,
        item.price_per_person == null ? "" : "₹" + Number(item.price_per_person).toLocaleString("en-IN") + " per person",
        remaining == null ? "" : remaining + (state.language === "hi-IN" ? " सीट बाकी" : " seats listed")
      ].filter(Boolean).join(" · ");
      addResultCard(
        results, item.title + (item.destination ? " · " + item.destination : ""), meta,
        item.highlights || "", item.image_url || "", "",
        enquiryText("यह departure चुनें", "Select this departure"), () => chooseDeparture(item)
      );
    });
    chatFeed.appendChild(results);
    chatFeed.scrollTop = chatFeed.scrollHeight;
  }
  function extractPackageRoute(item) {
    const stays = Array.from(String(item?.itinerary || "").matchAll(/Stay:\s*([^\r\n]+)/gi))
      .map(match => match[1].trim()).filter(Boolean);
    return [...new Set(stays)].join(" → ");
  }
  function renderPackageOptions(items) {
    if (!items || !items.length) return;
    const results = document.createElement("div");
    results.className = "hoe-voice-results";
    const label = document.createElement("p");
    label.className = "hoe-voice-results-label";
    label.textContent = enquiryText("आपकी search से मिले published packages", "Published packages matching your search");
    results.appendChild(label);
    items.forEach(item => {
      const route = extractPackageRoute(item);
      const meta = [
        item.duration,
        item.price_per_person == null ? "" : "₹" + Number(item.price_per_person).toLocaleString("en-IN") + " per person"
      ].filter(Boolean).join(" · ");
      addResultCard(
        results, item.name, meta, route ? "Route: " + route : "", item.image_url || "", "",
        enquiryText("यह package चुनें", "Select this package"), () => choosePackage(item)
      );
    });
    chatFeed.appendChild(results);
    chatFeed.scrollTop = chatFeed.scrollHeight;
  }
  function rankPublishedPackages(query) {
    const allPackages = state.bootstrap?.packages || [];
    const raw = normaliseSearch(query);
    const aliases = [
      ["स्पीति","spiti"],["स्पीटी","spiti"],["किन्नौर","kinnaur"],["नारकंडा","narkanda"],
      ["शिमला","shimla"],["मनाली","manali"],["कसोल","kasol"],["जिभी","jibhi"],["जीभी","jibhi"],
      ["सांगला","sangla"],["चितकुल","chitkul"],["कल्पा","kalpa"],["ताबो","tabo"],["काजा","kaza"]
    ];
    let queryText = raw;
    aliases.forEach(([from,to]) => { queryText = queryText.replaceAll(from,to); });
    const stop = new Set(["the","and","for","with","tour","tours","trip","trips","package","packages","please","show","me","want","need","details","about","का","की","के","में","और","चाहिए","दिखाओ","बताओ","पैकेज","टूर"]);
    const tokens = queryText.split(" ").filter(token => token.length >= 3 && !stop.has(token));
    if (!tokens.length) return allPackages.slice(0,4);
    return allPackages.map(item => {
      const name = normaliseSearch(item.name);
      const destination = normaliseSearch(item.destination);
      const duration = normaliseSearch(item.duration);
      const itinerary = normaliseSearch(item.itinerary);
      const description = normaliseSearch(item.description || item.Description);
      const allText = [name,destination,duration,itinerary,description].join(" ");
      let score = 0;
      if (queryText.length >= 5 && name.includes(queryText)) score += 30;
      else if (queryText.length >= 5 && allText.includes(queryText)) score += 12;
      tokens.forEach(token => {
        if (name.includes(token)) score += 8;
        else if (destination.includes(token)) score += 6;
        else if (duration.includes(token)) score += 4;
        else if (itinerary.includes(token)) score += 2;
        else if (description.includes(token)) score += 1;
      });
      return { item, score };
    }).filter(entry => entry.score > 0)
      .sort((a,b) => b.score - a.score).slice(0,4).map(entry => entry.item);
  }
  function renderAssistantMessage(message, shouldSpeak = true) {
    appendChatMessage("assistant", message);
    if (shouldSpeak) speak(message);
  }
  function askForField(field, message) {
    state.awaitingField = field;
    renderAssistantMessage(message);
  }
  function resetWhatsAppLink() {
    whatsappButton.href = "#";
    whatsappButton.classList.add("is-disabled");
    whatsappButton.setAttribute("aria-disabled", "true");
    whatsappButton.textContent = enquiryText("पूरी जानकारी भरने के बाद WhatsApp enquiry खुलेगी", "Complete the trip details to prepare WhatsApp enquiry");
  }
  function buildWhatsAppMessage() {
    const e = state.enquiry;
    const selected = e.departure
      ? e.departure.title + " (" + formatDepartureDates(e.departure) + ")"
      : e.package ? e.package.name : "Custom Himachal trip";
    const route = e.locations || (e.package ? extractPackageRoute(e.package) : "");
    const price = e.departure?.price_per_person ?? e.package?.price_per_person;
    return [
      "Namaste Himalayan Odyssey Expedition,",
      "I would like to enquire about this trip:",
      "Trip option: " + selected,
      "Guests: " + (e.guests || "Not provided"),
      "Travel dates: " + (e.travelDates || "Please advise"),
      "Pickup location: " + (e.pickup || "To be discussed"),
      "Destinations / route: " + (route || "Please help me plan"),
      "Guest name: " + (e.name || "Not provided"),
      price == null ? "" : "Listed package price: ₹" + Number(price).toLocaleString("en-IN") + " per person",
      "Please confirm availability, final price and inclusions."
    ].filter(Boolean).join("\n");
  }
  function buildEnquirySummary() {
    const e = state.enquiry;
    const selected = e.departure
      ? e.departure.title + " (" + formatDepartureDates(e.departure) + ")"
      : e.package ? e.package.name : "Custom Himachal trip";
    return [
      "Trip: " + selected,
      "Guests: " + e.guests,
      "Dates: " + e.travelDates,
      "Pickup: " + e.pickup,
      "Route: " + (e.locations || (e.package ? extractPackageRoute(e.package) : "To be planned")),
      "Name: " + e.name
    ].join("\n");
  }
  function activateWhatsAppButton() {
    whatsappButton.href = "https://wa.me/" + WHATSAPP + "?text=" + encodeURIComponent(buildWhatsAppMessage());
    whatsappButton.classList.remove("is-disabled");
    whatsappButton.setAttribute("aria-disabled", "false");
    whatsappButton.textContent = enquiryText("WhatsApp खोलें और enquiry भेजें", "Open WhatsApp and send enquiry");
    state.awaitingField = "ready";
    setStatus(enquiryText("आपकी enquiry तैयार है। WhatsApp खोलकर message review करें और Send दबाएँ।", "Your enquiry is ready. Open WhatsApp, review the message and tap Send."));
  }
  function chooseDeparture(item) {
    state.enquiry = {
      kind:"group", package:null, departure:item, guests:"",
      travelDates:formatDepartureDates(item), pickup:"",
      locations:item.highlights || item.destination || "", name:""
    };
    resetWhatsAppLink();
    appendChatMessage("assistant", enquiryText("आपने चुना: " + item.title + " — " + formatDepartureDates(item), "Selected: " + item.title + " — " + formatDepartureDates(item)));
    askForField("guests", enquiryText("इस trip में कुल कितने guests होंगे? Adults और children मिलाकर संख्या बताइए।", "How many guests will travel in total? Include adults and children."));
  }
  function choosePackage(item) {
    state.enquiry = {
      kind:"package", package:item, departure:null, guests:"",
      travelDates:"", pickup:"", locations:extractPackageRoute(item), name:""
    };
    resetWhatsAppLink();
    appendChatMessage("assistant", enquiryText("आपने यह published package चुना: " + item.name, "You selected this published package: " + item.name));
    askForField("guests", enquiryText("इस package में कुल कितने guests होंगे? Adults और children मिलाकर संख्या बताइए।", "How many guests will travel on this package? Include adults and children."));
  }
  function beginGuidedEnquiry() {
    const departures = state.bootstrap?.group_departures || [];
    state.enquiry = { kind:"", package:null, departure:null, guests:"", travelDates:"", pickup:"", locations:"", name:"" };
    resetWhatsAppLink();
    if (departures.length) {
      renderDepartureOptions(departures.slice(0,4));
      state.awaitingField = "groupOrCustom";
      const spoken = departures.slice(0,2).map(item =>
        item.title + ", " + formatDepartureDates(item) +
        (item.price_per_person == null ? "" : ", " + Number(item.price_per_person).toLocaleString("en-IN") + " rupees per person")
      ).join(". ");
      renderAssistantMessage(enquiryText(
        "आपकी planning में मदद करता हूँ। पहले हमारे upcoming group departures सुनिए: " + spoken +
        "। क्या आप इनमें से किसी group tour में जाना चाहते हैं, या अपना private / customised tour बनवाना चाहते हैं? आप नीचे किसी departure को select भी कर सकते हैं।",
        "I can help plan your trip. First, our upcoming group departures are: " + spoken +
        ". Would you like to join one of these group tours, or plan a private or customised trip? You can also select a departure card below."
      ));
    } else {
      askForField("tripChoice", enquiryText(
        "अभी कोई upcoming group departure listed नहीं है। क्या आप published tour package देखना चाहेंगे या customised trip बनवाना चाहते हैं?",
        "There are no upcoming group departures listed right now. Would you like to find a published tour package or plan a customised trip?"
      ));
    }
  }
  function findDepartureFromText(text) {
    const input = normaliseSearch(text);
    const departures = state.bootstrap?.group_departures || [];
    const dateMatches = departures.filter(item => {
      const start = String(item.start_date || "");
      const end = String(item.end_date || "");
      const startDay = start.slice(8,10);
      const endDay = end.slice(8,10);
      const startMonth = start.slice(5,7);
      const endMonth = end.slice(5,7);
      return (start && input.includes(start)) || (end && input.includes(end)) ||
        (startDay && input.includes(startDay) && input.includes("dec")) ||
        (endDay && input.includes(endDay) && (input.includes("jan") || endMonth === "01"));
    });
    if (dateMatches.length === 1) return dateMatches[0];
    if (/\b(first|1st|one|pehla)\b/.test(input) || text.includes("पहला")) return departures[0] || null;
    if (/\b(second|2nd|two|doosra)\b/.test(input) || text.includes("दूसरा")) return departures[1] || null;
    if (departures.length === 1 && /(group|departure|haan|yes|interested|ग्रुप|हाँ|हां)/.test(input)) return departures[0];
    return null;
  }
  function isYes(text) {
    const value = normaliseSearch(text);
    return /\b(yes|yeah|yep|haan|han|ha|sure|okay|ok|correct|right|first|pehla)\b/.test(value) ||
      /\b1\b/.test(value) || /(हाँ|हां|जी|ठीक|सही|पहला)/.test(text);
  }
  function isNo(text) {
    const value = normaliseSearch(text);
    return /\b(no|nope|nah|nahi|nahin|custom|private|personal|apna|khud|change)\b/.test(value) ||
      /(नहीं|नही|कस्टम|प्राइवेट|अपना|बदलना)/.test(text);
  }
  function parseGuestCount(text) {
    const numeric = String(text).match(/\b(\d{1,2})\b/);
    if (numeric) {
      const count = Number(numeric[1]);
      return count >= 1 && count <= 100 ? count : null;
    }
    const words = {
      one:1,two:2,three:3,four:4,five:5,six:6,seven:7,eight:8,nine:9,ten:10,
      ek:1,do:2,teen:3,char:4,paanch:5,chhe:6,che:6,saat:7,aath:8,nau:9,das:10,
      एक:1,दो:2,तीन:3,चार:4,पांच:5,पाँच:5,छह:6,सात:7,आठ:8,नौ:9,दस:10
    };
    const normalized = normaliseSearch(text);
    for (const [word,count] of Object.entries(words)) {
      if (normalized.includes(normaliseSearch(word)) || String(text).includes(word)) return count;
    }
    return null;
  }
  function findPackageFromText(text) {
    const input = normaliseSearch(text);
    return (state.packageMatches || []).find(item => input.includes(normaliseSearch(item.name))) || null;
  }
  function beginPackageSearch(query) {
    const matches = rankPublishedPackages(query);
    state.packageMatches = matches;
    if (!matches.length) {
      state.enquiry.kind = "custom";
      state.enquiry.package = null;
      state.enquiry.departure = null;
      askForField("guests", enquiryText(
        "इस नाम या route का exact published package नहीं मिला। मैं customised enquiry तैयार करूँगा। कुल कितने guests होंगे?",
        "I couldn't find an exact published package for that name or route. I can prepare a custom trip enquiry. How many guests will travel?"
      ));
      return;
    }
    renderPackageOptions(matches);
    state.awaitingField = "packageChoice";
    const names = matches.slice(0,3).map((item,index) => (index + 1) + ". " + item.name).join(". ");
    renderAssistantMessage(enquiryText(
      "आपकी search से ये published packages मिले: " + names + "। सही package को नीचे select करें या उसका नाम बोलें।",
      "I found these published packages: " + names + ". Select the correct package below or say its name."
    ));
  }
  function askForNextAfterGuests() {
    if (state.enquiry.kind === "group") {
      askForField("datesConfirmation", enquiryText(
        "आपने group departure की dates चुनी हैं: " + state.enquiry.travelDates + "। क्या यही dates ठीक हैं? हाँ कहें या अपनी दूसरी dates बताएं।",
        "The selected group departure dates are " + state.enquiry.travelDates + ". Do these dates work for you? Say yes, or tell me your preferred dates."
      ));
    } else {
      askForField("dates", enquiryText(
        "आपकी यात्रा किस तारीख से किस तारीख तक होगी? दोनों dates बताइए, या start date और कितने दिन बताइए।",
        "What are your travel dates? Tell me the start and end dates, or the start date and trip duration."
      ));
    }
  }
  function askForPickup() {
    askForField("pickup", enquiryText(
      "आप कहाँ से pickup चाहते हैं? City या pickup point बताइए, जैसे Delhi, Chandigarh या Ambala.",
      "Where should the pickup be? Tell me your city or pickup point, for example Delhi, Chandigarh or Ambala."
    ));
  }
  function askForLocationsOrName() {
    if (state.enquiry.kind === "custom" && !state.enquiry.locations) {
      askForField("locations", enquiryText(
        "किन-किन destinations को cover करना है? सभी जगहों के नाम बता दीजिए।",
        "Which destinations would you like to cover? Please name the places."
      ));
    } else if (state.enquiry.kind !== "custom") {
      askForField("additionalLocations", enquiryText(
        "क्या selected itinerary के अलावा कोई और जगह जोड़नी है या route में बदलाव चाहिए? नहीं हो तो 'नहीं' बोलें।",
        "Would you like to add any destinations or change the selected route? Say no if the itinerary is fine."
      ));
    } else askForName();
  }
  function askForName() {
    askForField("name", enquiryText("Enquiry में आपका नाम क्या लिखूँ?", "What name should I put on the enquiry?"));
  }
  function confirmEnquiry() {
    const summary = buildEnquirySummary();
    state.awaitingField = "confirmation";
    renderAssistantMessage(enquiryText(
      "कृपया details check करें:\n" + summary + "\nक्या सब सही है? हाँ कहें या बताएं क्या बदलना है।",
      "Please check the enquiry details:\n" + summary + "\nIs everything correct? Say yes, or tell me what needs to change."
    ));
  }
  function processEnquiryTurn(transcript) {
    const input = String(transcript || "").trim();
    if (!input) return;
    appendChatMessage("user", input);
    const field = state.awaitingField;

    if (field === "groupOrCustom" || field === "tripChoice") {
      const selectedDeparture = findDepartureFromText(input);
      if (selectedDeparture) { chooseDeparture(selectedDeparture); return; }
      const normalized = normaliseSearch(input);
      if (/(group|departure|ग्रुप|समूह)/.test(normalized) || isYes(input)) {
        const departures = state.bootstrap?.group_departures || [];
        if (departures.length === 1) chooseDeparture(departures[0]);
        else {
          renderDepartureOptions(departures.slice(0,4));
          askForField("departureChoice", enquiryText(
            "कौन-सी departure चुनेंगे? 19 December वाली या 26 December वाली? नीचे card select करें या तारीख बोलें।",
            "Which departure would you like? Select a card below or say its date."
          ));
        }
        return;
      }
      if (isNo(input) || /(custom|private|customised|customized|apna|खुद|प्राइवेट|कस्टम)/.test(normalized)) {
        state.enquiry.kind = "custom";
        askForField("locations", enquiryText(
          "ठीक है, customised trip बनाते हैं। आप कौन-सी जगहें घूमना चाहते हैं?",
          "Okay, let's plan a customised trip. Which destinations would you like to visit?"
        ));
        return;
      }
      beginPackageSearch(input);
      return;
    }

    if (field === "departureChoice") {
      const departure = findDepartureFromText(input);
      if (departure) { chooseDeparture(departure); return; }
      askForField("departureChoice", enquiryText(
        "मुझे departure date clear नहीं हुई। नीचे दिए options में से एक select करें या तारीख फिर से बताएं।",
        "I couldn't identify the departure date. Select one of the options below or repeat the date."
      ));
      renderDepartureOptions((state.bootstrap?.group_departures || []).slice(0,4));
      return;
    }

    if (field === "packageChoice") {
      const item = findPackageFromText(input);
      if (item) { choosePackage(item); return; }
      if (/\b(first|1|pehla)\b/.test(normaliseSearch(input)) || input.includes("पहला")) {
        if (state.packageMatches[0]) { choosePackage(state.packageMatches[0]); return; }
      }
      if (/\b(second|2|doosra)\b/.test(normaliseSearch(input)) || input.includes("दूसरा")) {
        if (state.packageMatches[1]) { choosePackage(state.packageMatches[1]); return; }
      }
      beginPackageSearch(input);
      return;
    }

    if (field === "guests") {
      const guests = parseGuestCount(input);
      if (!guests) {
        askForField("guests", enquiryText("कुल guests की संख्या बताइए, जैसे 2, 4 या 6।", "Please tell me the total number of guests, for example 2, 4 or 6."));
        return;
      }
      state.enquiry.guests = String(guests);
      askForNextAfterGuests();
      return;
    }

    if (field === "datesConfirmation") {
      if (isYes(input)) { askForPickup(); return; }
      if (isNo(input)) {
        askForField("dates", enquiryText("अपनी preferred travel dates बताइए।", "Tell me your preferred travel dates."));
        return;
      }
      state.enquiry.travelDates = input;
      askForPickup();
      return;
    }

    if (field === "dates") {
      state.enquiry.travelDates = input;
      askForPickup();
      return;
    }

    if (field === "pickup") {
      state.enquiry.pickup = input;
      askForLocationsOrName();
      return;
    }

    if (field === "locations") {
      state.enquiry.locations = input;
      if (state.enquiry.guests) askForName();
      else askForField("guests", enquiryText("इस trip में कुल कितने guests होंगे?", "How many guests will travel in total?"));
      return;
    }

    if (field === "additionalLocations") {
      if (!isNo(input)) state.enquiry.locations = [state.enquiry.locations,input].filter(Boolean).join("; Additional request: ");
      askForName();
      return;
    }

    if (field === "name") {
      state.enquiry.name = input;
      confirmEnquiry();
      return;
    }

    if (field === "confirmation") {
      if (isYes(input)) {
        activateWhatsAppButton();
        renderAssistantMessage(enquiryText(
          "आपकी enquiry तैयार है। नीचे WhatsApp button दबाएँ। Message खुलेगा; उसे review करके WhatsApp में Send दबाएँ।",
          "Your enquiry is ready. Tap the WhatsApp button below. The prepared message will open in WhatsApp; review it and tap Send."
        ));
      } else {
        state.awaitingField = "editChoice";
        askForField("editChoice", enquiryText(
          "कौन-सी detail बदलनी है—guests, dates, pickup, locations या name?",
          "Which detail should I change: guests, dates, pickup, locations or name?"
        ));
      }
      return;
    }

    if (field === "editChoice") {
      const key = normaliseSearch(input);
      if (/(guest|people|traveller|traveler|person|लोग|यात्री)/.test(key)) {
        askForField("guests", enquiryText("कुल guests की सही संख्या बताइए।", "Tell me the correct total number of guests."));
      } else if (/(date|तारीख|दिन)/.test(key)) {
        askForField("dates", enquiryText("सही travel dates बताइए।", "Tell me the correct travel dates."));
      } else if (/(pickup|start|शुरू|पिकअप)/.test(key)) {
        askForField("pickup", enquiryText("सही pickup location बताइए।", "Tell me the correct pickup location."));
      } else if (/(location|destination|route|जगह|स्थान|रूट)/.test(key)) {
        askForField(state.enquiry.kind === "custom" ? "locations" : "additionalLocations",
          enquiryText("सही destinations या route बताइए।", "Tell me the correct destinations or route."));
      } else if (/(name|नाम)/.test(key)) {
        askForField("name", enquiryText("सही नाम बताइए।", "Tell me the correct name."));
      } else {
        askForField("editChoice", enquiryText("कृपया guests, dates, pickup, locations या name में से बताएं।", "Please say guests, dates, pickup, locations or name."));
      }
      return;
    }

    if (field === "ready") {
      renderAssistantMessage(enquiryText(
        "आपकी enquiry WhatsApp के लिए तैयार है। नीचे WhatsApp button दबाकर message भेजें।",
        "Your enquiry is ready for WhatsApp. Tap the button below to send it."
      ));
      return;
    }
    beginPackageSearch(input);
  }
  function prepareAndStartGuidedEnquiry() {
    const ready = state.bootstrap ? Promise.resolve(state.bootstrap) : loadAssistantData();
    ready.then(() => {
      if (state.open && state.sessionActive) beginGuidedEnquiry();
    });
  }
  const assistantDataPromise = loadAssistantData();
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
      if (state.isGreeting || state.speaking) {
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
      if (transcript) processEnquiryTurn(transcript);
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
          if (state.sessionActive) prepareAndStartGuidedEnquiry();
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
        if (state.awaitingField !== "ready") scheduleListening(350);
      } else {
        setStatus(state.language === "hi-IN" ? "वॉइस असिस्टेंट खुलते ही सुनना शुरू करेगा।" : "Open the voice assistant to start listening.");
      }
    });
  });

})();
