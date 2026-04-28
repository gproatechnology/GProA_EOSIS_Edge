# EDGE Document Processor

[![Tests](https://github.com/gproatechnology/GProA_Edge/workflows/CI/badge.svg)](https://github.com/gproatechnology/GProA_Edge/actions)
[![Backend Tests](https://img.shields.io/badge/Backend-100%25-brightgreen.svg)]()
[![Frontend Tests](https://img.shields.io/badge/Frontend-95%25-brightgreen.svg)]()

## 🚀 AI-Powered EDGE Certification Document Manager

**EDGE Document Processor** is an intelligent platform for EDGE certification projects. Upload construction documents (plans, spec sheets, photos), and GPT-4o automatically:
- Classifies into EDGE categories (DESIGN, ENERGY, WATER, MATERIALS)
- Extracts data (watts, lumens, equipment, brand/model)
- Calculates areas from floor plans
- Validates completeness (missing docs per measure)
- Generates Excel exports

MVP complete with 100% backend tests, 95% frontend tests.

## ✨ Features
- ✅ Project CRUD & management
- ✅ Multi-file upload with AI processing pipeline
- ✅ EDGE classification + measure detection
- ✅ Technical data extraction + area calculations
- ✅ Real-time EDGE status dashboard (categories, measures, gaps)
- ✅ Professional UI (React 19 + Tailwind + Shadcn)
- ✅ Excel export (data + areas sheets)

## 🛠 Tech Stack
![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)
![React](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react)
![MongoDB](https://img.shields.io/badge/MongoDB-4DB33D?style=for-the-badge&logo=mongodb)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-38B2AC?style=for-the-badge&logo=tailwind-css)
![GPT-4o](https://img.shields.io/badge/OpenAI-GPT--4o-orange?style=for-the-badge&logo=openai)

## 🏗️ Architecture

```mermaid
graph TB
    FE[React Frontend] -->|REST API| API[FastAPI Server]
    API -->|Persist| DB[MongoDB]
    API -->|Classify/Extract/Validate| LLM[GPT-4o]
    LLM -->|JSON| API
    DB -->|Query| API
    API -->|Data/Status/Export| FE
```

## 🔄 Document Processing Flow

```mermaid
flowchart TD
    A[File Upload] --> B[Text Extraction]
    B --> C[AI Classify<br/>Category + Measure]
    C --> D[AI Extract<br/>watts, lumens, equipo...]
    D --> E{doc_type == 'plano' ?}
    E -->|Yes| F[AI Calc Areas]
    E -->|No| G[AI Validation<br/>Missing Docs]
    F --> G
    G --> H[Store in DB]
    H --> I[Dashboard + Excel Export]

    classDef startEnd fill:#e1f5fe
    classDef ai fill:#fff3e0
    classDef db fill:#f3e5f5
    class A,I startEnd
    class C,D,F,G ai
    class H db
```

## 🎯 Screenshots
![Dashboard](./screenshots/dashboard.png)
![File Upload](./screenshots/upload.png)
![EDGE Status](./screenshots/status.png)
*(Run locally to generate screenshots)*

## 🚀 Quick Start

### Prerequisites
- MongoDB (local or Atlas)
- [Emergent Universal Key](https://emergent.sh) for GPT-4o
- Python 3.10+, Node 18+, Yarn

### Local Development

**Backend:**
```bash
cd backend
pip install -r requirements.txt
cp .env.example .env  # Add MONGO_URL, EMERGENT_LLM_KEY
uvicorn server:app --reload --port 8000
```
API docs: [http://localhost:8000/docs](http://localhost:8000/docs)

**Frontend:**
```bash
cd frontend
yarn install
yarn start
```
App: [http://localhost:3000](http://localhost:3000)

---

## ☁️ Deployment to Render

Deploy this application to Render.com as two separate Web Services (Backend + Frontend).

**⏱️ Time:** ~15 minutes  
**💰 Cost:** Free tier available (750 hrs/month each)

### 📋 Step-by-Step Guide

See **[RENDER_STEP_BY_STEP.md](RENDER_STEP_BY_STEP.md)** for detailed instructions.

**Quick summary:**
1. **Backend Service** — Python 3, build: `cd backend && pip install -r requirements.txt`, start: `cd backend && uvicorn server:app --host 0.0.0.0 --port $PORT`
2. **Frontend Service** — Node, build: `cd frontend && npm install && npm run build`, start: `npx serve -s build -l $PORT`
3. Set environment variables (see below)
4. Update CORS and redeploy
5. Test full flow

### 🔑 Required Environment Variables

#### Backend
| Variable | Description | Example |
|----------|-------------|---------|
| `MONGO_URL` | MongoDB Atlas connection string | `mongodb+srv://user:pass@cluster.mongodb.net/gproa_edge?retryWrites=true&w=majority` |
| `EMERGENT_LLM_KEY` | Emergent API key for GPT-4o | `sk-xxxxxxxxxxxxxxxx` |
| `DB_NAME` | Database name | `gproa_edge` |
| `CORS_ORIGINS` | Allowed frontend origins | `*` (dev) or `https://frontend.onrender.com` (prod) |

#### Frontend
| Variable | Description | Value format |
|----------|-------------|--------------|
| `REACT_APP_BACKEND_URL` | Backend service hostname | `gproa-edge-backend.onrender.com` (no `https://`) |

⚠️ **Important:** Do NOT include `https://` in `REACT_APP_BACKEND_URL` — the frontend adds it automatically.

See **[ENV_SETUP.md](ENV_SETUP.md)** for detailed environment configuration (MongoDB Atlas, Emergent key, etc.).

---

## ✅ Testing After Deployment

After deploying to Render, run the verification script:

```bash
# Clone the verification script to your local machine
curl -O https://raw.githubusercontent.com/gproatechnology/GProA_EOSIS_Edge/main/verify-deployment.sh
chmod +x verify-deployment.sh

# Run with your URLs
./verify-deployment.sh https://gproa-edge-backend.onrender.com https://gproa-edge-frontend.onrender.com
```

Or manually test:

1. **Backend health:** `GET https://...onrender.com/api/` → should return JSON
2. **Frontend loads:** Open frontend URL in browser
3. **Full flow:** Create project → upload file → process → export

See **[RENDER_STEP_BY_STEP.md](RENDER_STEP_BY_STEP.md)** for complete testing checklist.

---

## 🗺️ Roadmap (from PRD)
### Phase 2 (P1)
- Google Drive auto-sync
- PDF OCR support
- Batch processing progress

### Future (P2)
- ZIP exports
- Multi-user auth
- Real-time collab
- Advanced CV analysis

## 📁 Project Structure
```
GProA_Edge/
├── backend/          # FastAPI + MongoDB + GPT-4o
├── frontend/         # React + Tailwind + Shadcn UI
├── memory/PRD.md     # Product Requirements
├── test_reports/     # Test results (95-100%)
└── README.md         # This file
```

## 🤝 Contributing
1. Fork & clone
2. Create feature branch
3. `black . && yarn lint`
4. Test: `pytest backend/` & `yarn test`
5. PR to `main`

## 📄 License
MIT

## 🙏 Acknowledgments
- [EDGE Certification](https://edgebuildings.com/)
- [Emergent Integrations](https://emergent.sh)
- [Shadcn UI](https://ui.shadcn.com/)

---
⭐ Star us on GitHub!

