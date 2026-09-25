# Evidence — Repo survey reverse-engineering

**Date:** 2026-09-25  
**Repository:** `aes-lighting/file-service-client`  
**Purpose:** Record as-built tree vs aspirational docs before Spec Kit / ontology claims.

## Survey method

Inspected HEAD files (no runtime start — missing modules prevent clean boot). Cross-checked `README.md`, `package.json`, `.speckit/`, and module require graphs.

## As-built file tree (present)

| Path | Role |
|------|------|
| `index.js` | Entry: wires ProjectService / UploadService / Scheduler (requires missing modules) |
| `server.js` | Express app: `/health`, `/api/status`, `/api/projects*`, `/api/upload/packing-slip`, `/api/upload/intake` |
| `src/services/uploadService.js` | PO-based packing-slip / intake photo writes under project folders |
| `fileService.js` | Filename-encoded whitelist upload + JSON sidecar + list |
| `files.js` | Router intending `/api/upload`, `/api/list/:directory`, `/api/config`, `/health` |
| `auth.js` | `X-API-Key` middleware against `config.json` |
| `config.js` | Loads `../config/config.json` (path assumes nested layout) |
| `config.example.json` | Port, storage root, directories INTAKE/DELIVERY/IN-TRANSIT, API key placeholder |
| `logger.js` | Console + file logger (paths assume nested `utils/`) |
| `package.json` | `main: src/index.js` (file does not exist); Express/Multer/uuid |
| `README.md` | Documents V0 filename-encoding MVP surface |
| `.speckit/` | Prior lightweight Spec Kit (constitution + windows-projects) |

## Missing modules (referenced, not in tree)

| Required by | Missing path |
|-------------|--------------|
| `index.js` | `src/services/windowsServerClient.js` |
| `index.js` | `src/services/projectService.js` |
| `index.js` | `src/services/schedulerService.js` |
| `files.js` / `auth.js` / `fileService.js` / `logger.js` | Nested `src/routes`, `src/middleware`, `src/services`, `src/utils`, `config/config.json` |

## Dual surfaces (must not conflate)

1. **FilenameEncodedSurface (V0 docs)** — `DIRECTORY_SHIPMENT_TIMESTAMP_HASH.ext` → whitelist directory under storage root; optional JSON sidecar. Logic in `fileService.js` / `files.js`; **wiring broken** (wrong relative requires).
2. **ProjectBoundUploadSurface** — Multer image upload + `po_number` → project folder packing-slip / INTAKE paths. Logic in `server.js` + `uploadService.js`; **depends on missing ProjectService**.
3. **WindowsProjectDiscoverySurface (Target)** — Spec'd in `.speckit`; partial route stubs in `server.js`; implementation modules absent.

## Config / auth facts

- API key: `X-API-Key` header (also `?apiKey=` on `server.js` routes).
- Defaults: `API_KEY` env or `test-api-key-12345` in `server.js`; `config.example.json` placeholder.
- Whitelist directories (example): `INTAKE`, `DELIVERY`, `IN-TRANSIT`.
- Multer memory storage; `server.js` image MIME allow-list; 50MB limit.
- PO format for project uploads: `NNNNN-XX` (`/^\d{5}-\d{2}$/`).

## Aspirational (README / old constitution) — Target layout

```
src/index.js, src/server.js, src/routes/, src/middleware/, src/services/, src/utils/, config/
```

Not true of HEAD. Agents must not label this layout **Implemented**.

## Prior Spec Kit

`.speckit/CONSTITUTION.md` + windows-projects spec/plan. Migrated into `.specify/`; `.speckit/` retired.

## Conclusion for Spec Kit

- Spec **001** = reverse-engineered baseline of present modules + honest Target gaps.
- Spec **002** = Windows project discovery (Target / Roadmap).
- MVP = **Deferred** (no owner definition).
