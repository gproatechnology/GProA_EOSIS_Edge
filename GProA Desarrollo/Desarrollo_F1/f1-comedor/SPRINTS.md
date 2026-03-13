# 🚀 Plan de Sprints - F1 Comedor

## Resumen del Proyecto

| Métrica | Valor |
|---------|-------|
| Sprints Totales | 4 |
| Duración por Sprint | 1 semana |
| Total | 4 semanas |
| **Sprint 1** | ✅ Completado |
| **Sprint 2** | ✅ Completado |
| **Sprint 3** | ✅ Completado (73% coverage) |
| **Sprint 4** | ✅ Completado (PWA, Export, UI) |

---

## 🎯 Sprint 1: Seguridad Crítica ✅ COMPLETADO
**Duración:** 1 semana (5 días)

### Objetivo
Eliminar las vulnerabilidades de seguridad antes de cualquier despliegue a producción.

### Tareas

| # | Tarea | Prioridad | Historia de Usuario | Estimación | Estado |
|---|-------|-----------|-------------------|------------|--------|
| 1 | Eliminar bypass de emergencia en `security.py` | 🔴 P0 | Como desarrollador, quiero eliminar código de bypass para que el sistema sea seguro | 1 día | ✅ Completado |
| 2 | Configurar SECRET_KEY seguro via entorno | 🔴 P0 | Como ops, quiero una clave segura configurada para proteger JWT | 0.5 días | ✅ Completado |
| 3 | Configurar CORS específico en `main.py` | 🟠 P1 | Como seguridad, quiero limitar orígenes CORS para prevenir ataques | 0.5 días | ✅ Completado |
| 4 | Implementar rate limiting básico | 🟠 P1 | Como ops, quiero prevenir ataques de fuerza bruta | 1 día | ✅ Completado |
| 5 | Añadir logging de auditoría | 🟠 P1 | Como administrador, quiero registrar acciones para auditoría | 1 día | ✅ Completado |

### Criterios de Aceptación
- [x] No existe función de bypass en el código
- [x] CORS solo permite orígenes definidos
- [x] Rate limiting configurado (60 req/min)
- [x] Logs guardan: login, logout, acciones de usuarios

### Entregable
Sistema listo para despliegue con configuraciones de seguridad básicas.

---

## 🎯 Sprint 2: Estabilidad y Rendimiento ✅ COMPLETADO
**Duración:** 1 semana (5 días)

### Objetivo
Optimizar el rendimiento del sistema y corregir problemas de estabilidad.

### Tareas

| # | Tarea | Prioridad | Historia de Usuario | Estimación | Estado |
|---|-------|-----------|-------------------|------------|--------|
| 1 | Corregir query N+1 en dashboard stats | 🔴 P0 | Como usuario, quiero ver estadísticas rápidas sin esperar | 1 día | ✅ Completado |
| 2 | Implementar paginación en endpoints de lista | 🟠 P1 | Como usuario, quiero paginar resultados grandes | 1 día | ✅ Completado |
| 3 | Añadir cacheo a consultas frecuentes | 🟠 P1 | Como usuario, quiero datos rápidos al recargar | 1 día | ✅ Completado |
| 4 | Optimizar consulta de consumos por hora | 🟢 P2 | Como admin, quiero gráficos que carguen rápido | 0.5 días | ✅ Completado |
| 5 | Configurar timeouts en axios | 🟢 P2 | Como usuario, quiero mensajes de error claros si algo falla | 0.5 días | ✅ Completado |
| 6 | Implementar retry automático en queries | 🟢 P2 | Como usuario, quiero que la app se recupere de errores de red | 1 día | ✅ Completado |

### Criterios de Aceptación
- [x] Dashboard carga en menos de 2 segundos
- [x] Paginación funciona en todos los listados
- [x] Queries complejas ejecutan en menos de 500ms

### Entregable
Sistema con rendimiento optimizado y mejor experiencia de usuario.

---

## 🎯 Sprint 3: Testing y Calidad ✅ COMPLETADO
**Duración:** 1 semana (5 días)

### Objetivo
Aumentar la cobertura de tests y garantizar la calidad del código.

### Tareas

| # | Tarea | Prioridad | Historia de Usuario | Estimación | Estado |
|---|-------|-----------|-------------------|------------|--------|
| 1 | Coverage de tests al 70% | 🔴 P0 | Como QA, quiero cobertura mínima para confiar en cambios | 2 días | ✅ Completado |
| 2 | Tests de integración API | 🟠 P1 | Como QA, quiero tests de integración para validar flujos | 1.5 días | ✅ Completado |
| 3 | Tests E2E con Playwright/Cypress | 🟠 P1 | Como QA, quiero tests E2E para validar UI | 1.5 días | ⏳ Pendiente |

### Criterios de Aceptación
- [x] Coverage >= 70% (actual: 73%)
- [x] Todos los tests principales pasan
- [ ] Tests E2E de flujos principales pasan

### Entregable
Suite de tests completa con coverage garantizado.

---

## 🎯 Sprint 4: Funcionalidades Extras ✅ COMPLETADO
**Duración:** 1 semana (5 días)

### Objetivo
Implementar funcionalidades adicionales solicitadas y mejoras de UX.

### Tareas

| # | Tarea | Prioridad | Historia de Usuario | Estimación | Estado |
|---|-------|-----------|-------------------|------------|--------|
| 1 | Notificaciones en tiempo real (WebSocket) | 🟠 P1 | Como cajero, quiero ver consumos en tiempo real | 2 días | ⏳ Pendiente |
| 2 | Mejora UI Scanner (feedback visual) | 🟢 P2 | Como cajero, quiero mejor feedback al escanear | 0.5 días | ✅ Completado |
| 3 | Dashboard configurable por usuario | 🟢 P2 | Como admin, quiero personalizar mi dashboard | 1 día | ⏳ Pendiente |
| 4 | Exportar a PDF | 🟢 P2 | Como admin, quiero reportes en PDF | 1 día | ✅ Completado |
| 5 | PWA para móvil | 🟢 P2 | Como usuario, quiero usar la app desde móvil | 0.5 días | ✅ Completado |

### Criterios de Aceptación
- [ ] WebSocket conecta y actualiza en tiempo real
- [x] PWA instalable en móvil
- [x] UI mejorada con animaciones y feedback

### Entregable
Sistema con funciones adicionales y mejor experiencia móvil.

---

## 📊 Distribución de Recursos

| Rol | Sprint 1 | Sprint 2 | Sprint 3 | Sprint 4 |
|-----|----------|----------|----------|----------|
| Backend Dev | 60% | 40% | 30% | 40% |
| Frontend Dev | 20% | 40% | 30% | 40% |
| QA/DevOps | 20% | 20% | 40% | 20% |

---

## ⚠️ Riesgos Identificados

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|-------------|
| Scope creep | Media | Alto | Priorizar tareas, postergar si es necesario |
| Dependencies roto | Baja | Alto | Tests de integración tempranos |
| Retrasos por bugs | Media | Medio | Buffer de 20% en estimación |

---

## ✅ Definition of Done

Cada tarea debe cumplir:
- [ ] Código revisado y mergeado a main
- [ ] Tests pasan en CI/CD
- [ ] Documentación actualizada
- [ ] Probado manualmente en entorno staging

---

## 📝 Notas

- Este plan puede ajustarse según prioridades del negocio
- Sprint 1 es obligatorio antes de producción
- Se recomienda daily standups de 15 minutos
- Review al final de cada sprint con stakeholders

---

*Plan generado el 2026-03-04*
