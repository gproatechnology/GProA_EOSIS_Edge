# EDGE Document Processor Deployment Guide

## 🚀 Quick Deploy to Render (Step-by-Step)

**Time:** ~15 minutes  
**Cost:** Free tier available

---

## Option A: Manual Deployment (Recommended for Learning)

Follow the detailed checklist: **[RENDER_STEP_BY_STEP.md](RENDER_STEP_BY_STEP.md)**

### TL;DR Version:

1. **Backend** → New Web Service → Python → build: `cd backend && pip install -r requirements.txt` → start: `cd backend && uvicorn server:app --host 0.0.0.0 --port $PORT` → add env vars (OPENAI_API_KEY, MONGO_URL, DB_NAME, CORS_ORIGINS=`*`)
2. Wait for Live → verify `/api/` returns JSON
3. **Frontend** → New Web Service → Node → build: `cd frontend && npm install && npm run build` → start: `npx serve -s build -l $PORT` → add env var `REACT_APP_BACKEND_URL=gproa-edge-backend.onrender.com`
4. Wait for Live → verify app loads
5. **CORS** → Update backend `CORS_ORIGINS` to frontend URL → redeploy backend
6. **Test** → Create project, upload file, process, export

---

## Option B: Blueprint Deployment (Automated)

If you want automated deployment of both services at once:

```bash
# Install Render CLI
npm install -g @render/cli

# Login
render login

# Apply blueprint (will ask for confirmation per service)
render blueprint apply
```

⚠️ Blueprint requires all environment variables up front. Manual deployment gives you control to test each service independently.

---

## Environment Variables

### Backend (Required)

| Variable | Description | Where to get |
|----------|-------------|---------------|
| `OPENAI_API_KEY` | OpenAI API key for GPT-4o | https://platform.openai.com/api-keys |
| `MONGO_URL` | MongoDB Atlas connection string | Atlas → Connect → Driver |
| `DB_NAME` | Database name | Any name, e.g., `gproa_edge` |
| `CORS_ORIGINS` | Allowed frontend origins | Start with `*`, then restrict to frontend URL |

### Frontend (Required)

| Variable | Description | Value format |
|----------|-------------|--------------|
| `REACT_APP_BACKEND_URL` | Backend service hostname | `gproa-edge-backend.onrender.com` (no https://) |

---

## Verification Checklist

After部署 (deployment):

- [ ] Backend URL returns `{"message":"EDGE Document Processor API v2"}` at `/api/`
- [ ] Frontend URL loads React app (no console errors)
- [ ] Can create a project from UI
- [ ] Can upload a `.txt` file
- [ ] "Procesar Proyecto EDGE" button starts batch job
- [ ] Progress modal shows percentage completion
- [ ] After completion, "Datos Extraídos" tab shows data
- [ ] "Compliance EDGE" tab shows validation
- [ ] Excel export downloads a valid `.xlsx` file

---

## Local Testing First (Optional)

```bash
# Backend
cd backend
pip install -r requirements.txt
cp .env.example .env  # Edit with your values
uvicorn server:app --reload --port 8000

# Frontend (new terminal)
cd frontend
npm install
npm start
```

Visit:
- API: http://localhost:8000/api/
- App: http://localhost:3000

---

## Common Issues

| Symptom | Likely Cause | Fix |
|---------|--------------|-----|
| Backend build fails | `requirements.txt` missing package | Check logs → `pip install <missing-package>` |
| Frontend blank page | Build failed | Check logs → maybe npm cache issue → redeploy |
| CORS error in browser | `CORS_ORIGINS` doesn't match frontend URL | Update to exact frontend URL (https://...) |
| 502 Bad Gateway | Backend crashed on start | Check logs for import errors or missing env vars |
| File upload fails | MongoDB connection refused | Verify `MONGO_URL` is correct and Atlas allows your IP |
| AI never responds | `EMERGENT_LLM_KEY` invalid/expired |Verify key at emergent.sh |
| Very slow | Free tier CPU throttling | Upgrade to paid plan |

---

## Architecture on Render

```
                        ┌─────────────────────┐
                        │   Render.com        │
                        │   (Hosting Platform)│
                        └──────────┬──────────┘
                                   │
                    ┌──────────────┴──────────────┐
                    │                             │
          ┌─────────▼─────────┐        ┌─────────▼─────────┐
          │  Backend Service │        │  Frontend Service │
          │  (Python/FastAPI)│        │  (React/Node)     │
          │  Port: $PORT     │        │  Port: $PORT      │
          │  URL: ...onrender.com   │  URL: ...onrender.com   │
          └─────────┬─────────┘        └─────────┬─────────┘
                    │                             │
                    └──────────────┬──────────────┘
                                   │
                        ┌──────────▼──────────┐
                        │   MongoDB Atlas     │
                        │   (Cloud Database)  │
                        └─────────────────────┘
```

Services communicate via HTTP:
- Frontend → Backend: `https://gproa-edge-backend.onrender.com/api/...`
- Backend → GPT-4o: OpenAI API
- Backend → MongoDB: Atlas connection

---

## Costs (Free Tier)

| Service | Free Tier Hours | Notes |
|---------|----------------|-------|
| Backend (Python) | 750 hrs/month | ~31 days continuous |
| Frontend (Node) | 750 hrs/month | ~31 days continuous |
| MongoDB Atlas | 512 MB storage | Free forever |
| **Total** | **$0/month** | ⚠️ Services sleep after 15 min inactivity |

To avoid sleep: Keep a minimum of 1 service always active (requires paid plan, ~$7/month per service).

---

## Support

- Render Docs: https://render.com/docs
- GitHub Issues: https://github.com/gproatechnology/GProA_EOSIS_Edge/issues
- EDGE Certification: https://edgebuildings.com

---

**Last Updated:** 2025-04-27  
**Version:** 1.0  
**Status:** Ready for deployment
