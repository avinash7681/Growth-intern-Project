#!/usr/bin/env python3
"""
NxtWave Growth Engine — SQLite Database Viewer Utility
Run this script anytime to inspect registered students, referrals, and AI evaluations.
"""

import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'nxtwave_growth.db')

def view():
    if not os.path.exists(DB_PATH):
        print(f"Database not found at: {DB_PATH}")
        print("Run 'python server.py' first to initialize the database.")
        return

    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    print("=" * 80)
    print(f"NXTWAVE GROWTH DATABASE VIEWER: {DB_PATH}")
    print("=" * 80)

    # 1. Students Table
    print("\n[TABLE: students]")
    print("-" * 80)
    cursor.execute("SELECT id, name, college, referral_code, referred_by, referral_count, created_at FROM students ORDER BY id ASC")
    students = cursor.fetchall()
    print(f"{'ID':<4} {'Name':<18} {'College':<32} {'Code':<12} {'RefBy':<10} {'Refs':<5}")
    print("-" * 80)
    for s in students:
        ref_by = s['referred_by'] or 'Direct'
        print(f"{s['id']:<4} {s['name'][:17]:<18} {s['college'][:30]:<32} {s['referral_code']:<12} {ref_by:<10} {s['referral_count']:<5}")
    print(f"\nTotal Registered Students: {len(students)}")

    # 2. Referral Events Table
    print("\n[TABLE: referral_events]")
    print("-" * 80)
    cursor.execute("SELECT id, referrer_code, referred_name, referred_college, created_at FROM referral_events ORDER BY id DESC LIMIT 5")
    events = cursor.fetchall()
    for e in events:
        print(f"* Event #{e['id']}: {e['referred_name']} ({e['referred_college']}) joined using code [{e['referrer_code']}] at {e['created_at']}")
    cursor.execute("SELECT COUNT(*) FROM referral_events")
    print(f"Total Referral Events Logged: {cursor.fetchone()[0]}")

    # 3. AI Evaluations Table
    print("\n[TABLE: evaluations]")
    print("-" * 80)
    cursor.execute("SELECT id, title, branch, score, created_at FROM evaluations ORDER BY id DESC LIMIT 5")
    evals = cursor.fetchall()
    for ev in evals:
        print(f"* Eval #{ev['id']}: [{ev['score']}/100] {ev['title']} ({ev['branch']})")
    cursor.execute("SELECT COUNT(*) FROM evaluations")
    print(f"Total AI Project Evaluations Logged: {cursor.fetchone()[0]}")

    print("\n" + "=" * 80)
    conn.close()

if __name__ == '__main__':
    view()
