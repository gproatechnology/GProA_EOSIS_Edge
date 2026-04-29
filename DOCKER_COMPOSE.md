# 🐳 Docker Compose Deployment – GProA EDGE
# Guía completa para desplegar con Docker Compose (local o servidor)

## 📋 Índice

1. [Requisitos](#requisitos)
2. [Archivos Docker](#archivos-docker)
3. [Despliegue Rápido](#despliegue-rápido)
4. [Configuración](#configuración)
5. [Comandos Útiles](#comandos-útiles)
6. [Producción](#producción)
7. [Troubleshooting](#troubleshooting)

---

## 📦 **Archivos Docker Incluidos**

```
GProA_Edge/
├── Dockerfile.render          # Todo-en-uno para Render (un servicio)
├── docker-compose.yml         # Multi-servicio (backend + frontend)
├── docker-compose.override.yml# Desarrollo con hot-reload
├── docker-compose.prod.yml    # Producción optimized (opcional)
├── .env.docker                # Variables de entorno para Docker
├── backend/
│   └── Dockerfile             # Backend image (Python 3.12)
├── frontend/
│   ├── Dockerfile             # Frontend production (Nginx)
│   └── Dockerfile.dev         # Frontend development (Node dev server)
├── nginx/
│   └── nginx.conf             # Proxy inverso (para Dockerfile.render)
└── ...
```

---

## 🚀 **Despliegue Rápido (3 comandos)**

### **Opción A: Desarrollo (con hot-reload)**
```bash
# 1. Copia variables de entorno (opcional)
cp .env.docker .env

# 2. Inicia todos los servicios (backend + frontend)
docker-compose up

# 3. Abre en navegador:
#    Frontend: http://localhost:3000
#    Backend API: http://localhost:8000
#    API Docs: http://localhost:8000/docs
```

### **Opción B: Producción (imágenes optimizadas)**
```bash
# 1. Sin hot-reload, imágenes más pequeñas
docker-compose -f docker-compose.yml --profile production up -d

# 2. Accede:
#    Frontend: http://localhost:3000  (servido por Nginx)
#    Backend: http://localhost:8000
```

---

## ⚙️ **Configuración**

### **Variables de Entorno (.env)**

Crea un archivo `.env` en la raíz (o usa `.env.docker` como plantilla):

```bash
# Backend
MONGO_URL=                      # Déjalo vacío → SQLite demo mode
OPENAI_API_KEY=                 # Déjalo vacío → Mock AI
DEMO_MODE=true                  # true=sin OpenAI, false=con OpenAI
DB_NAME=gproa_edge              # Nombre archivo SQLite
CORS_ORIGINS=*                  # Orígenes permitidos (* para dev)

# Frontend
REACT_APP_BACKEND_URL=http://localhost:8000  # Sin https://
```

**Nota:** En producción cambia `CORS_ORIGINS` a tu dominio real.

### **Perfiles de Docker Compose**

Docker Compose soporta **perfiles** para Different ambientes:

- **Sin perfil** (default): backend + frontend con hot-reload (desarrollo)
- **Perfil `production`**: backend + frontend con imágenes optimizadas (producción)

```bash
# Usar perfil de producción
docker-compose --profile production up -d
```

---

## 🏗️ **Arquitectura Docker**

### **Desarrollo (docker-compose.yml + override)**

| Servicio | Imagen | Puertos | Volumen | Comando |
|----------|--------|---------|---------|---------|
| `backend` | `python:3.12-slim` (custom) | 8000:8000 | Código montado (hot-reload) | `uvicorn --reload` |
| `frontend`| `node:18-alpine` (dev) | 3000:3000 | Código montado (hot-reload) | `npm start` |

**Ventajas:** Cambios en código se reflejan inmediatamente sin rebuild.

### **Producción (docker-compose.yml sin override)**

| Servicio | Imagen | Puertos | Volumen | Comando |
|----------|--------|---------|---------|---------|
| `backend` | Custom (Python) | 8000:8000 | Datos SQLite persistente | `uvicorn` (sin reload) |
| `frontend`| Custom (Nginx) | 3000:80 | Solo archivos built | `nginx` |

**Ventajas:** Imágenes pequeñas, rápido arranque, suitable for cloud.

---

## 🎯 **Comandos Útiles**

### **Gestión de Contenedores**
```bash
# Iniciar (modo attached - ve logs en consola)
docker-compose up

# Iniciar en background (detached)
docker-compose up -d

# Detener
docker-compose down

# Detener y eliminar volúmenes (¡cuidado! borra datos SQLite)
docker-compose down -v

# Reiniciar un servicio específico
docker-compose restart backend
docker-compose restart frontend
```

### **Logs**
```bash
# Todos los logs
docker-compose logs

# Seguir logs en tiempo real
docker-compose logs -f

# Solo backend
docker-compose logs -f backend

# Solo frontend
docker-compose logs -f frontend
```

### **Build & Rebuild**
```bash
# Reconstruir todo
docker-compose build

# Reconstruir un servicio
docker-compose build backend

# Forzar rebuild sin cache
docker-compose build --no-cache

# Rebuild y up
docker-compose up -d --build
```

### **Acceso a Shell**
```bash
# Entrar al contenedor backend
docker-compose exec backend sh

# Entrar al contenedor frontend
docker-compose exec frontend sh

# Ver logs de SQLite
docker-compose exec backend ls -la /app/data
```

### **Estado**
```bash
# Ver contenedores corriendo
docker-compose ps

# Ver recursos usados
docker stats

# Ver redes
docker network ls | grep gproa
```

---

## 🔧 **Desarrollo con Hot-Reload**

Docker Compose automáticamente usa `docker-compose.override.yml` si existe, que configura:

- Backend: `--reload` para recargar en cambios de código
- Frontend: `npm start` (dev server de React)
- Volúmenes montados: codigo fuente vivo → cambios inmediatos

**Flujo:**
1. Ejecutas `docker-compose up`
2. Editas archivos en `backend/` o `frontend/` en tu PC
3. Cambios se reflejan dentro del contenedor
4. Backend recarga automáticamente (FastAPI)
5. Frontend recarga automáticamente (React Fast Refresh)

**Nota:** El primer build de dependencias puede tardar 2-5 minutos (descarga de paquetes). Los rebuilds posteriores son más rápidos por el cache de Docker.

---

## 📦 **Producción con Docker Compose**

Para desplegar en un servidor propio (VPS, EC2, DigitalOcean):

### **1. Clonar en servidor**
```bash
git clone https://github.com/gproatechnology/GProA_EOSIS_Edge.git
cd GProA_EOSIS_Edge
git checkout submain
```

### **2. Configurar variables de producción**
```bash
# Crear .env
cat > .env << EOF
DEMO_MODE=false
MONGO_URL=mongodb+srv://user:pass@cluster.mongodb.net/gproa_edge?retryWrites=true&w=majority
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxx
CORS_ORIGINS=https://tudominio.com
REACT_APP_BACKEND_URL=https://api.tudominio.com
EOF
```

### **3. Desplegar**
```bash
# Build y start en background
docker-compose -f docker-compose.yml --profile production up -d

# Ver logs
docker-compose logs -f

# Ver estado
docker-compose ps
```

### **4. (Opcional) HTTPS con Nginx externo**

Si quieres HTTPS, puedes agregar un contenedor Nginx adicional que maneje SSL:

```yaml
# En docker-compose.prod.yml agregar:
nginx:
  image: nginx:alpine
  ports:
    - "80:80"
    - "443:443"
  volumes:
    - ./nginx/nginx-ssl.conf:/etc/nginx/nginx.conf:ro
    - ./ssl:/etc/nginx/ssl:ro  # Certificados SSL
  depends_on:
    - backend
    - frontend
```

---

## 🔄 **Docker Compose vs. Render**

| Característica | Docker Compose (Local/Servidor) | Render (Cloud) |
|----------------|--------------------------------|----------------|
| **Coste** | $0 (tu propio servidor) | Free tier o pago |
| **Control** | Total (tú manejas todo) | Limitado (Render maneja infra) |
| **Escalado** | Manual (más contenedores) | Automático (auto-scale) |
| **SSL** | Tú lo configuras | Automático (Let's Encrypt) |
| **Actualizaciones** | `docker-compose pull && up` | Git push → auto-deploy |
| **Logs** | `docker logs` | Dashboard + tail |
| **Base de datos** | SQLite (archivo) o MongoDB externo | SQLite (efímero) o MongoDB externo |

---

## 🐛 **Troubleshooting Docker**

### **Error: "Port already in use"**
```bash
# Ver qué proceso usa el puerto
lsof -i :8000   # Backend
lsof -i :3000   # Frontend

# Opciones:
# 1. Mata el proceso: kill -9 <PID>
# 2. Cambia puertos en docker-compose.yml:
#    ports:
#      - "8001:8000"  # Host:Contenedor
```

### **Backend no conecta a base de datos**
```bash
# Ver logs del backend
docker-compose logs backend

# Si error de permisos en /app/data:
docker-compose exec backend ls -la /app/data

# Solucionar: asegurar que el volumen existe y es writable
```

### **Frontend no encuentra el backend**
```bash
# Verificar REACT_APP_BACKEND_URL
docker-compose exec frontend env | grep REACT_APP

# Si está mal, detén y rebuild:
docker-compose down
docker-compose build --no-cache frontend
docker-compose up -d
```

### **Imágenes muy grandes**
```bash
# Ver tamaño de imágenes
docker images | grep gproa

# Limpiar cache sin usar:
docker system prune -a --volumes  # ¡Cuidado! Borra todo
```

### **Rebuild lento**
```bash
# Usar buildKit (más rápido)
export DOCKER_BUILDKIT=1
docker-compose build

# O en build command:
docker-compose build --progress=plain
```

---

## 📊 **Diagrama de Arquitectura Docker Compose**

```
┌─────────────────────────────────────────────────────────────┐
│                     Docker Host (tu PC/servidor)            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────┐         ┌────────────────────┐       │
│  │   Frontend       │         │    Backend         │       │
│  │   (Nginx)        │         │   (FastAPI)        │       │
│  │  Puerto: 3000    │         │   Puerto: 8000     │       │
│  │  Contenedor:     │         │   Contenedor:      │       │
│  │  frontend        │         │   backend          │       │
│  └────────┬─────────┘         └────────┬───────────┘       │
│           │                            │                   │
│           │ HTTP /api/* → proxy        │                   │
│           │ ─────────────────────────▶ │                   │
│           │                            │                   │
│           │ ←───────────────────────── │                   │
│           │    JSON responses          │                   │
│           │                            │                   │
│           └────────────────────────────┘                   │
│                                                             │
│  Red Docker: gproa-network (comunicación interna)         │
│  Volúmenes: ./backend/data → SQLite persistente           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## ✅ **Checklist de Despliegue**

### **Desarrollo Local**
- [ ] Docker Desktop instalado (o Docker + Docker Compose)
- [ ] `git clone` del repo en rama `submain`
- [ ] `cp .env.docker .env` (opcional, defaults funcionan)
- [ ] `docker-compose up`
- [ ] Frontend carga en `http://localhost:3000`
- [ ] Backend health `http://localhost:8000/api/` → `{"message":"..."}`

### **Producción en Servidor**
- [ ] Servidor con Docker + Docker Compose instalado
- [ ] Repositorio clonado en servidor
- [ ] `.env` configurado con valores de producción
- [ ] `docker-compose -f docker-compose.yml --profile production up -d`
- [ ] Dominio apunta a IP del servidor
- [ ] (Opcional) Certificado SSL configurado

---

## 🎬 **Resumen**

Con Docker Compose tienes:

✅ **Backend** → SQLite + Mock AI (demo) o MongoDB + OpenAI (prod)  
✅ **Frontend** → React + Nginx (estáticos)  
✅ **Un solo comando** → `docker-compose up`  
✅ **Hot-reload** en desarrollo  
✅ **Fácil deploy** en cualquier servidor con Docker  
✅ **Escalable** → agrega más servicios (Redis, Celery, etc.)  

---

## 📖 **Documentación Adicional**

- **Docker Compose docs:** https://docs.docker.com/compose/
- **Dockerfile best practices:** https://docs.docker.com/develop/develop-images/dockerfile_best-practices/
- **Multi-stage builds:** https://docs.docker.com/develop/develop-images/multistage-build/
- **Nginx as reverse proxy:** https://www.nginx.com/resources/wiki/start/topics/examples/reverseproxy/

---

¿Necesitas también un **script de deploy automatizado** para tu servidor (ej. `deploy.sh`)? Puedo crearlo.
