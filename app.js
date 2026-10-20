// Baby Helper: tap, speak, hear an idea. Telugu answers come from the Telugu team's
// reviewed data (telugu/te.json + telugu/te-intents.js); content.js is the fallback.
const UI = {
  en: {title:"Baby Helper", mic:"Tap and speak", listening:"Listening… speak now", song:"Song", game:"Game", story:"Story", picture:"Picture", calm:"Baby crying", sleep:"Sleep",
       again:"Say again", next:"Another one", stop:"Stop", ask:"Ask again", print:"Print", sos:"Call 108", typed:"Or type here", go:"Go",
       noMic:"Voice is not available in this browser. Please tap a big button or type.", micPermission:"Please allow the microphone. Tap 'Allow' at the top.",
       heardNothing:"I did not hear you. Please tap and try again.", stopped:"OK, stopped. Tap the speaker when you need me.",
       greetings:{morning:"Good morning! A song, a game or a story?", afternoon:"Good afternoon! Shall I suggest an easy game?", evening:"Good evening! A song or a story for the little one?", night:"Good night. Shall I sing a lullaby?"},
       replies:{song:"Here is a song. Clap along!", lullaby:"Dim the light and rock gently. Here is a lullaby.", game:"Here is an easy game.", story:"Here is a short story.", picture:"Here is a picture. Tap Print to print it.", calm:"Don't worry. Try these:", sleep:"Try these to help the baby sleep:", food:"Try these at meal time:", emergency:"This is important. Call 108 now if the baby is in danger.", sick:"Please call the parents or a doctor. Meanwhile:", bath:"Here is how to make bath time safe and fun:", greeting:"Hello! I am here to help.", thanks:"Happy to help!", unknown:"Sorry, I did not understand. Say: song, game, story, picture, or baby is crying."}},
  te: {title:"చిన్నారి సహాయి", mic:"నొక్కి మాట్లాడండి", listening:"వింటున్నాను… చెప్పండి", song:"పాట", game:"ఆట", story:"కథ", picture:"బొమ్మ", calm:"బిడ్డ ఏడుపు", sleep:"నిద్ర",
       again:"మళ్ళీ వినండి", next:"ఇంకొకటి", stop:"ఆపు", ask:"మళ్ళీ అడగండి", print:"ప్రింట్ చేయండి", sos:"108 కి ఫోన్ చేయండి", typed:"లేదా ఇక్కడ టైప్ చేయండి", go:"చూపించు",
       noMic:"ఈ బ్రౌజర్‌లో వాయిస్ పనిచేయదు. పెద్ద బటన్ నొక్కండి లేదా టైప్ చేయండి.", micPermission:"మైక్ వాడటానికి అనుమతి ఇవ్వండి. పైన 'Allow' నొక్కండి.",
       heardNothing:"క్షమించండి, నాకు వినిపించలేదు. మళ్ళీ నొక్కి చెప్పండి.", stopped:"సరే, ఆపేశాను. మళ్ళీ కావాలంటే మైక్ నొక్కండి.",
       noVoice:"ఈ ఫోన్‌లో తెలుగు గొంతు లేదు. జవాబు తెర మీద పెద్ద అక్షరాల్లో చూపిస్తున్నాను.", greetings:{}, replies:{}}
};
const $ = id => document.getElementById(id);
let TE = null, te = null; // Telugu data + matcher module, when they load
let lang = "te";
try { lang = localStorage.getItem("bh-lang") || "te"; } catch(e) {}
let current = null; // {lang, topic, index, card}

