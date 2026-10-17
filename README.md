# SolarWave site (Node.js + PostgreSQL, Railway ready)

## Local chalane ka tareeqa (VS Code)
1. `npm install`
2. `.env.example` ko copy karke `.env` banao aur values bharo (DATABASE_URL, ADMIN_PASSWORD, JWT_SECRET).
3. `npm run dev` -> http://localhost:3000  |  admin: http://localhost:3000/admin/
Tables khud ban jati hain (db.js, har start par). Koi SQL command nahi chalani.

## Railway par deploy
1. Code GitHub par push karo (.env push NAHI hoti, .gitignore me hai).
2. Railway -> New Project -> Deploy from GitHub repo.
3. Same project me **+ New -> Database -> PostgreSQL** add karo.
4. App service -> Variables me ye daalo:
   - `DATABASE_URL` = `${{Postgres.DATABASE_URL}}`
   - `JWT_SECRET` = koi lamba random string
   - `ADMIN_PASSWORD` = admin panel password (sirf password, koi user nahi)
   - `BUSINESS_TZ` = `America/Chicago` (apni timezone)
5. Settings -> Networking -> Generate Domain. Deploy ke baad `/admin/` par login karo.

## Demo content badalna
- Phone, address, email, license: `public/js/content.js` ke upar `SITE` object.
- Animation ke text aur detail sections: `public/js/content.js` ka `STORY`.
- Sab demo hai: live jane se pehle asli info daalo.

## Booking rules
Customer calendar se date chunta hai (Mon-Sat, kal se 120 din tak). Default 3 booking per din; admin panel me capacity badal sakte ho ya koi din block kar sakte ho.


## AI booking: Book via Call / Book via Message / Book via Form
"Book Now" opens three options. Form = the normal calendar form. Message = AI chat (Groq). Call = AI voice assistant (Vapi). All three use the same rules (`booking-core.js`: Mon-Sat, daily capacity, blocked days) and show up in the admin panel with their source (FORM / CHAT / VOICE).
Env vars (copy the values from the office project's `.env`): `GROQ_API_KEY`, `VAPI_PUBLIC_KEY_1..3`, plus `APP_URL` and `VOICE_SECRET` (see ENV-ADD.txt).
`APP_URL` must be a PUBLIC address because Vapi calls the booking tools from its own servers: your ngrok URL while testing locally, your Railway domain after deploy.
