// Baby Helper: tap, speak, hear an idea. Telugu answers come from the Telugu team's
// reviewed data (telugu/te.json + telugu/te-intents.js); content.js is the fallback.
const UI = {
  en: {title:"Baby Helper", mic:"Tap and speak", listening:"Listening… speak now", song:"Song", game:"Game", story:"Story", picture:"Picture", calm:"Baby crying", sleep:"Sleep",
       again:"Say again", next:"Another one", stop:"Stop", ask:"Ask again", voice:"Change voice",
       rec:"Record in my voice", recAgain:"Record again", recStop:"Tap to finish recording", recDel:"Delete my recording",
       recHint:"Recording… read or sing the answer above, then tap the red button.", recSaved:"Saved. This answer will now play in your voice.", recDeleted:"Recording deleted. The phone voice will read it again.",
       recTooShort:"That was too short. Please try again.", recFailed:"Could not save the recording on this phone.", recNotSupported:"This browser cannot record. Please update the phone's browser.",
       dictate:"Tap the 🎤 on the keyboard below, speak, then tap Go.", dictateShort:"Tap the microphone on the keyboard and speak.", trySafari:"In Safari, the big speaker button can listen by itself.", print:"Print", sos:"Call 108", typed:"Or type here", go:"Go",
       noMic:"Voice is not available in this browser. Please tap a big button or type.", micPermission:"Please allow the microphone. Tap 'Allow' at the top.",
       heardNothing:"I did not hear you. Please tap and try again.", stopped:"OK, stopped. Tap the speaker when you need me.",
       greetings:{morning:"Good morning! A song, a game or a story?", afternoon:"Good afternoon! Shall I suggest an easy game?", evening:"Good evening! A song or a story for the little one?", night:"Good night. Shall I sing a lullaby?"},
       replies:{song:"Here is a song. Clap along!", lullaby:"Dim the light and rock gently. Here is a lullaby.", game:"Here is an easy game.", story:"Here is a short story.", picture:"Here is a picture. Tap Print to print it.", calm:"Don't worry. Try these:", sleep:"Try these to help the baby sleep:", food:"Try these at meal time:", emergency:"This is important. Call 108 now if the baby is in danger.", sick:"Please call the parents or a doctor. Meanwhile:", bath:"Here is how to make bath time safe and fun:", greeting:"Hello! I am here to help.", thanks:"Happy to help!", unknown:"Sorry, I did not understand. Say: song, game, story, picture, or baby is crying."}},
  te: {title:"చిన్నారి సహాయి", mic:"నొక్కి మాట్లాడండి", listening:"వింటున్నాను… చెప్పండి", song:"పాట", game:"ఆట", story:"కథ", picture:"బొమ్మ", calm:"బిడ్డ ఏడుపు", sleep:"నిద్ర",
       again:"మళ్ళీ వినండి", next:"ఇంకొకటి", stop:"ఆపు", ask:"మళ్ళీ అడగండి", voice:"గొంతు మార్చు",
       rec:"నా గొంతులో రికార్డ్ చేయండి", recAgain:"మళ్ళీ రికార్డ్ చేయండి", recStop:"ఆపడానికి నొక్కండి", recDel:"నా రికార్డింగ్ తీసేయండి",
       recHint:"రికార్డ్ అవుతోంది… పైన ఉన్నది చదవండి లేదా పాడండి, తర్వాత ఎర్ర బటన్ నొక్కండి.", recSaved:"సేవ్ అయింది. ఇకపై ఈ జవాబు మీ గొంతులోనే వినిపిస్తుంది.", recDeleted:"రికార్డింగ్ తీసేశాను. ఫోన్ గొంతు మళ్ళీ చదువుతుంది.",
       recTooShort:"చాలా చిన్నగా ఉంది. మళ్ళీ ప్రయత్నించండి.", recFailed:"ఈ ఫోన్‌లో రికార్డింగ్ సేవ్ కాలేదు.", recNotSupported:"ఈ బ్రౌజర్‌లో రికార్డ్ చేయలేము. ఫోన్ బ్రౌజర్ అప్‌డేట్ చేయండి.",
       dictate:"కింద కీబోర్డ్‌లో 🎤 నొక్కి మాట్లాడండి, తర్వాత 'చూపించు' నొక్కండి.", dictateShort:"కీబోర్డ్‌లో మైక్ నొక్కి మాట్లాడండి.", trySafari:"Safari లో అయితే పెద్ద స్పీకర్ బటన్ నేరుగా వింటుంది.", print:"ప్రింట్ చేయండి", sos:"108 కి ఫోన్ చేయండి", typed:"లేదా ఇక్కడ టైప్ చేయండి", go:"చూపించు",
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
// ---------- Baby age ----------
let ageId = null;
try { ageId = localStorage.getItem("bh-age"); } catch(e) {}
function ageMax(){ const g = AGE.groups.find(g => g.id === ageId); return g ? g.maxMonths : 72; }
function under1(){ return ageId === "u1"; }
// "6 నెలలు – 2 సంవత్సరాలు" -> 6, "2 – 5 సంవత్సరాలు" -> 24
function minMonths(item){
  if (item.minMonths != null) return item.minMonths;
  const a = item.age || "";
  const m = a.match(/(\d+)\s*(నెల)?/);
  if (!m) return 0;
  return m[2] ? +m[1] : +m[1] * 12;
}
function ageMin(){ const i = AGE.groups.findIndex(g => g.id === ageId); return i <= 0 ? 0 : AGE.groups[i - 1].maxMonths + 1; }
function fitsAge(item){ return minMonths(item) <= ageMax() && (item.maxMonths == null || item.maxMonths >= ageMin()); }
// Researched activities for 8-month-olds (activities/8-months.json), turned into game items for both languages.
let ACT = null, ACT_EN = [], ACT_TE = [];
function loadActivities(data){
  ACT = data;
  const mk = (a, l) => Object.assign({}, a[l], {id: a.id, minMonths: 6, maxMonths: 18, keywords: a.keywords[l], activity: true});
  ACT_EN = data.activities.map(a => mk(a, "en"));
  ACT_TE = data.activities.map(a => mk(a, "te"));
}
function findActivity(text, l, onlyToyWords){
  const list = l === "te" ? ACT_TE : ACT_EN;
  // English: every word of the keyword appears ("hide a toy" matches "hide toy").
  const enHit = k => k.toLowerCase().split(/\s+/).every(w => has(text, w));
  const hit = k => (l === "te" ? text.includes(k) : enHit(k)) && (!onlyToyWords || k.includes("బొమ్మ") || /toy/i.test(k));
  return list.find(a => (a.keywords || []).some(hit));
}
function askedFor8Months(text, l){ return !!ACT && (ACT.keywords[l] || []).some(k => l === "te" ? text.includes(k) : has(text, k.toLowerCase())); }
// Older games that a researched activity replaces, so "another one" doesn't repeat the same idea.
const COVERED = {en: ["Peekaboo", "Ball roll"], te: ["peekaboo", "ball_roll", "vessels_drum"]};
function activitiesActive(){ return ACT_EN.some(fitsAge); }
function enPool(topic){
  if (topic === "food" && under1()) return CONTENT.en.food_u1;
  let list = CONTENT.en[topic] || CONTENT.en.unknown;
  if (topic === "game"){ if (activitiesActive()) list = list.filter(g => !COVERED.en.includes(g.title)); list = list.concat(ACT_EN); }
  const ok = list.filter(fitsAge);
  return ok.length ? ok : list;
}
function tePool(t){
  let list = TE[TE_POOLS[t]] || [];
  if (t === "game"){ if (activitiesActive()) list = list.filter(g => !COVERED.te.includes(g.id)); list = list.concat(TE_EXTRA.games, ACT_TE); }
  const ok = list.filter(fitsAge);
  return ok.length ? ok : list;
}
function pictureFor(name){
  const n = (name || "").toLowerCase();
  return PICTURES.find(p => p.id === n || p.words.includes(n));
}
function enCard(topic, index, picIndex){
  const r = UI.en.replies;
  const list = enPool(topic);
  const item = list[index % list.length];
  const card = {topic, reply: r[topic] || "", title: item.title};
  if (topic === "song" || topic === "lullaby") card.lines = item.steps; else card.steps = item.steps;
  if (item.needs) card.needs = [].concat(item.needs).join(", ");
  if (item.safety) card.safety = item.safety;
  if (topic === "sleep") card.lines = CONTENT.en.lullaby[0].steps; // tips, then a lullaby to sing
  if (topic === "picture") { card.picture = PICTURES[picIndex % PICTURES.length]; card.title = card.picture.en; card.steps = (under1() && item.stepsU1 ? item.stepsU1 : item.steps).slice(1).map(x => x.replace("This is a cow. Moo!", "This is a " + card.picture.en.toLowerCase() + "!")); }
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
    if (Array.isArray(item.steps)) card.steps = item.steps;
    if (item.needs) card.needs = [].concat(item.needs).join(", ");
    if (item.safety) card.safety = item.safety;
    if (item.text) card.text = item.text;
    if (topic === "picture"){ card.picture = pictureFor(item.en) || PICTURES[0]; card.title = TE.picture_caption ? TE.picture_caption.replace("{name}", item.te) : item.te; card.pictureName = item.te; }
  }
  if (tips) card.tips = tips;
  if (topic === "picture" && under1() && item){ card.reply = TE_EXTRA.picture_u1.replace("'ఇది ఆవు. అంబా!'", "'ఇది " + item.te + "!'"); card.title = item.te; }
  if (item && item.id === "chuk_chuk_railu" && under1()) card.how = TE_EXTRA.chuk_chuk_how_u1;
  if (topic === "food" && under1()) card.tips = (card.tips || []).concat(TE_EXTRA.feeding_u1);
  if (topic === "emergency"){ card.emergency = true; if (under1()) card.tips = [TE_EXTRA.choking_u1].concat(card.tips || []); }
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
  const pool = tePool(t);
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
function baby8Card(l, index){
  const list = l === "te" ? ACT_TE : ACT_EN;
  const item = list[index % list.length];
  const card = {topic: "baby8", reply: (l === "te" ? "8 నెలల బిడ్డతో ఇలా ఆడండి. ముందుగా ఈ జాగ్రత్తలు:" : "Here is a play idea for an 8-month-old. First, keep these in mind:"), title: item.title,
    tips: ACT.general_safety[l], steps: item.steps, safety: item.safety, needs: [].concat(item.needs || []).join(", ")};
  card.tipsFirstAll = true;
  return card;
}
function makeCard(l, topic, index){
  if (topic === "baby8") return baby8Card(l, index);
  if (topic === "unknown") return unknownCard(l);
  return l === "te" ? teCard(topic, index) : enCard(topic, index, index);
}
function poolSize(l, topic){
  if (topic === "picture") return PICTURES.length;
  if (topic === "bath" || topic === "sick" || topic === "greeting" || topic === "thanks") return 1;
  if (topic === "baby8") return Math.max(1, ACT_EN.length);
  if (l === "te" && TE){ const t = topic === "sleep" ? "lullaby" : topic; return TE_POOLS[t] ? tePool(t).length : 3; }
  return enPool(topic).length;
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
  // Activities only answer play-type asks, so "picture of a ball" or "drink water" keep their own topic.
  if (ACT && (r.topic === "game" || r.topic === "unknown" || r.topic === "greeting")){
    const lower = raw.toLowerCase();
    const act = findActivity(lower, "en");
    if (act) return showActivity("en", act);
    if (askedFor8Months(lower, "en")) { const i = Math.floor(Math.random() * ACT_EN.length); return show({lang, topic:"baby8", index:i, card: baby8Card("en", i)}, true); }
  }
  if (r.topic === "stop") return stopAll(true);
  if (r.topic === "again" && current) return speakCard(current.card);
  if (r.topic === "next" && current) return nextOne();
  if (r.topic === "again" || r.topic === "next") r.topic = "unknown";
  const n = poolSize(lang, r.topic);
  let index = Math.floor(Math.random() * n);
  if (r.topic === "picture" && r.subject >= 0) index = r.subject;
  show({lang, topic: r.topic, index, card: makeCard(lang, r.topic, index)}, true);
}
function showActivity(l, act){
  const pool = l === "te" ? tePool("game") : enPool("game");
  const index = Math.max(0, pool.indexOf(act));
  const teReply = (TE.intents.find(i => i.id === "game") || {replies:[""]}).replies[0];
  const card = l === "te" ? teCardFromItem("game", act, teReply, null) : enCardFromItem(act);
  show({lang: l, topic: "game", index, card}, true);
}
function enCardFromItem(item){
  return {topic:"game", reply: UI.en.replies.game, title: item.title, steps: item.steps, safety: item.safety, needs: [].concat(item.needs || []).join(", ")};
}
function handleTe(raw){
  let r = te.matchTelugu(raw, TE);
  // బొమ్మ means both "toy" and "picture": a toy activity ("బొమ్మ దాచు") wins over the picture intent.
  if (ACT && r.intent === "picture"){ const act = findActivity(raw, "te", true); if (act) return showActivity("te", act); }
  if (ACT && (r.intent === "game" || r.intent === "unknown" || r.intent === "greeting")){
    const act = findActivity(raw, "te");
    if (act) return showActivity("te", act);
    if (askedFor8Months(raw, "te")) { const i = Math.floor(Math.random() * ACT_TE.length); return show({lang, topic:"baby8", index:i, card: baby8Card("te", i)}, true); }
  }
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
  const pool = TE_POOLS[topic] ? tePool(topic) : [];
  let item = r.item, index = Math.max(0, pool.indexOf(item));
  if (topic === "game" && item && !pool.includes(item)){ index = Math.floor(Math.random() * pool.length); item = pool[index]; } // too old for this baby
  show({lang, topic, index, card: teCardFromItem(topic, item, r.reply, r.tips)}, true);
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
  const tipsFirst = ((card.topic === "lullaby" || card.topic === "bath" || (card.topic === "food" && under1())) && card.tips && card.lines) || card.tipsFirstAll;
  $("answer-title").textContent = tipsFirst ? "" : (card.title || "");
  const body = document.createElement("div");
  const add = (tag, text, parent = body) => { const e = document.createElement(tag); e.textContent = text; parent.appendChild(e); return e; };
  if (tipsFirst){ // calm/safe steps first, then the song under its own heading
    const ol = add("ol", ""); ol.className = "tips"; card.tips.forEach(s => add("li", s, ol));
    add("h2", (card.lines ? "🎵 " : "") + card.title);
  }
  if (card.safety){ const ul = add("ul", ""); ul.className = "safety"; card.safety.forEach(s => add("li", "⚠️ " + s, ul)); }
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
  refreshRecButtons();
  if (speakIt) speakCard(card);
}

// ---------- Speaking ----------
// Pick the most natural-sounding voice the phone has for this language.
// Cloud/neural voices ("Natural", "Online", "Google", "Enhanced", "Premium") sound far less robotic than
// the small offline ones, so they rank first. The viewer can cycle through the rest with the voice button.
const GOOD = [/natural/i, /neural/i, /online/i, /premium/i, /enhanced/i, /google/i, /siri/i, /samantha|karen|daniel|moira|tessa|rishi|veena|lekha/i];
const BAD = [/compact/i, /espeak/i, /robot|zarvox|bad news|good news|bells|boing|bubbles|cellos|trinoids|whisper|wobble|jester|organ|superstar|bahh|albert|fred|junior|ralph|kathy|eddy|flo\b|grandma|grandpa|reed|rocko|sandy|shelley/i];
function voicesFor(code){
  const vs = ("speechSynthesis" in window) ? speechSynthesis.getVoices() : [];
  const c = code.toLowerCase(), base = c.slice(0, 2);
  const score = v => {
    const l = (v.lang || "").toLowerCase().replace("_", "-");
    if (!l.startsWith(base)) return -1;
    if (BAD.some(r => r.test(v.name))) return 0;
    let s = l === c ? 20 : 10;                       // exact region first (en-IN, te-IN)
    GOOD.forEach((r, i) => { if (r.test(v.name)) s += 30 - i; });
    if (!v.localService) s += 5;                     // network voices are usually the neural ones
    return s;
  };
  return vs.map(v => [v, score(v)]).filter(x => x[1] > 0).sort((a, b) => b[1] - a[1]).map(x => x[0]).slice(0, 4);
}
let voicePick = {};
try { voicePick = JSON.parse(localStorage.getItem("bh-voice") || "{}"); } catch(e) {}
function voiceFor(code){
  const list = voicesFor(code);
  return list.find(v => v.name === voicePick[code]) || list[0];
}
function nextVoice(){
  const code = lang === "te" ? "te-IN" : "en-IN";
  const list = voicesFor(code);
  if (!list.length){ $("voice-note").textContent = lang === "te" ? UI.te.noVoice : "No voice found on this phone."; $("voice-note").hidden = false; return; }
  const cur = list.indexOf(voiceFor(code));
  const v = list[(cur + 1) % list.length];
  voicePick[code] = v.name;
  try { localStorage.setItem("bh-voice", JSON.stringify(voicePick)); } catch(e) {}
  $("voice-note").textContent = "🗣️ " + v.name + " (" + ((list.indexOf(v) + 1) + "/" + list.length) + ")"; $("voice-note").hidden = false;
  speakParts([lang === "te" ? "నమస్కారం! ఈ గొంతు బాగుందా?" : "Hello! Do you like this voice?"]);
}
function partsOf(card){
  const parts = [];
  if (card.reply) parts.push(card.reply);
  if (card.title && card.topic !== "picture") parts.push(card.title);
  if (card.topic === "picture" && card.picture) parts.push(card.pictureName || card.picture.en);
  if (card.safety) parts.push(...card.safety);            // safety before the steps
  const tipsFirst = card.topic === "lullaby" || card.topic === "bath" || (card.topic === "food" && under1()) || card.tipsFirstAll; // calm/safe first
  if (tipsFirst && card.tips) parts.push(...card.tips);
  if (card.lines) parts.push(...card.lines);           // one line per utterance so rhymes sound sung
  if (card.text) parts.push(card.text);
  if (card.needs) parts.push(card.needs);
  if (card.steps) parts.push(...card.steps);
  if (!tipsFirst && card.tips) parts.push(...card.tips);
  return parts;
}
// ---------- Family recordings ----------
// A family member can record any answer (a song, a story, tips) in their own voice. The recording is kept
// on this phone (IndexedDB) and plays instead of the phone's synthetic voice from then on.
const REC_DB = "bh-recordings";
function recDb(){
  return new Promise((ok, bad) => {
    try {
      const r = indexedDB.open(REC_DB, 1);
      r.onupgradeneeded = () => r.result.createObjectStore("clips");
      r.onsuccess = () => ok(r.result); r.onerror = () => bad(r.error);
    } catch(e) { bad(e); }
  });
}
async function recGet(key){ try { const db = await recDb(); return await new Promise(ok => { const q = db.transaction("clips").objectStore("clips").get(key); q.onsuccess = () => ok(q.result || null); q.onerror = () => ok(null); }); } catch(e) { return null; } }
async function recPut(key, blob){ const db = await recDb(); return new Promise((ok, bad) => { const t = db.transaction("clips", "readwrite"); t.objectStore("clips").put(blob, key); t.oncomplete = ok; t.onerror = () => bad(t.error); }); }
async function recDel(key){ try { const db = await recDb(); db.transaction("clips", "readwrite").objectStore("clips").delete(key); } catch(e) {} }
function cardKey(card, l){ return [l || lang, card.topic, card.title || "", card.pictureName || ""].join("|"); }
let player = null;
function playBlob(blob){
  stopAudio();
  player = new Audio(URL.createObjectURL(blob));
  player.play().catch(() => {});
}
function stopAudio(){ if (player){ player.pause(); URL.revokeObjectURL(player.src); player = null; } }
async function refreshRecButtons(){
  if (!current) return;
  const has = !!(await recGet(cardKey(current.card, current.lang)));
  $("rec-label").textContent = has ? UI[lang].recAgain : UI[lang].rec;
  $("rec-del").hidden = !has;
}
let recorder = null, recChunks = [];
async function toggleRecording(){
  if (recorder){ recorder.stop(); return; }
  if (!navigator.mediaDevices || !window.MediaRecorder){ $("voice-note").textContent = UI[lang].recNotSupported; $("voice-note").hidden = false; return; }
  stopAll(false);
  let stream;
  try { stream = await navigator.mediaDevices.getUserMedia({audio: true}); }
  catch(e) { $("voice-note").textContent = UI[lang].micPermission; $("voice-note").hidden = false; return; }
  const key = cardKey(current.card, current.lang);
  recChunks = [];
  recorder = new MediaRecorder(stream);
  recorder.ondataavailable = e => { if (e.data && e.data.size) recChunks.push(e.data); };
  recorder.onstop = async () => {
    stream.getTracks().forEach(t => t.stop());
    $("rec").classList.remove("recording");
    const blob = new Blob(recChunks, {type: recorder.mimeType || "audio/webm"});
    recorder = null;
    if (blob.size < 2000){ $("voice-note").textContent = UI[lang].recTooShort; $("voice-note").hidden = false; refreshRecButtons(); return; }
    try { await recPut(key, blob); $("voice-note").textContent = UI[lang].recSaved; }
    catch(e) { $("voice-note").textContent = UI[lang].recFailed; }
    $("voice-note").hidden = false;
    refreshRecButtons();
    playBlob(blob);
  };
  recorder.start();
  $("rec").classList.add("recording");
  $("rec-label").textContent = UI[lang].recStop;
  $("voice-note").textContent = UI[lang].recHint; $("voice-note").hidden = false;
}
async function speakCard(card){
  const clip = current && await recGet(cardKey(card, current.lang));
  if (clip) return playBlob(clip);
  speakParts(partsOf(card));
}
function speakParts(parts, waited){
  if (!("speechSynthesis" in window)) return;
  speechSynthesis.cancel();
  // Voices can load late; speak right away anyway (iPhone only allows speech started from the tap),
  // letting the phone pick its default voice for the language until the list arrives.
  const voicesReady = speechSynthesis.getVoices().length > 0;
  const code = lang === "te" ? "te-IN" : "en-IN";
  const v = voiceFor(code);
  if (lang === "te" && !v && voicesReady){ $("voice-note").textContent = UI.te.noVoice; $("voice-note").hidden = false; return; } // English voice reading Telugu sounds wrong
  parts.forEach(p => {
    const u = new SpeechSynthesisUtterance(p);
    u.lang = code; u.rate = lang === "te" ? 0.85 : 0.92; u.pitch = 1; if (v) u.voice = v;
    speechSynthesis.speak(u);
  });
}
function say(text){ speakParts([text]); }
function stopAll(withMessage){
  if ("speechSynthesis" in window) speechSynthesis.cancel();
  stopAudio();
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
function renderAge(){
  const box = $("age"), q = $("age-q"), opts = $("age-opts"), chip = $("age-chip");
  q.textContent = AGE.question[lang];
  opts.replaceChildren(...AGE.groups.map(g => {
    const b = document.createElement("button"); b.className = "age-opt" + (g.id === ageId ? " on" : "");
    b.textContent = g[lang]; b.addEventListener("click", () => setAge(g.id)); return b;
  }));
  const g = AGE.groups.find(g => g.id === ageId);
  chip.hidden = !g; box.hidden = !!g;
  if (g) chip.textContent = "👶 " + AGE.chip[lang] + ": " + g[lang] + " ✎";
}
function setAge(id){
  ageId = id;
  try { localStorage.setItem("bh-age", id); } catch(e) {}
  renderAge();
  if (current) show({lang: current.lang, topic: current.topic, index: 0, card: makeCard(current.lang, current.topic, 0)}, false);
}
function setLang(l){
  lang = l;
  try { localStorage.setItem("bh-lang", l); } catch(e) {}
  document.documentElement.lang = l;
  const t = UI[l];
  $("title").textContent = t.title; $("mic-label").textContent = t.mic;
  ["song","game","story","picture","calm","sleep"].forEach(k => $("q-"+k).textContent = t[k]);
  $("again-label").textContent = t.again; $("next-label").textContent = t.next; $("stop-label").textContent = t.stop; $("ask-label").textContent = t.ask; $("voice-label").textContent = t.voice; $("rec-label").textContent = t.rec; $("rec-del-label").textContent = t.recDel; refreshRecButtons();
  $("print-label").textContent = t.print; $("sos-label").textContent = t.sos;
  $("typed-input").placeholder = t.typed; $("typed-go").textContent = t.go;
  $("lang-te").classList.toggle("on", l === "te"); $("lang-en").classList.toggle("on", l === "en");
  $("greeting").textContent = greeting();
  renderAge();
  if (current && current.lang !== l){
    show({lang: l, topic: current.topic, index: current.index, card: makeCard(l, current.topic, current.index)}, false);
  }
}

// ---------- Listening ----------
const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
let rec = null, listening = false;
function listen(){
  if ("speechSynthesis" in window) speechSynthesis.cancel();
  if (!SR){
    const ios = /iPhone|iPad|iPod/.test(navigator.userAgent);
    const msg = UI[lang].dictate + (ios && /CriOS|FxiOS|EdgiOS/.test(navigator.userAgent) ? " " + UI[lang].trySafari : "");
    $("heard").textContent = msg;
    const box = $("typed-input"); box.scrollIntoView({behavior:"smooth", block:"center"}); box.focus();
    say(UI[lang].dictateShort);
    return;
  }
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
$("voice").addEventListener("click", nextVoice);
$("rec").addEventListener("click", () => current && toggleRecording());
$("rec-del").addEventListener("click", async () => { if (!current) return; await recDel(cardKey(current.card, current.lang)); $("voice-note").textContent = UI[lang].recDeleted; $("voice-note").hidden = false; refreshRecButtons(); });
$("age-chip").addEventListener("click", () => { $("age").hidden = false; $("age-chip").hidden = true; });
$("print").addEventListener("click", () => { stopAll(false); window.print(); });
$("typed").addEventListener("submit", e => { e.preventDefault(); handle($("typed-input").value); $("typed-input").value = ""; });
if ("speechSynthesis" in window) speechSynthesis.getVoices(); // warm up the voice list
setLang(lang);

// Load the reviewed Telugu content; the app still works from content.js if this fails.
try {
  te = await import("./telugu/te-intents.js");
  TE = await (await fetch("./telugu/te.json")).json();
  UI.te.noVoice = TE.ui.no_telugu_voice || UI.te.noVoice;
  try { loadActivities(await (await fetch("./activities/8-months.json")).json()); } catch(e) { console.warn("8-month activities not loaded", e); }
  setLang(lang);
} catch(e) { te = null; TE = null; console.warn("Telugu data not loaded, using built-in Telugu", e); }

// For automated testing
window.BabyHelper = {handle, setLang, get current(){ return current; }, get lang(){ return lang; }, get teLoaded(){ return !!TE; }};