// ---------- Cards: one shape for everything shown and spoken ----------
// {topic, reply, title, lines[] (poem), steps[] (list), text, tips[], picture, emergency}
function pictureFor(name){
  const n = (name || "").toLowerCase();
  return PICTURES.find(p => p.id === n || p.words.includes(n));
}
function enCard(topic, index, picIndex){
  const r = UI.en.replies;
  const list = CONTENT.en[topic] || CONTENT.en.unknown;
  const item = list[index % list.length];
  const card = {topic, reply: r[topic] || "", title: item.title};
  if (topic === "song" || topic === "lullaby") card.lines = item.steps; else card.steps = item.steps;
  if (topic === "sleep") card.lines = CONTENT.en.lullaby[0].steps; // tips, then a lullaby to sing
  if (topic === "picture") { card.picture = PICTURES[picIndex % PICTURES.length]; card.title = card.picture.en; card.steps = item.steps.slice(1); }
  if (topic === "emergency" || topic === "sick") card.emergency = true;
  if (topic === "unknown") { card.reply = r.unknown; card.title = ""; card.steps = []; }
  return card;
}
const TE_POOLS = {song:"rhymes", lullaby:"lullabies", game:"games", story:"stories", picture:"pictures"};
const TE_TOPIC = {crying:"calm", feeding:"food", song:"song", lullaby:"lullaby", game:"game", story:"story", picture:"picture", emergency:"emergency", bath:"bath"};
function teCardFromItem(topic, item, reply, tips){
  const card = {topic, reply: reply || "", title: item ? item.title : ""};
  if (item){
    if (item.lines) card.lines = item.lines;
    if (item.how) card.how = item.how;
    if (typeof item.steps === "string") card.text = item.steps;
    if (item.needs) card.needs = item.needs;
    if (item.text) card.text = item.text;
    if (topic === "picture"){ card.picture = pictureFor(item.en) || PICTURES[0]; card.title = TE.picture_caption ? TE.picture_caption.replace("{name}", item.te) : item.te; card.pictureName = item.te; }
  }
  if (tips) card.tips = tips;
  if (topic === "emergency") card.emergency = true;
  return card;
}
function teCard(topic, index){
  // Used by buttons and "another one": walk the reviewed pools in order.
  if (!TE) return fallbackTeCard(topic, index);
  if (topic === "sick") topic = "emergency";
  if (topic === "greeting") return {topic:"unknown", reply: TE.intents.find(i => i.id === "greeting").replies[0], title:""};
  const intent = (TE.intents || []).find(i => i.id === ({calm:"crying", food:"feeding", sleep:"lullaby"}[topic] || topic));
  const reply = intent && intent.replies ? intent.replies[index % intent.replies.length] : "";
  if (topic === "calm") return teCardFromItem("calm", null, reply, TE.tips.crying);
  if (topic === "food") return teCardFromItem("food", TE.rhymes.find(r => r.id === "chandamama"), reply, TE.tips.feeding);
  if (topic === "emergency") return teCardFromItem("emergency", null, reply, TE.tips.safety);
  if (topic === "bath") return teCardFromItem("bath", TE.rhymes.find(r => r.id === "snanam_song"), reply, TE.tips.bath);
  const t = topic === "sleep" ? "lullaby" : topic;
  const pool = TE[TE_POOLS[t]] || [];
  return teCardFromItem(t, pool[index % pool.length], reply, t === "lullaby" ? TE.tips.sleep : null);
}
function fallbackTeCard(topic, index){
  const list = CONTENT.te[topic] || CONTENT.te.unknown;
  const item = list[index % list.length];
  const card = {topic, reply:"", title:item.title};
  if (topic === "song") card.lines = item.steps; else card.steps = item.steps;
  if (topic === "picture"){ card.picture = PICTURES[index % PICTURES.length]; card.title = card.picture.te; }
  return card;
}
function makeCard(l, topic, index){
  if (topic === "unknown") return unknownCard(l);
  return l === "te" ? teCard(topic, index) : enCard(topic, index, index);
}
function poolSize(l, topic){
  if (topic === "picture") return PICTURES.length;
  if (topic === "bath" || topic === "sick" || topic === "greeting" || topic === "thanks") return 1;
  if (l === "te" && TE){ const p = TE[TE_POOLS[topic === "sleep" ? "lullaby" : topic]]; return p ? p.length : 3; }
  return (CONTENT[l][topic] || [1]).length;
}

