# Guía de Despliegue en Render (Web Service - Gratis)

Render cobra si usas **Blueprint**. Esta guía es para deployar **manual como Web Service** (sin costo).

---

## Requisitos Previos

1. Cuenta en [Render.com](https://render.com)
2. Repo clonado en GitHub: `https://github.com/gproatechnology/GProA_Edge.git`
3. MongoDB (Atlas gratuito o local con tunneling)

---

## Paso 1: Crear Base de Datos MongoDB (Gratis)

### Opción A: MongoDB Atlas (Recomendado)
1. Ve a [Atlas](https://www.mongodb.com/cloud/atlas)
2. Crea cuenta gratuita
3. Create Free Cluster:
   - Provider: AWS
   - Region: Oregon (us-west-2)
   - Cluster Name: `gproa-edge`
4. Create Database User:
   - Username: `gproa_user`
   - Password: `contraseña_segura`
5. Network Access: Add IP `0.0.0.0/0` (allow all)
6. Copia la connection string:
```
mongodb+srv://gproa_user:<password>@gproa-edge.xxxx.mongodb.net/gproa_edge?retryWrites=true&w=majority
```

### Opción B: MongoDB Local con tunneling
Usa [cloudflare tunnel](https://developers.cloudflare.com/cloudflare-one/tutorials/share-local-port/) o ngrok para exponer tu MongoDB local.

---

## Paso 2: Deployar Backend (FastAPI)

1. En Render Dashboard: **New → Web Service**
2. Configure:
   - Name: `gproa-edge-backend`
   - Region: Oregon
   - Environment: `Python`
   - Branch: `main`
3. Build Command:
   ```
   pip install -r backend/requirements.txt
   ```
4. Start Command:
   ```
   cd backend && uvicorn server:app --host 0.0.0.0 --port $PORT
   ```
5. Advanced:
   - Instance Type: **Free** (0.1 CPU, 512MB RAM)
6. Environment Variables (Add):
   | Key | Value |
   |-----|--------|
   | `MONGO_URL` | `mongodb+srv://...` (tu connection string) |
   | `EMERGENT_LLM_KEY` | Tu key de Emergent |
7. Click: **Create Web Service**

**Esperar ~5 minutos** hasta que diga "Live".

---

## Paso 3: Deployar Frontend (React)

1. **New → Web Service**
2. Configure:
   - Name: `gproa-edge-frontend`
   - Region: Oregon
   - Environment: `Node`
   - Branch: `main`
   - Build Command: 
     ```
     cd frontend && yarn install --frozen-lockfile && yarn build
     ```
   - Start Command:
     ```
     yarn start
     ```
3. Environment Variables (Add):
   | Key | Value |
   |-----|--------|
   | `REACT_APP_API_URL` | URL del backend (sin $PORT, ejemplo: `https://gproa-edge-backend.onrender.com`) |
4. Instance Type: **Free**
5. Click: **Create Web Service**

**Esperar ~10 minutos** hasta que diga "Live".

---

## Paso 4: Verificar

| Servicio | URL |
|----------|-----|
| Backend API | `https://gproa-edge-backend.onrender.com` |
| API Docs | `https://gproa-edge-backend.onrender.com/docs` |
| Frontend | `https://gproa-edge-frontend.onrender.com` |

### Pruebas rápidas:

```bash
# 1. Health check
curl https://gproa-edge-backend.onrender.com/

# 2. API docs disponible
curl https://gproa-edge-backend.onrender.com/docs
```

---

## Solución de Problemas

| Error | Solución |
|-------|----------|
| Build failed | Revisa `requirements.txt` y puertos |
| 502 Bad Gateway | El backend no responde - revisa logs en Render |
| CORS error | Configura CORS en `server.py` agregando el dominio del frontend |
| MongoDB connection | Verifica `MONGO_URL` y IP en Atlas |

### Revisar logs:
En Render: Select service → **Logs**

---

## Arquitectura Final

```
                    ┌─────────────────────┐
                    │   Render (Free)      │
┌──────────┐        │                    │
│ GitHub    │───────▶│ gproa-edge-backend │◀──▶ MongoDB Atlas
│ (main)   │        │ (Python/FastAPI)  │
└──────────┘        │                    │
                    └─────────┬─────────┘
                              │
                    ┌─────────▼─────────┐
                    │ gproa-edge-frontend
                    │ (React 19)        │
                    └─────────────────────┘
```

---

## Costos

| Recurso | Tipo | Costo |
|--------|------|-------|
| Backend Web Service | Free | $0 |
| Frontend Web Service | Free | $0 |
| MongoDB Atlas | Free Cluster | $0 |
| **Total** | | **$0/mes** |

---

*Guía actualizada: Abril 2026*