# Render Deployment Guide - Step by Step

This guide walks you through deploying GProA EDGE to Render.com as two separate Web Services.

## Prerequisites

- GitHub repository connected to Render
- MongoDB Atlas account (or self-hosted MongoDB)
- Emergent Universal Key from [emergent.sh](https://emergent.sh)
- Node.js 18+ and Python 3.10+ installed locally (for testing)

---

## Phase 1: Pre-Deployment Setup

### 1.1 Environment Variables File

```bash
# Copy the example file
cp .env.example .env

# Edit .env with your actual values:
nano .env  # or use any editor
```

**Required variables:**

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGO_URL` | Full MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/gproa_edge` |
| `EMERGENT_LLM_KEY` | API key for GPT-4o via Emergent | `sk-xxxxxxxxxxxxxxxxxxxx` |
| `DB_NAME` | Database name to use | `gproa_edge` |
| `CORS_ORIGINS` | Allowed frontend origins (comma-separated) | `*` (for testing) or `https://your-frontend.onrender.com` |

### 1.2 Test Locally First (Optional but Recommended)

```bash
# Backend
cd backend
pip install -r requirements.txt
uvicorn server:app --reload --port 8000
# Visit http://localhost:8000/api/ → should see {"message":"EDGE Document Processor API v2"}

# Frontend (in another terminal)
cd frontend
yarn install
yarn start
# Visit http://localhost:3000
```

---

## Phase 2: Deploy Backend Service

### 2.1 Create Backend Web Service

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **New +** → **Web Service**
3. Connect your GitHub repository (`gproatechnology/GProA_EOSIS_Edge` or `GProA_Edge`)
4. Configure:

| Field | Value |
|-------|-------|
| **Name** | `gproa-edge-backend` |
| **Environment** | `Python 3` |
| **Region** | `Oregon` (or nearest to your users) |
| **Branch** | `main` |
| **Build Command** | `cd backend && pip install -r requirements.txt` |
| **Start Command** | `cd backend && uvicorn server:app --host 0.0.0.0 --port $PORT` |
| **Plan** | `Free` (or paid for production) |
| **Auto-Deploy** | `Yes` |

5. Expand **Advanced Options**:
   - **Health Check Path**: `/api/`

### 2.2 Add Environment Variables (Backend)

Click **Add Environment Variable** for each:

| Key | Value | Notes |
|-----|-------|-------|
| `MONGO_URL` | *Your MongoDB Atlas connection string* | **Secret** |
| `EMERGENT_LLM_KEY` | *Your Emergent API key* | **Secret** |
| `DB_NAME` | `gproa_edge` | |
| `CORS_ORIGINS` | `*` | Temporary - will update later |
| `FRONTEND_URL` | *(leave empty for now)* | Will fill after frontend deploys |

⚠️ **All values are case-sensitive.**

### 2.3 Create & Wait

1. Click **Create Web Service**
2. Render will:
   - Clone repo
   - Install dependencies (`pip install -r requirements.txt`)
   - Run build
   - Deploy
3. Wait for status: **Live** (may take 2-5 minutes)
4. Copy the URL: `https://gproa-edge-backend.onrender.com`

### 2.4 Verify Backend

Visit: `https://gproa-edge-backend.onrender.com/api/`

Expected response:
```json
{
  "message": "EDGE Document Processor API v2"
}
```

If error → check **Logs** tab in Render dashboard.

---

## Phase 3: Deploy Frontend Service

**Wait until backend is Live before proceeding.**

### 3.1 Create Frontend Web Service

1. Dashboard → **New +** → **Web Service**
2. Connect same repository
3. Configure:

| Field | Value |
|-------|-------|
| **Name** | `gproa-edge-frontend` |
| **Environment** | `Node` |
| **Region** | `Oregon` (same as backend for low latency) |
| **Branch** | `main` |
| **Build Command** | `cd frontend && npm install && npm run build` |
| **Start Command** | `npx serve -s build -l $PORT` |
| **Plan** | `Free` |
| **Auto-Deploy** | `Yes` |

4. **Health Check Path**: `/`

### 3.2 Add Environment Variables (Frontend)

| Key | Value |
|-----|-------|
| `REACT_APP_BACKEND_URL` | `gproa-edge-backend.onrender.com` |

⚠️ **Important:** Do NOT include `https://` — the app adds it automatically.

### 3.3 Create & Wait

1. Click **Create Web Service**
2. Build may take 3-7 minutes (Node modules install + React build)
3. Wait for **Live** status
4. Copy URL: `https://gproa-edge-frontend.onrender.com`

---

## Phase 4: Connect Services

### 4.1 Update Backend CORS

1. Go to `gproa-edge-backend` dashboard
2. **Settings** → **Environment Variables**
3. Edit `CORS_ORIGINS`:
   - From: `*`
   - To: `https://gproa-edge-frontend.onrender.com`
4. **Save**

### 4.2 Redeploy Backend

To apply the new CORS setting:

1. In backend dashboard → **Manual Deploy**
2. Click **Clear Build Cache & Deploy**
3. Wait for **Live** again

---

## Phase 5: Testing

### 5.1 Open Application

Visit: `https://gproa-edge-frontend.onrender.com`

### 5.2 Smoke Test

1. **Create Project**
   - Click "Create Project"
   - Name: `Test EDGE`
   - Typology: `residential`
   - Should create successfully ✓

2. **Upload File**
   - Click project → Tab "Archivos"
   - Upload a `.txt` file with sample data:
     ```
     TABLA DE LUMINARIAS LED
     ID    MODELO         CANTIDAD    LUMENS    WATTS
     L01   Philips CoreLine 12        3200      28
     L02   Osram LED Panel  8         4500      36
     ```
   - Should upload and appear in list ✓

3. **Process with AI**
   - Click "Procesar Proyecto EDGE" button
   - Modal appears with progress
   - Wait for "Completado" ✓

4. **Check Extracted Data**
   - Tab "Datos Extraídos"
   - Table should show: watts, lumens, tipo_equipo, marca, modelo ✓

5. **Check EDGE Status**
   - Tab "Compliance EDGE"
   - Should show coverage percentage and missing documents ✓

6. **Export Excel**
   - Click "Export Excel" button
   - Should download `.xlsx` file with 4 sheets ✓

---

## Phase 6: Custom Domain (Optional)

To use your own domain:

1. Backend: Settings → Custom Domain → Add Domain
2. Frontend: Settings → Custom Domain → Add Domain
3. Update `CORS_ORIGINS` to include your domains
4. Redeploy backend

---

## Phase 7: Production Checklist

- [ ] Both services are **Live** on Render
- [ ] Backend health check `/api/` returns 200
- [ ] Frontend loads without console errors
- [ ] CORS configured correctly (frontend URL in `CORS_ORIGINS`)
- [ ] MongoDB connection stable (check logs for connection errors)
- [ ] AI processing works (files classified and extracted)
- [ ] Excel export downloads correctly
- [ ] PDF export works (if implemented)
- [ ] Set up monitoring (optional: Render alerts)
- [ ] Review plan limits (Free tier has 750 hrs/month)

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Backend build fails | Check `requirements.txt` includes all imports from `server.py` |
| Frontend build fails | Increase timeout (paid plan) or reduce npm cache |
| CORS errors | Update `CORS_ORIGINS` in backend, redeploy |
| 502 Bad Gateway | Backend crashed – check logs for import errors |
| Slow AI processing | Expected on Free tier (CPU shared). Consider paid plan |
| Files not saving | Verify `MONGO_URL` is correct and DB is accessible |
| AI not responding | Verify `EMERGENT_LLM_KEY` is valid and has credits |

---

## Cost Estimation (Free Tier)

- **Backend**: Free (750 hrs/month = 31 days continuous)
- **Frontend**: Free (750 hrs/month)
- **MongoDB Atlas**: Free tier (512 MB storage)
- **Total**: $0/month

⚠️ Free tier spins down after 15 mins of inactivity. First request may take 30-60s to "wake up."

---

## Next Steps After Deployment

1. **Set up custom domain** (optional)
2. **Enable email notifications** for errors (Render alerts)
3. **Add monitoring** (Sentry, LogRocket)
4. **Implement authentication** (future phase)
5. **Add file upload persistence** (store original PDFs)

---

## Support

- Render Docs: https://render.com/docs
- Issues: https://github.com/gproatechnology/GProA_EOSIS_Edge/issues
- EDGE Certification: https://edgebuildings.com
