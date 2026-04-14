# EDGE Document Processor - PRD

## Problem Statement
Build an EDGE certification document management platform with AI-powered document classification, data extraction, and validation. MVP with manual file upload, GPT-4o processing, and Excel export.

## Architecture
- **Frontend**: React 19 + Tailwind CSS + Radix UI (shadcn) + Phosphor Icons
- **Backend**: FastAPI + Motor (MongoDB async) + emergentintegrations (OpenAI GPT-4o)
- **Database**: MongoDB
- **AI**: OpenAI GPT-4o via Emergent Universal Key

## User Personas
- **EDGE Consultant**: Primary user who uploads construction documents, processes them with AI, and reviews classification results
- **Project Manager**: Creates projects, monitors progress, exports reports

## Core Requirements (Static)
1. Project CRUD (name + typology)
2. File upload (manual, text-based files)
3. AI Classification (EDGE categories: DESIGN, ENERGY, WATER, MATERIALS)
4. AI Data Extraction (watts, lumens, equipment type, brand, model)
5. AI Area Calculation (from floor plan OCR text)
6. AI Validation (detect missing documents per EDGE measure)
7. Results Dashboard (data tables, EDGE status cards, progress tracking)
8. Excel Export (classification + extraction data)

## What's Been Implemented (April 14, 2026)
- [x] Full backend API (12 endpoints) with MongoDB persistence
- [x] Project management (create, list, detail, delete)
- [x] File upload with multipart support
- [x] AI Processing pipeline (classify → extract → calculate areas → validate)
- [x] Extracted data table with all fields
- [x] EDGE status dashboard with category cards, measures breakdown, missing docs
- [x] Excel export with classification and areas sheets
- [x] Professional Swiss-style UI with Chivo/IBM Plex fonts
- [x] Sidebar navigation with project list
- [x] All tests passing (Backend 100%, Frontend 95%, AI 100%)

## Prioritized Backlog
### P0 - Done
- All MVP features implemented and tested

### P1 - Phase 2
- Google Drive integration (connect folder, auto-sync files)
- PDF text extraction (OCR)
- Batch processing progress indicator (real-time updates)

### P2 - Future
- ZIP export (organized folder structure)
- Multi-user support with authentication
- Real-time collaboration
- Advanced floor plan analysis with external CV APIs
- Automated EDGE scoring calculator
- Webhooks/notifications for processing completion

## Next Tasks
1. Google Drive integration (Phase 2)
2. PDF OCR support for reading actual document content
3. Real-time processing progress (WebSocket or polling)
4. ZIP export with organized EDGE folder structure
