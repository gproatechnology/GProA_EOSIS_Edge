# F1 Comedor - Restaurant Management System

Sistema de gestión de comedor empresarial con autenticación JWT, generación de códigos QR, reportes y frontend React + Vite.

---

## ⚠️ Modo Estricto - Importante

**Todo el proyecto debe ejecutarse exclusivamente desde dentro de esta carpeta (`c:\\Users\\Mao\\OneDrive\\Documentos\\GProA Desarrollo\\Desarrollo_F1\\f1-comedor`).**  
No se debe usar ni generar nada fuera de esta carpeta. Todos los comandos, entornos virtuales, Docker y archivos están contenidos aquí.

---

## 🚀 Quick Start

La aplicación se compone de **tres servicios** Docker:

1. **Base de datos PostgreSQL** – puerto **5432**
2. **API FastAPI** – puerto **8000**
3. **Frontend Nginx** – puerto **5173**

Los servicios se comunican entre sí a través de la red interna de Docker.

### Opción 1: Arrancar todo con Docker Compose (recomendado)

```bash
# Asegúrate de estar en el directorio principal del proyecto:
cd "c:\\Users\\Mao\\OneDrive\\Documentos\\GProA Desarrollo\\Desarrollo_F1\\f1-comedor"

# (opcional) crear red compartida si aún no existe
docker network create f1-comedor-network 2>/dev/null || true

# levantar y reconstruir servicios
docker-compose up -d --build

# esperar ~10‑15 segundos a que la base de datos arranque
echo "esperando que la base de datos esté lista..." && sleep 15

# comprobar que los contenedores estén en buen estado
docker-compose ps
# debería verse: db (healthy), app (healthy), frontend (running)

# cargar datos de prueba (único uso o después de borrar la BD)
docker-compose exec app python -m app.seed
```

> 🔁 Si enfrentas problemas de datos duplicados, detén los contenedores con
> `docker-compose down -v` antes de ejecutar el seed para resetear la BD.

### Opción 2: Solo front‑end (desarrollo local)

```bash
# Cambia al directorio del frontend
cd "c:\\Users\\Mao\\OneDrive\\Documentos\\GProA Desarrollo\\Desarrollo_F1\\f1-comedor\\frontend"
npm install
npm run dev
```

*En este caso deberás apuntar `VITE_API_URL` a `http://localhost:8000` porque
la API estará corriendo en tu máquina, no en Docker.*

> 💡 **Nota para entornos remotos (Codespaces/GitHub.dev)**
> 
> - El navegador que utiliza GitHub.dev/Codespaces no forma parte de la red de
>   Docker. Por eso `http://app:8000` no es accesible desde el lado del cliente.
> - Con la versión actual del frontend no necesitas tocar nada: el valor por
>   defecto de `VITE_API_URL` es vacío, y el cliente hace las peticiones a
>   rutas relativas (`/api/...`). El servidor de desarrollo de Vite, que sí
>   corre dentro del contenedor, *proxía* esas rutas a `http://localhost:8000`.
> - Si prefieres definirlo manualmente, usa la URL pública que GitHub te da para
>   el puerto 8000 (algo como `https://<workspace>-8000.github.dev`).

Esta flexibilidad asegura que la aplicación funcionará tanto en tu máquina
local como dentro de un Codespace remoto.



### Opción 3: Solo API (desarrollo local)

```bash
# Asegúrate de estar en el directorio principal del proyecto:
cd "c:\\Users\\Mao\\OneDrive\\Documentos\\GProA Desarrollo\\Desarrollo_F1\\f1-comedor"
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
export DATABASE_URL="postgresql://f1comedor:f1comedor123@localhost:5432/f1comedor"
export SECRET_KEY="your-secret-key"
python -m app.seed
uvicorn app.main:app --reload
```

### Credenciales de prueba

Después de ejecutar el seed:

| Rol        | Usuario     | Contraseña     |
|------------|-------------|----------------|
| Admin      | admin       | admin123       |
| Supervisor | supervisor  | supervisor123  |
| Cajero     | cajero      | cajero123      |


## ⚠️ Problemas comunes al iniciar

