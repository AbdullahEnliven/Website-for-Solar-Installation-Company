// AI booking: text chat (Groq) and voice call (Vapi). Both use the same booking rules as the web form.
const express = require('express');
const crypto = require('crypto');
const rateLimit = require('express-rate-limit');
const { pool } = require('./db');
const core = require('./booking-core');

const router = express.Router();
const SERVICE_MAP = { FULL_SYSTEM: 'Full solar system', PANELS: 'Solar panels only', BATTERY: 'Battery backup', INVERTER: 'Inverter upgrade', WIRES: 'Wires & cables', MAINTENANCE: 'Maintenance / repair' };
const wrap = fn => (req, res, next) => fn(req, res, next).catch(next);

const FACTS = `SolarWave Energy is a solar company in Austin, Texas (phone (512) 555-0142). Our team visits homes Monday to Saturday, closed Sundays. Our shop is at ${core.SHOP.address}, ${core.SHOP.city}, open ${core.SHOP.hours}. We do not set dates or times in this booking chat or call: after the booking, our team contacts the customer to finalize the date, day and time. Products: 400 W monocrystalline solar panels (21.8% efficiency), 10 AWG UV-resistant PV wiring, 7.6 kW hybrid inverters with Wi-Fi monitoring, and 10 kWh lithium iron phosphate battery modules (stackable up to 40 kWh, 6,000 cycles). Installation is done by our own licensed crews, usually 1 to 2 days on site, with a free home survey and written quote. Every panel, battery and installation has a 5-year warranty, plus 24/7 system monitoring.`;

// ---------------------------------------------------------------- chat (Groq)
const CATALOG = `PRODUCT CATALOG (only quote prices from this list):
Panels, sold as 1 panel, 6-pack or 12-pack: SW-400 mono PERC 400 W, 21.8% efficient, $199 / $1,099 / $2,090. SW-450 all-black 450 W, 22.3% efficient, $239 / $1,299 / $2,490. SW-550 bifacial 550 W, 21.3% efficient, made for ground mounts, carports and commercial roofs, $289 / $1,590 / $3,050.
Wires and cables: PV cable 10 AWG by the roll, 100 ft $119, 250 ft $279, 500 ft $529. MC4-style connector kits, 10 pairs $39, 25 pairs $89, 50 pairs $169. Combiner and grounding box, 4-string $149, 6-string $199, 8-string $259.
Inverters, with a 5-year or 10-year warranty: SW-5K grid-tied 5 kW $1,190 / $1,390. SW-7.6H hybrid 7.6 kW (most popular) $2,490 / $2,790. SW-10H whole-home hybrid 10 kW, takes up to 4 batteries, $3,290 / $3,690.
Batteries, wall mount or floor stand: SW-B10 10 kWh $4,490 / $4,690. SW-B20 20 kWh $8,490 / $8,790. SW-B40 40 kWh for whole-home backup $16,490 / $16,990.
Full installation packages (our crew installs everything, permits included): Starter Home, 5.2 kW, 13 SW-400 panels, 5 kW grid-tied inverter, 1 day on site, $12,900. Family + Battery, 8 kW, 20 SW-400 panels, 7.6 kW hybrid inverter, 10 kWh battery, backup for lights, fridge and Wi-Fi, $24,900. Premium Whole Home, 12.6 kW, 28 SW-450 panels, 10 kW hybrid inverter, 20 kWh battery, whole-home backup, $36,900.`;

