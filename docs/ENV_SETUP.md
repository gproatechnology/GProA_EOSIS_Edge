# Setting Up Environment Variables for GProA EDGE

## 🤖 OpenAI API Key (Required)

### 1. Get Your OpenAI API Key
- Visit https://platform.openai.com/api-keys
- Sign in to your OpenAI account
- Click **"Create new secret key"**
- Copy the key (starts with `sk-...`)
- **Add credits** to your account if needed (billing → payment methods)

### 2. Set `OPENAI_API_KEY` in Render
Backend service → Settings → Environment Variables:
```
Key: OPENAI_API_KEY
Value: sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
Secret: ✅ Yes
```

**Note:** The code will automatically use `OPENAI_API_KEY`. If you still have an Emergent key, you can alternatively set `EMERGENT_LLM_KEY` (legacy), but OpenAI direct is now the default.

---

## 🗄️ MongoDB Atlas Setup

### 1. Create MongoDB Atlas Account
- Go to https://cloud.mongodb.com
- Sign up / log in
- Create a new cluster (Free tier: M0)

### 2. Get Connection String
- Click **Connect** on your cluster
- Choose **Drivers**
- Driver: `Python`
- Version: `3.12` or latest
- Copy the connection string:
```
mongodb+srv://<username>:<password>@cluster.mongodb.net/?retryWrites=true&w=majority
```

### 3. Create Database User
- Database Access → Add New Database User
- Username: `edge_user` (or your choice)
- Password: generate strong password
- Database Privileges: `Read and write to any database`

### 4. Network Access
- Network Access → Add IP Address
- Click **Allow Access from Anywhere** (0.0.0.0/0) for testing
- ⚠️ For production, restrict to specific IPs

### 5. Build Your Final `MONGO_URL`
```
mongodb+srv://edge_user:YOUR_PASSWORD@cluster-name.mongodb.net/gproa_edge?retryWrites=true&w=majority
```
Replace:
- `YOUR_PASSWORD` → actual password
- `cluster-name` → your cluster hostname

---

## 🤖 Emergent AI Key Setup

### 1. Get Your API Key
- Visit https://emergent.sh
- Sign up / log in
- Go to **Settings** → **API Keys**
- Copy your **Universal Key**
  - Format: `sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
  - Starts with `sk-`

### 2. Credits
- Free tier includes $10 credits
- GPT-4o usage: ~$0.01-0.03 per file processed
- Monitor usage at https://emergent.sh/dashboard

---

## 📝 Environment Variables Reference

### Backend (`.env` in project root)

```bash
# Required
MONGO_URL="mongodb+srv://user:pass@cluster.mongodb.net/gproa_edge?retryWrites=true&w=majority"
EMERGENT_LLM_KEY="sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
DB_NAME="gproa_edge"

# Optional (defaults)
CORS_ORIGINS="*"  # Change to frontend URL in production
FRONTEND_URL=""   # Filled automatically if using Render Blueprint
```

### Frontend (`.env` in `frontend/` folder)

```bash
REACT_APP_BACKEND_URL="gproa-edge-backend.onrender.com"
```

⚠️ **No `https://`** — prefix is added automatically in code.

---

## 🔧 How to Set Variables on Render

### Method A: Via Dashboard (GUI)

1. Service → **Settings** → **Environment Variables**
2. Click **Add Environment Variable**
3. Enter Key and Value
4. Mark as **Secret** for sensitive values (MongoDB, API keys)
5. Save → Redeploy

### Method B: Via Render CLI

```bash
render env:set gproa-edge-backend MONGO_URL "your-connection-string"
render env:set gproa-edge-backend EMERGENT_LLM_KEY "sk-xxx"
render env:set gproa-edge-frontend REACT_APP_BACKEND_URL "gproa-edge-backend.onrender.com"
```

---

## 🧪 Test Your Environment Variables

### Local Test (`.env` file)

```bash
# Backend
cd backend
python -c "
from dotenv import load_dotenv
import os
load_dotenv()
print('MONGO_URL:', os.getenv('MONGO_URL')[:30] + '...')
print('EMERGENT_LLM_KEY:', os.getenv('EMERGENT_LLM_KEY')[:10] + '...')
print('DB_NAME:', os.getenv('DB_NAME'))
"
```

Should print truncated values (not None).

### On Render (Logs)

Check service logs after deployment:
```
MONGO_URL set? → Connection succeeded
EMERGENT_LLM_KEY set? → LLM initialized
CORS_ORIGINS → Listening on ...
```

---

## 🚨 Common Mistakes

| Mistake | Result | Fix |
|---------|--------|-----|
| `REACT_APP_BACKEND_URL` includes `https://` | Backend calls fail | Remove protocol, keep only hostname |
| `CORS_ORIGINS` has `*` in production | Security risk | Change to specific frontend URL |
| Forgetting to redeploy after env var change | Changes not applied | Manual Deploy → Clear Cache & Deploy |
| MongoDB IP not whitelisted | Connection refused | Add 0.0.0.0/0 or your IP in Atlas Network Access |
| Using wrong Emergent key | AI returns 401 | Get correct key from emergent.sh/settings |
| Duplicate env vars in `.env` | Confusion | Keep single source of truth |

---

## 📋 Environment Variables Checklist

Backend:
- [ ] `MONGO_URL` configured
- [ ] `EMERGENT_LLM_KEY` configured
- [ ] `DB_NAME` set to `gproa_edge`
- [ ] `CORS_ORIGINS` set to `*` initially
- [ ] `FRONTEND_URL` left empty (optional)

Frontend:
- [ ] `REACT_APP_BACKEND_URL` set to backend hostname only

---

## 🔐 Security Best Practices

1. **Never commit `.env`** → already in `.gitignore`
2. **Use Render Secrets** → mark env vars as "Secret"
3. **Restrict CORS** → After deployment, change `*` → specific frontend URL
4. **Rotate keys** → Periodically regenerate Emergent key
5. **MongoDB user** → Use least-privilege (read/write only, not admin)
6. **Network Access** → Whitelist specific IPs (not 0.0.0.0/0) in production

---

## 🆘 Need Help?

- Check logs: Render Dashboard → Service → **Logs** tab
- Test endpoints: `https://your-backend.onrender.com/api/edge-rules`
- MongoDB connection: Use MongoDB Compass to test URI
- Emergent key: Test at https://emergent.sh/playground

---

**Next:** After setting env vars, proceed to **RENDER_STEP_BY_STEP.md** for full deployment.
