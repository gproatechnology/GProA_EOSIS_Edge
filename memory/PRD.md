# EDGE Document Processor - PRD

## Problem Statement
Build a full EDGE certification automation platform. Evolved from a basic document processor to an intelligent assistant that automates the complete EDGE certification flow: classify documents, extract technical data, run specialized analysis per measure, validate against WBS requirements, calculate KPIs, and guide users through completion.

## Architecture
- **Frontend**: React 19 + Tailwind CSS + Radix UI (shadcn) + Phosphor Icons
- **Backend**: FastAPI + Motor (MongoDB async) + emergentintegrations (OpenAI GPT-4o)
- **Database**: MongoDB
- **AI**: OpenAI GPT-4o via Emergent Universal Key
- **Modules**: edge_rules.py (WBS engine), edge_processors.py (specialized analyzers), server.py (API)

## User Personas
- **EDGE Consultant**: Primary user - uploads documents, runs EDGE automation, reviews compliance
- **Project Manager**: Creates projects, monitors certification progress, exports reports

## Core Requirements (Static)
1. Project CRUD (name + typology)
2. File upload (manual, text-based files)
3. EDGE Rules Engine (WBS) with 30+ measures defined
4. AI Classification (DESIGN/ENERGY/WATER/MATERIALS + specific measure)
5. AI Data Extraction (watts, lumens, equipment, brand, model)
6. Specialized Processors (EEM22 lighting, EEM09 HVAC, WEM01/02 water)
7. EEM22 Luminaire Analysis (extract table, calculate global efficacy)
8. Deterministic WBS Validation (cross-reference files vs requirements)
9. KPIs per measure (efficacy lm/W, COP, flow rates)
10. Batch Processing with real-time progress
11. Full EDGE automation via single button
12. Compliance Dashboard (WBS table, coverage, alerts)
13. Enhanced Excel Export (classification + WBS validation + EEM22 + areas)

## What's Been Implemented

### Phase 1 - MVP (April 14, 2026)
- [x] Full backend API with MongoDB
- [x] Project management CRUD
- [x] File upload with multipart
- [x] Basic AI classification and extraction
- [x] Professional Swiss-style UI

### Phase 2 - Full EDGE Automation (April 14, 2026)
- [x] EDGE Rules Engine (edge_rules.py) with 30+ measures (EEM, WEM, MEM, DESIGN)
- [x] WBS knowledge base: required docs + calculations per measure
- [x] Specialized Processors (edge_processors.py):
  - EEM22/23: Luminaire extraction + global efficacy calculation (SUM(lumens*qty)/SUM(watts*qty))
  - EEM09: HVAC equipment analysis (COP, SEER, capacity)
  - EEM16: Renewable energy analysis
  - WEM01/02: Water fixtures analysis (flow rates)
- [x] Full EDGE Project Automation (single "Procesar Proyecto EDGE" button)
- [x] Batch processing with real-time progress modal (polling every 2s)
- [x] Deterministic WBS validation (files vs requirements cross-reference)
- [x] KPIs per measure (efficacy, COP, flow rates with EDGE thresholds)
- [x] Compliance EDGE tab with WBS table, coverage overview, alerts
- [x] Enhanced Excel export (4 sheets: Classification, WBS Validation, EEM22 Luminaires, Areas)
- [x] All tests passing (Backend 100% 19/19, Frontend 95% 22/23)

## Prioritized Backlog
### P0 - Done
- All MVP + Phase 2 features implemented

### P1 - Phase 3
- Google Drive integration (connect folder, auto-sync)
- PDF OCR support (read actual document content)
- More specialized processors (EEM01 thermal, EEM05 solar protection, etc.)
- EDGE scoring calculator (points per measure)

### P2 - Future
- ZIP export with organized EDGE folder structure
- Multi-user support with authentication
- Real-time collaboration
- EDGE version selection (v2 vs v3)
- Automated report generation (PDF certification report)
- Advanced floor plan analysis with external CV APIs
- Webhooks/notifications

## Next Tasks
1. Google Drive integration (connect project folders)
2. PDF OCR support
3. Additional specialized processors (EEM01, EEM05, EEM06)
4. EDGE scoring/points calculator
5. PDF report generation for certification submission
