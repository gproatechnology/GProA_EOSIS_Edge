# GProA EDGE - Render Deployment Checklist
# Follow this step-by-step to deploy on Render.com

## BEFORE YOU START

☐ GitHub repository is ready (this repo: gproatechnology/GProA_EOSIS_Edge)
☐ MongoDB Atlas cluster created and connection string available
☐ Emergent Universal Key obtained from https://emergent.sh
☐ Tested locally (optional but recommended): `uvicorn server:app --reload` works

---

## STEP 1: Create BACKEND Service

**Render Dashboard → New + → Web Service**

| Field | Value |
|-------|-------|
| Service Name | `gproa-edge-backend` |
| Environment | `Python 3` |
| Region | `Oregon` (or closest) |
| Branch | `main` |
| Build Command | `cd backend && pip install -r requirements.txt` |
| Start Command | `cd backend && uvicorn server:app --host 0.0.0.0 --port $PORT` |
| Plan | `Free` (or paid) |
| Auto-Deploy | `Yes` |

**Advanced:**
- Health Check Path: `/api/`

**Environment Variables (Add ALL):**

| Key | Value | Important |
|-----|-------|-----------|
| `MONGO_URL` | *your MongoDB Atlas URI* | 🔒 **SECRET** |
| `EMERGENT_LLM_KEY` | *your Emergent API key* | 🔒 **SECRET** |
| `DB_NAME` | `gproa_edge` | |
| `CORS_ORIGINS` | `*` | ⚠️ Will update later |
| `FRONTEND_URL` | *(leave empty)* | |

**Action:** Click "Create Web Service"

**Wait:** 2-5 minutes until status = **Live**

**Verify:** Open `https://gproa-edge-backend.onrender.com/api/`
Expected: `{"message":"EDGE Document Processor API v2"}`

**Record URL:** `https://gproa-edge-backend.onrender.com` ← You'll need this

---

## STEP 2: Create FRONTEND Service

**Wait until backend is LIVE before continuing.**

**Render Dashboard → New + → Web Service**

| Field | Value |
|-------|-------|
| Service Name | `gproa-edge-frontend` |
| Environment | `Node` |
| Region | `Oregon` (same as backend) |
| Branch | `main` |
| Build Command | `cd frontend && npm install && npm run build` |
| Start Command | `npx serve -s build -l $PORT` |
| Plan | `Free` |
| Auto-Deploy | `Yes` |

**Advanced:**
- Health Check Path: `/`

**Environment Variables:**

| Key | Value |
|-----|-------|
| `REACT_APP_BACKEND_URL` | `gproa-edge-backend.onrender.com` |

⚠️ **Do NOT add `https://`** — the code handles it.

**Action:** Click "Create Web Service"

**Wait:** 3-7 minutes (first build installs all npm packages)

**Verify:** Open the frontend URL shown by Render (e.g., `https://gproa-edge-frontend.onrender.com`)
Should show the React app loading.

**Record URL:** `https://gproa-edge-frontend.onrender.com` ← You'll need this

---

## STEP 3: Connect Services (CORS)

Now we need to tell the backend to accept requests from the frontend.

1. Go to `gproa-edge-backend` dashboard
2. Settings → Environment Variables
3. Find `CORS_ORIGINS`
4. **Change from** `*` **to:**
   ```
   https://gproa-edge-frontend.onrender.com
   ```
5. Click Save

6. Redeploy backend to apply:
   - Manual Deploy → "Clear Build Cache & Deploy"
   - Wait for **Live** again

---

## STEP 4: Test Full Flow

Open: `https://gproa-edge-frontend.onrender.com`

**Test Sequence:**

1. ✅ Click "Create Project" → create "Test Project"
2. ✅ Click project name → opens Project Detail
3. ✅ Tab "Archivos" → Click upload area → select a `.txt` file
   - Try this sample LED file content:
     ```
     TABLA DE LUMINARIAS LED
     ID    MODELO         CANT    LUMENS   WATTS
     L01   Philips Core    12      3200     28
     L02   Osram Panel     8       4500     36
     ```
4. ✅ File appears in list with status "pending"
5. ✅ Click "Procesar Proyecto EDGE" button
6. ✅ Modal opens showing progress bar
7. ✅ Wait ~10-30 seconds → "Completado"
8. ✅ Tab "Datos Extraídos" → table shows watts, lumens, tipo_equipo, marca
9. ✅ Tab "Compliance EDGE" → shows coverage and missing documents
10. ✅ (If available) Click "Export Excel" → downloads `.xlsx`

---

## STEP 5: Production Hardening

**CORS:** Keep `CORS_ORIGINS` as the frontend URL (not `*`) for security.

**Custom Domain (optional):**
- Backend: Settings → Custom Domain
- Frontend: Settings → Custom Domain
- Update `CORS_ORIGINS` to include your domain

**Monitoring:**
- Settings → Alerts → Add email for crash/error notifications

**Plan:** Free tier gives 750 hours/month each (enough for 1 service continuously). Both services = 1500 hours total.

---

## TROUBLESHOOTING

| Issue | Check |
|-------|-------|
| Backend 502 | Logs → likely import error in requirements.txt |
| Frontend blank | Logs → build failed? npm install timeout? |
| CORS error | `CORS_ORIGINS` must exactly match frontend URL (https + no trailing slash) |
| Upload fails | Check MongoDB connection in backend logs |
| AI not working | Check `EMERGENT_LLM_KEY` is valid (logs show "Unauthorized") |
| Slow processing | Free tier CPU is shared; consider paid plan |

---

## ROLLBACK

If something goes wrong:

1. Backend: Manual Deploy → "Clear Build Cache & Deploy" (re-runs build)
2. Frontend: Manual Deploy → "Clear Build Cache & Deploy"
3. Check logs for each service
4. Disable Auto-Deploy temporarily while debugging

---

## NEXT STEPS AFTER SUCCESS

- [ ] Update README.md with deployed URLs
- [ ] Set up GitHub repository (if not already)
- [ ] Add team members as collaborators on Render
- [ ] Configure backup MongoDB ( Atlas backup )
- [ ] Set up error monitoring (Sentry)
- [ ] Add authentication (future phase)
- [ ] Enable custom domain with SSL

---

## QUICK REFERENCE

**Backend API:** `https://gproa-edge-backend.onrender.com/api/`
**Frontend URL:** `https://gproa-edge-frontend.onrender.com`
**Health Check:** `https://gproa-edge-backend.onrender.com/api/` → 200 OK

**Render Dashboard:** https://dashboard.render.com

---

Questions? Check README.md or open an issue on GitHub.
