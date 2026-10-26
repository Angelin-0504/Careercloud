"""
CareerCloud Database Inspector Tool
Run this script to inspect your local SQLite database file, tables, rows, and records.
Usage:
    python scripts/inspect_db.py
"""
import os
import sys
import sqlite3

if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
DB_PATH = os.path.join(ROOT_DIR, "careercloud.db")

def inspect():
    print("=" * 70)
    print("  CAREERCLOUD DATABASE INSPECTOR")
    print("=" * 70)
    print(f"\n[+] Database File Location:")
    print(f"    Path: {DB_PATH}")
    
    if not os.path.exists(DB_PATH):
        print(f"[-] Database file does not exist yet at {DB_PATH}.")
        print("    Run 'python backend/seed.py --reset' to initialize it.")
        return

    size_kb = os.path.getsize(DB_PATH) / 1024
    print(f"    File Size: {size_kb:.2f} KB")

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # 1. List all tables
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;")
    tables = [t[0] for t in cursor.fetchall() if not t[0].startswith("sqlite_")]
    
    print(f"\n[+] Relational Tables in Database ({len(tables)} tables total):")
    for tbl in tables:
        cursor.execute(f"SELECT COUNT(*) FROM {tbl};")
        count = cursor.fetchone()[0]
        print(f"    - {tbl:<25} ({count} records)")

    # 2. Sample Users
    print("\n" + "-" * 70)
    print("[+] Registered User Accounts:")
    cursor.execute("SELECT id, email, full_name, role, is_active FROM users LIMIT 10;")
    for row in cursor.fetchall():
        print(f"    ID {row[0]:<2} | {row[1]:<32} | {row[2]:<25} | Role: {row[3]}")

    # 3. Verified Enterprise Companies
    print("\n" + "-" * 70)
    print("[+] Real-World Enterprise Companies:")
    cursor.execute("SELECT id, name, industry, location, is_verified FROM companies;")
    for row in cursor.fetchall():
        ver = "VERIFIED" if row[4] else "PENDING"
        print(f"    ID {row[0]:<2} | [{ver}] {row[1]:<30} | {row[2]}")

    # 4. Active Campus Job Postings
    print("\n" + "-" * 70)
    print("[+] Active Campus Job Postings:")
    cursor.execute("""
        SELECT j.id, c.name, j.title, j.salary_range, j.required_skills, j.min_cgpa, j.eligible_graduation_years
        FROM jobs j
        JOIN companies c ON j.company_id = c.id
        WHERE j.status = 'active';
    """)
    for row in cursor.fetchall():
        print(f"\n    * Job ID #{row[0]}: {row[2]} at {row[1]}")
        print(f"      Salary: {row[3]} | Min CGPA: {row[5]} | Years: {row[6]}")
        print(f"      Required Skills: {row[4]}")

    # 5. Student Profiles
    print("\n" + "-" * 70)
    print("[+] Student Profiles & Skills:")
    cursor.execute("""
        SELECT s.id, u.full_name, s.department, s.graduation_year, s.cgpa, s.skills
        FROM student_profiles s
        JOIN users u ON s.user_id = u.id;
    """)
    for row in cursor.fetchall():
        print(f"    - {row[1]}: Dept: {row[2]} | Year: {row[3]} | CGPA: {row[4]}")
        print(f"      Skills: {row[5]}")

    # 6. Applications
    print("\n" + "-" * 70)
    print("[+] Current Applications:")
    cursor.execute("""
        SELECT a.id, u.full_name, j.title, c.name, a.status
        FROM applications a
        JOIN student_profiles s ON a.student_id = s.id
        JOIN users u ON s.user_id = u.id
        JOIN jobs j ON a.job_id = j.id
        JOIN companies c ON j.company_id = c.id;
    """)
    for row in cursor.fetchall():
        print(f"    App #{row[0]:<2} | Candidate: {row[1]:<16} | Role: {row[2]:<30} | Status: {row[4]}")

    conn.close()
    print("\n" + "=" * 70)
    print("  HOW TO VIEW THE DATABASE VISUALLY:")
    print("  1. DB Browser for SQLite: Download free GUI from https://sqlitebrowser.org/")
    print(f"     Open: {DB_PATH}")
    print("  2. VS Code Extension: Search 'SQLite Viewer' in VS Code Marketplace.")
    print("     Click on 'careercloud.db' in the file explorer to view tables directly.")
    print("  3. AWS Cloud Transition:")
    print("     To use AWS RDS PostgreSQL, update DATABASE_URL in .env.")
    print("=" * 70 + "\n")

if __name__ == "__main__":
    inspect()
