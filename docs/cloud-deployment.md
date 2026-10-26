# CareerCloud — AWS Cloud Deployment & Teardown Guide

This step-by-step guide is designed for beginner students deploying the **CareerCloud** application to Amazon Web Services (AWS) for their Cloud Computing capstone presentation.

The deployment leverages AWS Free Tier eligible and low-cost serverless services.

---

## 1. Prerequisites

1. An **AWS Account** ([Create AWS Free Tier Account](https://aws.amazon.com/free/)).
2. **AWS CLI** installed and configured (`aws configure` with Access Key & Secret).
3. **Docker** installed (or use GitHub-based automated deployments on AWS App Runner).
4. **Git repository** with your CareerCloud codebase.

---

## 2. Step-by-Step AWS Deployment

### Step 1: Deploy Amazon RDS Managed PostgreSQL

1. Open the **Amazon RDS Console** → Click **Create database**.
2. Select **Standard create** → Engine type: **PostgreSQL**.
3. Template: Select **Free tier** (`db.t4g.micro` or `db.t3.micro`).
4. Settings:
   * DB instance identifier: `careercloud-db`
   * Master username: `careeradmin`
   * Master password: `ChooseAStrongPassword123!`
5. Connectivity:
   * Public access: **Yes** (for easiest testing from your backend container).
   * VPC Security Group: Create new, allowing inbound traffic on port `5432`.
6. Initial database name: Under **Additional configuration**, enter `careercloud`.
7. Click **Create database**. Note down your **Endpoint** (e.g. `careercloud-db.c9xxx.us-east-1.rds.amazonaws.com`).

---

### Step 2: Create Amazon S3 Private Resume Bucket

1. Open the **Amazon S3 Console** → Click **Create bucket**.
2. Bucket name: Enter a globally unique name, e.g., `careercloud-resumes-[your-student-id]`.
3. AWS Region: Select `us-east-1` (or your nearest region).
4. **Block Public Access settings for this bucket**: Keep **Block all public access** CHECKED.
5. Default encryption: **Server-side encryption with Amazon S3 managed keys (SSE-S3)**.
6. Click **Create bucket**.

---

### Step 3: Deploy Backend on AWS App Runner

**AWS App Runner** is a fully managed service that makes it easy to build and run containerized web applications without configuring servers.

1. Open the **AWS App Runner Console** → Click **Create service**.
2. **Source type**:
   * Option A (Easiest): **Source code repository** → Connect your GitHub repo → Branch: `main` → Directory: `/` (or `/backend`).
   * Option B: **Container registry** (Push your Docker image to Amazon ECR).
3. Build settings (if using GitHub):
   * Runtime: **Python 3**.
   * Build command: `pip install -r backend/requirements.txt`.
   * Start command: `uvicorn backend.app.main:app --host 0.0.0.0 --port 8000`.
   * Port: `8000`.
4. Configure service environment variables:
   * `ENVIRONMENT`: `production`
   * `DEBUG`: `False`
   * `SECRET_KEY`: `production-super-secret-key-replace-with-random-hex`
   * `DATABASE_URL`: `postgresql://careeradmin:ChooseAStrongPassword123!@[your-rds-endpoint]:5432/careercloud`
   * `STORAGE_TYPE`: `s3`
   * `AWS_S3_BUCKET_NAME`: `careercloud-resumes-[your-student-id]`
   * `AWS_REGION`: `us-east-1`
   * `CORS_ORIGINS`: `*`
5. Click **Create & Deploy**. App Runner will provide an HTTPS endpoint (e.g. `https://xyz123.us-east-1.awsapprunner.com`).
6. Test your health check: Open `https://xyz123.us-east-1.awsapprunner.com/health` in your browser.

---

### Step 4: Deploy Frontend on AWS Amplify

1. Open the **AWS Amplify Console** → Click **Host web app**.
2. Connect your GitHub repository → Select the repository and `main` branch.
3. Build settings: Amplify will auto-detect Vite. Ensure the app root is set to `frontend`:
   ```yaml
   version: 1
   frontend:
     phases:
       preBuild:
         commands:
           - cd frontend
           - npm ci
       build:
         commands:
           - npm run build
     artifacts:
       baseDirectory: frontend/dist
       files:
         - '**/*'
     cache:
       paths:
         - frontend/node_modules/**/*
   ```
4. Set Frontend Environment Variable:
   * `VITE_API_URL`: `https://xyz123.us-east-1.awsapprunner.com`
5. Click **Save and Deploy**. Amplify will build and assign an SSL domain (e.g. `https://main.d123456.amplifyapp.com`).

---

## 3. Seed Production Cloud Database

To seed initial companies, students, and demo accounts on your cloud database:
Run the seed script from your local machine pointing to the cloud database:

```powershell
$env:DATABASE_URL="postgresql://careeradmin:ChooseAStrongPassword123!@[your-rds-endpoint]:5432/careercloud"
.\venv\Scripts\python.exe backend\seed.py
```

---

## 4. Teardown Guide (Avoid Unwanted AWS Charges!)

Once your capstone project presentation and evaluation is complete, follow this checklist to delete all demo resources:

### 1. Delete AWS App Runner Service
* Open App Runner Console → Select service → Click **Actions** → **Delete**.

### 2. Delete Amazon RDS Database Instance
* Open RDS Console → Select `careercloud-db` → Click **Actions** → **Delete**.
* **Uncheck** "Create final snapshot" and **Check** "I acknowledge..." to terminate immediately.

### 3. Delete Amazon S3 Bucket
* Open S3 Console → Select `careercloud-resumes-[your-student-id]` → Click **Empty** → Confirm deletion of objects.
* Click **Delete bucket**.

### 4. Delete AWS Amplify App
* Open Amplify Console → Select CareerCloud app → Click **App settings** → **Delete app**.

**Cost Summary**: Following this guide ensures your total AWS expenditure for the capstone demo is either **$0.00** (under Free Tier) or under **$1.50** for a few hours of demonstration.
