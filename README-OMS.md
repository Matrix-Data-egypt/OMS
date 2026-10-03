# OMS — How to run

## 1) Backend (API)
```bash
cd backend
npm install
npm start
```
Runs on http://localhost:5000

Default admin login (for dashboard):
- Username: `admin`
- Password: `omsadmin123`

## 2) Company website (frontend)
```bash
cd my-app
npm start
```
Runs on http://localhost:3000

## 3) Admin dashboard (separate from website)
```bash
cd admin
npm install
npm run dev
```
Runs on http://localhost:5173

Open the dashboard only from that URL — it is not part of the public site.

## What the dashboard includes
1. **Start Project** — all client briefs submitted from the website contact form
2. **Production TV** — add YouTube links or upload video files (shown on `/production-tv`)
3. **Blog** — create posts with title + full content (shown on `/blog`)
