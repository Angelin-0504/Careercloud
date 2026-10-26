import httpx

# 1. Test fetching jobs without token (public discovery)
r = httpx.get('http://127.0.0.1:8000/api/v1/jobs')
jobs = r.json()
print(f'Total jobs in system: {len(jobs)}')
for j in jobs:
    comp = j.get('company', {}).get('name', 'Unknown')
    print(f"  [{comp}] {j['title']} (Batch: {j['eligible_graduation_years']}, CGPA: {j['min_cgpa']})")
    print(f"      Required Skills: {j['required_skills']}")

# 2. Test login as Alex (student with Python, Java, SQL, React)
login_res = httpx.post(
    'http://127.0.0.1:8000/api/v1/auth/login',
    json={'email': 'alex.student@university.edu', 'password': 'Password@123'}
)
if login_res.status_code != 200:
    print("Login error:", login_res.text)
else:
    token = login_res.json()['access_token']
    rec_res = httpx.get(
        'http://127.0.0.1:8000/api/v1/jobs/recommendations',
        headers={'Authorization': f'Bearer {token}'}
    )
    recs = rec_res.json()
    print(f"\nRecommendations for student with Python, Java, SQL, React (Total: {len(recs)}):")
    for j in recs:
        md = j.get('match_details', {})
        comp = j.get('company', {}).get('name')
        print(f"  -> {comp}: {j['title']}")
        print(f"     Match Score: {md.get('match_score')}% | Eligible: {md.get('is_eligible')}")
        print(f"     Matched Skills: {md.get('matched_skills')}")
        print(f"     Missing Skills: {md.get('missing_skills')}")
