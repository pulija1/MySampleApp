// Telugu request matcher for the babysitting voice helper.
// Works in the browser (as an ES module) and in Node. Pure functions, no dependencies.
// Usage:
//   import { isTelugu, matchTelugu, greetingFor } from './te-intents.js';
//   const data = await (await fetch('telugu/te.json')).json();
//   const r = matchTelugu('ఇంకొక పాట పాడు', data);
//   // r = { intent: 'song', modifiers: ['more'], reply: '...', item: {...rhyme}, kind: 'rhyme' }

const TELUGU_RANGE = /[ఀ-౿]/;

// Intents that only change *how* we answer (another one, again) rather than *what* about.
const MODIFIERS = new Set(['more', 'repeat']);
// Intents that only win when nothing topical was asked.
const CONTROL = new Set(['stop', 'thanks', 'greeting']);

export function isTelugu(text) {
  return TELUGU_RANGE.test(text || '');
}

export function normalize(text) {
  return (text || '')
    .toLowerCase()
    .normalize('NFC')
    // Speech engines spell these two ways; treat them the same.
    .replace(/ళ్ళ/g, 'ళ్ల')
    .replace(/[.,!?।॥"'’‘“”()\-–—]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// One point per keyword found, times the intent's weight (specific asks like crying beat generic ones like song).
function score(text, keywords, weight = 1) {
  let s = 0;
  for (const k of keywords || []) {
    const kn = normalize(k);
    if (kn && text.includes(kn)) s += 1;
  }
  return s * weight;
}

function pick(list, seed) {
  if (!list || !list.length) return undefined;
  const i = seed == null ? Math.floor(Math.random() * list.length) : seed % list.length;
  return list[i];
}

// Find a rhyme/story/picture the person named ("చందమామ పాట", "కాకి కథ", "ఏనుగు బొమ్మ").
function findNamed(text, items, data) {
  for (const it of items || []) {
    const words = [it.title, it.te, ...(it.keywords || [])].filter(Boolean);
    for (const w of words) {
      const first = normalize(w).split(' ')[0];
      if (first && first.length >= 2 && text.includes(first)) return it;
    }
    for (const ref of it.picture_refs || []) {
      const p = (data.pictures || []).find((x) => x.id === ref);
      if (p && score(text, p.keywords) > 0) return it;
    }
  }
  return undefined;
}

export function matchTelugu(rawText, data, opts = {}) {
  const text = normalize(rawText);
  const scored = (data.intents || [])
    .map((it) => ({ it, s: score(text, it.keywords, it.weight) }))
    .filter((x) => x.s > 0);

  const modifiers = scored.filter((x) => MODIFIERS.has(x.it.id)).map((x) => x.it.id);
  const urgent = scored.filter((x) => (x.it.priority || 0) >= 100);
  const topical = scored.filter((x) => !MODIFIERS.has(x.it.id) && !CONTROL.has(x.it.id));
  const control = scored.filter((x) => CONTROL.has(x.it.id));

  let chosen;
  if (urgent.length) chosen = urgent[0].it;
  else if (topical.length) chosen = topical.sort((a, b) => b.s - a.s)[0].it;
  else if (control.length) chosen = control.sort((a, b) => b.s - a.s)[0].it;
  else if (modifiers.length) chosen = (data.intents || []).find((i) => i.id === modifiers[0]);

  if (!chosen) {
    return { intent: 'unknown', modifiers: [], reply: data.ui && data.ui.not_understood };
  }

  const result = {
    intent: chosen.id,
    modifiers,
    action: chosen.action,
    reply: pick(chosen.replies, opts.seed),
  };

  // Attach the content to play/show.
  if (chosen.id === 'song') {
    const pool = data.rhymes || [];
    result.kind = 'rhyme';
    const feeding = (data.intents || []).find((i) => i.id === 'feeding');
    const atMealtime = feeding && score(text, feeding.keywords) > 0;
    result.item =
      findNamed(text, pool, data) ||
      (atMealtime && pool.find((r) => r.id === 'chandamama')) ||
      pick(pool, opts.seed);
  } else if (chosen.id === 'lullaby') {
    const pool = data.lullabies || [];
    result.kind = 'lullaby';
    result.item = findNamed(text, pool, data) || pick(pool, opts.seed);
    result.tips = data.tips && data.tips.sleep;
  } else if (chosen.id === 'game') {
    result.kind = 'game';
    result.item = findNamed(text, data.games, data) || pick(data.games, opts.seed);
  } else if (chosen.id === 'story') {
    result.kind = 'story';
    result.item = findNamed(text, data.stories, data) || pick(data.stories, opts.seed);
  } else if (chosen.id === 'picture') {
    result.kind = 'picture';
    result.item = (data.pictures || []).find((p) => score(text, p.keywords) > 0) || pick(data.pictures, opts.seed);
  } else if (chosen.id === 'feeding') {
    result.kind = 'rhyme';
    result.item = (data.rhymes || []).find((r) => r.id === 'chandamama');
    result.tips = data.tips && data.tips.feeding;
  } else if (chosen.id === 'bath') {
    result.kind = 'rhyme';
    result.item = (data.rhymes || []).find((r) => r.id === 'snanam_song');
    result.tips = data.tips && data.tips.bath;
  } else if (chosen.tips_ref) {
    result.tips = data.tips && data.tips[chosen.tips_ref];
  }
  return result;
}

// Text to read aloud for a matched result: the reply, then the content.
export function speakableTelugu(result) {
  const parts = [result.reply];
  const it = result.item;
  if (it) {
    if (it.title) parts.push(it.title + '.');
    if (it.lines) parts.push(it.lines.join('. ') + '.');
    if (it.steps) parts.push(it.steps);
    if (it.text) parts.push(it.text);
    if (it.te && result.kind === 'picture') parts.push(it.te + '.');
  }
  if (result.tips && !it) parts.push(result.tips.join(' '));
  return parts.filter(Boolean).join(' ');
}

export function greetingFor(data, date = new Date()) {
  const h = date.getHours();
  const g = data.greetings || {};
  if (h >= 5 && h < 12) return g.morning;
  if (h >= 12 && h < 16) return g.afternoon;
  if (h >= 16 && h < 20) return g.evening;
  return g.night;
}
