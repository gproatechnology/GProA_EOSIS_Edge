# 🚀 Configurar Frontend Localmente

## Paso 1: Instalar dependencias

```bash
cd "C:\Users\Mao\OneDrive\Documentos\GProA Desarrollo\Desarrollo_F1\f1-comedor\frontend"
npm install
```

## Paso 2: Configurar API

El archivo `.env` ya está configurado correctamente:

```
VITE_API_URL=http://localhost:8000
```

## Paso 3: Ejecutar

```bash
npm run dev
```

## Paso 4: Acceder

Abre en tu navegador: **http://localhost:5174**

---

## 📝 Estructura del Proyecto

| Archivo | Qué contiene |
|---------|--------------|
| `src/index.css` | Estilos globales, Tailwind |
| `src/pages/*.jsx` | Cada página (Dashboard, Scanner, Admin, etc.) |
| `src/components/` | Componentes reutilizables |
| `tailwind.config.js` | Configuración de colores/temas |

---

## 🛠️ Comandos Útiles

### Instalar nuevas dependencias
```bash
npm install <paquete>
```

### Construir para producción
```bash
npm run build
```

### Previsualizar producción
```bash
npm run preview
```

---

## ⚠️ Nota Importante

**NO ejecutes `npm run dev` múltiples veces** - el servidor ya está corriendo en segundo plano. Si ves el error "Port 5174 is already in use", significa que el servidor ya está funcionando.

Para detener los servidores:
1. Cierra las terminales donde se están ejecutando
2. O presiona `Ctrl+C` en cada terminal
