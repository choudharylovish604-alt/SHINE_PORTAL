# 🤖 ML Model Guide — Shine AI Dropout Prediction System

> **Project:** Shine — AI-Based Student Dropout Prediction and Counseling System  
> **Author:** HarshSATHE001  
> **Model Type:** Rule-Based Weighted Scoring (Mock ML)  
> **Serving Framework:** Python + FastAPI  
> **Last Updated:** 2026-04-30

---

## 📌 Table of Contents

1. [Main Purpose](#1-main-purpose)
2. [How the Model Works](#2-how-the-model-works)
3. [Input Features](#3-input-features)
4. [Output Schema](#4-output-schema)
5. [Scoring Logic Breakdown](#5-scoring-logic-breakdown)
6. [Integration with the Full Stack](#6-integration-with-the-full-stack)
7. [Prerequisites to Run the AI Service](#7-prerequisites-to-run-the-ai-service)
8. [Current Limitations](#8-current-limitations)
9. [Scope of Advancement](#9-scope-of-advancement)
10. [API Reference](#10-api-reference)
11. [File Structure](#11-file-structure)

---

## 1. Main Purpose

The ML model is the **core intelligence layer** of the Shine system. Its primary role is:

> **To predict the risk level of a student dropping out of their academic program based on their attendance percentage, academic performance (marks), and fee payment status.**

The output of this model drives:
- Risk scores visible on the **Mentor Dashboard** (sorted highest-risk first)
- The **"Deep Diagnostic Scan"** profile for each student
- Triggering **Counseling Interventions** for high-risk students
- Analytics trends and batch stability metrics

The system is designed to give mentors an early warning system, allowing them to intervene **before** a student actually drops out — making proactive counseling possible rather than reactive.

---

## 2. How the Model Works

The current implementation is a **rule-based weighted scoring engine** — not a trained statistical or neural model. This is intentional for the prototype/MVP phase, allowing the system to be fully functional and demonstrable without requiring a training dataset.

The model assigns penalty points based on thresholds for each input feature, adds them up, caps the total at 100, and maps the resulting score to a risk category.

### Risk Category Thresholds:

| Score Range | Risk Category |
|-------------|---------------|
| 0 – 39      | 🟢 Low        |
| 40 – 69     | 🟡 Medium     |
| 70 – 100    | 🔴 High       |

---

## 3. Input Features

The model accepts **3 input features** per student:

| Feature        | Type    | Description                                                  | Example |
|----------------|---------|--------------------------------------------------------------|---------|
| `attendance`   | `float` | Percentage of classes attended (0–100)                      | `72.5`  |
| `marks`        | `float` | Average percentage of marks scored across subjects (0–100)  | `55.0`  |
| `fee_status`   | `bool`  | Whether the student has paid their fees (`true` = paid)     | `false` |

> **Note:** These values are uploaded by mentors via an Excel/CSV file, parsed by the backend, and forwarded to the AI microservice in real-time.

---

## 4. Output Schema

The model returns a JSON response with the following fields:

```json
{
  "risk_score": 60,
  "risk_category": "Medium",
  "reason": "Low attendance, Fees unpaid"
}
```

| Field           | Type     | Description                                                          |
|-----------------|----------|----------------------------------------------------------------------|
| `risk_score`    | `float`  | Numerical score from 0 to 100 (higher = more at-risk)               |
| `risk_category` | `string` | `"Low"`, `"Medium"`, or `"High"`                                     |
| `reason`        | `string` | Human-readable explanation of why the score was assigned             |

---

## 5. Scoring Logic Breakdown

The scoring is additive — each risk factor contributes penalty points:

### Attendance Scoring:
```
attendance < 75%   →  +40 points  (flagged: "Low attendance")
attendance < 85%   →  +15 points  (mild penalty, not flagged)
attendance >= 85%  →   0 points   (good standing)
```

### Marks Scoring:
```
marks < 40%        →  +40 points  (flagged: "Poor academic performance")
marks < 60%        →  +15 points  (mild penalty, not flagged)
marks >= 60%       →   0 points   (good standing)
```

### Fee Status Scoring:
```
fee_status = false →  +20 points  (flagged: "Fees unpaid")
fee_status = true  →   0 points   (no penalty)
```

### Final Score:
```
total_score = min(attendance_penalty + marks_penalty + fee_penalty, 100)
```

### Maximum Possible Scores by Scenario:

| Scenario                               | Score | Category |
|----------------------------------------|-------|----------|
| All good (att ≥ 85, marks ≥ 60, paid) | 0     | Low      |
| Low attendance only                    | 40    | Medium   |
| Poor marks only                        | 40    | Medium   |
| Fees unpaid only                       | 20    | Low      |
| Low att + Poor marks                   | 80    | High     |
| All three risk factors triggered       | 100   | High     |

---

## 6. Integration with the Full Stack

The AI model runs as an **independent Python microservice** (not embedded in the Node.js backend). Here is the data flow:

```
Mentor uploads Excel file
        ↓
Backend (Node.js/Express) parses the file row by row
        ↓
For each student row:
  → Saves academic record to SQLite (records table)
  → Calls AI Service: POST http://localhost:8000/predict
        ↓
AI Service (FastAPI) returns { risk_score, risk_category, reason }
        ↓
Backend stores the result in SQLite (risk table)
        ↓
Mentor Dashboard queries backend → renders sorted risk list
```

### Fallback Behavior:
If the AI service is **unavailable** (e.g., not started), the backend's `aiService.js` returns a **default Medium risk score of 50** to prevent the application from crashing during demos.

```javascript
// aiService.js fallback
return {
  risk_score: 50,
  risk_category: "Medium",
  reason: "AI Service Unavailable - Default Risk"
};
```

---

## 7. Prerequisites to Run the AI Service

### System Requirements:
- **Python** 3.10 or higher
- **pip** (Python package manager)
- (Optional) Docker — for containerized deployment

### Python Dependencies (`ai/requirements.txt`):
```
fastapi==0.104.1
uvicorn==0.24.0.post1
pydantic==2.5.2
```

### Running Locally (Without Docker):

```bash
# Step 1: Navigate to the AI directory
cd ai

# Step 2: (Recommended) Create a virtual environment
python -m venv venv

# Step 3: Activate the virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Step 4: Install dependencies
pip install -r requirements.txt

# Step 5: Start the AI service
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

The service will be available at: `http://localhost:8000`  
Interactive API docs (Swagger UI): `http://localhost:8000/docs`  
Auto-generated ReDoc: `http://localhost:8000/redoc`

### Running with Docker:

```bash
# From project root
docker-compose up --build
```

The AI service Dockerfile uses `python:3.10-slim` and exposes port `8000`.

### Environment Variables (Backend):

The backend uses the following environment variable to locate the AI service:

| Variable        | Default                  | Description                   |
|-----------------|--------------------------|-------------------------------|
| `AI_SERVICE_URL`| `http://localhost:8000`  | URL of the FastAPI AI service |

In Docker Compose, this is set to the service name `http://ai:8000`.

---

## 8. Current Limitations

Understanding what the current model **cannot** do is essential before advancing it:

| Limitation | Details |
|---|---|
| **No real ML training** | The scoring is entirely hand-crafted with fixed thresholds. It does not learn from historical data. |
| **Only 3 features** | Real dropout prediction benefits from many more signals (socioeconomic factors, engagement, mental health proxies, etc.). |
| **No temporal awareness** | The model looks at a single snapshot of data. It cannot detect trends (e.g., a student whose attendance is declining month over month). |
| **No confidence intervals** | There is no uncertainty quantification — the score is deterministic. |
| **No personalization** | The same thresholds are applied to all students regardless of course, year, or institution context. |
| **No continuous learning** | The model cannot improve as counseling outcomes are recorded in the system. |
| **Binary fee status** | Fee status is a single boolean. Partial payments, payment plans, or scholarship status are not considered. |
| **No subject-level granularity** | The attendance from the Excel upload is a single aggregate percentage, not per-subject. (Per-subject data IS stored in the DB via attendance_logs but is not yet fed to the model.) |

---

## 9. Scope of Advancement

This section outlines concrete, actionable paths to evolve the current mock model into a production-grade ML system.

---

### Phase 1 — Enhanced Rule Engine (Short-Term)

> No new libraries needed. Improves accuracy without introducing ML complexity.

- **Add semester trend analysis**: Compare current semester data with previous semesters stored in the `records` table to detect declining trajectories.
- **Add subject-level attendance**: Use the `attendance_logs` table data already being collected. Weight low attendance in core/mandatory subjects more heavily.
- **Add weighted scoring by year**: A 1st-year student with 70% attendance may be more at risk than a 4th-year student with the same score.
- **Add counseling history as a risk modifier**: If a student has multiple past counseling sessions with unresolved issues, increase their risk score.
- **Add configurable thresholds**: Move hardcoded thresholds (75, 85, 40, 60) to a configuration file or database so mentors can tune them per institution.

---

### Phase 2 — Classical Machine Learning (Medium-Term)

> Requires a collected dataset (at minimum ~200–500 labeled student records with known outcomes).

**Recommended Algorithms (in order of recommendation):**

1. **Logistic Regression** — Simple, interpretable, good baseline. Outputs class probabilities.
2. **Random Forest Classifier** — Handles non-linear relationships, provides feature importances. Excellent for tabular data.
3. **Gradient Boosted Trees (XGBoost / LightGBM)** — State-of-the-art for tabular data in academic settings. Highly accurate.
4. **Decision Tree with SHAP explanations** — Best for maintaining explainability (critical in education).

**New Feature Engineering Opportunities:**
- `attendance_trend`: slope of attendance over last N semesters
- `marks_trend`: slope of marks over last N semesters
- `counseling_count`: number of prior interventions
- `subject_failure_count`: number of subjects with marks below passing threshold
- `days_since_last_login`: engagement proxy (if tracked)
- `feedback_sentiment_score`: NLP sentiment of student self-feedback (already stored in `records.student_feedback`)

**Pipeline:**
```
Raw Data → Feature Engineering → Scaler (StandardScaler) → ML Model → Calibrated Probability → Risk Category
```

**Python Libraries to Add:**
```
scikit-learn>=1.3.0
xgboost>=1.7.0
pandas>=2.0.0
numpy>=1.24.0
shap>=0.43.0         # For model explainability
joblib>=1.3.0        # For model serialization
```

---

### Phase 3 — Deep Learning / NLP (Long-Term)

> For institutions with large datasets (10,000+ student records).

- **LSTM / GRU Networks**: Model student trajectories as time-series sequences for semester-over-semester dropout prediction.
- **Transformer-based models**: If rich text data (feedback, notes) is available, fine-tune a small BERT model for dropout risk from counseling notes.
- **Graph Neural Networks**: Model student-peer relationships and social risk factors.
- **Federated Learning**: Enable multiple institutions to collaboratively train a model without sharing raw student data (privacy-preserving ML).

---

### Phase 4 — MLOps & Production Readiness

- **Model Registry**: Version and track models using MLflow or Weights & Biases.
- **A/B Testing**: Run two model versions simultaneously to compare performance on real outcomes.
- **Drift Detection**: Monitor if the incoming data distribution shifts (e.g., post-COVID attendance patterns differ from pre-COVID training data).
- **Automated Retraining Pipeline**: Trigger model retraining when counseling outcomes are marked as resolved in the database, using that ground truth to improve the model.
- **Explainability API**: Return SHAP feature importance values per prediction so the mentor knows exactly *why* a student is flagged.
- **Model Monitoring Dashboard**: Track prediction accuracy, false positive/negative rates, and bias metrics over time.

---

### Recommended Next Step (Immediate Action):

**Upgrade Phase 1** first — specifically:
1. Feed per-subject attendance from `attendance_logs` into the scoring engine.
2. Add semester-over-semester trend detection from the `records` table.
3. Store and surface the SHAP-like "reason" explanations with more granularity in the API response.

This gives measurable improvements with zero additional infrastructure cost.

---

## 10. API Reference

### Endpoint: `POST /predict`

**Base URL:** `http://localhost:8000`

**Request Body:**
```json
{
  "attendance": 72.5,
  "marks": 38.0,
  "fee_status": false
}
```

**Response:**
```json
{
  "risk_score": 100,
  "risk_category": "High",
  "reason": "Low attendance, Poor academic performance, Fees unpaid"
}
```

**cURL Example:**
```bash
curl -X POST "http://localhost:8000/predict" \
  -H "Content-Type: application/json" \
  -d '{"attendance": 72.5, "marks": 38.0, "fee_status": false}'
```

**Health Check:**
```
GET http://localhost:8000/
```

**Interactive Docs:**
```
GET http://localhost:8000/docs       # Swagger UI
GET http://localhost:8000/redoc      # ReDoc UI
```

---

## 11. File Structure

```
Shine/
├── ai/
│   ├── main.py              ← FastAPI app + prediction endpoint (the ML model)
│   ├── requirements.txt     ← Python dependencies
│   ├── Dockerfile           ← Container config (python:3.10-slim, port 8000)
│   └── venv/                ← Local virtual environment (gitignored)
│
├── backend/
│   ├── services/
│   │   └── aiService.js     ← Node.js client that calls the AI microservice
│   ├── controllers/
│   │   └── apiController.js ← uploadData() triggers AI prediction per student
│   ├── db.js                ← SQLite schema (records, risk, counseling tables)
│   └── server.js            ← Express app entry point
│
├── frontend/                ← React + Vite UI (consumes /students, /analytics)
├── docker-compose.yml       ← Orchestrates frontend + backend + ai services
└── ML_MODEL_GUIDE.md        ← This file
```

---

## 📚 References & Further Reading

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Scikit-learn User Guide](https://scikit-learn.org/stable/user_guide.html)
- [XGBoost Documentation](https://xgboost.readthedocs.io/)
- [SHAP — Explainable ML](https://shap.readthedocs.io/)
- [MLflow — ML Lifecycle Management](https://mlflow.org/)
- [Student Dropout Prediction Research (Survey)](https://arxiv.org/abs/2112.00585)

---

> **For LLMs reading this file:** The current model in `ai/main.py` is a deterministic rule-based scoring function, not a trained ML model. It is intentionally simple for rapid prototyping. All feature engineering, model training, and MLOps work described in Section 9 are **not yet implemented** and represent the intended future roadmap. The database schema (SQLite via `db.js`) already stores the necessary raw data to support Phase 1 and Phase 2 improvements without schema changes.
