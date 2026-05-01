# Guía de Despliegue Local (Sin Docker)

Este documento detalla los pasos para levantar el entorno de desarrollo local manualmente, separando el backend (FastAPI) y el frontend (React).

## 1. Despliegue del Backend (FastAPI)

El backend requiere Python 3.10+ y utiliza un entorno virtual para manejar las dependencias.

### Pasos en Windows:
Abre una terminal en la raíz del proyecto y ejecuta:

```powershell
# 1. Navegar a la carpeta del backend
cd backend

# 2. Crear un entorno virtual
python -m venv venv

# 3. Activar el entorno virtual
.\venv\Scripts\activate

# 4. Instalar las dependencias
pip install -r requirements.txt

# 5. Configurar las variables de entorno (Opcional, los defaults sirven para modo demo)
# Puedes copiar el archivo .env.example y renombrarlo a .env
copy ..\.env.example .env

# 6. Iniciar el servidor local de desarrollo
uvicorn app.main:app --reload --port 8000
```

### Pasos en Mac/Linux:
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp ../.env.example .env
uvicorn app.main:app --reload --port 8000
```

El servidor del backend estará disponible en: [http://localhost:8000](http://localhost:8000)
La documentación de la API (Swagger) estará en: [http://localhost:8000/docs](http://localhost:8000/docs)

---

## 2. Despliegue del Frontend (React)

El frontend requiere Node.js instalado en tu computadora.

Abre una **nueva terminal** (manteniendo la del backend abierta y corriendo) en la raíz del proyecto y ejecuta:

```powershell
# 1. Navegar a la carpeta del frontend
cd frontend

# 2. Instalar las dependencias (usando yarn o npm)
yarn install
# (Si no tienes yarn, puedes usar: npm install)

# 3. Iniciar el servidor de desarrollo de React
yarn start
# (Si usaste npm: npm start)
```

La aplicación web del frontend se abrirá automáticamente en tu navegador en: [http://localhost:3000](http://localhost:3000)

---

## 3. Notas Adicionales

- **Modo Demo**: Por defecto, si no configuras claves de OpenAI o MongoDB en el `.env`, el proyecto funcionará utilizando una base de datos local (SQLite) y respuestas simuladas (Mock AI).
- **Problemas comunes**: Si experimentas problemas al levantar el backend asegurate de que tu terminal indica que estás dentro del entorno `(venv)`. Para el frontend, si un puerto está ocupado, la terminal te preguntará si deseas utilizar otro puerto (puedes presionar `Y` para aceptar).
