def test_student_registration(client):
    response = client.post(
        "/api/v1/auth/register",
        json={
            "email": "new_student@university.edu",
            "password": "Password@123",
            "full_name": "New Student",
            "role": "student"
        }
    )
    assert response.status_code == 201
    data = response.json()
    assert "access_token" in data
    assert data["user"]["email"] == "new_student@university.edu"
    assert data["user"]["role"] == "student"

def test_recruiter_registration(client):
    response = client.post(
        "/api/v1/auth/register",
        json={
            "email": "new_recruiter@techcorp.io",
            "password": "Password@123",
            "full_name": "New Recruiter",
            "role": "recruiter",
            "company_name": "TechCorp Innovations",
            "company_industry": "Cloud SaaS",
            "company_location": "Hyderabad"
        }
    )
    assert response.status_code == 201
    data = response.json()
    assert data["user"]["role"] == "recruiter"
    assert data["user"]["company_id"] is not None

def test_duplicate_registration_fails(client, test_student):
    response = client.post(
        "/api/v1/auth/register",
        json={
            "email": test_student["user"].email,
            "password": "Password@123",
            "full_name": "Duplicate User",
            "role": "student"
        }
    )
    assert response.status_code == 400
    assert "already exists" in response.json()["detail"]

def test_login_success(client, test_student):
    response = client.post(
        "/api/v1/auth/login",
        json={
            "email": test_student["user"].email,
            "password": "Password@123"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["email"] == test_student["user"].email

def test_login_invalid_password_fails(client, test_student):
    response = client.post(
        "/api/v1/auth/login",
        json={
            "email": test_student["user"].email,
            "password": "WrongPassword999"
        }
    )
    assert response.status_code == 401

def test_get_current_user_me(client, test_student):
    headers = {"Authorization": f"Bearer {test_student['token']}"}
    response = client.get("/api/v1/auth/me", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == test_student["user"].email
    assert data["role"] == "student"
