import httpx

# Login as Aarav Sharma (skills: python, java, sql, react)
email = 'aarav.sharma2025@university.edu'
login_res = httpx.post('http://127.0.0.1:8000/api/v1/auth/login', json={
    'email': email,
    'password': 'Password@123'
})
print('Login status:', login_res.status_code)
token = login_res.json()['access_token']

recs = httpx.get('http://127.0.0.1:8000/api/v1/jobs/recommendations', headers={'Authorization': f'Bearer {token}'}).json()
print(f'\nTotal recommendations for Aarav (skills: python, java, sql, react): {len(recs)}')
for j in recs:
    md = j['match_details']
    c_name = j.get('company', {}).get('name', 'Company')
    print(f"  * {c_name} -> {j['title']}: {md['match_score']}% Match | Eligible: {md['is_eligible']} | Matched: {md['matched_skills']}")
