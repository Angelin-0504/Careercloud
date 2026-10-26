import httpx
from backend.app.database import SessionLocal
from backend.app.models.user import User
from backend.app.models.student import StudentProfile

email = 'tanvi.sharma@university.edu'
# Register student
res = httpx.post('http://127.0.0.1:8000/api/v1/auth/register', json={
    'email': email,
    'password': 'Password@123',
    'full_name': 'Tanvi Sharma',
    'role': 'student',
    'phone': '+91 98765 00001',
    'department': 'Computer Science & Engineering',
    'degree': 'B.Tech',
    'graduation_year': 2025,
    'cgpa': 8.5,
    'skills': 'python, java, sql, react'
})
print('Registration HTTP code:', res.status_code)
token = res.json()['access_token']

# Check DB profile directly
db = SessionLocal()
u = db.query(User).filter(User.email == email).first()
sp = db.query(StudentProfile).filter(StudentProfile.user_id == u.id).first()
print(f"Stored DB Profile: Department='{sp.department}', Year={sp.graduation_year}, CGPA={sp.cgpa}, Skills='{sp.skills}'")
db.close()

# Fetch Recommendations from API
recs = httpx.get('http://127.0.0.1:8000/api/v1/jobs/recommendations', headers={'Authorization': f'Bearer {token}'}).json()
print(f"\nRecommendations for Tanvi (Skills: Python, Java, SQL, React | Year: 2025):")
for j in recs:
    md = j['match_details']
    comp = j.get('company', {}).get('name')
    print(f"  * [{comp}] {j['title']}")
    print(f"      Score: {md['match_score']}% | Eligible: {md['is_eligible']} | Matched: {md['matched_skills']}")
    print(f"      Missing: {md['missing_skills']}")