// ---------- Understanding English ----------
// English words match whole words ("eat" not in "weather"); Telugu words match inside longer words.
function has(text, w){
  if (/[ఀ-౿]/.test(w)) return text.includes(w);
  return new RegExp("\\b" + w + "(s|es|ing)?\\b").test(text);
}
function understandEn(raw){
  const text = raw.toLowerCase();
  let topic = "unknown";
  for (const [t, words] of KEYWORDS){ if (words.some(w => has(text, w))){ topic = t; break; } }
  const subject = PICTURES.findIndex(p => p.words.some(w => has(text, w)));
  if (topic === "unknown" && subject >= 0) topic = "picture";
  if ((topic === "song") && has(text, "sleep")) topic = "lullaby";
  return {topic, subject};
}

// ---------- Handling a request ----------
function isTe(raw){ return /[ఀ-౿]/.test(raw); }
function handle(raw){
  raw = (raw || "").trim();
  $("heard").textContent = raw ? "“" + raw + "”" : "";
  if (!raw) return;
  if (isTe(raw)) { if (lang !== "te") setLang("te"); }
  else if (/[a-z]/i.test(raw) && lang !== "en") setLang("en"); // English words in, English out

  if (lang === "te" && te && TE) return handleTe(raw);
  const r = understandEn(raw);
  if (r.topic === "stop") return stopAll(true);
  if (r.topic === "again" && current) return speakCard(current.card);
  if (r.topic === "next" && current) return nextOne();
  if (r.topic === "again" || r.topic === "next") r.topic = "unknown";
  const n = poolSize(lang, r.topic);
  let index = Math.floor(Math.random() * n);
  if (r.topic === "picture" && r.subject >= 0) index = r.subject;
  show({lang, topic: r.topic, index, card: makeCard(lang, r.topic, index)}, true);
}
function handleTe(raw){
  let r = te.matchTelugu(raw, TE);
  // Drinking (తాగ) is not in the reviewed keywords yet; treat it as feeding.
  if (r.intent === "unknown" && raw.includes("తాగ")) r = te.matchTelugu("తినట్లేదు", TE);
  if (r.intent === "stop") return stopAll(true);
  if (r.intent === "repeat" && current) return speakCard(current.card);
  if (r.intent === "more" && current) return nextOne();
  if (r.intent === "unknown" || r.intent === "thanks" || r.intent === "greeting" || r.intent === "more" || r.intent === "repeat"){
    const card = {topic:"unknown", reply: r.reply || TE.ui.not_understood, title:""};
    return show({lang, topic:"unknown", index:0, card}, true);
  }
  const topic = TE_TOPIC[r.intent] || "calm";
  if (topic === "bath") return show({lang, topic, index:0, card: teCardFromItem("bath", r.item || TE.rhymes.find(x => x.id === "snanam_song"), r.reply, r.tips || TE.tips.bath)}, true);
  const pool = TE[TE_POOLS[topic]] || [];
  const index = Math.max(0, pool.indexOf(r.item));
  show({lang, topic, index, card: teCardFromItem(topic, r.item, r.reply, r.tips)}, true);
}
function unknownCard(l){
  if (l === "te") return {topic:"unknown", reply: (TE && TE.ui.not_understood) || CONTENT.te.unknown[0].steps[0], title:""};
  return enCard("unknown", 0, 0);
}
function nextOne(){
  const c = current;
  if (c.topic === "unknown") return show({lang: c.lang, topic:"unknown", index:0, card: unknownCard(c.lang)}, true);
  const index = (c.index + 1) % Math.max(1, poolSize(c.lang, c.topic));
  show({lang: c.lang, topic: c.topic, index, card: makeCard(c.lang, c.topic, index)}, true);
}

