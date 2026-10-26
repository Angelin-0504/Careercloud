from typing import List, Dict, Any, Tuple
import re
from backend.app.models.student import StudentProfile
from backend.app.models.job import Job

# Canonical Skill Synonyms & Aliases Map
SKILL_ALIASES: Dict[str, List[str]] = {
    "python": ["python", "python3", "python 3", "py", "fastapi", "django", "flask"],
    "java": ["java", "core java", "java 8", "java 11", "java 17", "j2ee", "spring", "spring boot", "springboot"],
    "sql": ["sql", "mysql", "postgresql", "postgres", "sqlite", "oracle", "plsql", "pl/sql", "rdbms", "database", "relational database"],
    "react": ["react", "react.js", "reactjs", "react native", "frontend", "redux"],
    "javascript": ["javascript", "js", "typescript", "ts", "es6", "node", "nodejs", "node.js"],
    "aws": ["aws", "amazon web services", "cloud", "cloud computing", "ec2", "s3", "cloud practitioner"],
    "docker": ["docker", "containers", "containerization", "kubernetes", "k8s"],
    "linux": ["linux", "ubuntu", "unix", "bash", "shell"],
    "c++": ["c++", "cpp", "c/c++"],
    "git": ["git", "github", "gitlab", "version control"],
    "machine learning": ["machine learning", "ml", "ai", "artificial intelligence", "deep learning", "pandas", "data science"],
    "data science": ["data science", "pandas", "numpy", "scikit-learn", "analytics", "sql"]
}

