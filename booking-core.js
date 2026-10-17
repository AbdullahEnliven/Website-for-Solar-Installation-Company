// One set of booking rules, used by the web form, the AI chat and the AI voice call.
const crypto = require('crypto');
const { pool } = require('./db');

const TZ = process.env.BUSINESS_TZ || 'America/Chicago';
const SERVICES = ['Full solar system', 'Solar panels only', 'Battery backup', 'Inverter upgrade', 'Wires & cables', 'Maintenance / repair'];
const FULFIL = ['Pickup', 'Delivery & install'];
const SHOP = { address: '1250 Sunrise Blvd, Suite 300', city: 'Austin, TX 78701', hours: 'Monday to Saturday, 8:00 AM to 6:00 PM' };
const DATE_TAKEN = 'Sorry, that date is no longer available. Please choose another day.';

const clean = (v, n = 200) => String(v ?? '').trim().slice(0, n);
const isDate = s => /^\d{4}-\d{2}-\d{2}$/.test(s) && !isNaN(Date.parse(s));
const today = () => new Intl.DateTimeFormat('en-CA', { timeZone: TZ }).format(new Date());
const addDays = (s, n) => new Date(Date.parse(s + 'T00:00:00Z') + n * 864e5).toISOString().slice(0, 10);
const dow = s => new Date(s + 'T00:00:00Z').getUTCDay();
const fmtDate = s => new Date(s + 'T12:00:00Z').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
const weekday = s => new Date(s + 'T12:00:00Z').toLocaleDateString('en-US', { weekday: 'long', timeZone: 'UTC' });

function validate(b) {
  const d = { name: clean(b.name, 100), phone: clean(b.phone, 30), email: clean(b.email, 120), address: clean(b.address, 160), city: clean(b.city, 80),
    state: '', zip: '', service: clean(b.service, 60), date: null, slot: '', fulfillment: clean(b.fulfillment, 30), notes: clean(b.notes, 600) };
  const pickup = d.service !== 'Full solar system' && d.fulfillment === 'Pickup';
  // Pickup needs no customer address: they collect it at our shop. There are no dates: our team agrees the date, day and time by phone.
  if (pickup) { if (!d.address) d.address = SHOP.address + ' (shop pickup)'; if (!d.city) d.city = SHOP.city; }
  if (!d.name || d.phone.replace(/\D/g, '').length < 10 || (d.email && !/^\S+@\S+\.\S+$/.test(d.email)) || !d.address || !d.city)
    return { error: 'Please fill in all required fields correctly.' };
  if (!SERVICES.includes(d.service)) return { error: 'Invalid selection.' };
  if (d.service === 'Full solar system') d.fulfillment = '';
  else if (!FULFIL.includes(d.fulfillment)) return { error: 'Please choose pickup or delivery & install.' };
  return { d };
}

async function createBooking(d, source = 'FORM') {
  const ref = 'SW-' + crypto.randomBytes(3).toString('hex').toUpperCase();
  await pool.query('INSERT INTO bookings(ref,name,phone,email,address,city,state,zip,service,visit_date,time_slot,notes,source,fulfillment) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)',
    [ref, d.name, d.phone, d.email, d.address, d.city, d.state, d.zip, d.service, null, d.slot, d.notes, source, d.fulfillment]);
  return { ok: true, ref };
}

module.exports = { SHOP, SERVICES, FULFIL, DATE_TAKEN, clean, isDate, today, addDays, dow, fmtDate, weekday, validate, createBooking };
