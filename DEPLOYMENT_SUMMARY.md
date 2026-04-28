# GProA EDGE - Deployment Summary

## 📦 Repository: https://github.com/gproatechnology/GProA_EOSIS_Edge.git

---

## ✅ Files Added/Modified for Render Deployment

### New Documentation Files
- **`RENDER_STEP_BY_STEP.md`** — Detailed manual deployment guide (checklist format)
- **`ENV_SETUP.md`** — Environment variables setup (MongoDB, OpenAI key)
- **`DEPLOY.md`** — Quick deployment reference card
- **`TESTING_CHECKLIST.md`** — Post-deployment verification checklist
- **`RENDER_DEPLOY.md`** — Original comprehensive deployment guide

### Scripts
- **`verify-deployment.sh`** — Bash health check script (run after deployment)
- **`pre-deploy-check.ps1`** — PowerShell pre-deployment validator (Windows)
- **`.github/workflows/deploy.yml`** — GitHub Actions auto-deploy (optional)

### Configuration
- **`.env.example`** — Environment variables template (backend)
- **`render-cli-config.yaml`** — Render CLI configuration reference
- **`render.yaml`** — Blueprint file (if you want automated deploy later)

---

## 🚀 Quick Start: 5-Minute Deployment

### Step 1: Prepare
```bash
# Clone your repo
git clone https://github.com/gproatechnology/GProA_EOSIS_Edge.git
cd GProA_EOSIS_Edge

# Create .env (for local testing)
cp .env.example .env
# Edit .env with your MongoDB URL and OpenAI API key
```

### Step 2: Render Dashboard — Create Backend

1. Go to https://dashboard.render.com → New → Web Service
2. Connect: `gproatechnology/GProA_EOSIS_Edge` (or your fork)
3. Settings:

| Field | Value |
|-------|-------|
| Name | `gproa-edge-backend` |
| Environment | Python 3 |
| Region | Oregon |
| Build Command | `cd backend && pip install -r requirements.txt` |
| Start Command | `cd backend && uvicorn server:app --host 0.0.0.0 --port $PORT` |
| Plan | Free |

4. Environment Variables (add all):

| Key | Value |
|-----|-------|
| `OPENAI_API_KEY` | *Your OpenAI API key* |
| `MONGO_URL` | *Your MongoDB Atlas URI* |
| `DB_NAME` | `gproa_edge` |
| `CORS_ORIGINS` | `*` |
| `FRONTEND_URL` | *(leave empty)* |

5. Click **Create Web Service**
6. Wait → **Live** → Copy URL: `https://gproa-edge-backend.onrender.com`

### Step 3: Render Dashboard — Create Frontend

1. New → Web Service (same repo)
2. Settings:

| Field | Value |
|-------|-------|
| Name | `gproa-edge-frontend` |
| Environment | Node |
| Region | Oregon |
| Build Command | `cd frontend && npm install && npm run build` |
| Start Command | `npx serve -s build -l $PORT` |
| Plan | Free |

3. Environment Variables:

| Key | Value |
|-----|-------|
| `REACT_APP_BACKEND_URL` | `gproa-edge-backend.onrender.com` |

4. Click **Create Web Service**
5. Wait → **Live** → Copy URL: `https://gproa-edge-frontend.onrender.com`

### Step 4: Connect (CORS)

1. Backend service → Settings → Environment Variables
2. Edit `CORS_ORIGINS`: change from `*` to:
   ```
   https://gproa-edge-frontend.onrender.com
   ```
3. Save → Manual Deploy → Clear Build Cache & Deploy
4. Wait for **Live**

### Step 5: Test

Open frontend URL. Create project → upload text file → "Procesar Proyecto EDGE" → check tabs.

Full checklist: **[RENDER_STEP_BY_STEP.md](RENDER_STEP_BY_STEP.md)**

---

## 📁 File Structure (Deployment-Ready)

```
GProA_EOSIS_Edge/
├── backend/
│   ├── server.py              # FastAPI app (817 lines)
│   ├── edge_rules.py          # EDGE WBS rules (320 lines)
│   ├── edge_processors.py     # Specialized AI processors (271 lines)
│   ├── pdf_generator.py       # PDF export (reportlab)
│   ├── requirements.txt       # 127 Python dependencies
│   └── Dockerfile             # Container image (optional)
├── frontend/
│   ├── src/
│   │   ├── App.js            # Main router + API base URL
│   │   ├── components/       # 8 React components
│   │   └── App.css           # Global styles
│   ├── package.json          # Node dependencies
│   ├── craco.config.js       # CRA override
│   ├── Dockerfile            # Container image
│   └── README.md             # CRA default
├── .github/
│   └── workflows/
│       └── deploy.yml        # Auto-deploy via GitHub Actions
├── .env.example              # ← Environment template
├── render.yaml               # ← Blueprint (auto-deploy both)
├── render-cli-config.yaml    # ← CLI reference config
├── verify-deployment.sh      # ← Health check script
├── pre-deploy-check.ps1      # ← Pre-flight checklist (Windows)
├── RENDER_STEP_BY_STEP.md   # ← **MAIN GUIDE** (use this)
├── ENV_SETUP.md             # ← Env vars deep dive
├── DEPLOY.md                # ← Quick reference card
├── TESTING_CHECKLIST.md     # ← Post-deploy QA
└── README.md                # ← Updated with deployment section
```