class JobMatchingService:
    """
    Explainable Rule-Based Job Matching & Eligibility Algorithm.
    Equipped with intelligent skill canonicalization, fuzzy alias matching,
    and LinkedIn/Naukri-style transparency.
    
    Weights:
      - Skills match: 50 points
      - Department compatibility: 20 points
      - CGPA eligibility & compatibility: 15 points
      - Graduation year eligibility: 15 points
    """

    @staticmethod
    def _parse_list(val: str) -> List[str]:
        if not val:
            return []
        items = [item.strip() for item in val.replace("[", "").replace("]", "").replace('"', '').split(",") if item.strip()]
        return items

    @classmethod
    def _skills_match(cls, req_skill: str, candidate_skills: List[str]) -> bool:
        """
        Smart matching: returns True if candidate has the required skill
        via exact match, canonical alias synonym, or token inclusion.
        """
        r_clean = req_skill.strip().lower()
        
        # 1. Direct match
        if r_clean in candidate_skills:
            return True
            
        # 2. Check canonical alias groups
        for canonical, aliases in SKILL_ALIASES.items():
            # If the required skill belongs to this group
            if r_clean == canonical or r_clean in aliases:
                # Check if candidate has ANY skill in this group
                if any(cand_s in aliases or cand_s == canonical for cand_s in candidate_skills):
                    return True

        # 3. Fuzzy token substring matching (e.g. 'react' in 'react.js' or 'sql' in 'postgresql')
        for cand_s in candidate_skills:
            if r_clean in cand_s or cand_s in r_clean:
                # Avoid trivial matches on 1-letter strings
                if len(r_clean) >= 3 and len(cand_s) >= 3:
                    return True

        return False

    @classmethod
    def calculate_match(cls, student: StudentProfile, job: Job) -> Dict[str, Any]:
        matched_skills: List[str] = []
        missing_skills: List[str] = []
        ineligibility_reasons: List[str] = []
        is_eligible = True
        
        # 1. Skills Evaluation (50 Points)
        raw_job_skills = cls._parse_list(job.required_skills)
        raw_student_skills = cls._parse_list(student.skills)
        student_skills_lower = [s.strip().lower() for s in raw_student_skills]
        
        skills_score = 0.0
        if not raw_job_skills:
            # If no skills specified by job, student receives full 50 points
            skills_score = 50.0
        else:
            for original_skill in raw_job_skills:
                if cls._skills_match(original_skill, student_skills_lower):
                    matched_skills.append(original_skill)
                else:
                    missing_skills.append(original_skill)
            
            proportion = len(matched_skills) / len(raw_job_skills)
            skills_score = round(proportion * 50.0, 1)

        # 2. Department Compatibility (20 Points)
        dept_score = 0.0
        eligible_depts = [d.lower() for d in cls._parse_list(job.eligible_departments)]
        student_dept = student.department.strip().lower() if student.department else ""

        # Common department acronyms mapping
        dept_aliases = {
            "cse": "computer science & engineering",
            "computer science": "computer science & engineering",
            "it": "information technology",
            "ece": "electronics & communication",
            "ds": "data science"
        }

        dept_matched = False
        if not eligible_depts or "all" in eligible_depts or "any" in eligible_depts:
            dept_score = 20.0
            dept_matched = True
        elif student_dept:
            for ed in eligible_depts:
                if student_dept in ed or ed in student_dept:
                    dept_matched = True
                    break
                # Check alias
                for alias_k, alias_v in dept_aliases.items():
                    if (alias_k in student_dept or alias_v in student_dept) and (alias_k in ed or alias_v in ed):
                        dept_matched = True
                        break
                if dept_matched:
                    break

            if dept_matched:
                dept_score = 20.0
            else:
                dept_score = 0.0
                ineligibility_reasons.append(f"Department '{student.department}' is not in eligible departments list")
        else:
            dept_score = 0.0
            ineligibility_reasons.append(f"Department '{student.department}' is not in eligible departments list")

        # 3. CGPA Eligibility (15 Points - Hard Constraint)
        cgpa_score = 0.0
        if job.min_cgpa > 0:
            if student.cgpa < job.min_cgpa:
                is_eligible = False
                ineligibility_reasons.append(
                    f"CGPA {student.cgpa:.2f} is below minimum requirement of {job.min_cgpa:.2f}"
                )
                cgpa_score = 0.0
            else:
                cgpa_score = 15.0
        else:
            cgpa_score = 15.0

        # 4. Graduation Year Eligibility (15 Points - Hard Constraint)
        grad_score = 0.0
        eligible_years = [y.strip() for y in cls._parse_list(job.eligible_graduation_years)]
        if eligible_years:
            student_year_str = str(student.graduation_year).strip()
            if student_year_str in eligible_years or "all" in [y.lower() for y in eligible_years]:
                grad_score = 15.0
            else:
                is_eligible = False
                ineligibility_reasons.append(
                    f"Graduation year ({student.graduation_year}) does not match required batch: {', '.join(eligible_years)}"
                )
                grad_score = 0.0
        else:
            grad_score = 15.0

        total_score = round(skills_score + dept_score + cgpa_score + grad_score, 1)
        total_score = min(100.0, max(0.0, total_score))

        # Generate Explainable Summary
        explanation_parts = []
        if is_eligible:
            explanation_parts.append("You meet all mandatory eligibility criteria.")
        else:
            explanation_parts.append("Not currently eligible due to mandatory constraints.")

        if matched_skills:
            explanation_parts.append(f"Skills matched: {len(matched_skills)} of {len(raw_job_skills)} ({', '.join(matched_skills[:3])}{'...' if len(matched_skills) > 3 else ''}).")
        elif raw_job_skills:
            explanation_parts.append(f"Missing required skills: {', '.join(missing_skills[:3])}.")

        if dept_matched:
            explanation_parts.append(f"Department '{student.department}' matches role requirements.")

        explanation = " ".join(explanation_parts)

        return {
            "job_id": job.id,
            "match_score": total_score,
            "is_eligible": is_eligible,
            "matched_skills": matched_skills,
            "missing_skills": missing_skills,
            "ineligibility_reasons": ineligibility_reasons,
            "skills_score": skills_score,
            "dept_score": dept_score,
            "cgpa_score": cgpa_score,
            "grad_score": grad_score,
            "explanation": explanation
        }

matching_service = JobMatchingService()
