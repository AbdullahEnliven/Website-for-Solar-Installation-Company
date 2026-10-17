const pg = require('pg');
pg.types.setTypeParser(1082, v => v); // DATE -> 'YYYY-MM-DD' string
const url = process.env.DATABASE_URL;
if (!url) { console.error('DATABASE_URL is missing'); process.exit(1); }
const local = /localhost|127\.0\.0\.1|railway\.internal/.test(url);
const pool = new pg.Pool({ connectionString: url, ssl: local || process.env.DATABASE_SSL === 'false' ? false : { rejectUnauthorized: false } });

// Tables are created automatically on every start (safe to re-run).
async function init() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS blocked_dates (day DATE PRIMARY KEY, reason TEXT);
    CREATE TABLE IF NOT EXISTS bookings (
      id SERIAL PRIMARY KEY, ref TEXT UNIQUE NOT NULL, name TEXT NOT NULL, phone TEXT NOT NULL, email TEXT NOT NULL,
      address TEXT NOT NULL, city TEXT NOT NULL, state TEXT NOT NULL, zip TEXT NOT NULL, service TEXT NOT NULL,
      visit_date DATE NOT NULL, time_slot TEXT NOT NULL, notes TEXT, status TEXT NOT NULL DEFAULT 'pending',
      created_at TIMESTAMPTZ DEFAULT now());
    CREATE INDEX IF NOT EXISTS bookings_date_idx ON bookings(visit_date);
    CREATE TABLE IF NOT EXISTS work_photos (id SERIAL PRIMARY KEY, category TEXT NOT NULL, caption TEXT, mime TEXT NOT NULL, data BYTEA NOT NULL, created_at TIMESTAMPTZ DEFAULT now());
    CREATE INDEX IF NOT EXISTS work_photos_cat_idx ON work_photos(category);
    ALTER TABLE bookings ALTER COLUMN visit_date DROP NOT NULL;
    ALTER TABLE bookings ADD COLUMN IF NOT EXISTS source TEXT NOT NULL DEFAULT 'FORM';
    ALTER TABLE bookings ADD COLUMN IF NOT EXISTS fulfillment TEXT NOT NULL DEFAULT '';
    CREATE TABLE IF NOT EXISTS vapi_usage (account_key TEXT PRIMARY KEY, minutes_used INT NOT NULL DEFAULT 0);
    INSERT INTO settings(key,value) VALUES('daily_capacity','3') ON CONFLICT DO NOTHING;`);
  if (!process.env.ADMIN_PASSWORD) console.warn('ADMIN_PASSWORD not set: nobody can log in to /admin yet');
}
module.exports = { pool, init };