// ---------- Showing ----------
function show(state, speakIt){
  current = state;
  const card = state.card;
  $("answer").hidden = false;
  $("sos").hidden = !card.emergency && card.topic !== "calm";
  $("answer-reply").textContent = card.reply || "";
  const tipsFirst = (card.topic === "lullaby" || card.topic === "bath") && card.tips && card.lines;
  $("answer-title").textContent = tipsFirst ? "" : (card.title || "");
  const body = document.createElement("div");
  const add = (tag, text, parent = body) => { const e = document.createElement(tag); e.textContent = text; parent.appendChild(e); return e; };
  if (tipsFirst){ // calm/safe steps first, then the song under its own heading
    const ol = add("ol", ""); ol.className = "tips"; card.tips.forEach(s => add("li", s, ol));
    add("h2", "🎵 " + card.title);
  }
  if (card.how) add("p", card.how);
  if (card.lines) card.lines.forEach(l => add("p", l).className = "line");
  if (card.text) add("p", card.text);
  if (card.needs) add("p", "🧸 " + card.needs).className = "needs";
  const listItems = card.steps || (tipsFirst ? null : card.tips);
  if (listItems && listItems.length){ const ol = add("ol", ""); ol.className = "tips"; listItems.forEach(s => add("li", s, ol)); }
  if (card.steps && card.tips){ const ol = add("ul", ""); card.tips.forEach(s => add("li", s, ol)); }
  $("answer-body").replaceChildren(body);
  $("picture").innerHTML = card.picture ? renderPicture(card.picture, state.lang, card.pictureName) : "";
  $("print").hidden = !card.picture;
  $("answer").scrollIntoView({behavior:"smooth", block:"start"});
  if (speakIt) speakCard(card);
}

// ---------- Speaking ----------
function voiceFor(code){
  const vs = ("speechSynthesis" in window) ? speechSynthesis.getVoices() : [];
  const c = code.toLowerCase();
  return vs.find(v => (v.lang || "").toLowerCase().replace("_","-") === c) || vs.find(v => (v.lang || "").toLowerCase().startsWith(c.slice(0,2)));
}
function partsOf(card){
  const parts = [];
  if (card.reply) parts.push(card.reply);
  if (card.title && card.topic !== "picture") parts.push(card.title);
  if (card.topic === "picture" && card.picture) parts.push(card.pictureName || card.picture.en);
  const tipsFirst = card.topic === "lullaby" || card.topic === "bath";            // calm the room first, then sing
  if (tipsFirst && card.tips) parts.push(...card.tips);
  if (card.lines) parts.push(...card.lines);           // one line per utterance so rhymes sound sung
  if (card.text) parts.push(card.text);
  if (card.needs) parts.push(card.needs);
  if (card.steps) parts.push(...card.steps);
  if (!tipsFirst && card.tips) parts.push(...card.tips);
  return parts;
}
function speakCard(card){ speakParts(partsOf(card)); }
function speakParts(parts){
  if (!("speechSynthesis" in window)) return;
  speechSynthesis.cancel();
  const code = lang === "te" ? "te-IN" : "en-IN";
  const v = voiceFor(code);
  if (lang === "te" && !v){ $("voice-note").textContent = UI.te.noVoice; $("voice-note").hidden = false; return; } // English voice reading Telugu sounds wrong
  parts.forEach(p => {
    const u = new SpeechSynthesisUtterance(p);
    u.lang = code; u.rate = 0.85; if (v) u.voice = v;
    speechSynthesis.speak(u);
  });
}
function say(text){ speakParts([text]); }
function stopAll(withMessage){
  if ("speechSynthesis" in window) speechSynthesis.cancel();
  if (rec && listening) rec.stop();
  if (withMessage) $("heard").textContent = UI[lang].stopped;
}