const CHAT_TOOLS = [
  { type: 'function', function: { name: 'create_booking', description: 'Create the booking. Only call after reading all details back and hearing the visitor clearly agree. For PICKUP send only name, phone, service, fulfillment, notes, confirmed (no address or city). There are no dates: never ask for or send a date.',
    parameters: { type: 'object', properties: {
      name: { type: 'string', description: 'Full name' }, phone: { type: 'string', description: 'Phone number' }, address: { type: 'string', description: 'Street address' }, city: { type: 'string', description: 'City' },
      service: { type: 'string', enum: Object.keys(SERVICE_MAP), description: 'FULL_SYSTEM for a full system or installation package, otherwise the main product.' },
      fulfillment: { type: 'string', enum: ['PICKUP', 'DELIVERY'], description: 'Required for every service except FULL_SYSTEM. PICKUP = visitor collects it at our shop (no address needed), DELIVERY = we deliver and install. Omit for FULL_SYSTEM.' },
      notes: { type: 'string', description: 'Everything they chose: models, sizes, packs, quantities.' },
      confirmed: { type: 'boolean', description: 'True only if you read the full details back and the visitor agreed.' } },
      required: ['name', 'phone', 'service', 'confirmed'] } } }];

// Groq keys: GROQ_API_KEY_1, _2, _3 (plain GROQ_API_KEY also works). If one hits its limit or is rejected, the next one is used automatically.
const GROQ_KEYS = [process.env.GROQ_API_KEY, ...[1, 2, 3, 4, 5].map(n => process.env['GROQ_API_KEY_' + n])].map(k => (k || '').trim()).filter((k, i, a) => k && a.indexOf(k) === i);
// Groq models, tried in order. The per-minute token limit is per model, so when one is full the next one takes over.
// Override with GROQ_MODELS in .env (comma separated). All of these run on Groq and support tool calling.
const GROQ_MODELS = (process.env.GROQ_MODELS || 'openai/gpt-oss-120b,openai/gpt-oss-20b,llama-3.3-70b-versatile,llama-3.1-8b-instant').split(',').map(m => m.trim()).filter(Boolean);
const groqCool = new Map(); // "model|key index" -> time (ms) until which it is skipped
async function groqCall(body) {
  let lastErr = 'no Groq key available';
  for (const model of GROQ_MODELS) {
    for (let i = 0; i < GROQ_KEYS.length; i++) {
      const id = model + '|' + i;
      if ((groqCool.get(id) || 0) > Date.now()) continue;
      const r = await fetch('https://api.groq.com/openai/v1/chat/completions', { method: 'POST',
        headers: { Authorization: 'Bearer ' + GROQ_KEYS[i], 'Content-Type': 'application/json' }, body: JSON.stringify({ ...body, model }) });
      if (r.ok) return r;
      const txt = (await r.text()).slice(0, 300);
      lastErr = `Groq ${model} key #${i + 1} -> ${r.status} ${txt}`;
      if (r.status === 429 || r.status === 401 || r.status === 403 || r.status === 404 || r.status >= 500) {
        const wait = r.status === 401 || r.status === 403 ? 6 * 3600e3
          : r.status === 404 ? 6 * 3600e3
          : /per day|TPD|RPD/i.test(txt) ? 3600e3
          : Math.min(Math.max((+r.headers.get('retry-after') || 20) * 1000, 10e3), 3600e3);
        groqCool.set(id, Date.now() + wait);
        console.warn(`[groq] ${model} key #${i + 1} failed (${r.status}), trying the next one`);
        continue;
      }
      if (r.status === 400) { groqCool.set(id, Date.now() + 60e3); console.warn(`[groq] ${model} rejected the request (400), trying the next model`); break; }
      throw new Error(lastErr);
    }
  }
  throw new Error(lastErr);
}

