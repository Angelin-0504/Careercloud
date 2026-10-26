import httpx

# Register a brand new student
email = 'aarav.sharma2025@university.edu'
res = httpx.post('http://127.0.0.1:8000/api/v1/auth/register', json={
    'email': email,
    'password': 'Password@123',
    'full_name': 'Aarav Sharma',
    'role': 'student',
    'phone': '+91 98989 89898',
    'department': 'Computer Science & Engineering',
    'degree': 'B.Tech',
    'graduation_year': 2025,
    'cgpa': 8.2,
    'skills': 'python, java, sql, react'
})
print('Register status:', res.status_code)
if res.status_code == 201:
    token = res.json()['access_token']
    recs = httpx.get('http://127.0.0.1:8000/api/v1/jobs/recommendations', headers={'Authorization': f'Bearer {token}'}).json()
    print(f'Total recommendations for fresh student Aarav with skills "python, java, sql, react": {len(recs)}')
    for j in recs:
        md = j['match_details']
        c_name = j.get('company', {}).get('name', 'Company')
        print(f"  * {c_name} -> {j['title']}: {md['match_score']}% Match | Eligible: {md['is_eligible']} | Matched Skills: {md['matched_skills']}")
else:
    print('Response:', res.text)
