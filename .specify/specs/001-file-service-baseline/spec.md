# Spec 001 — File Service Baseline

**Feature Branch**: `main` (baseline reverse-engineering)  
**Created**: 2026-09-25  
**Status**: Implemented (as-built documentation) / Partial runtime  
**MVP**: [Deferred — see mvp-definition.md](./mvp-definition.md) — do not invent success criteria

## Summary

AES File Service Client baseline reverse-engineered from HEAD. Documents **two** upload surfaces and honest gaps. Does not invent an MVP.

## User scenarios

### US-1 Health (P3) — Implemented (code)

`GET /health` returns `{ status, service, timestamp }` without API key (`server.js`).

### US-2 Filename-encoded upload (P1) — Modules present / wiring Target

Client posts a file with body `filename` = `DIRECTORY_SHIPMENT_TIMESTAMP_HASH.ext`; service parses directory, checks whitelist, writes under storage root; optional JSON sidecar.

**Code:** `fileService.js`, `files.js`, `auth.js`, `config.js`.  
**Gap:** Relative requires assume nested `src/` + `config/config.json` — not runnable as-is.

### US-3 List directory (P2) — Modules present / wiring Target

`GET /api/list/:directory` lists whitelisted directory entries (`files.js` + `fileService.listDirectory`).

### US-4 Project packing-slip upload (P1) — Partial

`POST /api/upload/packing-slip` with `po_number` + image file → project folder packing-slips path (`server.js`, `uploadService.js`). Requires `ProjectService` (missing).

### US-5 Intake photo upload (P1) — Partial

`POST /api/upload/intake` — same PO rules; writes under `…/Packing Slips/INTAKE` with auto-numbering.

### US-6 Project list / lookup / status (P2) — Target

`GET /api/projects`, `GET /api/projects/:jobNumber`, `GET /api/status` stubbed in `server.js`; fail without `projectService`. Full discovery → Spec 002.

## Requirements

### Functional (Implemented as code artifacts)

- **FR-001**: Parse filename first segment as directory (`DIRECTORY_…`).
- **FR-002**: Reject non-whitelisted directories; prevent path traversal outside storage root.
- **FR-003**: Optional JSON sidecar beside file (stem `.json`).
- **FR-004**: Authenticate with `X-API-Key` (config or env).
- **FR-005**: Image MIME allow-list on `server.js` Multer filter; PO format `NNNNN-XX` for project uploads.
- **FR-006**: Expose health for probes.

### Functional (Target)

- **FR-T01**: Nested `src/` layout per README; fix require graph; `package.json` main.
- **FR-T02**: Implement `windowsServerClient` / `projectService` / `schedulerService` and wire `index.js`.
- **FR-T03**: Spec 002 Windows discovery + templates.

### Non-goals (this baseline)

- Defining MVP success metrics (Deferred)
- Implementing Spec 002 in this change set

## Key entities

- **StoredFile**, **Directory**, **UploadRequest**, **SidecarMetadata**, **ApiCredential**
- Target: **Project**, **WindowsShare**, **ProjectTemplate**

## Success criteria

Baseline documentation success:

- **SC-DOC-001**: Spec Kit + ontology reflect as-built surfaces and pass `validate_spec.py`.

Product MVP success criteria: **Deferred** — see [mvp-definition.md](../../mvp-definition.md).