async function chat(msgs) {
  const fail = { ok: false, reply: 'Sorry, I am having trouble connecting right now. Please try again in a moment, or use the booking form.' };
  if (!GROQ_KEYS.length) return { ok: false, reply: 'Chat is not set up yet. Please use the booking form.' };
  // Once a booking reference has been given the chat is finished: no more model calls, so it cannot loop on "ok", "thanks".
  if (msgs.some(m => m.role === 'assistant' && /\bSW-[0-9A-F]{6}\b/.test(m.content))) return { ok: true, done: true, reply: 'Your booking is already confirmed. Thank you for choosing SolarWave Energy! If you need anything else, please start a new chat.' };
  let booked = false;
  try {
    const system = `You are the booking assistant for SolarWave Energy, chatting by text with a website visitor. Sound like a real, friendly person: short natural replies (1 to 3 sentences), ONE question at a time, no bullet lists, no forms. Reply in the language the visitor writes in.\n${FACTS}\n${CATALOG}\n\nHOW THE CHAT GOES:\n1. Find out what they need. If they want several things (for example solar and a battery), go through them one by one: ask which panel model and how many (or which pack), which battery size and mounting, which inverter, using the catalog. Briefly say what each option is good for and give the catalog price when it helps them choose. If they are unsure, ask one simple question (size of home, backup needs) and recommend one option. If they want a whole system, offer the three installation packages.\n2. Once they have decided what they want, and it is NOT a full solar system or installation package, ask: will they come and pick the items up themselves at our shop (PICKUP) or should we deliver and install them (DELIVERY)? Never ask this for a full solar system.\n3. If PICKUP: ask only full name, then phone number. Do NOT ask for an address or city.\n4. If DELIVERY or a full system: ask, one at a time, full name, phone number, street address, city.\n5. Never ask for email, state, ZIP code, or any date, day or time. We do not schedule in this chat. If the visitor asks when we can come or which days are free, say our team will contact them after booking to finalize the date, day and time.\n6. Read everything back (what they chose, name, phone, pickup or delivery, and address and city when asked) and ask exactly: \"Shall I go ahead and book this?\"\n7. Only after a clear yes, call create_booking with confirmed true. Never call it before the visitor has typed every detail above and said yes to the read-back. Put every item they chose (models, sizes, packs, quantities) in notes. For service use FULL_SYSTEM for a full system or package, otherwise the main product (PANELS, BATTERY, INVERTER, WIRES or MAINTENANCE).\n8. When it succeeds, say it is booked, give the reference, and say: \"Our team will contact you soon to finalize the date, day and time.\" For PICKUP also tell them to bring the reference to our shop at ${core.SHOP.address}, ${core.SHOP.city} (open ${core.SHOP.hours}). Then stop; ask nothing more.\n\nNever invent prices, discounts or specs that are not listed above; if something is not listed, say the free home survey gives a written quote. This system sends no confirmation emails or reminders, never promise one. Never say it is booked unless create_booking returned success true. If a tool fails, say so plainly and ask them to try another day or use the booking form.`;
    const conv = [{ role: 'system', content: system }, ...msgs];
    for (let i = 0; i < 5; i++) {
      const r = await groqCall({ messages: conv, tools: CHAT_TOOLS, tool_choice: 'auto', temperature: 0.3, max_tokens: 900 });
      const m = (await r.json()).choices?.[0]?.message || {};
      const calls = m.tool_calls || [];
      if (!calls.length) return { ok: true, done: booked, reply: m.content || 'Sorry, could you say that again?' };
      conv.push({ role: 'assistant', content: m.content || '', tool_calls: calls });
      for (const c of calls) {
        let args = parseArgs(c.function?.arguments);
        const result = await runTool(c.function?.name, args, 'CHAT', msgs);
        if (c.function?.name === 'create_booking' && result.success) booked = true;
        conv.push({ role: 'tool', tool_call_id: c.id, content: JSON.stringify(result) });
      }
    }
    return { ok: true, reply: 'Sorry, something went wrong on my side. Please try again, or use the booking form.' };
  } catch (e) { console.error('[chat]', e.message); return fail; }
}

