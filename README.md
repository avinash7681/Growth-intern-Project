# NxtWave AI Workshop Growth Engine & Backend Architecture

## Overview
This asset is a **Production-Grade Full-Stack Growth Application** engineered for the **NxtWave Growth Intern Challenge (Round 1)**.
It combines a responsive, high-converting frontend with a robust **Python Flask + SQLite3 REST API backend** that handles real-time student registration, automated referral attribution, AI project evaluation, calendar generation, and live growth analytics.

---

## 🛠️ Full-Stack Technical Architecture

```
02_WORKING_ASSET/
├── index.html          # Modern Tailwind + Glassmorphism Frontend UI
├── app.js              # Client State Machine & Asynchronous REST API Client
├── styles.css          # Dark Mode UI, Custom Animations & Mobile WhatsApp Frame
├── server.py           # Production Flask REST API Backend & Static Server
├── database.py         # SQLite Schema Definition, Migration & Data Seeding
├── requirements.txt    # Python Dependencies (Flask, Werkzeug)
├── start_backend.bat   # 1-Click Launch Script for Windows
├── nxtwave_growth.db   # SQLite Database (Autocreated on first run)
└── README.md           # This Documentation File
```

---

## 📡 REST API Documentation

| Method | Endpoint | Description | Sample Request / Response |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Backend status & DB connection health | `{"status": "healthy", "database_records": 15, "engine": "Flask 3.1 + SQLite3"}` |
| `POST` | `/api/register` | Register student, generate unique referral code, credit referrer | **Body:** `{"name": "...", "phone": "...", "college": "...", "branch": "..."}`<br>**Returns:** Registered student record + referral link |
| `GET` | `/api/referrals/<code_or_phone>` | Fetch live referral metrics, referred friends list, and unlocked reward tiers | `{"referral_code": "ARJ-AI8821", "referral_count": 68, "unlocked_tiers": [1, 2, 3]}` |
| `POST` | `/api/referrals/simulate` | Simulates an incoming peer registration under a referral code | **Body:** `{"referral_code": "..."}`<br>**Returns:** Updated referral count + milestone unlock alerts |
| `POST` | `/api/evaluate-project` | AI Project Evaluator & Resume Bullet Generator | **Body:** `{"title": "...", "branch": "..."}`<br>**Returns:** Placement readiness score (0-100), diagnosis, GenAI architecture overhaul & 3 STAR resume bullets |
| `GET` | `/api/stats` | Live growth KPIs, channel attribution breakdown & ambassador leaderboard | Returns total registrations, goal completion %, K-factor (0.42), blended CAC, and top campus leads |
| `GET` | `/api/calendar.ics` | Generates RFC 5545 compliant `.ics` calendar invitation for 1-click calendar sync | Downloads `nxtwave_ai_workshop.ics` for Google Calendar / Apple Calendar |
| `GET` | `/api/export/csv` | Streams all registered student records from SQLite into a CSV file | Downloads `nxtwave_registered_students.csv` for growth operations |

---

## 🗄️ SQLite Database Schema

### 1. `students` Table
- `id` (INTEGER PRIMARY KEY AUTOINCREMENT)
- `name` (TEXT NOT NULL)
- `email` (TEXT UNIQUE NOT NULL)
- `phone` (TEXT NOT NULL)
- `college` (TEXT NOT NULL) — *Includes Amrita Vishwa Vidyapeetham, VIT, SRM, CBIT, JNTUH, etc.*
- `branch` (TEXT NOT NULL)
- `referral_code` (TEXT UNIQUE NOT NULL)
- `referred_by` (TEXT NULLABLE) — *Foreign referral code link*
- `referral_count` (INTEGER DEFAULT 0)
- `created_at` (DATETIME DEFAULT CURRENT_TIMESTAMP)

### 2. `referral_events` Table
- `id` (INTEGER PRIMARY KEY AUTOINCREMENT)
- `referrer_code` (TEXT NOT NULL)
- `referred_name` (TEXT NOT NULL)
- `referred_college` (TEXT NOT NULL)
- `created_at` (DATETIME DEFAULT CURRENT_TIMESTAMP)

### 3. `evaluations` Table
- `id` (INTEGER PRIMARY KEY AUTOINCREMENT)
- `title` (TEXT NOT NULL)
- `branch` (TEXT NOT NULL)
- `score` (INTEGER NOT NULL)
- `critique` (TEXT)
- `overhaul` (TEXT)
- `stack` (TEXT)
- `bullets` (TEXT / JSON)
- `created_at` (DATETIME DEFAULT CURRENT_TIMESTAMP)

---

## 🚀 How to Run the Project

### Option A: 1-Click Windows Launch
Double-click `start_backend.bat`. This automatically launches the Flask server at `http://localhost:8080`.

### Option B: Terminal Command (Any OS)
1. Ensure Python is installed:
   ```bash
   pip install -r requirements.txt
   ```
2. Start the server:
   ```bash
   python server.py
   ```
3. Open your browser and navigate to:
   **`http://localhost:8080`**

### Option C: Standalone Browser Mode (Zero Dependencies)
If Python is not available on an evaluator's machine, simply double-clicking `index.html` runs the application seamlessly in **Standalone Client Mode** with automatic local fallback!