// ---------- Language ----------
function greeting(){
  const h = new Date().getHours();
  if (lang === "te" && te && TE) return te.greetingFor(TE);
  const g = UI.en.greetings;
  if (lang === "te") return "";
  return h >= 5 && h < 12 ? g.morning : h < 16 && h >= 12 ? g.afternoon : h >= 16 && h < 20 ? g.evening : g.night;
}
function setLang(l){
  lang = l;
  try { localStorage.setItem("bh-lang", l); } catch(e) {}
  document.documentElement.lang = l;
  const t = UI[l];
  $("title").textContent = t.title; $("mic-label").textContent = t.mic;
  ["song","game","story","picture","calm","sleep"].forEach(k => $("q-"+k).textContent = t[k]);
  $("again-label").textContent = t.again; $("next-label").textContent = t.next; $("stop-label").textContent = t.stop; $("ask-label").textContent = t.ask;
  $("print-label").textContent = t.print; $("sos-label").textContent = t.sos;
  $("typed-input").placeholder = t.typed; $("typed-go").textContent = t.go;
  $("lang-te").classList.toggle("on", l === "te"); $("lang-en").classList.toggle("on", l === "en");
  $("greeting").textContent = greeting();
  if (current && current.lang !== l){
    show({lang: l, topic: current.topic, index: current.index, card: makeCard(l, current.topic, current.index)}, false);
  }
}

// ---------- Listening ----------
const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
let rec = null, listening = false;
function listen(){
  if ("speechSynthesis" in window) speechSynthesis.cancel();
  if (!SR){ $("heard").textContent = UI[lang].noMic; say(UI[lang].noMic); return; }
  if (listening){ rec.stop(); return; }
  rec = new SR();
  rec.lang = lang === "te" ? "te-IN" : "en-IN";
  rec.interimResults = false; rec.maxAlternatives = 1;
  let got = false, failed = false;
  rec.onstart = () => { listening = true; $("mic").classList.add("listening"); $("mic-label").textContent = UI[lang].listening; };
  rec.onresult = e => { got = true; handle(e.results[0][0].transcript); };
  rec.onerror = e => {
    failed = true;
    const msg = (e.error === "not-allowed" || e.error === "service-not-allowed") ? UI[lang].micPermission : UI[lang].heardNothing;
    $("heard").textContent = msg; say(msg);
  };
  rec.onend = () => {
    listening = false; $("mic").classList.remove("listening"); $("mic-label").textContent = UI[lang].mic;
    if (!got && !failed){ $("heard").textContent = UI[lang].heardNothing; say(UI[lang].heardNothing); }
  };
  $("heard").textContent = "";
  try { rec.start(); } catch(e) { $("heard").textContent = UI[lang].noMic; }
}

// ---------- Wiring ----------
$("mic").addEventListener("click", listen);
$("lang-te").addEventListener("click", () => setLang("te"));
$("lang-en").addEventListener("click", () => setLang("en"));
document.querySelectorAll(".q").forEach(b => b.addEventListener("click", () => {
  const topic = b.dataset.topic;
  const index = Math.floor(Math.random() * poolSize(lang, topic));
  $("heard").textContent = "";
  show({lang, topic, index, card: makeCard(lang, topic, index)}, true);
}));
$("ask").addEventListener("click", () => { $("mic").scrollIntoView({behavior:"smooth", block:"center"}); listen(); });
$("again").addEventListener("click", () => current && speakCard(current.card));
$("next").addEventListener("click", () => current && nextOne());
$("stop").addEventListener("click", () => stopAll(false));
$("print").addEventListener("click", () => { stopAll(false); window.print(); });
$("typed").addEventListener("submit", e => { e.preventDefault(); handle($("typed-input").value); $("typed-input").value = ""; });
if ("speechSynthesis" in window) speechSynthesis.getVoices(); // warm up the voice list
setLang(lang);

// Load the reviewed Telugu content; the app still works from content.js if this fails.
try {
  te = await import("./telugu/te-intents.js");
  TE = await (await fetch("./telugu/te.json")).json();
  UI.te.noVoice = TE.ui.no_telugu_voice || UI.te.noVoice;
  setLang(lang);
} catch(e) { te = null; TE = null; console.warn("Telugu data not loaded, using built-in Telugu", e); }

// For automated testing
window.BabyHelper = {handle, setLang, get current(){ return current; }, get lang(){ return lang; }, get teLoaded(){ return !!TE; }};