const chatLimiter = rateLimit({ windowMs: 60e3, limit: 20, standardHeaders: true, legacyHeaders: false });
const bookLimiter = rateLimit({ windowMs: 3600e3, limit: 10, standardHeaders: true, legacyHeaders: false });
router.post('/chat', chatLimiter, wrap(async (req, res) => {
  const msgs = (Array.isArray(req.body?.messages) ? req.body.messages : []).filter(m => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string').slice(-30).map(m => ({ role: m.role, content: m.content.slice(0, 800) }));
  if (!msgs.length || msgs[msgs.length - 1].role !== 'user') return res.status(400).json({ ok: false, reply: 'Please type a message.' });
  res.json(await chat(msgs));
}));
router.post('/chat/book', bookLimiter, wrap(async (req, res) => {
  const v = core.validate(req.body || {});
  if (v.error) return res.status(400).json({ ok: false, error: v.error });
  const x = await core.createBooking(v.d, 'CHAT');
  res.json({ ok: true, ref: x.ref });
}));

// ---------------------------------------------------------------- voice (Vapi)
const ACCTS = [1, 2, 3].map(n => ({ key: 'account' + n, publicKey: process.env['VAPI_PUBLIC_KEY_' + n] })).filter(a => a.publicKey);
const LIMIT = +process.env.VAPI_MINUTES_LIMIT || 30;
const vapiCool = new Map();
// Last voice events (kept in memory) so /api/voice/diag can show what Vapi really sent and what we answered.
const voiceRefs = new Map(); // sid -> { ref, pickup, shopAddress, shopHours, at }  (one entry per call, kept 1 hour)
const keepRef = (sid, r) => { if (!/^[a-f0-9]{16}$/.test(sid || '')) return; voiceRefs.set(sid, { ref: r.reference, pickup: !!r.pickup, shopAddress: r.shopAddress || '', shopHours: r.shopHours || '', at: Date.now() }); for (const [k, v] of voiceRefs) if (Date.now() - v.at > 3600e3) voiceRefs.delete(k); };
const recent = [];
const note = e => { recent.unshift({ at: new Date().toISOString(), ...e }); if (recent.length > 25) recent.pop(); }; // account key -> time (ms) until which it is skipped after a failed start
async function pickAccount(excl) {
  for (const a of ACCTS) {
    if (excl.includes(a.key) || (vapiCool.get(a.key) || 0) > Date.now()) continue;
    const u = await pool.query('SELECT minutes_used FROM vapi_usage WHERE account_key=$1', [a.key]);
    if ((u.rows[0]?.minutes_used || 0) < LIMIT) return a;
  }
  return null;
}
const recordUsage = (key, min) => pool.query('INSERT INTO vapi_usage(account_key,minutes_used) VALUES($1,$2) ON CONFLICT (account_key) DO UPDATE SET minutes_used=vapi_usage.minutes_used+$2', [key, min]);

const VFACTS = FACTS.replace("We do not set dates or times in this booking chat or call: after the booking, our team contacts the customer to finalize the date, day and time.", 'We do not set dates or times on this call. For DELIVERY and FULL_SYSTEM bookings, our team contacts the customer afterwards to finalize the date and time. For PICKUP bookings, the customer just visits our shop during opening hours, and nobody needs to call them.');
function buildAssistant(baseUrl, key, sid) {
  const hook = `${baseUrl}/api/voice/webhook?account=${encodeURIComponent(key)}&k=${encodeURIComponent(process.env.VOICE_SECRET || '')}&sid=${sid}`;
  const prompt = `You are the booking assistant for SolarWave Energy, speaking to someone on a voice call. Keep every reply to one or two short sentences, this is speech, not text.\n${VFACTS}\n${CATALOG}\n\nFollow these steps in order. Ask one thing at a time and wait for the answer.\n1. GREETING is already given (it already lists our services and asks which one they want). If they open with a question, answer it briefly, then continue.\n2. SERVICE: confirm which one they want: full solar system (FULL_SYSTEM), solar panels only (PANELS), battery backup (BATTERY), inverter upgrade (INVERTER), wires and cables (WIRES), or maintenance and repair (MAINTENANCE).\n2B. PRODUCT DETAILS (MANDATORY, before pickup or delivery). Ask what exactly they want, one short question at a time, using the catalog. Never skip this and never book without it. If they want several things, go through them one by one.\n- PANELS: ask which model, SW-400, SW-450 all-black or SW-550 bifacial, then how many panels, or whether they want a 6-pack or 12-pack.\n- INVERTER: we have three models, SW-5K grid-tied 5 kilowatt, SW-7.6H hybrid 7.6 kilowatt which is the most popular, and SW-10H whole-home 10 kilowatt. Ask which one they want, then 5-year or 10-year warranty.\n- BATTERY: sizes are SW-B10 10 kilowatt-hour, SW-B20 20 kilowatt-hour and SW-B40 40 kilowatt-hour. Ask which size, how many batteries, and wall mount or floor stand.\n- WIRES: ask what they need: PV cable and how many feet (100, 250 or 500 foot rolls), connector kits (10, 25 or 50 pairs), or a combiner and grounding box (4, 6 or 8 string). Ask for the quantity of each.\n- FULL_SYSTEM: offer the three packages, Starter Home 5.2 kilowatt, Family plus Battery 8 kilowatt, and Premium Whole Home 12.6 kilowatt, and ask which one.\n- MAINTENANCE: ask in one sentence what needs fixing or checking.\nIf they are unsure, ask one simple question (size of home, backup needs) and recommend one option. Give a catalog price only when it helps them choose or they ask. Keep each question short, it is a phone call. Remember every choice (model, size, quantity, feet, warranty, mounting) for the notes field.\n3. PICKUP OR DELIVERY (MANDATORY). Once the product details are settled, and it is NOT FULL_SYSTEM, you MUST ask exactly: "Will you pick it up yourself at our shop, or should we deliver it to you?" Do NOT ask for name, phone or anything else until they have answered this. Never assume or guess it: fulfillment must be what the caller said. Never ask this for FULL_SYSTEM.\n4. DETAILS, one at a time: full name and phone number, and for DELIVERY or FULL_SYSTEM also street address and city. For PICKUP do NOT ask for an address or city. Never ask for an email, state, ZIP code, or any date, day or time: we do not schedule on this call. Read the phone number back to check it.\n5. READ BACK everything: service and every product detail they chose (model, quantity, size, feet, warranty), name, phone, pickup or delivery when it was asked, plus street address and city for delivery or a full system. Then ask exactly: "Shall I go ahead and book this?"\n6. BOOK only after a clear yes: call create_booking with confirmed set to true and put every product detail in notes. If they change something, update it and read back a fresh summary.\n7. AFTER A SUCCESSFUL BOOKING, say exactly what applies and nothing more:\n- PICKUP: say it is booked, give the reference, then give ONLY the shop address and opening hours from the tool result. Do NOT say that the team will contact them.\n- DELIVERY or FULL_SYSTEM: say "Your booking is confirmed. Our team will contact you soon to finalize the date and time." and give the reference. Do NOT mention the shop address or opening hours.\n8. ANYTHING ELSE? If not, thank them warmly and say goodbye to end the call.\n\nOnly quote prices that are in the catalog above; for anything not listed, say the free home survey gives a written quote. Never say you will send an email, confirmation or reminder; this system sends none.\nFAILURES: if a tool returns success false, read its error, fix what it says (for example ask for a missing detail) and try again. If it still fails, say plainly it did not go through and ask them to use the booking form on the website. Never say it is booked unless create_booking returned success true.`;
  const str = d => ({ type: 'string', description: d });
  return {
    name: 'SolarWave Energy',
    firstMessage: 'Hi, thanks for calling SolarWave Energy! We offer full solar systems, solar panels, battery backup, inverters, wires and cables, and maintenance. Which one are you interested in?',
    endCallPhrases: ['goodbye', 'bye now', 'have a great day. goodbye'], maxDurationSeconds: 900, silenceTimeoutSeconds: 60,
    serverUrl: hook,
    server: { url: hook, timeoutSeconds: 20, headers: { 'ngrok-skip-browser-warning': 'true' } },
    serverMessages: ['tool-calls'],
    transcriber: { provider: 'deepgram', model: 'nova-2', language: 'en-IN', smartFormat: true, keywords: ['SolarWave:2', 'inverter:2', 'battery:2', 'pickup:2', 'delivery:2', 'bifacial:2', 'hybrid:2', 'combiner:2'] },
    startSpeakingPlan: { waitSeconds: 0.7 }, stopSpeakingPlan: { numWords: 2 },
    voice: { provider: 'vapi', voiceId: 'Elliot' },
    model: { provider: 'openai', model: 'gpt-4o-mini', temperature: 0.3, maxTokens: 250, messages: [{ role: 'system', content: prompt }], tools: [
      { type: 'function', async: false, server: { url: hook, timeoutSeconds: 20, headers: { 'ngrok-skip-browser-warning': 'true' } }, function: { name: 'create_booking', description: 'Create the booking. Only call after reading all details aloud and hearing the caller agree.', parameters: { type: 'object', properties: {
        name: str('Full name'), phone: str('Phone number'), address: str('Street address'), city: str('City'),
        service: { type: 'string', enum: Object.keys(SERVICE_MAP) }, fulfillment: { type: 'string', enum: ['PICKUP', 'DELIVERY'], description: 'Required for every service except FULL_SYSTEM. PICKUP = customer collects it, DELIVERY = we deliver and install. Omit for FULL_SYSTEM. For PICKUP no address or city is needed.' },
        notes: str('Everything they chose: models, sizes, packs, quantities, feet of cable, warranty, mounting.'),
        confirmed: { type: 'boolean', description: 'True only if you read the full details aloud and the caller agreed.' } },
        required: ['name', 'phone', 'service', 'confirmed'] } } }] } };
}

// Server-side guard for the text chat: the model may not book until the visitor really gave every detail and answered a read-back.
const norm = t => String(t || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
function chatGuard(a, msgs, pickup) {
  const users = msgs.filter(m => m.role === 'user').map(m => m.content).join(' | ');
  const text = ' ' + norm(users) + ' ', dig = users.replace(/\D/g, '');
  const has = v => { const t = norm(v).split(' ').filter(Boolean); return t.length > 0 && t.every(w => text.includes(' ' + w) || text.includes(w)); };
  const missing = [];
  if (!has(a.name)) missing.push('full name');
  if (!(String(a.phone || '').replace(/\D/g, '').length >= 10 && dig.includes(String(a.phone).replace(/\D/g, '').slice(-10)))) missing.push('phone number');
  if (!pickup) { if (!has(a.address)) missing.push('street address'); if (!has(a.city)) missing.push('city'); }
  if (missing.length) return `The visitor has not told you their ${missing.join(', ')} yet. Ask for it now, one question at a time. Never guess or invent details.`;
  const lastBot = [...msgs].reverse().find(m => m.role === 'assistant');
  if (!lastBot || !/book[^?]*\?/i.test(lastBot.content)) return 'You have not read the details back yet. Read everything back and ask exactly "Shall I go ahead and book this?", then wait for a clear yes before booking.';
  return '';
}

async function runTool(name, a, source = 'VOICE', msgs = null) {
  try {
    if (name === 'create_booking') {
      if (msgs) { const bad = chatGuard(a, msgs, a.fulfillment === 'PICKUP' && a.service !== 'FULL_SYSTEM'); if (bad) return { success: false, error: bad }; }
      if (a.confirmed !== true && a.confirmed !== 'true') return { success: false, error: 'Not confirmed. Do not book. Read the full summary aloud and ask "Shall I go ahead and book this?" first.' };
      const v = core.validate({ ...a, service: SERVICE_MAP[a.service] || a.service, fulfillment: a.fulfillment === 'PICKUP' ? 'Pickup' : a.fulfillment === 'DELIVERY' ? 'Delivery & install' : '' });
      if (v.error) return { success: false, error: v.error + ' Ask the caller for what is missing or wrong (phone needs 10 digits). If pickup or delivery is missing, ask which one they want.' };
      const x = await core.createBooking(v.d, source);
      if (v.d.fulfillment === 'Pickup') return { success: true, reference: x.ref, pickup: true, shopAddress: `${core.SHOP.address}, ${core.SHOP.city}`, shopHours: core.SHOP.hours, message: 'Give the reference, the shop address and hours, and say: our team will contact you soon to finalize the date, day and time.' };
      return { success: true, reference: x.ref, message: 'Give the reference and say: our team will contact you soon to finalize the date, day and time.' };
    }
    return { success: false, error: 'Unknown tool' };
  } catch (e) { console.error('[tool failed]', name, JSON.stringify(a), e); return { success: false, error: 'Tool failed: ' + (e.message || 'unknown') }; }
}
// Vapi's voice model reads the tool result best as one short plain sentence, not a JSON blob.
const speak = r => {
  if (!r.success) return `FAILED. The booking was NOT saved. ${r.error || 'Unknown error.'}`;
  const ref = String(r.reference || '').replace(/^SW-?/, 'S W ').split('').join(' ').replace(/\s+/g, ' ');
  return r.pickup
    ? `SUCCESS. Booking confirmed and saved. Reference: ${ref}. This is a PICKUP order. Tell the caller it is booked, read the reference slowly, then say only the shop address (${r.shopAddress}) and opening hours (${r.shopHours}). Do NOT say the team will contact them. Then ask if they need anything else.`
    : `SUCCESS. Booking confirmed and saved. Reference: ${ref}. This is a DELIVERY or full system order. Say: "Your booking is confirmed. Our team will contact you soon to finalize the date and time." and read the reference slowly. Do NOT mention the shop address or opening hours. Then ask if they need anything else.`;
};
const parseArgs = raw => { if (typeof raw === 'string') { try { return JSON.parse(raw || '{}'); } catch { return {}; } } return raw || {}; };

router.get('/voice/route-select', rateLimit({ windowMs: 10 * 60e3, limit: 20 }), wrap(async (req, res) => {
  const excl = String(req.query.exclude || '').split(',').map(s => s.trim()).filter(Boolean);
  const acct = await pickAccount(excl);
  if (!acct) return res.json({ available: false, message: 'Our AI voice assistant is at capacity right now. Please use the chat or the booking form instead.' });
  const baseUrl = (process.env.APP_URL || `${req.protocol}://${req.get('host')}`).replace(/\/$/, '');
  if (/localhost|127\.0\.0\.1/.test(baseUrl)) console.warn('[voice] APP_URL is not public: Vapi cannot reach the booking tools. Set APP_URL (ngrok URL or your Railway domain).');
  const sid = crypto.randomBytes(8).toString('hex');
  res.json({ available: true, accountKey: acct.key, publicKey: acct.publicKey, sid, assistant: buildAssistant(baseUrl, acct.key, sid) });
}));
router.post('/voice/start-failed', wrap(async (req, res) => {
  const key = String(req.body?.accountKey || '');
  if (ACCTS.some(a => a.key === key)) vapiCool.set(key, Date.now() + 30 * 60e3);
  res.json({ ok: true });
}));
router.post('/voice/end-of-call', wrap(async (req, res) => {
  const key = String(req.body?.accountKey || ''), min = Math.min(30, Math.ceil(+req.body?.minutes || 0));
  if (ACCTS.some(a => a.key === key) && min > 0) await recordUsage(key, min);
  res.json({ ok: true });
}));
router.post('/voice/webhook', wrap(async (req, res) => {
  const msg = req.body?.message;
  console.log('[voice webhook] hit:', msg?.type || 'no message');
  if (process.env.VOICE_SECRET && req.query.k !== process.env.VOICE_SECRET) { console.warn('[voice webhook] 401: secret in the URL does not match VOICE_SECRET'); note({ type: msg?.type || 'none', status: 401, problem: 'secret (k) in URL does not match VOICE_SECRET' }); return res.sendStatus(401); }
  if (msg?.type === 'tool-calls') {
    // Vapi sends the calls as toolCallList ({id, name, arguments|parameters}) or inside toolWithToolCallList; accept every shape.
    const calls = (msg.toolCallList && msg.toolCallList.length ? msg.toolCallList : msg.toolCalls) || (msg.toolWithToolCallList || []).map(x => x.toolCall).filter(Boolean);
    const results = await Promise.all(calls.map(async c => {
      const n = c.function?.name || c.name, a = parseArgs(c.function?.arguments ?? c.function?.parameters ?? c.arguments ?? c.parameters);
      const r = await runTool(n, a);
      if (r.success) keepRef(String(req.query.sid || ''), r);
      console.log('[voice]', n, JSON.stringify(a), '->', r.success ? 'ok' : 'FAILED ' + r.error);
      note({ type: 'tool-calls', status: 200, tool: n, args: { ...a, phone: a.phone ? String(a.phone).replace(/\d(?=\d{3})/g, '*') : a.phone }, success: !!r.success, ref: r.reference, error: r.error });
      return { name: n, toolCallId: c.id, result: speak(r) };
    }));
    if (!calls.length) note({ type: 'tool-calls', status: 200, problem: 'tool-calls message had no calls inside', keys: Object.keys(msg) });
    return res.json({ results });
  }
  if (msg?.type === 'function-call') { const c = msg.functionCall || {}; const r = await runTool(c.name, parseArgs(c.parameters ?? c.arguments)); note({ type: 'function-call', status: 200, tool: c.name, success: !!r.success, error: r.error }); return res.json({ result: speak(r) }); }
  note({ type: msg?.type || 'none', status: 200 });
  res.json({ ok: true });
}));

router.get('/voice/result', rateLimit({ windowMs: 60e3, limit: 60, standardHeaders: true, legacyHeaders: false }), (req, res) => {
  const v = voiceRefs.get(String(req.query.sid || ''));
  res.set('Cache-Control', 'no-store');
  res.json(v ? { found: true, ref: v.ref, pickup: v.pickup, shopAddress: v.shopAddress, shopHours: v.shopHours } : { found: false });
});

// Open: <APP_URL>/api/voice/diag?k=<VOICE_SECRET>  -> shows config, DB check and the last webhook hits from Vapi.
router.get('/voice/diag', wrap(async (req, res) => {
  if (!process.env.VOICE_SECRET || req.query.k !== process.env.VOICE_SECRET) return res.sendStatus(401);
  const appUrl = (process.env.APP_URL || '').replace(/\/$/, '');
  let db = 'ok';
  try { await pool.query('SELECT 1'); await pool.query('SELECT visit_date, source, fulfillment FROM bookings LIMIT 1'); } catch (e) { db = 'ERROR: ' + e.message; }
  const usage = (await pool.query('SELECT account_key, minutes_used FROM vapi_usage').catch(() => ({ rows: [] }))).rows;
  res.json({
    appUrl: appUrl || '(APP_URL is empty!)',
    appUrlIsPublic: !!appUrl && !/localhost|127\.0\.0\.1/.test(appUrl),
    webhookUrl: `${appUrl}/api/voice/webhook?account=accountN&k=<VOICE_SECRET>`,
    vapiAccountsConfigured: ACCTS.map(a => a.key), vapiMinutesUsed: usage, vapiMinutesLimit: LIMIT,
    groqKeys: GROQ_KEYS.length, db,
    howToRead: 'Make a test call, finish it, then refresh this page. No entries = Vapi never reached your server. status 401 = secret mismatch. success:false = see error.',
    recentVoiceEvents: recent
  });
}));

module.exports = router;