---

## 🔐 Environment Variables — Quick Reference

### Backend (Render Service)
```bash
OPENAI_API_KEY      # OpenAI API key for GPT-4o (Secret)
MONGO_URL           # MongoDB Atlas connection (Secret)
DB_NAME             # gproa_edge
CORS_ORIGINS        # * → then change to frontend URL
```

### Frontend (Render Service)
```bash
REACT_APP_BACKEND_URL   # gproa-edge-backend.onrender.com (no https://)
```

---

## 🎯 Expected URLs After Deployment

| Service | URL Pattern | Example |
|---------|-------------|---------|
| Backend API | `https://gproa-edge-backend.onrender.com/api/` | Health check |
| Backend Docs | `https://gproa-edge-backend.onrender.com/docs` | Swagger UI |
| Frontend App | `https://gproa-edge-frontend.onrender.com` | React app |

---

## ✅ Verification Checklist

After both services are live, run:

```bash
# Option 1: Automated script
./verify-deployment.sh https://gproa-edge-backend.onrender.com https://gproa-edge-frontend.onrender.com

# Option 2: Manual curl tests
curl https://gproa-edge-backend.onrender.com/api/
# Should return: {"message":"EDGE Document Processor API v2"}
```

Then **[TESTING_CHECKLIST.md](TESTING_CHECKLIST.md)** for full QA.

---

## 🆘 Troubleshooting

| Issue | Fix |
|-------|-----|
| Backend build fails | Check `requirements.txt` includes all imports from `server.py` |
| Frontend build fails (npm timeout) | Free tier has 15 min timeout. If npm install takes longer, upgrade to paid plan |
| CORS errors | Update `CORS_ORIGINS` to exact frontend URL (https://... no trailing slash) |
| 502 Bad Gateway | Backend crashed — check Logs tab for import errors or missing env vars |
| Upload fails | Check MongoDB connection in backend logs |
| AI doesn't respond | Check `EMERGENT_LLM_KEY` is valid (logs show auth errors) |
| Very slow | Free tier CPU is shared. Consider paid plan for production |

---

## 💰 Cost (Free Tier)

| Service | Free Hours | Notes |
|---------|------------|-------|
| Backend (Python) | 750 hrs/month | ~31 days continuous |
| Frontend (Node) | 750 hrs/month | ~31 days continuous |
| MongoDB Atlas | 512 MB | Free forever |
| **Total** | **$0** | ⚠️ Sleeps after 15 min inactive |

---

## 📚 Documentation Index

| File | Purpose |
|------|---------|
| **RENDER_STEP_BY_STEP.md** | ⭐ Main deployment guide (use this) |
| ENV_SETUP.md | MongoDB + Emergent key setup |
| DEPLOY.md | Quick reference (1-page) |
| TESTING_CHECKLIST.md | QA after deployment |
| verify-deployment.sh | Automated health check script |
| pre-deploy-check.ps1 | Windows pre-flight check |

---

## 🎬 Next Steps After Success

1. **Update `README.md`** with your deployed URLs
2. **Set up custom domain** (optional): api.gproa.com, app.gproa.com
3. **Add team collaborators** on Render dashboard
4. **Configure monitoring**: Render alerts, error tracking
5. **Secure CORS**: Change `CORS_ORIGINS` from `*` to your frontend URL
6. **Plan upgrade**: If you need always-on (no sleep), upgrade to paid plan ($7/month/service)

---

## 🎯 One-Page Summary (TL;DR)

**2 services:**
1. Backend: Python, `uvicorn server:app`, env: `MONGO_URL`, `EMERGENT_LLM_KEY`, `DB_NAME=gproa_edge`, `CORS_ORIGINS=*`
2. Frontend: Node, `npm run build` + `serve -s build`, env: `REACT_APP_BACKEND_URL=<backend-hostname>`

**Order:** Backend first → get URL → Frontend second → use that URL → Update CORS → Redeploy backend → Test.

**Full guide:** See `RENDER_STEP_BY_STEP.md`

---

**Status:** Repository ready for deployment ✅  
**Last updated:** 2025-04-27  
**Repo:** https://github.com/gproatechnology/GProA_EOSIS_Edge.git
