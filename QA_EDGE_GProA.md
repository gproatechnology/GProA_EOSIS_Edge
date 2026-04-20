# QA - GProA EDGE: Document Processor

## 1. ¿Qué es GProA EDGE?

**GProA EDGE** es una plataforma inteligente para la gestión de proyectos de certificación EDGE en construcción sostenible. Utiliza IA (GPT-4o) para automatizar el procesamiento de documentos técnicos.

---

## 2. ¿Qué problema resuelve?

### Flujo Manual Actual (Problemática)

| Paso | Actividad Manual | Tiempo Est. |
|------|------------------|-------------|
| 1 | Recepción y organización de archivos en Google Drive | Variable |
| 2 | Clasificación manual en carpetas (DESIGN, ENERGY, WATER, MATERIALS) | 2-4 horas |
| 3 | Lectura de planos en AutoCAD para medir áreas | 4-8 horas |
| 4 | Extracción de datos técnicos (watts, lumens, equipos) de fichas | 3-5 horas |
| 5 | Identificación de documentos faltantes por medida | 2-3 horas |
| 6 | Llenado de calculadoras EDGE | 3-6 horas |
| **Total** | | **14-26 horas/proyecto** |

### Limitaciones del proceso actual:
- Archivos en lotes de 10 (límite de ChatGPT)
- Proceso manual repetitivo
- Actualizaciones continuas del cliente
- Dificultad para mantener organización

---

## 3. ¿Cómo funciona GProA EDGE?

### Flujo Automatizado Propuesto

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────────┐
│ 1. Crear       │     │ 2. Subir        │     │ 3. Procesar         │
│    Proyecto    │────▶│    Archivos     │────▶│    con IA           │
└─────────────────┘     └──────────────────┘     └─────────────────────┘
                                                          │
                                                          ▼
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────────┐
│ 6. Exportar     │     │ 5. Ver Dashboard │     │ 4. Validar          │
│    Excel        │◀────│    de Estado     │◀────│    Completitud      │
└─────────────────┘     └──────────────────┘     └─────────────────────┘
```

### Proceso IA (Detalle)

| Etapa | Descripción | Archivos Soportados |
|-------|-------------|---------------------|
| **Extracción de texto** | Lee el contenido de cada documento | PDF, JPG, TXT |
| **Clasificación** | Asigna categoría EDGE (DESIGN/ENERGY/WATER/MATERIALS) | Todos |
| **Detección de medida** | Identifica qué medida EEM/WEM/MEM aplica | Todos |
| **Extracción de datos** | Extrae: watts, lumens, equipos, marcas/modelos | Fichas técnicas |
| **Cálculo de áreas** | Lee cotas y calcula áreas desde planos | Planos (DWG→PDF) |
| **Validación** | Identifica documentos faltantes por medida | Todos |

---

## 4. Comparativa: Proceso Manual vs GProA EDGE

| Actividad | Manual | GProA EDGE | Mejora |
|-----------|--------|------------|--------|
| Clasificación de archivos | Manual (por carpeta) | Automático con IA | **~90% tiempo** |
| Extracción de datos técnicos | Lectura manual de fichas | Automático | **~85% tiempo** |
| Cálculo de áreas | AutoCAD | IA lee cotas | **~70% tiempo** |
| Validación de completitud | Manual | Automático | **~80% tiempo** |
| Lotes de 10 archivos | Sí (ChatGPT) | Ilimitado | **Sin límite** |
| Organización en Drive | Manual | Automático (DB) | **~95% tiempo** |

---

## 5. Medidas EDGE Soportadas

### DESIGN
- Areas and Loads Breakdown
- Window-to-Wall Ratio (EEM01)

### ENERGY (EEM)
- EEM01, EEM02, EEM03, EEM05, EEM06, EEM08, EEM09, EEM13, EEM16, EEM22, EEM23

### WATER (WEM)
- WEM01, WEM02, WEM04, WEM07, WEM08

### MATERIALS (MEM)
- MEM01 a MEM10

---

## 6. ¿Qué genera GProA EDGE?

### Dashboard de Estado
- Resumen por categoría (DESIGN, ENERGY, WATER, MATERIALS)
- Lista de medidas aplicadas
- Documentos procesados vs faltantes
- Estado de completitud (%)

### Exportación Excel
| Hoja | Contenido |
|------|-----------|
| **Archivos** | Nombre, categoría, medida, fecha |
| **Datos Técnicos** | Watts, lumens, equipos, marcas |
| **Áreas** | Metros cuadrados por espacio |
| **Resumen** | Estado general del proyecto |

---

## 7. ¿Cómo usarlo?

### Paso 1: Crear Proyecto
```http
POST /api/projects
{
  "name": "CCU PV 03 Tristone",
  "building_type": "Industrial - Light Industry"
}
```

### Paso 2: Subir Archivos
Arrastrar archivos o seleccionar:
- PDF (planos, fichas técnicas)
- JPG (fotos, planos escaneados)
- DWG (convertido a PDF)

### Paso 3: Procesar
```http
POST /api/projects/{id}/process
```
La IA procesa todos los archivos pendientes.

### Paso 4: Revisar Dashboard
```http
GET /api/projects/{id}/edge-status
```

### Paso 5: Exportar
```http
GET /api/projects/{id}/export-excel
```

---

## 8. Tecnologías Utilizadas

| Componente | Tecnología |
|------------|------------|
| Backend | FastAPI (Python) |
| Base de Datos | MongoDB |
| Frontend | React 19 + Tailwind + Shadcn |
| IA | GPT-4o (Emergent) |

---

## 9. Roadmap - Mejoras Futuras

### Fase 2 (Próximamente)
- [ ] Sincronización automática con Google Drive
- [ ] Soporte OCR para PDFs escaneados
- [ ] Proceso por lotes con progress bar
- [ ] Integración con calculadoras EDGE

### Fase 3 (Planeación)
- [ ] Exportación ZIP con estructura de carpetas
- [ ] Autenticación multiusuario
- [ ] Colaboración en tiempo real
- [ ] Análisis avanzado de planos (CV)

---

## 10. FAQ - Preguntas Frecuentes

### ¿Qué formatos acepta?
- PDF, JPG, PNG, TXT
- DWG (convertido a PDF primero)

### ¿Cuántos archivos puedo subir?
Ilimitados (no como ChatGPT con límite de 10)

### ¿Necesito AutoCAD para medir áreas?
No, la IA lee las cotas directamente de los planos PDF

### ¿Dónde se almacenan los archivos?
En MongoDB (GridFS) - puedes conectar a MongoDB Atlas para nube

### ¿Puedo integrar con mi Google Drive?
Próximamente en Fase 2

### ¿Es seguro mis datos?
Sí, los datos se procesan con GPT-4o y se almacenan en tu instancia de MongoDB

---

## 11. Beneficios Clave

✅ **Ahorro de tiempo**: 70-90% menos tiempo en documentación  
✅ **Menos errores**: IA extrae datos consistentemente  
✅ **Sin límites**: Archivos ilimitados vs 10 de ChatGPT  
✅ **Centralizado**: Todo en una plataforma  
✅ **Exportación**: Excel listo para calculadoras EDGE  
✅ **Escalable**: Múltiples proyectos simultáneos  

---

*Documento generado para GProA EDGE - Edge Document Processor*
*Versión: 1.0*