1. **Error al pasar del login**
   * Causa: el frontend no contacta a la API porque está usando `localhost`.
   * En Docker debe usar `http://app:8000`; esa variable se inyecta en el
     contenedor del frontend a través del Dockerfile y docker-compose.
   * Comprueba el archivo `.env` dentro del contenedor (`docker-compose exec
     frontend cat .env`) y asegúrate de que contiene `VITE_API_URL=http://app:8000`.
   * Recarga la página (Ctrl+F5) para evitar caché de la app anterior.

2. **Docker crea puertos internos**
   * Es esperado; cada servicio escucha en un puerto diferente internamente. El frontend no
     se sirve por el puerto de la API. **No hay puertos expuestos al host**.

3. **"Connection refused" hacia la base de datos**
   * La API arranca antes que PostgreSQL esté listo. El `depends_on` con
     healthcheck en docker-compose previene la mayoría de los casos, pero si
     ocurre reinicia el contenedor del app:
     ```bash
docker-compose restart app
```  
   * También puedes ver los logs con
     `docker-compose logs db` y `docker-compose logs app`.

4. **Seed falla por clave duplicada**
   * Ejecuta `docker-compose down -v` para borrar el volumen y vuelve a ejecutar 
     el seed.

5. **No puedes acceder al panel principal después del login (Bypass de emergencia)**
   * Si tienes problemas de autenticación, hay un bypass temporal disponible:
   * En la página de login, haz clic en el botón **"🔓 Acceso Directo (Bypass)"**
   * Esto te permitirá entrar como usuario ADMIN sin necesidad de credenciales válidas
   * El bypass funciona buscando un usuario existente en la base de datos
   * **Nota:** Este bypass es solo para desarrollo/pruebas. No usarlo en producción.

## Estructura del proyecto

```
c:\\Users\\Mao\\OneDrive\\Documentos\\GProA Desarrollo\\Desarrollo_F1\\f1-comedor\\
├── app/                    # Backend (FastAPI)
│   ├── api/               # Endpoints de la API
│   ├── models/            # Modelos SQLAlchemy
│   ├── schemas/           # Schemas Pydantic
│   ├── services/          # Lógica de negocio
│   ├── core/              # Configuración y seguridad
│   ├── main.py            # Aplicación FastAPI
│   └── seed.py            # Datos de prueba
├── frontend/              # Frontend (React + Vite)
│   ├── src/
│   │   ├── pages/         # Vistas principales
│   │   ├── components/    # Componentes reutilizables
│   │   ├── services/      # Llamadas a la API
│   │   ├── context/       # AuthContext
│   │   └── utils/         # Helpers
│   ├── package.json
│   ├── Dockerfile
│   └── .env.example
├── docker-compose.yml     # Orquestación de servicios
├── Dockerfile             # Imagen de la API
└── requirements.txt       # Dependencias Python
```


## Endpoints API (ejemplos)

### Autenticación

```bash
# Login
token=$(curl -s -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=admin&password=admin123" | jq -r .access_token)

# Refresh token
curl -X POST http://localhost:8000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d "{\"refresh_token\":\"$REFRESH\"}"
```

(Omisiones de endpoints de empresas, empleados, consumos, reportes en el
README para mantenerlo legible; todos están definidos en la documentación de
Swagger (`/docs`).)


## 🧪 Pruebas

```bash
# Asegúrate de estar en el directorio principal del proyecto:
cd "c:\\Users\\Mao\\OneDrive\\Documentos\\GProA Desarrollo\\Desarrollo_F1\\f1-comedor"
pytest
pytest --cov=app --cov-report=html
```


## ⚙️ Variables de entorno

**Backend**

| Variable                   | Default                            | Descripción                     |
|---------------------------|------------------------------------|---------------------------------|
| DATABASE_URL              | postgresql://f1comedor:...         | URL de la base de datos         |
| SECRET_KEY                | your-secret-key                    | Clave para JWT                  |
| ACCESS_TOKEN_EXPIRE_MINUTES | 30                               | Expiración token de acceso      |
| DUPLICATE_SCAN_MINUTES    | 5                                  | Ventana para evitar escaneos dobles |

**Frontend**

| Variable      | Default               | Descripción        |
|---------------|-----------------------|--------------------|
| VITE_API_URL  | http://localhost:8000 | URL de la API      |


## 🔄 QR Modular

El servicio de QR está en `app/core/qr_service.py`. Utiliza la librería
`qrcode` internamente, pero puede sustituirse por un proveedor externo
implementando `QRProviderInterface`.


## 📝 Licencia

MIT
