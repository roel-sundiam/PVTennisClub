# PV Tennis Club — Logins & Setup Guide

---

## Easiest Way to Start (Double-click)

| File | What it does |
|------|-------------|
| `start-backend.bat` | Starts the API server on port 3000 |
| `start-frontend.bat` | Starts the Angular app on port 4200 |

Double-click **both** batch files (in separate windows). Keep both windows open.

---

## Manual Start (Terminal)

### Step 1 — Backend
```
cd c:\Projects2\PVTennisClub\backend
npm start
```

### Step 2 — Frontend
Open a **second** terminal:
```
cd c:\Projects2\PVTennisClub\frontend
npx ng serve
```

App is at: **http://localhost:4200**

---

## If you get "port 3000 already in use"

Run this in any terminal to free the port:
```
for /f "tokens=5" %a in ('netstat -ano ^| findstr ":3000"') do taskkill /PID %a /F
```
Then run `npm start` again.

---

## Admin Logins

| Username     | Password       | Role  |
|--------------|----------------|-------|
| `RoelSundiam`| `PVTennisClub` | Admin |
| `AKVinluan`  | `PVTennisClub` | Admin |

---

## Player Accounts

Players register at **http://localhost:4200/register**.
Admin must approve them before they can log in.

---

## Admin Capabilities
- Approve / reject player registrations
- Set court rates (game rate, light rate, ball boy fee)
- Record court sessions and compute billing
- Mark player charges as paid

## Player Capabilities
- View own session history
- View charge breakdown per session
- See outstanding balance
